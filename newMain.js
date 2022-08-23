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

// creo le variabili necessarie per lo svolgimento del gioco

let allCells = [];
// il numero di bombe presenti sul campo
let n_Bombs = 12;
// l'elenco degli id delle celle che sono bombe
let virtualBombs = [];
// la dimensione del campo
let boardSize = 10;
// flag per capire se il gioco è in corso o meno (potrebbe essere utile per il reset del gioco ed il setting di un timer)
let gameIsOn = false;
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
// setTheUI();
startButton.addEventListener("click", () => startGame());
surrenderButton.addEventListener("click", () => surrender());

logData();

// TODO: fare una funzione per una splash screen?

/**
 * Funzione che avvia la creazione del campo di gioco e prepara tutti i dati necessari per lo svolgimento del gioco.
 */
const startGame = () => {
  resetGame();
  getDifficultyLevel();
  generateBombsIds();
  generateBoard();
};
/**
 * Funzione che resetta tutti i dati di gioco e azzera l'interfaccia.
 */
const resetGame = () => {
  allCells = [];
  n_Bombs = 12;
  gameIsOn = false;
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
  // setTheUI();
  logData();
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
      boardSize = 10;
      n_Bombs = 20;
      break;

    case "3":
      boardSize = 17;
      n_Bombs = 45;
      break;

    case "4":
      boardSize = 20;
      n_Bombs = 60;
      break;
  }
  console.log("difficulty:", { level: difficulty.level, boardSize, n_Bombs });
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
  console.log("bombs ids:", { bombs });
};

/**
 * Funzione che setta la cella cliccata con i riferimenti alla cella stessa, il suo id e le sue coordinate.
 */
const setClickedCell = (id, x, y, cellReference) => {
  clickedCell = { id: id, DOMCell: { x: x, y: y, cell: cellReference } };

  console.dir("clickedCell:", { clickedCell });
};

/**
 * Generazione delle celle del DOM, di ogni cella viene salvata una referenza alla cella stessa in virtualCells.
 */
const generateBoard = () => {
  console.log("nuova tavola");
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
};

/**
 * Al click su una cella avvia tutte le funzioni per lo svolgimento del gioco.
 */
const handleClick = (id) => {
  cell = virtualCells[id].DOMCell.cellReference;
  if (isABomb(id)) {
    gameOver();
  } else {
    defineCloseCells(id);
    closeBombs = countCloseBombs();
    cell.innerText = closeBombs;
    cell.classList.add("not");
    cell.style.color = colorCounter(closeBombs);
  }
};

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
    bomb.innerHTML = '<i class="fas fa-bomb"></i>';
  });
};

/**
 * Permette di flaggare e bloccare le celle che si ritiene essere bombe
 */
const flagCell = (id) => {
  cell = virtualCells[id].DOMCell.cellReference;
  if (!flaggedCells.includes(id)) {
    cell.classList.toggle("flagged");
    flaggedCells.push(id);
  } else {
    flaggedCells.splice(flaggedCells.indexOf(id), 1);
    cell.classList.toggle("flagged");
  }
  
}

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
  theseAreCloseCells = [...surroundingCells];
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
  if (gameIsOn) {
    victory = "surrender";
    let sure = confirm("Sicuro di volerti arrendere?");
    sure ? gameOver() : alert("Ottima scelta!\nIn bocca al lupo!");
  } else {
    alert("Almeno inizia a giocare prima di arrenderti!");
  }
};

///////////////////////////////////

// TODO: Display bombe flaggate e rimanenti.
// TODO: Quando tutte le bombe vere sono state flaggate alert vittoria.
// TODO: contare e loggare le bombe vicine.
// TODO: quando una celle è flaggata non deve più percepire i click con il tasto sx

//////////////////////////////////

// DEV UTILS
function logData() {
  console.log("logData:", {
    allCells,
    n_Bombs,
    gameIsOn,
    victory,
    remainingBombs,
    flaggedBombs,
    theseAreCloseCells,
    closeCounter,
    clickedCell,
    virtualCells,
    flaggedCells,
    bombs,
    boardSize,
  });
}

function highlightClickedCell(id) {
  virtualCells[id].DOMCell.cellReference.style.backgroundColor = "yellow";
}
