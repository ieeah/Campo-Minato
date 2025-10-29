/**
 * Game Timer Management
 * Handles starting and stopping the game timer
 */

let gameTimer = null;

/**
 * Stops the game timer
 */
export const stopTimer = () => {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
};

/**
 * Starts the game timer
 * @param {Function} getState - Function to get current state
 * @param {Function} setState - Function to set state
 */
export const startTimer = (getState, setState) => {
  stopTimer(); // Ensure any existing timer is cleared first
  gameTimer = setInterval(() => {
    const state = getState();
    if (!state.paused) {
      let newSeconds = state.seconds + 1;
      let newMinutes = state.minutes;
      if (newSeconds === 60) {
        newMinutes++;
        newSeconds = 0;
      }
      setState({ seconds: newSeconds, minutes: newMinutes });
    }
  }, 1000);
};
