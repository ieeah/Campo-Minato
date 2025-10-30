/**
 * Game Logic
 * Core game functionality including bomb generation, cell handling, and win/loss conditions
 */

import { ICONS, LEVELS } from "../constants.js";
import { saveMatch } from "../LS.js";
import { between, isABomb } from "./helpers.js";
import { stopTimer } from "./gameTimer.js";
import { audioManager } from "./audioManager.js";
import { translationManager } from "./translationManager.js";

/**
 * Generates random bomb IDs for the board
 * @param {number} boardSize - Size of the board
 * @param {number} n_Bombs - Number of bombs to generate
 * @returns {Array<number>} Array of bomb cell IDs
 */
export const generateBombsIds = (boardSize, n_Bombs) => {
  const bombs = [];
  while (bombs.length < n_Bombs) {
    let randomId = Math.floor(Math.random() * (boardSize * boardSize));
    if (!bombs.includes(randomId)) {
      bombs.push(randomId);
    }
  }
  return bombs;
};

/**
 * Finds all cells adjacent to a given cell
 * @param {number} id - Cell ID
 * @param {Array} virtualCells - Array of all cells
 * @param {number} boardSize - Size of the board
 * @returns {Array} Array of adjacent cell objects
 */
export const defineCloseCells = (id, virtualCells, boardSize) => {
  let surroundingCells = [];
  let x = virtualCells[id].x;
  let y = virtualCells[id].y;

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

/**
 * Counts how many bombs are in the adjacent cells
 * @param {Array} closeCells - Array of adjacent cells
 * @param {Array<number>} bombs - Array of bomb IDs
 * @returns {number} Count of adjacent bombs
 */
export const countCloseBombs = (closeCells, bombs) => {
  let counter = 0;

  closeCells.forEach((cell) => {
    if (bombs.includes(cell.id)) {
      counter++;
    }
  });

  return counter;
};

/**
 * Updates UI reaction based on game events
 * @param {string} type - Type of reaction ("good" or "bad")
 * @param {Function} setState - State setter function
 */
export const handleReaction = (type, setState) => {
  let reaction = "";
  let index = -1;
  let textIndex = -1;

  if (type === "bad") {
    index = Math.floor(Math.random() * ICONS.reactions[0].length);
    const reactions = translationManager.t("reactions.bad");
    textIndex = Math.floor(Math.random() * reactions.length);
    reaction = ICONS.reactions[0][index];
    setState({
      reactionText: reactions[textIndex],
      reactionIcon: `./imgs/icons/moves_reactions/${reaction}.svg`,
      reactionBad: true,
    });
  } else {
    index = Math.floor(Math.random() * ICONS.reactions[1].length);
    const reactions = translationManager.t("reactions.good");
    textIndex = Math.floor(Math.random() * reactions.length);
    reaction = ICONS.reactions[1][index];
    setState({
      reactionText: reactions[textIndex],
      reactionIcon: `./imgs/icons/moves_reactions/${reaction}.svg`,
      reactionBad: false,
    });
  }
};

/**
 * Shows a modal dialog
 * @param {string} message - Message to display
 * @param {boolean} showRedButton - Whether to show the surrender button
 * @param {Function} setState - State setter function
 */
export const showModal = (message, showRedButton, setState) => {
  setState({
    paused: true,
    showModal: true,
    modalMessage: message,
    modalShowRedButton: showRedButton,
  });
};

/**
 * Closes the modal dialog
 * @param {Function} setState - State setter function
 * @param {Object} state - Current state
 */
export const closeModal = (setState, state) => {
  setState({
    showModal: false,
    paused: false,
  });
};

/**
 * Starts a new game
 * @param {Function} getState - Function to get current state
 * @param {Function} setState - Function to set state
 * @param {Function} startTimerFn - Function to start the timer
 */
export const startGame = (getState, setState, startTimerFn) => {
  const state = getState();
  const currentDifficulty = state.difficulty;

  // Get difficulty settings
  const boardSize = LEVELS[currentDifficulty].boardSize;
  const n_Bombs = LEVELS[currentDifficulty].n_bombs;

  // Generate bombs
  const bombs = generateBombsIds(boardSize, n_Bombs);

  // Generate virtual cells
  const virtualCells = [];
  let j = 0;
  for (let y = 1; y <= boardSize; y++) {
    for (let x = 1; x <= boardSize; x++) {
      virtualCells[j] = {
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
    reactionText: translationManager.t("header.newGame"),
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
  startTimerFn();
};

/**
 * Handles clicking on a cell
 * @param {number} id - Cell ID
 * @param {Function} getState - Function to get current state
 * @param {Function} setState - Function to set state
 * @param {boolean} isLoop - Whether this is a recursive call
 */
export const handleClick = (id, getState, setState, isLoop = false) => {
  const state = getState();

  // If first click and it's a bomb, regenerate bombs
  if (state.firstClick) {
    if (isABomb(id, state.bombs)) {
      const newBombs = generateBombsIds(state.boardSize, state.n_Bombs);
      setState({ bombs: newBombs, firstClick: false });
      setTimeout(() => handleClick(id, getState, setState, isLoop, audioElements), 10);
      return;
    }
    setState({ firstClick: false });
  }

  if (state.flaggedCells.includes(id)) return;

  const cell = state.virtualCells[id];
  if (!cell) return;

  if (isABomb(id, state.bombs)) {
    audioManager.playLost();
    handleReaction("bad", setState);

    // Mark all bombs as visible
    const newVirtualCells = [...state.virtualCells];
    state.bombs.forEach((bombId) => {
      if (newVirtualCells[bombId]) {
        newVirtualCells[bombId].bomb = true;
      }
    });

    // Save the match
    saveMatch("lost", Date.now(), state.difficulty, `${state.minutes}:${state.seconds.toString().padStart(2, '0')}`);

    // Stop the timer
    stopTimer();

    showModal(translationManager.t("modal.gameOver"), false, setState);
    setState({ virtualCells: newVirtualCells, paused: true, gameEnded: true });
    return;
  }

  if (!cell.clicked) {
    const closeCells = defineCloseCells(id, state.virtualCells, state.boardSize);
    const closeBombs = countCloseBombs(closeCells, state.bombs);

    const newVirtualCells = [...state.virtualCells];
    newVirtualCells[id] = {
      ...newVirtualCells[id],
      clicked: true,
      closeCells: closeCells,
      closeBombs: closeBombs,
    };

    audioManager.playClick();
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
      audioManager.playWon();
      saveMatch("win", Date.now(), state.difficulty, `${state.minutes}:${state.seconds.toString().padStart(2, '0')}`);

      // Stop the timer
      stopTimer();

      showModal(translationManager.t("modal.youWin"), false, setState);
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
    const closeCells = cell.closeCells;
    const closeBombs = cell.closeBombs;

    if (!closeCells || closeCells.length === 0) return;

    let openedCells = [];
    let closeFlaggedCells = 0;

    closeCells.forEach((closeCell) => {
      const virtualCell = state.virtualCells[closeCell.id];
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
      const newVirtualCells = [...state.virtualCells];
      closeCells.forEach((closeCell) => {
        const virtualCell = state.virtualCells[closeCell.id];
        if (!virtualCell.clicked && !virtualCell.flagged) {
          newVirtualCells[closeCell.id] = { ...newVirtualCells[closeCell.id], marked: true };
        }
      });

      setState({ virtualCells: newVirtualCells });

      // Remove the marks after 250ms
      setTimeout(() => {
        const currentState = getState();
        const unmarkedCells = [...currentState.virtualCells];
        closeCells.forEach((closeCell) => {
          if (unmarkedCells[closeCell.id].marked) {
            unmarkedCells[closeCell.id] = { ...unmarkedCells[closeCell.id], marked: false };
          }
        });
        setState({ virtualCells: unmarkedCells });
      }, 250);
    }
  }
};

/**
 * Toggles flag on a cell
 * @param {number} id - Cell ID
 * @param {Function} getState - Function to get current state
 * @param {Function} setState - Function to set state
 */
export const flagCell = (id, getState, setState) => {
  const state = getState();
  const cell = state.virtualCells[id];
  if (!cell || cell.clicked) return;

  const newVirtualCells = [...state.virtualCells];
  const newFlaggedCells = [...state.flaggedCells];
  const newFlaggedBombs = [...state.flaggedBombs];

  if (!state.flaggedCells.includes(id)) {
    audioManager.playFlag();
    newFlaggedCells.push(id);
    newVirtualCells[id] = { ...newVirtualCells[id], flagged: true };

    if (state.bombs.includes(id)) {
      newFlaggedBombs.push(id);
    }
  } else {
    const flagIndex = newFlaggedCells.indexOf(id);
    newFlaggedCells.splice(flagIndex, 1);
    newVirtualCells[id] = { ...newVirtualCells[id], flagged: false };

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
    audioManager.playWon();
    saveMatch("win", Date.now(), state.difficulty, `${state.minutes}:${state.seconds.toString().padStart(2, '0')}`);

    // Stop the timer
    stopTimer();

    showModal(translationManager.t("modal.youWin"), false, setState);
    setState({ paused: true, gameEnded: true });
  }
};

/**
 * Provides a hint by flagging a random unflagged bomb
 * @param {Function} getState - Function to get current state
 * @param {Function} setState - Function to set state
 * @param {Function} flagCellFn - Flag cell function
 */
export const hint = (getState, setState, flagCellFn) => {
  const state = getState();

  if (state.firstClick) {
    showModal(
      translationManager.t("help.needToStart"),
      false,
      setState
    );
    return;
  }

  if (state.flaggedCells.length > state.bombs.length - 2) {
    showModal(
      translationManager.t("help.noLastBomb"),
      false,
      setState
    );
    return;
  }

  if (state.usedHelps > 0) {
    showModal(
      translationManager.t("help.alreadyUsed"),
      false,
      setState
    );
    return;
  }

  let index = Math.floor(Math.random() * state.bombs.length);
  if (!state.flaggedBombs.includes(state.bombs[index])) {
    flagCellFn(state.bombs[index]);
    setState({ usedHelps: state.usedHelps + 1 });
  } else {
    // If the randomly selected bomb is already flagged, try again
    hint(getState, setState, flagCellFn);
  }
};
