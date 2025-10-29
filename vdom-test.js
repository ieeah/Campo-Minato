import { createVNode, createApp } from "./js/virtualDom.js";
import { historyExist, getHistory, saveMatch } from "./js/LS.js";
import { ICONS, REACTIONS, LEVELS } from "./js/constants.js";

// Audio elements (still need direct DOM access for these)
const audioClick = document.getElementById("audio_click");
const audioLost = document.getElementById("audio_lost");
const audioWon = document.getElementById("audio_won");
const audioFlag = document.getElementById("audio_flag");

// Game configuration
const initialGameState = {
  n_Bombs: 12,
  boardSize: 10,
  flaggedCells: [],
  flaggedBombs: [],
  remainingBombs: 12,
  theseAreCloseCells: [],
  closeBombsCounter: null,
  firstClick: true,
  virtualCells: [],
  bombs: [],
  usedHelps: 0,
  clickedCells: 0,
  seconds: 0,
  minutes: 0,
  paused: true,
  gameEnded: false,
  audioMuted: false,
  reactionText: "Weee Giochiamoo?",
  reactionIcon: "./imgs/icons/new_game.svg",
  reactionBad: false,
  difficulty: "1",
  showModal: false,
  modalMessage: "",
  modalShowRedButton: false,
};

// Helper functions
const playAudio = (audio, muted) => {
  if (!muted) {
    audio.pause();
    audio.currentTime = 0;
    audio.play();
  }
};

const between = (ref, toCompare) => {
  return toCompare >= ref - 1 && toCompare <= ref + 1;
};

const colorCounter = (closeCounter) => {
  const colors = {
    0: "#07fc03",
    1: "var(--text-color)",
    2: "#f743eb",
    3: "#00ddff",
    4: "#ff8438",
    5: "#e2f425",
    6: "#5b00a1",
    7: "#002736",
    8: "#592700",
  };
  return colors[ closeCounter ] || "var(--text-color)";
};

const isABomb = (id, bombs) => bombs.includes(id);

const generateBombsIds = (boardSize, n_Bombs) => {
  const bombs = [];
  while (bombs.length < n_Bombs) {
    let randomId = Math.floor(Math.random() * (boardSize * boardSize));
    if (!bombs.includes(randomId)) {
      bombs.push(randomId);
    }
  }
  return bombs;
};

const defineCloseCells = (id, virtualCells, boardSize) => {
  let surroundingCells = [];
  let x = virtualCells[ id ].x;
  let y = virtualCells[ id ].y;

  virtualCells.forEach((cell, index) => {
    if (between(x, cell.x) && between(y, cell.y)) {
      if (index !== id) {
        surroundingCells.push({
          id: index,
          x: cell.x,
          y: cell.y,
        });
      }
    }
  });

  return surroundingCells;
};

const countCloseBombs = (closeCells, bombs) => {
  let counter = 0;

  closeCells.forEach((cell) => {
    if (bombs.includes(cell.id)) {
      counter++;
    }
  });

  return counter;
};

// Game logic functions
const handleReaction = (type, setState) => {
  let reaction = "";
  let index = -1;
  let textIndex = -1;

  if (type === "bad") {
    index = Math.floor(Math.random() * ICONS.reactions[ 0 ].length);
    textIndex = Math.floor(Math.random() * REACTIONS.bad.length);
    reaction = ICONS.reactions[ 0 ][ index ];
    setState({
      reactionText: REACTIONS.bad[ textIndex ],
      reactionIcon: `./imgs/icons/moves_reactions/${reaction}.svg`,
      reactionBad: true,
    });
  } else {
    index = Math.floor(Math.random() * ICONS.reactions[ 1 ].length);
    textIndex = Math.floor(Math.random() * REACTIONS.good.length);
    reaction = ICONS.reactions[ 1 ][ index ];
    setState({
      reactionText: REACTIONS.good[ textIndex ],
      reactionIcon: `./imgs/icons/moves_reactions/${reaction}.svg`,
      reactionBad: false,
    });
  }
};

const showModal = (message, showRedButton, setState) => {
  setState({
    paused: true,
    showModal: true,
    modalMessage: message,
    modalShowRedButton: showRedButton,
  });
};

const closeModal = (setState, state) => {
  setState({
    showModal: false,
    paused: false,
  });
};

const resetGame = (setState) => {
  setState({
    n_Bombs: 12,
    remainingBombs: 12,
    flaggedBombs: [],
    theseAreCloseCells: [],
    virtualCells: [],
    flaggedCells: [],
    bombs: [],
    boardSize: 10,
    clickedCells: 0,
    seconds: 0,
    minutes: 0,
    firstClick: true,
    paused: true,
    gameEnded: false,
    usedHelps: 0,
    reactionText: "Weee Giochiamoo?",
    reactionIcon: "./imgs/icons/new_game.svg",
    reactionBad: false,
  });
};

const setDifficultyLevel = (level, setState, state) => {
  const boardSize = LEVELS[ level ].boardSize;
  const n_Bombs = LEVELS[ level ].n_bombs;
  setState({
    boardSize,
    n_Bombs,
    difficulty: level,
    remainingBombs: n_Bombs,
  });
};

const startGame = (getState, setState) => {
  const state = getState();
  const currentDifficulty = state.difficulty;

  // Get difficulty settings
  const boardSize = LEVELS[ currentDifficulty ].boardSize;
  const n_Bombs = LEVELS[ currentDifficulty ].n_bombs;

  // Generate bombs
  const bombs = generateBombsIds(boardSize, n_Bombs);

  // Generate virtual cells
  const virtualCells = [];
  let j = 0;
  for (let y = 1; y <= boardSize; y++) {
    for (let x = 1; x <= boardSize; x++) {
      virtualCells[ j ] = {
        id: j,
        x: x,
        y: y,
        clicked: false,
        flagged: false,
        closeCells: [],
        closeBombs: 0,
      };
      j++;
    }
  }

  // Reset and start game with ONE setState call
  setState({
    // Reset values
    remainingBombs: n_Bombs,
    flaggedBombs: [],
    theseAreCloseCells: [],
    flaggedCells: [],
    clickedCells: 0,
    seconds: 0,
    minutes: 0,
    firstClick: true,
    usedHelps: 0,
    reactionText: "Weee Giochiamoo?",
    reactionIcon: "./imgs/icons/new_game.svg",
    reactionBad: false,
    gameEnded: false,
    // New game values
    bombs,
    virtualCells,
    paused: false,
    boardSize,
    n_Bombs,
  });

  // Start the timer
  startTimer();
};

const handleClick = (id, getState, setState, isLoop = false) => {
  const state = getState();

  // If first click and it's a bomb, regenerate bombs
  if (state.firstClick) {
    if (isABomb(id, state.bombs)) {
      const newBombs = generateBombsIds(state.boardSize, state.n_Bombs);
      setState({ bombs: newBombs, firstClick: false });
      setTimeout(() => handleClick(id, getState, setState, isLoop), 10);
      return;
    }
    setState({ firstClick: false });
  }

  if (state.flaggedCells.includes(id)) return;

  const cell = state.virtualCells[ id ];
  if (!cell) return;

  if (isABomb(id, state.bombs)) {
    playAudio(audioLost, state.audioMuted);
    handleReaction("bad", setState);

    // Mark all bombs as visible
    const newVirtualCells = [ ...state.virtualCells ];
    state.bombs.forEach((bombId) => {
      if (newVirtualCells[ bombId ]) {
        newVirtualCells[ bombId ].bomb = true;
      }
    });

    // Save the match
    saveMatch("lost", Date.now(), state.difficulty, `${state.minutes}:${state.seconds.toString().padStart(2, '0')}`);

    // Stop the timer
    stopTimer();

    showModal("Game Over! Hai cliccato su una bomba!", false, setState);
    setState({ virtualCells: newVirtualCells, paused: true, gameEnded: true });
    return;
  }

  if (!cell.clicked) {
    const closeCells = defineCloseCells(id, state.virtualCells, state.boardSize);
    const closeBombs = countCloseBombs(closeCells, state.bombs);

    const newVirtualCells = [ ...state.virtualCells ];
    newVirtualCells[ id ] = {
      ...newVirtualCells[ id ],
      clicked: true,
      closeCells: closeCells,
      closeBombs: closeBombs,
    };

    playAudio(audioClick, state.audioMuted);
    handleReaction("good", setState);

    const newClickedCells = state.clickedCells + 1;
    setState({
      virtualCells: newVirtualCells,
      clickedCells: newClickedCells,
      theseAreCloseCells: closeCells,
      closeBombsCounter: closeBombs,
    });

    // Check if won
    if (newClickedCells === Math.pow(state.boardSize, 2) - state.n_Bombs) {
      playAudio(audioWon, state.audioMuted);
      saveMatch("win", Date.now(), state.difficulty, `${state.minutes}:${state.seconds.toString().padStart(2, '0')}`);

      // Stop the timer
      stopTimer();

      showModal("Grande! Hai vinto!\nFacciamo un'altra partita?", false, setState);
      setState({ paused: true, gameEnded: true });
      return;
    }

    // Auto-click surrounding cells if no close bombs
    if (closeBombs === 0) {
      setTimeout(() => {
        closeCells.forEach((closeCell) => {
          handleClick(closeCell.id, getState, setState, true);
        });
      }, 10);
    }
  } else if (!isLoop) {
    // Cell already clicked - implement the "chord" feature
    // (clicking an opened cell to reveal surrounding cells if enough flags are placed)
    const closeCells = cell.closeCells;
    const closeBombs = cell.closeBombs;

    if (!closeCells || closeCells.length === 0) return;

    let openedCells = [];
    let closeFlaggedCells = 0;

    closeCells.forEach((closeCell) => {
      const virtualCell = state.virtualCells[ closeCell.id ];
      if (virtualCell.clicked) {
        openedCells.push(closeCell);
      } else if (virtualCell.flagged) {
        closeFlaggedCells++;
      }
    });

    // If enough flags are placed, auto-open remaining cells
    if (
      closeFlaggedCells >= closeBombs &&
      openedCells.length + closeFlaggedCells < closeCells.length
    ) {
      closeCells.forEach((closeCell) => {
        handleClick(closeCell.id, getState, setState, true);
      });
    } else if (openedCells.length + closeFlaggedCells !== closeCells.length) {
      // Otherwise, temporarily mark the cells
      const newVirtualCells = [ ...state.virtualCells ];
      closeCells.forEach((closeCell) => {
        const virtualCell = state.virtualCells[ closeCell.id ];
        if (!virtualCell.clicked && !virtualCell.flagged) {
          newVirtualCells[ closeCell.id ] = { ...newVirtualCells[ closeCell.id ], marked: true };
        }
      });

      setState({ virtualCells: newVirtualCells });

      // Remove the marks after 250ms
      setTimeout(() => {
        const currentState = getState();
        const unmarkedCells = [ ...currentState.virtualCells ];
        closeCells.forEach((closeCell) => {
          if (unmarkedCells[ closeCell.id ].marked) {
            unmarkedCells[ closeCell.id ] = { ...unmarkedCells[ closeCell.id ], marked: false };
          }
        });
        setState({ virtualCells: unmarkedCells });
      }, 250);
    }
  }
};

const flagCell = (id, getState, setState) => {
  const state = getState();
  const cell = state.virtualCells[ id ];
  if (!cell || cell.clicked) return;

  const newVirtualCells = [ ...state.virtualCells ];
  const newFlaggedCells = [ ...state.flaggedCells ];
  const newFlaggedBombs = [ ...state.flaggedBombs ];

  if (!state.flaggedCells.includes(id)) {
    playAudio(audioFlag, state.audioMuted);
    newFlaggedCells.push(id);
    newVirtualCells[ id ] = { ...newVirtualCells[ id ], flagged: true };

    if (state.bombs.includes(id)) {
      newFlaggedBombs.push(id);
    }
  } else {
    const flagIndex = newFlaggedCells.indexOf(id);
    newFlaggedCells.splice(flagIndex, 1);
    newVirtualCells[ id ] = { ...newVirtualCells[ id ], flagged: false };

    if (state.bombs.includes(id)) {
      const bombIndex = newFlaggedBombs.indexOf(id);
      newFlaggedBombs.splice(bombIndex, 1);
    }
  }

  setState({
    flaggedCells: newFlaggedCells,
    flaggedBombs: newFlaggedBombs,
    virtualCells: newVirtualCells,
  });

  // Check if won
  if (
    newFlaggedBombs.length === state.n_Bombs &&
    newFlaggedCells.length === state.n_Bombs
  ) {
    playAudio(audioWon, state.audioMuted);
    saveMatch("win", Date.now(), state.difficulty, `${state.minutes}:${state.seconds.toString().padStart(2, '0')}`);

    // Stop the timer
    stopTimer();

    showModal("Grande! Hai vinto!\nFacciamo un'altra partita?", false, setState);
    setState({ paused: true, gameEnded: true });
  }
};

// Render functions using Virtual DOM
const renderCell = (cell, boardSize, getState, setState) => {
  const classes = [ "cell" ];
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
        if (!state.paused) handleClick(cell.id, getState, setState);
      },
      onContextmenu: (e) => {
        e.preventDefault();
        const state = getState();
        if (!state.paused) flagCell(cell.id, getState, setState);
      },
    },
    cellContent === "" ? cellContent : String(cellContent)
  );
};

const renderBoard = (state, getState, setState) => {
  if (state.virtualCells.length === 0) {
    return createVNode("div", { id: "boardgame" }, [
      createVNode("h1", { className: "start_message" }, "Scegli una difficoltà ed inizia una nuova partita!"),
    ]);
  }

  const cells = state.virtualCells.map((cell) =>
    renderCell(cell, state.boardSize, getState, setState)
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

const renderHistory = () => {
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

const renderModal = (state, setState) => {
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
              closeModal(setState, state);
              resetGame(setState);
            },
          },
          "Sì, mi arrendo"
        ),
        createVNode(
          "button",
          {
            className: "modal_button continue",
            onClick: () => closeModal(setState, state),
          },
          "Andiamo!"
        ),
      ]),
    ]),
  ]);
};

// Main app component
const App = (getState, setState) => {
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
              onClick: () => startGame(getState, setState),
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
                  showModal(
                    "Per arrenderti devi prima fare almeno una mossa!",
                    false,
                    setState
                  );
                } else {
                  showModal("Sicuro?", true, setState);
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
      renderBoard(state, getState, setState),
    ]),
    renderModal(state, setState),
  ]);
};

// Initialize the app
const appContainer = document.createElement("div");
appContainer.id = "vdom-app-container";
document.querySelector("main").replaceWith(appContainer);

// Also move modal into the app container
const modalElement = document.querySelector(".modal");
if (modalElement) modalElement.remove();

const app = createApp(App, appContainer);
app.mount(initialGameState);

// Timer
let gameTimer = null;

const stopTimer = () => {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
};

const startTimer = () => {
  stopTimer(); // Ensure any existing timer is cleared first
  gameTimer = setInterval(() => {
    const state = app.getState();
    if (!state.paused) {
      let newSeconds = state.seconds + 1;
      let newMinutes = state.minutes;
      if (newSeconds === 60) {
        newMinutes++;
        newSeconds = 0;
      }
      app.setState({ seconds: newSeconds, minutes: newMinutes });
    }
  }, 1000);
};

// Keep existing button event handlers for theme and audio (outside the virtual DOM for now)
document.getElementById("themeButton").addEventListener("click", () => {
  document.querySelector("html").classList.toggle("light");
  const themeButton = document.getElementById("themeButton");
  let newtext = themeButton.innerText.includes("On")
    ? "Turn Lights Off"
    : "Turn Lights On";
  themeButton.innerText = newtext;
  themeButton.classList.toggle("muted");
});

document.getElementById("mutedButton").addEventListener("click", () => {
  const mutedButton = document.getElementById("mutedButton");
  mutedButton.classList.toggle("muted");
  mutedButton.classList.toggle("active");
  mutedButton.innerText =
    mutedButton.innerText === "Audio On" ? "Audio Off" : "Audio On";
  app.setState({ audioMuted: !app.getState().audioMuted });
});

const hint = () => {
  const state = app.getState();
  if (state.firstClick) {
    showModal(
      "Devi iniziare la partita per poter utilizzare un aiuto!",
      false,
      app.setState
    );
    return;
  }
  if (state.flaggedCells.length > state.bombs.length - 2) {
    showModal(
      "Non puoi usare gli aiuti per trovare l'ultima bomba, bel tentativo!",
      false,
      app.setState
    );
    return;
  }
  if (state.usedHelps > 0) {
    showModal(
      "Hai già utilizzato un aiuto in questa partita!",
      false,
      app.setState
    );
    return;
  }

  let index = Math.floor(Math.random() * state.bombs.length);
  if (!state.flaggedBombs.includes(state.bombs[ index ])) {
    flagCell(state.bombs[ index ], app.getState, app.setState);
    app.setState({ usedHelps: state.usedHelps + 1 });
  } else {
    // If the randomly selected bomb is already flagged, try again
    hint();
  }
};

document.getElementById("helpButton").addEventListener("click", hint);
