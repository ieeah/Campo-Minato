/**
 * It gets the history from localStorage.
 * @returns the value of the variable oldHistory.
 */
export function getHistory() {
  let oldHistory = JSON.parse(
    localStorage.getItem("mineSweeper_ieeah_history")
  );
  return oldHistory;
}

/**
 * It removes the history from local storage.
 */
export function removeHistory() {
  localStorage.removeItem("mineSweeper_ieeah_history");
}

/**
 * If the localStorage item "mineSweeper_ieeah_history" is null, return false, else return true.
 * @returns A function that returns a boolean value.
 */
export function historyExist() {
  let oldHistory = localStorage.getItem("mineSweeper_ieeah_history");
  return oldHistory == null ? false : true;
}

/**
 * It takes in three parameters, and then checks if the localStorage item "mineSweeper_ieeah_history"
 * exists. If it does, it parses the JSON string, and then checks if the length of the matches array is
 * less than 10. If it is, it adds the new match to the beginning of the array. If it isn't, it creates
 * a new array, adds the new match to the beginning of the array, and then adds the old matches to the
 * array until the length of the array is 10. Then it sets the localStorage item to the new array. If
 * the localStorage item doesn't exist, it creates a new match, and then sets the localStorage item to
 * the new match.
 * @param outcome - "win" or "lose"
 * @param timestamp - Date.now()
 * @param level - "1", "2", "3", "4", or "5"
 */
export function saveMatch(outcome, timestamp, level, time) {
  let newHistory = null;

  const newMatch = {
    outcome: outcome,
    timestamp: timestamp,
    level: level,
    time: time,
  };

  if (historyExist()) {
    let oldMatches = JSON.parse(
      localStorage.getItem("mineSweeper_ieeah_history")
    ).matches;

    if (oldMatches != null) {
      if (oldMatches.length < 10) {
        oldMatches.unshift(newMatch);
        newHistory = JSON.stringify({
          matches: [...oldMatches],
        });
      } else {
        let newMatches = [];
        newMatches.push(newMatch);
        let i = 0;
        while (i < 9) {
          newMatches.push(oldMatches[i]);
          i++;
        }
        newHistory = JSON.stringify({
          matches: [...newMatches],
        });
      }
    }
  } else {
    newHistory = JSON.stringify({
      matches: [newMatch],
    });
  }
  localStorage.setItem("mineSweeper_ieeah_history", newHistory);
}