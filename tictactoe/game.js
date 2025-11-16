const board = document.getElementById("board");
const status = document.getElementById("status");
let cells = Array(9).fill(null);
let playerTurn = true;

function renderBoard() {
  board.innerHTML = "";
  cells.forEach((cell, i) => {
    const cellDiv = document.createElement("div");
    cellDiv.textContent = cell;
    cellDiv.addEventListener("click", () => {
      if (playerTurn && !cells[i]) {
        cells[i] = "X";
        playerTurn = false;
        renderBoard();
        checkWinner();
        aiMove();
      }
    });
    board.appendChild(cellDiv);
  });
}

function aiMove() {
  fetchGeminiMove(cells).then((moveIndex) => {
    if (moveIndex !== null && cells[moveIndex] === null) {
      cells[moveIndex] = "O";
      playerTurn = true;
      renderBoard();
      checkWinner();
    }
  });
}

function checkWinner() {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      status.textContent = `${cells[a]} wins!`;
      board.style.pointerEvents = "none";
      return;
    }
  }

  if (!cells.includes(null)) {
    status.textContent = "It's a draw!";
  }
}

async function fetchGeminiMove(boardState) {
  const prompt = `You are playing Tic Tac Toe. The board is represented as an array of 9 elements: ${JSON.stringify(boardState)}. Return the index (0-8) where the AI should play next to win or block.`;

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + window.GEMINI_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const match = text?.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

renderBoard();
