/**
 * Creates a virtual node (VNode).
 * A VNode is a plain JavaScript object that represents a DOM element.
 *
 * @param {string} tag - The HTML tag of the element.
 * @param {object} props - The properties/attributes of the element (e.g., { id: 'my-id', class: 'my-class', onClick: handler }).
 * @param {(string|Array<object>)} children - The children of the element, either a text string or an array of VNodes.
 * @returns {object} A VNode object.
 */
export const createVNode = (tag, props = {}, children = []) => {
    return {
      tag,
      props,
      children,
    };
  };

  /**
   * Helper function to determine if a prop is an event handler
   * @param {string} key - The prop key
   * @returns {boolean}
   */
  const isEventProp = (key) => key.startsWith('on');

  /**
   * Helper function to extract event name from prop key
   * @param {string} key - The prop key (e.g., 'onClick')
   * @returns {string} - The event name (e.g., 'click')
   */
  const extractEventName = (key) => key.slice(2).toLowerCase();

  /**
   * Sets a property on a DOM element
   * @param {HTMLElement} el - The DOM element
   * @param {string} key - The property key
   * @param {*} value - The property value
   */
  const setProp = (el, key, value) => {
    if (isEventProp(key)) {
      const eventName = extractEventName(key);
      el.addEventListener(eventName, value);
    } else if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      // Clear existing inline styles and apply new ones
      for (const styleProp in value) {
        if (value[styleProp] === '' || value[styleProp] === null) {
          el.style[styleProp] = '';
        } else {
          el.style[styleProp] = value[styleProp];
        }
      }
    } else if (key === 'checked' || key === 'value' || key === 'selected') {
      el[key] = value;
    } else {
      el.setAttribute(key, value);
    }
  };

  /**
   * Removes a property from a DOM element
   * @param {HTMLElement} el - The DOM element
   * @param {string} key - The property key
   * @param {*} value - The property value (needed for event listeners)
   */
  const removeProp = (el, key, value) => {
    if (isEventProp(key)) {
      const eventName = extractEventName(key);
      el.removeEventListener(eventName, value);
    } else if (key === 'className') {
      el.className = '';
    } else if (key === 'style') {
      el.removeAttribute('style');
    } else {
      el.removeAttribute(key);
    }
  };

  /**
   * Renders a VNode and mounts it to a container element.
   * This function creates the real DOM structure based on the VNode tree.
   *
   * @param {object} vnode - The VNode to render.
   * @param {HTMLElement} container - The DOM element to mount the VNode into.
   */
  export const render = (vnode, container) => {
    // Handle text nodes
    if (typeof vnode === 'string' || typeof vnode === 'number') {
      const textNode = document.createTextNode(vnode);
      container.appendChild(textNode);
      return textNode;
    }

    // Create the DOM element
    const el = document.createElement(vnode.tag);
    vnode.el = el; // Store the element reference on the VNode for future updates

    // Set properties
    if (vnode.props) {
      for (const key in vnode.props) {
        setProp(el, key, vnode.props[key]);
      }
    }

    // Handle children
    if (typeof vnode.children === 'string' || typeof vnode.children === 'number') {
      el.textContent = vnode.children;
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        render(child, el); // Recursively render child nodes
      });
    }

    // Mount to the container
    container.appendChild(el);
    return el;
  };
  
  /**
   * Patches the real DOM by comparing an old VNode with a new VNode.
   *
   * @param {object} oldVNode - The previous virtual representation of the DOM.
   * @param {object} newVNode - The new virtual representation of the DOM.
   */
  export const patch = (oldVNode, newVNode) => {
    // Handle text nodes
    if (typeof oldVNode === 'string' || typeof newVNode === 'string') {
      if (oldVNode !== newVNode) {
        const parent = oldVNode.parentNode || newVNode.parentNode;
        const newTextNode = document.createTextNode(newVNode);
        if (parent && oldVNode.nodeType === 3) {
          parent.replaceChild(newTextNode, oldVNode);
        }
        return newTextNode;
      }
      return oldVNode;
    }

    const el = oldVNode.el;
    newVNode.el = el; // The element is the same

    // If the tags are different, we need to replace the entire element.
    if (oldVNode.tag !== newVNode.tag) {
      const parent = el.parentNode;
      const newEl = render(newVNode, document.createDocumentFragment());
      parent.replaceChild(newEl, el);
      return;
    }

    // Patch props
    const oldProps = oldVNode.props || {};
    const newProps = newVNode.props || {};

    // Remove old props that are not in new props
    for (const key in oldProps) {
      if (!(key in newProps)) {
        removeProp(el, key, oldProps[key]);
      }
    }

    // Add or update new props
    for (const key in newProps) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];

      // Special handling for style objects - do deep comparison
      if (key === 'style' && typeof newValue === 'object' && typeof oldValue === 'object') {
        let styleChanged = false;
        // Check if any style property changed
        for (const styleProp in newValue) {
          if (newValue[styleProp] !== oldValue[styleProp]) {
            styleChanged = true;
            break;
          }
        }
        // Check if any style property was removed
        for (const styleProp in oldValue) {
          if (!(styleProp in newValue)) {
            styleChanged = true;
            break;
          }
        }
        if (styleChanged) {
          setProp(el, key, newValue);
        }
      } else if (newValue !== oldValue) {
        // Remove old event listener before adding new one
        if (isEventProp(key) && oldValue) {
          removeProp(el, key, oldValue);
        }
        setProp(el, key, newValue);
      }
    }

    // Patch children
    const oldChildren = oldVNode.children;
    const newChildren = newVNode.children;

    if (typeof newChildren === 'string' || typeof newChildren === 'number') {
      const newText = String(newChildren);
      const oldText = String(oldChildren);
      if (newText !== oldText) {
        el.textContent = newText;
      }
    } else if (Array.isArray(newChildren)) {
      if (typeof oldChildren === 'string' || typeof oldChildren === 'number') {
        // If old children was text, clear it and render new children
        el.textContent = '';
        newChildren.forEach(child => render(child, el));
      } else if (Array.isArray(oldChildren)) {
        // This is a simplified diffing. For a real app, you'd use a more
        // advanced algorithm (e.g., with keys for list items).
        const minLength = Math.min(oldChildren.length, newChildren.length);
        for (let i = 0; i < minLength; i++) {
          patch(oldChildren[i], newChildren[i]);
        }
        // If newVNode has more children, add them
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach(child => render(child, el));
        }
        // If oldVNode had more children, remove them
        else if (oldChildren.length > newChildren.length) {
          for (let i = minLength; i < oldChildren.length; i++) {
            const childEl = oldChildren[i].el || oldChildren[i];
            if (childEl && childEl.parentNode) {
              el.removeChild(childEl);
            }
          }
        }
      }
    } else if (newChildren === undefined && oldChildren !== undefined) {
      // If new children is undefined but old was something, clear it
      el.textContent = '';
    }
  };

  /**
   * Creates an app instance with state management and automatic re-rendering
   * @param {Function} rootComponent - A function that returns a VNode tree based on getState and setState
   * @param {HTMLElement} container - The DOM element to mount the app into
   * @returns {object} An object with methods to interact with the app
   */
  export const createApp = (rootComponent, container) => {
    let state = {};
    let oldVNode = null;

    const getState = () => state;

    const setState = (newState) => {
      state = { ...state, ...newState };
      rerender();
    };

    const rerender = () => {
      const newVNode = rootComponent(getState, setState);

      if (oldVNode === null) {
        container.innerHTML = '';
        render(newVNode, container);
        oldVNode = newVNode;
      } else {
        patch(oldVNode, newVNode);
        oldVNode = newVNode;
      }
    };

    return {
      mount: (initialState = {}) => {
        state = initialState;
        rerender();
      },
      getState,
      setState,
    };
  };
  