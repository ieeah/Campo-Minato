// DOM references
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

// data variablese
let allCells = [];
let n_Bombs = 10;
let bombs = [];
let DomBombs = [];
let size = 10;
let gameIsOn = false;
let flaggedCells = [];
let flaggedBombs = 10;
let remainingBombs = n_Bombs;
let theseAreCloseCells = [];
let closeCounter = 0;
let clickedCell = null;
let openedCells = 0;
let objectCells = [];
let safeCells = 0;
let victory = null;

startButton.addEventListener("click", () => {
  startGame();
});

surrenderButton.addEventListener("click", () => {
  surrender();
});

// a questo punto si aspetta che l'utente clicchi su una delle celle per richiamare i metodi attaccati con l'eventListener

// metodi

function startGame() {
  resetGame();
  // setta una flag per il gioco attivo, con cui inviare alert di reset gioco;
  gameIsOn = true;
  // se gameIsOn = true; -> messaggio di allerta;
  // se gameIsOff = fai partire il gioco;
  // prendi il valore di difficoltà
  getBoardgameSize();
  // genera n bombe in base alla difficoltà e inseriscile nell'array "bombe"
  generateBombs();
  // in base al valore della difficoltà genera la tabella con n bombe piazzate in modo random
  generateBoard(size);
  setCellsData();
  settingTheUI();
}

function settingTheUI() {
  flagsDisplay.innerText = flaggedCells.length;
  remainingDisplay.innerText = n_Bombs;
}

function updatingDisplays() {
  flagsDisplay.innerText = flaggedCells.length;
  remainingDisplay.innerText = n_Bombs - flaggedCells.length;
}

function resetGame() {
  gameIsOn = true;
  allCells = [];
  n_Bombs = 10;
  bombs = [];
  DomBombs = [];
  size = 10;
  flaggedCells = [];
  flaggedBombs = 0;
  remainingBombs = n_Bombs;
  theseAreCloseCells = [];
  closeCounter = 0;
  clickedCell = null;
  openedCells = 0;
  objectCells = [];
  safeCells = 0;
  victory = null;

  // // displays
  // flagsDisplay.innerText = flaggedCells.length;
  // remainingDisplay.innerText = n_Bombs;
}

function getBoardgameSize() {
  switch (difficulty.value) {
    case "1":
      size = 10;
      n_Bombs = 10;
      break;

    case "2":
      size = 10;
      n_Bombs = 15;
      break;

    case "3":
      size = 17;
      n_Bombs = 45;
      break;

    case "4":
      size = 20;
      n_Bombs = 58;
      break;
  }
}

function generateBombs() {
  // empty the bombs list
  bombs = [];
  for (let i = 0; i < n_Bombs; i++) {
    let new_bomb = {};
    let id = Math.floor(Math.random() * Math.pow(size, 2));
    if (!bombs.includes(id)) {
      bombs.push(id);
    } else i--;
  }
  console.log("bombs", bombs);
}

function generateBoard(size) {
  board.innerHTML = "";
  let j = 0;
  for (let y = 1; y <= size; y++) {
    for (let x = 1; x <= size; x++) {
      const cell = document.createElement("div");

      cell.classList.add("cell");
      cell.style.width = `calc(100% / ${size})`;
      cell.style.height = `calc(100% / ${size})`;
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.dataset.id = j;
      // click normale
      cell.addEventListener("click", (e) => isBomb(e.target));
      //click tasto dx
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        flagCell(e);
      });

      if (bombs.includes(j)) {
        cell.dataset.mine = true;
      }

      board.appendChild(cell);
      allCells.push(cell);
      j++;
    }
  }
  safeCells = allCells.length - n_Bombs;
}

function setCellsData() {
  allCells.forEach((cell, i) => {
    let o = {};
    o["id"] = i;
    o["counter"] = nearBombs(cell);
    o["closeCells"] = collectSurroundingCells(cell);
    o["x"] = cell.dataset.x;
    o["y"] = cell.dataset.y;
    objectCells.push(o);
  });
  console.log("objectCells", objectCells);
}

function isBomb(_clickedCell) {
  // ottieni l'id della cella cliccata la referenze del DOM
  clickedCell = _clickedCell;
  clickId = parseInt(clickedCell.dataset.id);
  
  // controlla se la cella è stata flaggata o meno

  console.clear();
  console.log("click sulla bomba");

  if (clickedCell.classList.contains("flagged")) {
    console.log("cella flaggata, ABORT");
    return false;
  }

  if (bombs.includes(clickId)) {
    console.log("la cella cliccata è una bomba");
    console.log("chiamo gameOver");
    gameOver();
    return null;
  } else {
    console.log("la cella non è una bomba");
    if (objectCells[clickId].counter === 0) {
      checkSurroundingCells(clickedCell, clickId);
    }
    openedCells++;
    clickedCell.classList.add("not");
    clickedCell.innerText = objectCells[clickId].counter;
    colorCounter(objectCells[clickId].counter);
  }
  console.log("isBomb finito, chiamo watchOpenedCells()");
  watchOpenedCells();
}

function gameOver() {
  victory = false;
  allCells.forEach((cell) => {
    cell.classList.add("over");
    if (bombs.includes(parseInt(cell.dataset.id))) {
      cell.classList.remove("flagged");
      cell.classList.add("bomb");
      cell.innerHTML = '<i class="fas fa-bomb"></i>';
    }
  });
}

function collectSurroundingCells(currentCell) {
  let surroundingCells = [];
  let x = parseInt(currentCell.dataset.x);
  let y = parseInt(currentCell.dataset.y);
  let xm = x - 1;
  let xM = x + 1;
  let ym = y - 1;
  let yM = y + 1;

  allCells.forEach((e) => {
    if (
      between(parseInt(e.dataset.x), xm, xM) &&
      between(parseInt(e.dataset.y), ym, yM)
    ) {
      e === currentCell ? null : surroundingCells.push(e);
    }
  });
  return surroundingCells;
}

function checkSurroundingCells(_clickedCell, _cellId) {
  let surroundingCells = collectSurroundingCells(_clickedCell);
  console.log({ surroundingCells });
  surroundingCells.forEach((cell) => {
    const CELLID = parseInt(cell.dataset.id);
    const CLOSEBOMBS = objectCells[CELLID].counter;
    if (!CLOSEBOMBS) {
      openedCells++;
      clickedCell.classList.add("not");
      clickedCell.innerText = objectCells[CELLID].counter;
      colorCounter(objectCells[CELLID].counter);
    }
    let isABomb = bombs.includes(CELLID) ? "not a bomb" : "it's a bomb";
    console.log({ CELLID, CLOSEBOMBS, isABomb });
  });
}

// function testSurroundingCellsNoRecursion(_clickedCell) {
//   collectSurroundingCells(_clickedCell).forEach(cell => {
//     let currentCellId = parseInt(cell.dataset.id);
//     if(bombs.includes(currentCellId)) {
//       gameOver();
//       return null;
//     } else {
//       console.log("la cella non è una bomba");
//       openedCells++;
//       clickedCell.innerText = objectCells[clickId].counter;
//       colorCounter(objectCells[clickId].counter);
//     }
//   });
// }

function nearBombs(clickedCell) {
  let surroundingCells = collectSurroundingCells(clickedCell);
  closeCounter = 0;

  surroundingCells.forEach((e) => {
    if (e.dataset.mine == "true") {
      closeCounter++;
    }
    // TODO Eliminare dataset mine e trovare un altro modo per fare il conteggio delle bombe vicine alle caselle cliccate
  });
  return closeCounter;
}

function colorCounter(closeCounter) {
  switch (closeCounter) {
    case 0:
      clickedCell.style.color = "#07fc03";
      break;
    case 1:
      clickedCell.style.color = "#00ffb7";
      break;
    case 2:
      clickedCell.style.color = "#f743eb";
      break;
    case 3:
      clickedCell.style.color = "#ff3838";
      break;
    case 4:
      clickedCell.style.color = "#ff8438";
      break;
    case 5:
      clickedCell.style.color = "#0011ff";
      break;
    case 6:
      clickedCell.style.color = "#5b00a1";
      break;
    case 7:
      clickedCell.style.color = "#002736";
      break;
    case 8:
      clickedCell.style.color = "#592700";
      break;
  }
}

function flagCell(e) {
  let cell = e.target;
  let id = e.target.dataset.id;
  let isBomb = bombs.includes(id);
  if (!flaggedCells.includes(id)) {
    flaggedCells.push(id);
    cell.classList.add("flagged");
    if (isBomb) {
      flaggedBombs++;
    }
  } else {
    removeFromFlaggedCells(id, cell);
  }
  if (flaggedBombs === n_Bombs) {
    youWin();
  }
  updatingDisplays();
}

function removeFromFlaggedCells(id, tile) {
  let j = flaggedCells.indexOf(id);
  flaggedCells.splice(j, 1);
  tile.classList.remove("flagged");
  if (bombs.includes(id)) {
    flaggedBombs--;
  }
}

function between(num, min, max) {
  if (min <= num && max >= num) {
    return true;
  } else return false;
}

function youWin() {
  victory = true;
  showModal();
}

function watchOpenedCells() {
  if (openedCells == safeCells) {
    youWin();
  }
}

function surrender() {
  victory = "surrender";
  let surrender = confirm("confermi di voler abbandonare il gioco?");

  if (surrender) {
    board.innerHTML = "<h1>Reset in corso</h1>";
    setTimeout(() => {
      board.innerHTML = "<h1>Manca poco</h1>";
    }, 1500);
    setTimeout(() => {
      board.innerHTML = "<h1>Puoi iniziare una nuova partita!</h1>";
    }, 2900);
    setTimeout(() => {
      resetGame();
    }, 3000);
  }
}

function showModal() {
  setModalMessage();
  modal.classList.remove("hidden");
}

function setModalMessage() {
  if (victory) {
    modalMessage.innerText =
      "Yeeeeeeeah! YOU WIN! \n Would you like to have a rematch!?";
  } else if (!victory) {
    modalMessage.innerText =
      "Oh what a Pity! \n Should we have another match!?";
  } else if (victory === "surrender") {
    modalMessage.innerText = "Oh... ok... \n Are you sure!?";
  }
}

// TODO - finire animazione modale e conferma (la modale appare con il messaggio corretto, ma devo fare in modo che quando clicco sui bottoni facciamo varie azioni)
// TODO - migliorare animazioni bottoni
