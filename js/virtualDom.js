/**
 * Creates a virtual node (VNode).
 * A VNode is a plain JavaScript object that represents a DOM element.
 *
 * @param {string} tag - The HTML tag of the element.
 * @param {object} props - The properties/attributes of the element (e.g., { id: 'my-id', class: 'my-class' }).
 * @param {(string|Array<object>)} children - The children of the element, either a text string or an array of VNodes.
 * @returns {object} A VNode object.
 */
export const createVNode = (tag, props, children) => {
    return {
      tag,
      props,
      children,
    };
  };
  
  /**
   * Renders a VNode and mounts it to a container element.
   * This function creates the real DOM structure based on the VNode tree.
   *
   * @param {object} vnode - The VNode to render.
   * @param {HTMLElement} container - The DOM element to mount the VNode into.
   */
  export const render = (vnode, container) => {
    // Create the DOM element
    const el = document.createElement(vnode.tag);
    vnode.el = el; // Store the element reference on the VNode for future updates
  
    // Set properties
    for (const key in vnode.props) {
      el.setAttribute(key, vnode.props[key]);
    }
  
    // Handle children
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children;
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        render(child, el); // Recursively render child nodes
      });
    }
  
    // Mount to the container
    container.appendChild(el);
  };
  
  /**
   * Patches the real DOM by comparing an old VNode with a new VNode.
   *
   * @param {object} oldVNode - The previous virtual representation of the DOM.
   * @param {object} newVNode - The new virtual representation of the DOM.
   */
  export const patch = (oldVNode, newVNode) => {
    const el = oldVNode.el;
    newVNode.el = el; // The element is the same
  
    // If the tags are different, we need to replace the entire element.
    if (oldVNode.tag !== newVNode.tag) {
      const parent = el.parentNode;
      const newEl = document.createElement(newVNode.tag);
      // basic render for the new element, this could be more robust
      render(newVNode, parent); 
      parent.replaceChild(newEl, el);
      return;
    }
  
    // Patch props
    const oldProps = oldVNode.props || {};
    const newProps = newVNode.props || {};
  
    // Add or update new props
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        el.setAttribute(key, newProps[key]);
      }
    }
    // Remove old props
    for (const key in oldProps) {
      if (!(key in newProps)) {
        el.removeAttribute(key);
      }
    }
  
    // Patch children
    const oldChildren = oldVNode.children;
    const newChildren = newVNode.children;
  
    if (typeof newChildren === 'string') {
      if (newChildren !== oldChildren) {
        el.textContent = newChildren;
      }
    } else if (Array.isArray(newChildren)) {
      if (typeof oldChildren === 'string') {
        // If old children was text, clear it and render new children
        el.innerHTML = '';
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
            el.removeChild(oldChildren[i].el);
          }
        }
      }
    }
  };
  