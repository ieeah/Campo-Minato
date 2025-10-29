/**
 * Game UI Components
 * Rendering functions for all game UI elements using Virtual DOM
 */

import { createVNode } from "../virtualDom.js";
import { historyExist, getHistory } from "../LS.js";
import { colorCounter } from "../game/helpers.js";

/**
 * Renders a single cell
 * @param {Object} cell - Cell data
 * @param {number} boardSize - Size of the board
 * @param {Function} getState - Function to get current state
 * @param {Function} setState - Function to set state
 * @param {Function} handleClickFn - Click handler function
 * @param {Function} flagCellFn - Flag cell handler function
 * @returns {Object} VNode for the cell
 */
export const renderCell = (cell, boardSize, getState, setState, handleClickFn, flagCellFn) => {
  const classes = ["cell"];
  if (cell.clicked) classes.push("not");
  if (cell.flagged) classes.push("flagged");
  if (cell.bomb) classes.push("bomb");
  if (cell.marked) classes.push("marked");

  const cellContent = cell.clicked && cell.closeBombs > 0 ? cell.closeBombs : "";
  const cellColor = cell.clicked && cell.closeBombs > 0 ? colorCounter(cell.closeBombs) : "inherit";

  return createVNode(
    "div",
    {
      id: String(cell.id),
      className: classes.join(" "),
      style: {
        width: `calc(100% / ${boardSize})`,
        height: `calc(100% / ${boardSize})`,
        color: cellColor,
      },
      onClick: () => {
        const state = getState();
        if (!state.paused) handleClickFn(cell.id);
      },
      onContextmenu: (e) => {
        e.preventDefault();
        const state = getState();
        if (!state.paused) flagCellFn(cell.id);
      },
    },
    cellContent === "" ? cellContent : String(cellContent)
  );
};

/**
 * Renders the game board
 * @param {Object} state - Current game state
 * @param {Function} getState - Function to get current state
 * @param {Function} setState - Function to set state
 * @param {Function} handleClickFn - Click handler function
 * @param {Function} flagCellFn - Flag cell handler function
 * @returns {Object} VNode for the board
 */
export const renderBoard = (state, getState, setState, handleClickFn, flagCellFn) => {
  if (state.virtualCells.length === 0) {
    return createVNode("div", { id: "boardgame" }, [
      createVNode("h1", { className: "start_message" }, "Scegli una difficoltà ed inizia una nuova partita!"),
    ]);
  }

  const cells = state.virtualCells.map((cell) =>
    renderCell(cell, state.boardSize, getState, setState, handleClickFn, flagCellFn)
  );

  return createVNode(
    "div",
    {
      id: "boardgame",
      style: { pointerEvents: state.paused ? "none" : "all" },
    },
    cells
  );
};

/**
 * Renders the match history
 * @returns {Object} VNode for the history display
 */
export const renderHistory = () => {
  if (!historyExist()) return createVNode("div", { "aria-labelledby": "history_display", className: "history display_container", style: { display: "none" } });

  const matches = getHistory().matches;
  if (matches.length === 0) {
    return createVNode("div", { id: "history_display", className: "history display_container", style: { display: "none" } });
  }

  const matchElements = matches.map((match) => {
    const iconSrc =
      match.outcome === "win"
        ? "./imgs/icons/history/history_check.svg"
        : "./imgs/icons/history/history_cross.svg";

    const date = new Date(match.timestamp);
    const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    return createVNode("div", { className: "singleMatch" }, [
      createVNode("img", { src: iconSrc }),
      createVNode("span", {}, dateStr),
      createVNode("span", {}, match.time),
      createVNode("span", {}, match.level),
    ]);
  });

  return createVNode(
    "div",
    { id: "history_display", className: "history display_container", style: { display: "block" } },
    matchElements
  );
};

/**
 * Renders the modal dialog
 * @param {Object} state - Current game state
 * @param {Function} setState - Function to set state
 * @param {Function} closeModalFn - Function to close modal
 * @param {Function} resetGameFn - Function to reset game
 * @returns {Object} VNode for the modal
 */
export const renderModal = (state, setState, closeModalFn, resetGameFn) => {
  return createVNode("div", { className: state.showModal ? "modal" : "modal hidden" }, [
    createVNode("div", { className: "overlay" }),
    createVNode("div", { className: "modal_show" }, [
      createVNode("h3", { className: "modal_message" }, state.modalMessage),
      createVNode("div", { className: "actions" }, [
        createVNode(
          "button",
          {
            className: state.modalShowRedButton
              ? "modal_button surrender"
              : "modal_button surrender hidden",
            onClick: () => {
              closeModalFn(setState, state);
              resetGameFn(setState);
            },
          },
          "Sì, mi arrendo"
        ),
        createVNode(
          "button",
          {
            className: "modal_button continue",
            onClick: () => closeModalFn(setState, state),
          },
          "Andiamo!"
        ),
      ]),
    ]),
  ]);
};

/**
 * Main App component
 * @param {Function} getState - Function to get current state
 * @param {Function} setState - Function to set state
 * @param {Function} startGameFn - Function to start game
 * @param {Function} handleClickFn - Click handler function
 * @param {Function} flagCellFn - Flag cell handler function
 * @param {Function} showModalFn - Function to show modal
 * @param {Function} closeModalFn - Function to close modal
 * @param {Function} resetGameFn - Function to reset game
 * @returns {Object} VNode for the entire app
 */
export const App = (getState, setState, startGameFn, handleClickFn, flagCellFn, showModalFn, closeModalFn, resetGameFn) => {
  const state = getState();
  const timeString = `${state.minutes}:${state.seconds.toString().padStart(2, "0")}`;

  return createVNode("div", { id: "app-root" }, [
    createVNode("main", {}, [
      createVNode("div", { className: "menu" }, [
        createVNode("div", { className: "reactions" }, [
          createVNode(
            "div",
            {
              id: "reactions_text",
              className: state.reactionBad ? "bad" : "",
            },
            state.reactionText
          ),
          createVNode("img", {
            id: "reactions_icon",
            src: state.reactionIcon,
            alt: "",
          }),
        ]),
        createVNode("div", { className: "options_wrap" }, [
          createVNode("div", { className: "optionGroup" }, [
            createVNode("div", { className: "singleOption full" }, [
              createVNode("div", { id: "levelSelect" }, "Difficoltà"),
              createVNode(
                "select",
                {
                  name: "levelSelect",
                  "aria-labelledby": "levelSelect",
                  value: state.difficulty,
                  onChange: (e) =>
                    setState({ difficulty: e.target.value }),
                },
                [
                  createVNode("option", { value: "1" }, "Principiante"),
                  createVNode("option", { value: "2" }, "Facile"),
                  createVNode("option", { value: "3" }, "Medio"),
                  createVNode("option", { value: "4" }, "Difficile"),
                  createVNode("option", { value: "5" }, "Pazzo"),
                ]
              ),
            ]),
          ]),
          createVNode("div", { className: "optionGroup" }, [
            createVNode("div", { className: "singleOption" }, [
              createVNode("div", { id: "flagged-cells-descriptor" }, "Flags"),
              createVNode(
                "div",
                { "aria-labelledby": "flagged-cells-descriptor", className: "display_container" },
                String(state.flaggedCells.length)
              ),
            ]),
            createVNode("div", { className: "singleOption long" }, [
              createVNode("div", { id: "bombs-descriptor" }, "Bombe rimanenti"),
              createVNode(
                "div",
                { "aria-labelledby": "bombs-descriptor", className: "display_container" },
                String(
                  state.n_Bombs - state.flaggedCells.length < 0
                    ? 0
                    : state.n_Bombs - state.flaggedCells.length
                )
              ),
            ]),
          ]),
          createVNode("div", { className: "optionGroup" }, [
            createVNode("div", { className: "singleOption" }, [
              createVNode("div", { id: "timer-descriptor" }, "Timer"),
              createVNode(
                "div",
                { "aria-labelledby": "time-descriptor", className: "display_container" },
                timeString
              ),
            ]),
            createVNode("div", { className: "singleOption long" }, [
              createVNode("div", { id: "clicked-cells-descriptor" }, "Celle Scoperte"),
              createVNode(
                "div",
                { "aria-labelledby": "clicked-cells-descriptor", className: "display_container" },
                String(state.clickedCells)
              ),
            ]),
          ]),
          createVNode("div", { className: "optionGroup" }, [
            createVNode("div", { className: "singleOption full" }, [
              createVNode("div", { id: "history_display" }, "Storico Partite"),
              renderHistory(),
            ]),
          ]),
        ]),
        createVNode("div", { className: "actions" }, [
          createVNode(
            "button",
            {
              id: "start",
              className: "start",
              onClick: () => startGameFn(),
            },
            [
              createVNode("img", {
                src: "./imgs/icons/actions_icons/action_play.svg",
                alt: "Start Game",
              }),
            ]
          ),
          createVNode(
            "button",
            {
              id: "surrender",
              className: "surrender",
              onClick: () => {
                const currentState = getState();
                if (currentState.firstClick) {
                  showModalFn(
                    "Per arrenderti devi prima fare almeno una mossa!",
                    false,
                    setState
                  );
                } else {
                  showModalFn("Sicuro?", true, setState);
                }
              },
            },
            [
              createVNode("img", {
                src: "./imgs/icons/actions_icons/action_surrender.svg",
                alt: "Surrender",
              }),
            ]
          ),
        ]),
      ]),
      renderBoard(state, getState, setState, handleClickFn, flagCellFn),
    ]),
    renderModal(state, setState, closeModalFn, resetGameFn),
  ]);
};
