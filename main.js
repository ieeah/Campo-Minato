

// DOM references
const board = document.getElementById('boardgame');
const difficulty = document.getElementById('levelSelect');
const startButton = document.getElementById('start');
const surrenderButton = document.getElementById('surrender');
const flagsDisplay = document.getElementById('flaggedCells');
const remainingDisplay = document.getElementById('unexploded');




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
settingTheUI();


startButton.addEventListener('click', () => {
	startGame();
});


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
};

function settingTheUI() {
	flagsDisplay.innerText = flaggedCells.length;
	remainingDisplay.innerText = n_Bombs;
};

function updatingDisplays() {
	flagsDisplay.innerText = flaggedCells.length;
	remainingDisplay.innerText = n_Bombs - flaggedCells.length;
};

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

	// displays
	flagsDisplay.innerText = flaggedCells.length;
	remainingDisplay.innerText = n_Bombs;
};

function getBoardgameSize() {
	switch (difficulty.value) {
		case '1':
			size = 10;
			n_Bombs = 10;
			break;
		
		case '2':
			size = 10;
			n_Bombs = 15;
			break;

		case '3':
			size = 17;
			n_Bombs = 45;
			break;

		case '4':
			size = 20;
			n_Bombs = 58;
			break;
	};
};

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
	console.log(bombs);
};

function generateBoard(size) {

	board.innerHTML = '';
	let j = 0;
	for (let y = 1; y <= size; y++) {
		for (let x = 1; x <= size; x++) {
			const cell = document.createElement('div');


			cell.classList.add('cell');
			cell.style.width = `calc(100% / ${size})`;
			cell.style.height = `calc(100% / ${size})`;
			cell.dataset.x = x;
			cell.dataset.y = y;
			cell.dataset.id = j;
			// click normale
			cell.addEventListener('click', (e) => isBomb(e));
			//click tasto dx
			cell.addEventListener('contextmenu', e => {
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
};

function setCellsData() {
	allCells.forEach((cell, i) => {
		let o = {};
		o['id'] = i;
		o['counter'] = nearBombs(cell);
		o['x'] = cell.dataset.x;
		o['y'] = cell.dataset.y;
		objectCells.push(o);
	});
	console.log(objectCells);
};

function isBomb(e) {
	// reference to the clicked cell
	clickedCell = e.target;
	clickId = parseInt(clickedCell.dataset.id);

	if (clickedCell.classList.contains('flagged')) {
		return false;
	}

	if (bombs.includes(clickId)) {
		gameOver();
	} else {
		clickedCell.classList.add('not');
		clickedCell.innerText = objectCells[clickId].counter;
		openedCells++;
		colorCounter(objectCells[clickId].counter);
	}
	
	watchOpenedCells();
};

function gameOver() {
	allCells.forEach(cell => {
		cell.classList.add('over');
		if (bombs.includes(parseInt(cell.dataset.id))) {
			cell.classList.remove('flagged');
			cell.classList.add('bomb');
			cell.innerHTML = '<i class="fas fa-bomb"></i>';
		}
	});
};

function nearBombs(clickedCell) {

	theseAreCloseCells = [];
	closeCounter = 0;
	// le celle che hanno dataset x -1 / = / +1
	// le celle che hanno dataset y -1 / = / +1
	let x = parseInt(clickedCell.dataset.x);
	let y = parseInt(clickedCell.dataset.y);
	let xm = x - 1;
	let xM = x + 1;
	let ym = y - 1;
	let yM = y + 1;

	allCells.forEach(e => {
		if ( between(parseInt(e.dataset.x), xm, xM)
			&&
			between(parseInt(e.dataset.y), ym, yM)
			)
			{
			theseAreCloseCells.push(e);
		}
	});

	theseAreCloseCells.forEach( e => {
		if (e.dataset.mine == 'true') {
			closeCounter++;
		}
		// TODO Eliminare dataset mine e trovare un altro modo per fare il conteggio delle bombe vicine alle caselle cliccate
	});
	return closeCounter;
};

function colorCounter(closeCounter) {
	switch (closeCounter) {
		case 0:
			clickedCell.style.color = '#07fc03'; 
			break;
		case 1:
			clickedCell.style.color = '#00ffb7';
			break;
		case 2:
			clickedCell.style.color = '#f743eb';
			break;
		case 3:
			clickedCell.style.color = '#ff3838';
			break;
		case 4:
			clickedCell.style.color = '#ff8438';
			break;
		case 5:
			clickedCell.style.color = '#0011ff';
			break;
		case 6:
			clickedCell.style.color = '#5b00a1';
			break;
		case 7:
			clickedCell.style.color = '#002736';
			break;
		case 8:
			clickedCell.style.color = '#592700';
			break;
	}
};

function flagCell(e) {
	let id = e.target.dataset.id;
	let tile = e.target;
	if (!flaggedCells.includes(id)) {
		flaggedCells.push(id);
		tile.classList.add('flagged');

		if (tile.dataset.mine == 'true') {
			flaggedBombs--;
			if (flaggedCells.length == n_Bombs) {
				youWin();
				// TODO - fare funzione vittoria
			}
		}
	} else removeFromFlaggedCells(id, tile);
	updatingDisplays();
};

function removeFromFlaggedCells(id, tile) {
	let j = flaggedCells.indexOf(id);
	flaggedCells.splice(j, 1);
	tile.classList.remove('flagged');
	if (tile.dataset.mine == 'true') {
		flaggedBombs--;
	}
};

function between(num, min, max) {
	if (min <= num && max >= num) {
		return true;
	} else return false;
};

function youWin() {
	if (confirm('HAI VINTO! \n vuoi giocare un\'altra partita?')) {
		startGame();
	} 
};

function watchOpenedCells() {
	if (openedCells == safeCells) {
		youWin();
	}
};

function surrender() {
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