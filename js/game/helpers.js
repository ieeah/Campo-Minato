/**
 * Game Helper Functions
 * Utility functions used throughout the game
 */

/**
 * Checks if a value is within range of a reference value (±1)
 * @param {number} ref - Reference value
 * @param {number} toCompare - Value to compare
 * @returns {boolean}
 */
export const between = (ref, toCompare) => {
  return toCompare >= ref - 1 && toCompare <= ref + 1;
};

/**
 * Returns color based on number of adjacent bombs
 * @param {number} closeCounter - Number of adjacent bombs
 * @returns {string} CSS color value
 */
export const colorCounter = (closeCounter) => {
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
  return colors[closeCounter] || "var(--text-color)";
};

/**
 * Checks if a cell ID corresponds to a bomb
 * @param {number} id - Cell ID
 * @param {Array<number>} bombs - Array of bomb IDs
 * @returns {boolean}
 */
export const isABomb = (id, bombs) => bombs.includes(id);
