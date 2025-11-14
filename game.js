// ---------------- SPLASH REMOVE ----------------
setTimeout(() => {
  let sp = document.getElementById("splash");
  if (sp) sp.style.display = "none";
}, 2200);

// ---------------- ELEMENTS ----------------
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

const playerSelect = document.getElementById("playerSelect");
const difficultySelect = document.getElementById("difficultySelect");
const modeSelect = document.getElementById("modeSelect");
const playerLabel = document.getElementById("playerLabel");
const diffLabel = document.getElementById("diffLabel");

const resultOverlay = document.getElementById("resultOverlay");
const resultText = document.getElementById("resultText");

let board;
let human;
let ai;
let gameActive = true;

let mode = "single";
let currentTurn = "X";

let moveOwner = Array(9).fill(null);

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// MODE CHANGE
modeSelect.onchange = () => {
  mode = modeSelect.value;

  if (mode === "multi") {
    difficultySelect.classList.add("hide");
    diffLabel.classList.add("hide");
    playerSelect.classList.add("hide");
    playerLabel.classList.add("hide");
  } else {
    difficultySelect.classList.remove("hide");
    diffLabel.classList.remove("hide");
    playerSelect.classList.remove("hide");
    playerLabel.classList.remove("hide");
  }

  startGame();
};

// ---------------- START GAME ----------------
function startGame() {
  board = Array(9).fill(null);
  moveOwner = Array(9).fill(null);
  gameActive = true;

  resultOverlay.classList.add("hide");
  resultText.innerHTML = "";

  restartBtn.disabled = false;

  if (mode === "single") {
    human = playerSelect.value;
    ai = human === "X" ? "O" : "X";

    statusEl.textContent = "Your Turn!";
    renderBoard();

    if (ai === "X") setTimeout(aiMove, 300);

  } else {
    currentTurn = "X";
    statusEl.textContent = "Player X Turn";
    renderBoard();
  }
}

// ---------------- RENDER BOARD ----------------
function renderBoard() {
  boardEl.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";

    if (board[i]) {
      const owner = moveOwner[i];
      cell.innerHTML =
        `<img src="images/${board[i].toLowerCase()}.png" class="xo ${owner} pop">`;
    }

    cell.onclick = () => handleMove(i);
    boardEl.appendChild(cell);
  }
}

// ---------------- HANDLE MOVE ----------------
function handleMove(i) {
  if (!gameActive || board[i]) return;
  if (mode === "single") playerMove(i);
  else multiplayerMove(i);
}

// ---------------- MULTIPLAYER ----------------
function multiplayerMove(i) {
  board[i] = currentTurn;
  moveOwner[i] = currentTurn === "X" ? "human" : "ai";

  renderBoard();
  checkAfterMove(currentTurn);

  if (!gameActive) return;

  currentTurn = currentTurn === "X" ? "O" : "X";
  statusEl.textContent = `Player ${currentTurn} Turn`;
}

// ---------------- PLAYER MOVE ----------------
function playerMove(i) {
  board[i] = human;
  moveOwner[i] = "human";

  renderBoard();
  checkAfterMove(human);

  if (gameActive) setTimeout(aiMove, 250);
}

// ---------------- AI MOVE ----------------
function aiMove() {
  if (!gameActive) return;

  const diff = difficultySelect.value;
  let bestMove;

  if (diff === "easy") bestMove = randomMove();
  else if (diff === "medium") bestMove = mediumMove();
  else if (diff === "hard") bestMove = hardMove();
  else bestMove = minimax(board, ai).index;

  board[bestMove] = ai;
  moveOwner[bestMove] = "ai";

  renderBoard();
  checkAfterMove(ai);
}

// ---------------- SIMPLE AIs ----------------
function randomMove() {
  return board.map((v,i)=> v===null?i:null).filter(v=>v!==null)[
    Math.floor(Math.random()*board.filter(v=>v===null).length)
  ];
}

function mediumMove() {
  for (let w of wins) {
    const [a,b,c] = w;
    if (board[a]===ai && board[b]===ai && !board[c]) return c;
    if (board[a]===ai && board[c]===ai && !board[b]) return b;
    if (board[b]===ai && board[c]===ai && !board[a]) return a;
  }

  for (let w of wins) {
    const [a,b,c] = w;
    if (board[a]===human && board[b]===human && !board[c]) return c;
    if (board[a]===human && board[c]===human && !board[b]) return b;
    if (board[b]===human && board[c]===human && !board[a]) return a;
  }

  return randomMove();
}

function hardMove() {
  const m = mediumMove();
  if (m !== undefined) return m;
  if (board[4] === null) return 4;

  const corners=[0,2,6,8].filter(i=>board[i]===null);
  if (corners.length) return corners[Math.floor(Math.random()*corners.length)];

  return randomMove();
}

function minimax(newBoard, player) {
  const empty=newBoard.map((v,i)=>v===null?i:null).filter(v=>v!==null);

  const win = checkWinner(newBoard);
  if (win) return newBoard[win[0]]===human?{score:-10}:{score:10};

  if (empty.length===0) return {score:0};

  let moves=[];
  for (let i of empty) {
    let move={index:i};
    newBoard[i]=player;

    move.score = (player===ai)
      ? minimax(newBoard,human).score
      : minimax(newBoard,ai).score;

    newBoard[i]=null;
    moves.push(move);
  }

  return (player===ai)
    ? moves.reduce((a,b)=>a.score>b.score?a:b)
    : moves.reduce((a,b)=>a.score<b.score?a:b);
}

// ---------------- WIN / LOSS ----------------
function checkAfterMove(player) {
  let winCombo = checkWinner(board);

  if (winCombo) {
    gameActive=false;

    let owner = moveOwner[winCombo[0]];
    highlightWin(winCombo, owner);

    resultOverlay.classList.remove("hide");

    if (owner==="human") {
      resultText.style.color="#00eaff";
      resultText.innerHTML="YOU WIN!";
    } else {
      resultText.style.color="#ff3b3b";
      resultText.innerHTML="YOU LOSE!";
    }

    // AUTO HIDE + AUTO RESTART
    setTimeout(() => {
      resultOverlay.classList.add("hide");
      startGame();
    }, 3000);

    return;
  }

  if (board.every(c=>c)) {
    gameActive=false;

    resultOverlay.classList.remove("hide");
    resultText.style.color="#ffffff";
    resultText.innerHTML="DRAW";

    setTimeout(() => {
      resultOverlay.classList.add("hide");
      startGame();
    }, 3000);
  }
}

// ---------------- CHECK WINNER ----------------
function checkWinner(b) {
  for (let c of wins) {
    const [a,b1,c2] = c;
    if (b[a] && b[a]===b[b1] && b[a]===b[c2]) return c;
  }
  return null;
}

// ---------------- HIGHLIGHT ----------------
function highlightWin(combo, owner) {
  combo.forEach(i => {
    boardEl.children[i].classList.add(owner==="human"?"human-win":"ai-win");
  });
}

// ---------------- RESTART BUTTON ----------------
restartBtn.onclick = startGame;

// ---------------- INIT ----------------
startGame();
