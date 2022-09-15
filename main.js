// import translations from "./js/translations";
import { historyExist, getHistory, saveMatch } from "./js/LS.js";

// crea le referenze al DOM per accesso semplificato.
const board = document.getElementById("boardgame");
const difficulty = document.getElementById("levelSelect");
const startButton = document.getElementById("start");
const surrenderButton = document.getElementById("surrender");
const flagsDisplay = document.getElementById("flaggedCells");
const remainingDisplay = document.getElementById("unexploded");
const modal = document.querySelector(".modal");
const modalMessage = document.querySelector(".modal_message");
const modalSurrender = document.querySelector(".modal_button.surrender");
const modalContinue = document.querySelector(".modal_button.continue");
const header_text = document.getElementById("reactions_text");
const header_icon = document.getElementById("reactions_icon");
const clickedCellsDisplay = document.getElementById("clickedCellsDisplay");
const historyDisplay = document.getElementById("history_display");
const icons = {
  reactions: [
    ["bad_cry", "bad_emb", "end_cross"],
    ["ok_cool", "ok_hearts", "ok_perv"],
  ],
  actions: ["action_play", "action_surrender"],
  cells: ["bomb", "flag"],
};
const reaction_texts = {
  bad: [
    "Oh No!",
    "Peccato!",
    "Nope!",
    "Game Over!",
    "KO tecnico!",
    "Non Va!",
    "Looooser!",
  ],
  good: [
    "Grande!",
    "Vai così!",
    "Boom Baby!",
    "Fenomeno!",
    "Che numero!",
    "Che gioco!",
    "Sei Forte!",
  ],
};

// il numero di bombe presenti sul campo
let n_Bombs = 12;
// la dimensione del campo
let boardSize = 10;
// flag per capire se il gioco è in corso o meno (potrebbe essere utile per il reset del gioco ed il setting di un timer)
// l'elenco degli id delle celle che sono state flaggate
let flaggedCells = [];
// l'elenco degli id delle bombe che sono state flaggate
let flaggedBombs = [];
// il numero di bombe che rimangono da scoprire
let remainingBombs = n_Bombs;
// le celle vicine alla cella cliccata
let theseAreCloseCells = [];
let firstClick = true;
// una rappresentazione fittizia di tutte le celle
let virtualCells = [];
let bombs = []; // array di id delle celle che sono bombe
let usedHelps = 0;
let clickedCells = 0;
let gameTimer = null;
let seconds = 0;
let minutes = 0;

setTheUI();
controlHistoryDisplay();

startButton.addEventListener("click", () => {
  startGame();
  startTimer();
});
surrenderButton.addEventListener("click", () => {
  stopTimer();
  surrender();
});

document.getElementById("helpButton").addEventListener("click", () => {
  hint();
});

/**
 * Funzione che avvia la creazione del campo di gioco e prepara tutti i dati necessari per lo svolgimento del gioco.
 */
function startGame() {
  resetGame();
  getDifficultyLevel();
  generateBombsIds();
  setTheUI();
  controlHistoryDisplay();
  generateBoard();
}

function stopTimer() {
  clearInterval(gameTimer);
}

function startTimer() {
  stopTimer();
  gameTimer = setInterval(() => {
    seconds++;
    setTheUI();
  }, 1000);
}
/**
 * Funzione che resetta tutti i dati di gioco e azzera l'interfaccia.
 */
function resetGame() {
  n_Bombs = 12;
  remainingBombs = n_Bombs;
  flaggedBombs = [];
  theseAreCloseCells = [];
  virtualCells = [];
  flaggedCells = [];
  bombs = [];
  boardSize = 10;
  header_text.innerText = "Weee Giochiamoo?";
  header_icon.src = "./imgs/icons/new_game.svg";
  clickedCells = 0;
  seconds = 0;
  minutes = 0;
  firstClick = true;
  handleReaction("good");
  setTheUI();
}

/**
 * Funzione che setta il numero di celle e di bombe in base al livello di difficoltà selezionato dall'utente.
 */
function getDifficultyLevel() {
  switch (difficulty.value) {
    case "1":
      boardSize = 10;
      n_Bombs = 12;
      break;

    case "2":
      boardSize = 13;
      n_Bombs = 30;
      break;

    case "3":
      boardSize = 18;
      n_Bombs = 45;
      break;

    case "4":
      boardSize = 28;
      n_Bombs = 85;
      break;

    case "5":
      boardSize = 32;
      n_Bombs = 120;
  }
}

/**
 * Generazione degli id delle celle che saranno delle bombe.
 */
function generateBombsIds() {
  bombs = [];
  while (bombs.length < n_Bombs) {
    let randomId = Math.floor(Math.random() * (boardSize * boardSize));
    if (!bombs.includes(randomId)) {
      bombs.push(randomId);
    }
  }
}

/**
 * Generazione delle celle del DOM, di ogni cella viene salvata una referenza alla cella stessa in virtualCells.
 */
function generateBoard() {
  // creo x celle per coprire le dimensioni del campo
  board.innerHTML = "";
  let j = 0;
  for (let y = 1; y <= boardSize; y++) {
    for (let x = 1; x <= boardSize; x++) {
      const cell = document.createElement("div");

      cell.classList.add("cell");
      cell.style.width = `calc(100% / ${boardSize})`;
      cell.style.height = `calc(100% / ${boardSize})`;
      cell.id = j;

      const cellId = parseInt(j);
      // click normale, si setta la cella cliccata e si controlla che sia o meno una bomba
      cell.addEventListener("click", () => {
        handleClick(cellId);
      });

      //click tasto dx, si avvia la funzione per il flaggin della cella clicclata
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        flagCell(cellId);
      });

      virtualCells[cellId] = {
        id: cellId,
        DOMCell: { x: x, y: y, cellReference: cell },
        clicked: false,
      };

      board.appendChild(cell);
      j++;
    }
  }
  board.style.pointerEvents = "all";
}

function hint() {
  if (firstClick) {
    showModal("Devi iniziare la partita per poter utilizzare un aiuto!");
    return null;
  }
  if (flaggedCells.length > bombs.length - 2) {
    showModal(
      "Non puoi usare gli aiuti per trovare l'ultima bomba, bel tentativo!"
    );
    return null;
  }
  if (usedHelps > 0) {
    showModal("Hai già utilizzato un aiuto in questa partita!");
    return null;
  }

  let index = Math.floor(Math.random() * bombs.length);
  if (!flaggedBombs.includes(bombs[index])) {
    flagCell(bombs[index]);
    usedHelps++;
  } else {
    hint();
  }
}

function showModal(message, showRedButton = false) {
  stopTimer();
  modalMessage.innerText = message;
  if (showRedButton) {
    modalSurrender.classList.remove("hidden");
  }
  modal.classList.remove("hidden");
  modalContinue.addEventListener("click", () => {
    closeModal();
    startTimer();
  });

  modalSurrender.addEventListener("click", () => {
    closeModal();
    gameOver();
  });
}

function closeModal() {
  modal.classList.add("hidden");
  modalContinue.removeEventListener("click", () => {
    closeModal();
    startTimer();
  });
  modalSurrender.removeEventListener("click", () => {
    modalSurrender.classList.add("hidden");
    closeModal();
    gameOver();
  });
}

function youWin() {
  showModal("Grande! Hai vinto!\nFacciamo un'altra partita?");
  stopTimer();
  addMatch("win");
  endGame();
  resetGame();
  printHistory();
}

function gameOver() {
  endGame();
  handleReaction("bad");
  highlightBombs();
  stopTimer();
  addMatch("lost");
  printHistory();
}

function endGame() {
  board.style.pointerEvents = "none";
}

function addMatch(outcome) {
  let newTime = timerDisplay.innerText;
  saveMatch(outcome, Date.now(), difficulty.value, newTime);
}

/**
 * Al click su una cella avvia tutte le funzioni per lo svolgimento del gioco.
 */
function handleClick(id) {
  if (firstClick) {
    if (isABomb(id)) {
      generateBombsIds();
      handleClick(id);
    }
    firstClick = false;
  }
  let cell = virtualCells[id].DOMCell.cellReference;
  if (!flaggedCells.includes(id)) {
    if (isABomb(id)) {
      gameOver();
    } else if (!virtualCells[id].clicked) {
      clickedCells++;
      virtualCells[id].clicked = true;
      handleReaction("good");
      defineCloseCells(id);
      let closeBombsCounter = countCloseBombs();
      if (closeBombsCounter === 0) {
        cell.classList.add("not");
        checkSurroundingCells(id);
      } else {
        cell.innerText = closeBombsCounter;
        cell.style.color = colorCounter(closeBombsCounter);
      }

      cell.classList.add("not");
      setTheUI();
    }
  }
}
function handleReaction(type) {
  let reaction = "";
  let index = -1;
  let textIndex = -1;
  let isBad = header_text.classList.contains("bad");
  switch (type) {
    case "bad":
      index = Math.floor(Math.random() * icons.reactions[0].length);
      textIndex = Math.floor(Math.random() * reaction_texts.bad.length);
      reaction = icons.reactions[0][index];
      header_text.innerText = reaction_texts.bad[textIndex];
      header_icon.src = `./imgs/icons/moves_reactions/${reaction}.svg`;
      if (!isBad) {
        header_text.classList.add("bad");
      }
      break;
    case "good":
      index = Math.floor(Math.random() * icons.reactions[1].length);
      textIndex = Math.floor(Math.random() * reaction_texts.good.length);
      reaction = icons.reactions[1][index];
      header_text.innerText = reaction_texts.good[textIndex];
      header_icon.src = `./imgs/icons/moves_reactions/${reaction}.svg`;
      if (isBad) {
        header_text.classList.remove("bad");
      }
      break;
  }
}
/**
 * Verifica se le celle adiacenti hanno contatore zero, in quel caso gli applica la funzione handleClick
 */
function checkSurroundingCells(_id) {
  theseAreCloseCells.forEach((cell) => {
    handleClick(cell.id);
  });
}

/**
 * Stampa a schermo il contatore delle celle flaggate e delle bombe rimanenti.
 * Chiama allBombsFlagged().
 */
function setTheUI() {
  if (seconds === 60) {
    minutes++;
    seconds = 0;
  }
  let timeString = `${minutes.toString()}:${seconds
    .toString()
    .padStart(2, "0")}`;
  flagsDisplay.innerText = flaggedCells.length;
  remainingDisplay.innerText =
    n_Bombs - flaggedCells.length < 0 ? "0" : n_Bombs - flaggedCells.length;
  allBombsFlagged();
  clickedCellsDisplay.innerText = clickedCells;
  timerDisplay.innerText = timeString;
}

/**
 * Colora il testo della cella in base al numero di bombe tra le celle vicine
 */
function colorCounter(closeCounter) {
  switch (closeCounter) {
    case 0:
      return "#07fc03";
      break;
    case 1:
      return "#00ffb7";
      break;
    case 2:
      return "#f743eb";
      break;
    case 3:
      return "#ff3838";
      break;
    case 4:
      return "#ff8438";
      break;
    case 5:
      return "#0011ff";
      break;
    case 6:
      return "#5b00a1";
      break;
    case 7:
      return "#002736";
      break;
    case 8:
      return "#592700";
      break;
  }
}

/**
 * Verifica che tutte le celle flaggate siano effettivamente delle bombe, e determina se si è vinto la partita o se si è flaggata qualche cella che non sia una bomba.
 */
function allBombsFlagged() {
  if (flaggedBombs.length === n_Bombs && flaggedCells.length === n_Bombs) {
    youWin();
  } else if (flaggedCells.length >= n_Bombs) {
    stopTimer();
    alert(
      "Hai flaggato qualche casella ancora valida!\nHai 3 secondi per sflaggarne almeno una e continuare a giocare, altrimenti rivedrai questo messaggio"
    );
    setTimeout(() => {startTimer()}, 3000);
  }
}

/**
 * Controlla se la cella cliccata sia una bomba o meno.
 */
function isABomb(id) {
  return bombs.includes(id) ? true : false;
}

/**
 * Evidenzia tutte le celle che sono delle bombe.
 */
function highlightBombs() {
  virtualCells.forEach((cell) => {
    if (bombs.includes(cell.id)) {
      cell.DOMCell.cellReference.classList.remove("flagged");
      cell.DOMCell.cellReference.classList.add("bomb");
    }
  });
}

/**
 * Permette di flaggare e bloccare le celle che si ritiene essere bombe
 */
function flagCell(id) {
  let cell = virtualCells[id].DOMCell.cellReference;
  if (!cell.classList.contains("not")) {
    if (!flaggedCells.includes(id)) {
      cell.classList.toggle("flagged");
      flaggedCells.push(id);
      if (bombs.includes(id)) {
        flaggedBombs.push(id);
      }
    } else {
      flaggedCells.splice(flaggedCells.indexOf(id), 1);
      cell.classList.toggle("flagged");
      if (bombs.includes(id)) {
        flaggedBombs.splice(flaggedBombs.indexOf(id), 1);
      }
    }
  }
  setTheUI();
}

/**
 * Controlla quante siano le bombe tra le 8 celle adiacenti a clickedCell
 */
function countCloseBombs() {
  let counter = 0;
  theseAreCloseCells.forEach((cell) => {
    if (bombs.includes(cell.id)) {
      counter++;
    }
  });
  return counter;
}

/**
 * Definisce quali siano le celle adiacenti a clickedCell e le raccoglie in theseAreCloseCells.
 */
function defineCloseCells(_id) {
  let surroundingCells = [];
  let x = virtualCells[_id].DOMCell.x;
  let y = virtualCells[_id].DOMCell.y;

  virtualCells.forEach((cell, index) => {
    if (between(x, cell.DOMCell.x) && between(y, cell.DOMCell.y)) {
      index === _id
        ? null
        : surroundingCells.push({
            id: index,
            x: cell.DOMCell.x,
            y: cell.DOMCell.y,
            cell: cell.DOMCell.cellReference,
          });
    }
  });
  theseAreCloseCells = surroundingCells;
}

/**
 * Aggiunge al display dello storico delle partite tutte le partite
 */
function printHistory() {
  if (historyExist()) {
    let matches = getHistory().matches;
    historyDisplay.innerHTML = "";

    if (matches.length > 0) {
      matches.forEach((match) => {
        const newMatch = document.createElement("div");
        newMatch.classList.add("singleMatch");
        const icon = document.createElement("img");
        if (match.outcome === "win") {
          icon.src = "./imgs/icons/history/history_check.svg";
        } else {
          icon.src = "./imgs/icons/history/history_cross.svg";
        }
        const date = document.createElement("span");
        let data = new Date(match.timestamp);
        date.innerText = `${data.getDate()}/${
          data.getMonth() + 1
        }/${data.getFullYear()}`;
        const time = document.createElement("span");
        time.innerText = match.time;
        const level = document.createElement("span");
        level.innerText = match.level;
        newMatch.appendChild(icon);
        newMatch.appendChild(date);
        newMatch.appendChild(time);
        newMatch.appendChild(level);
        historyDisplay.appendChild(newMatch);
      });
    }
  }
}

function controlHistoryDisplay() {
  if (historyExist()) {
    printHistory();
    document.querySelector('[for="history_display"').style = "display: block;";
    historyDisplay.style = "display: block;";
  } else {
    document.querySelector('[for="history_display"').style = "display: none;";
    historyDisplay.style = "display: none;";
  }
}

/**
 * Controlla se le coordinate della cella in esame sia compresa in un determinato range.
 */
function between(ref, toCompare) {
  if (toCompare >= ref - 1 && toCompare <= ref + 1) {
    return true;
  } else return false;
}

/**
 * Se il gioco non è stato avviato manda un alert, altrimenti chiede conferma sul voler abbandonare il gioco e stoppa l'esecuzione.
 */
function surrender() {
  if (firstClick) {
    stopTimer()
    alert("Dai inizia a giocare almeno!");
    startTimer();
  } else {
    let arreso = confirm("sicuro?");
    if(arreso) {
      gameOver();
    } else {
      startTimer();
    }
  }
}
