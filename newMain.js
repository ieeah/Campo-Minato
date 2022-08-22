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
  // creo x celle per coprire le dimensioni del campo
  board.innerHTML = "";
  let j = 0;
  for (let y = 1; y <= boardSize; y++) {
    for (let x = 1; x <= boardSize; x++) {
      const cell = document.createElement("div");
      
      cell.classList.add("cell");
      cell.style.width = `calc(100% / ${boardSize})`;
      cell.style.height = `calc(100% / ${boardSize})`;
      cell.dataset.id = j;
      
      const cellId = parseInt(cell.dataset.id);
      // click normale, si setta la cella cliccata e si controlla che sia o meno una bomba
      cell.addEventListener("click", () => {
        setClickedCell(cellId, x, y, cell);
        isBomb(cellId);
      });

      //click tasto dx, si avvia la funzione per il flaggin della cella clicclata
      cell.addEventListener("contextmenu", () => {
        e.preventDefault();
        flagCell(cellId);
      });

      if (bombs.includes(cellId)) {
        virtualBombs.push(cellId);
      }

      virtualCells[cellId] = {
        id: cellId,
        DOMCell: { x: x, y: y, cellReference: cell },
      };

      board.appendChild(cell);
      j++;
    }
  }
};

// TODO: FARE FUNZIONE PER GAME OVER
const isBomb = (id) => {
  bombs.includes(id) ? alert("BOMBA!") : alert("NESSUNA BOMBA!");
}






















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