// import translations from "./js/translations";

// crea le referenze al DOM per accesso semplificato.
const board = document.getElementById("boardgame");
const difficulty = document.getElementById("levelSelect");
const startButton = document.getElementById("start");
const surrenderButton = document.getElementById("surrender");
const flagsDisplay = document.getElementById("flaggedCells");
const remainingDisplay = document.getElementById("unexploded");
const modal = document.querySelector(".modal");
const modalMessage = document.querySelector(".modal_message");
const modalConfirm = document.querySelector(".modal_button.confirm");
const modalDeny = document.querySelector(".modal_button.deny");
const header_text = document.getElementById("reactions_text");
const header_icon = document.getElementById("reactions_icon");
const clickedCellsDisplay = document.getElementById("clickedCellsDisplay");
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

// creo le variabili necessarie per lo svolgimento del gioco

let allCells = [];
// il numero di bombe presenti sul campo
let n_Bombs = 12;
// l'elenco degli id delle celle che sono bombe
let virtualBombs = [];
// la dimensione del campo
let boardSize = 10;
// flag per capire se il gioco è in corso o meno (potrebbe essere utile per il reset del gioco ed il setting di un timer)
// l'elenco degli id delle celle che sono state flaggate
let flaggedCells = [];
// l'elenco degli id delle bombe che sono state flaggate
let flaggedBombs = 0;
// il numero di bombe che rimangono da scoprire
let remainingBombs = n_Bombs;
// le celle vicine alla cella cliccata
let theseAreCloseCells = [];
// il numero di bombe tra le celle vicine alla cella cliccata
let closeCounter = 0;
// id e referenza alla cella cliccata
let clickedCell = { id: null, DOMCell: { x: null, y: null, cell: null } };
// una rappresentazione fittizia di tutte le celle
let virtualCells = [];
// una flag per definire se la partita è stata vinta o meno.
let victory = null;

let bombs = []; // array di id delle celle che sono bombe

let clickedCells = 0;

let gameTimer = null;
let seconds = 0;
setTheUI();

startButton.addEventListener("click", () => {
  startGame();
  gameTimer = setInterval(() => {
    seconds++;
    setTheUI();
  }, 1000);
});
surrenderButton.addEventListener("click", () => {
  surrender();
});

/**
 * Funzione che avvia la creazione del campo di gioco e prepara tutti i dati necessari per lo svolgimento del gioco.
 */
const startGame = () => {
  resetGame();
  getDifficultyLevel();
  generateBombsIds();
  setTheUI();
  generateBoard();
};
/**
 * Funzione che resetta tutti i dati di gioco e azzera l'interfaccia.
 */
const resetGame = () => {
  allCells = [];
  n_Bombs = 12;
  victory = null;
  remainingBombs = n_Bombs;
  flaggedBombs = 0;
  theseAreCloseCells = [];
  closeCounter = 0;
  clickedCell = { id: null, DOMCell: { x: null, y: null, cell: null } };
  virtualCells = [];
  flaggedCells = [];
  bombs = [];
  boardSize = 10;
  header_text.innerText = "Weee Giochiamoo?";
  header_icon.src = "./imgs/icons/new_game.svg";
  clickedCells = 0;
  seconds = 0;
  if(gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  setTheUI();
};

/**
 * Funzione che setta il numero di celle e di bombe in base al livello di difficoltà selezionato dall'utente.
 */
const getDifficultyLevel = () => {
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
};

/**
 * Generazione degli id delle celle che saranno delle bombe.
 */
const generateBombsIds = () => {
  while (bombs.length < n_Bombs) {
    let randomId = Math.floor(Math.random() * (boardSize * boardSize));
    if (!bombs.includes(randomId)) {
      bombs.push(randomId);
    }
  }
};

/**
 * Funzione che setta la cella cliccata con i riferimenti alla cella stessa, il suo id e le sue coordinate.
 */
const setClickedCell = (id, x, y, cellReference) => {
  clickedCell = { id: id, DOMCell: { x: x, y: y, cell: cellReference } };
};

/**
 * Generazione delle celle del DOM, di ogni cella viene salvata una referenza alla cella stessa in virtualCells.
 */
const generateBoard = () => {
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
        setClickedCell(cellId, x, y, cell);
        handleClick(cellId);
      });

      //click tasto dx, si avvia la funzione per il flaggin della cella clicclata
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        flagCell(cellId);
      });

      if (bombs.includes(cellId)) {
        virtualBombs.push(cell);
      }

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
};

/**
 * Manda un alert di sconfitta al giocatore, chiama la funzione highlightBombs() e disattiva tutti i click sulla tavola di gioco.
 */
const gameOver = () => {
  highlightBombs();
  board.style.pointerEvents = "none";
  alert("Oh no!\nHai perso la partita!\nTranquillo, puoi farne un'altra!");
  header_text.classList.remove("bad");
  resetGame();
};

/**
 * Al click su una cella avvia tutte le funzioni per lo svolgimento del gioco.
 */
const handleClick = (id, inALoop = false) => {
  cell = virtualCells[id].DOMCell.cellReference;
  if (!flaggedCells.includes(id)) {
    if (isABomb(id)) {
      handleReaction("bad");
      gameOver();
    } else if (!virtualCells[id].clicked) {
      clickedCells++;
      virtualCells[id].clicked = true;
      handleReaction("good");
      let localCloseCells = defineCloseCells(id);
      let closeBombsCounter = countCloseBombs();
      if (closeBombsCounter === 0 && !inALoop) {
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
};

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
  flagsDisplay.innerText = flaggedCells.length;
  remainingDisplay.innerText =
    n_Bombs - flaggedCells.length < 0 ? "0" : n_Bombs - flaggedCells.length;
  allBombsFlagged();
  clickedCellsDisplay.innerText = clickedCells;
  timerDisplay.innerText = seconds;
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
  if (flaggedBombs === n_Bombs && flaggedCells.length === n_Bombs) {
    alert("hai vinto!");
    board.style.pointerEvents = "none";
    // TODO: funzione vittoria
    // youWin();
  } else if (flaggedCells.length >= n_Bombs) {
    alert("Hai flaggato qualche casella ancora valida!");
  }
}

/**
 * Controlla se la cella cliccata sia una bomba o meno.
 */
const isABomb = (id) => {
  return bombs.includes(id) ? true : false;
};

/**
 * Evidenzia tutte le celle che sono delle bombe.
 */
const highlightBombs = () => {
  virtualBombs.forEach((bomb) => {
    bomb.classList.remove("flagged");
    bomb.classList.add("bomb");
  });
};

/**
 * Permette di flaggare e bloccare le celle che si ritiene essere bombe
 */
const flagCell = (id) => {
  cell = virtualCells[id].DOMCell.cellReference;
  if (!cell.classList.contains("not")) {
    if (!flaggedCells.includes(id)) {
      cell.classList.toggle("flagged");
      flaggedCells.push(id);
      if (bombs.includes(id)) {
        flaggedBombs++;
      }
    } else {
      flaggedCells.splice(flaggedCells.indexOf(id), 1);
      cell.classList.toggle("flagged");
      if (bombs.includes(id)) {
        flaggedBombs--;
      }
    }
  }

  setTheUI();
};

/**
 * Controlla quante siano le bombe tra le 8 celle adiacenti a clickedCell
 */
const countCloseBombs = () => {
  let counter = 0;
  theseAreCloseCells.forEach((cell) => {
    if (bombs.includes(cell.id)) {
      counter++;
    }
  });
  return counter;
};

/**
 * Definisce quali siano le celle adiacenti a clickedCell e le raccoglie in theseAreCloseCells.
 */
const defineCloseCells = (_id) => {
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
  return surroundingCells;
};

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
const surrender = () => {
  let sure = confirm("Sicuro di volerti arrendere?");
  if (sure) {
    gameOver();
  } else {
    alert("Ottima scelta!\nIn bocca al lupo!");
  }
};
