/**
 * Game State Management
 * Defines initial state and state reset functionality
 */

/**
 * Initial game state configuration
 */
export const initialGameState = {
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
  reactionText: "Weee Giochiamoo?",
  reactionIcon: "./imgs/icons/new_game.svg",
  reactionBad: false,
  difficulty: "1",
  language: "it_IT",
  showModal: false,
  modalMessage: "",
  modalShowRedButton: false,
};

/**
 * Resets the game state to initial values
 * @param {Function} setState - State setter function
 */
export const resetGame = (setState) => {
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
