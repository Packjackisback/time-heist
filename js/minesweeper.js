document.addEventListener("DOMContentLoaded", () => {
  const gridSize = 8; 
  const mineCount = 10; 
  const grid = document.getElementById("grid");

  let cells = [];
  let gameOver = false;

  const directions = [
    { row: -1, col: -1 }, // Top-left
    { row: -1, col: 0 },  // Top
    { row: -1, col: 1 },  // Top-right
    { row: 0, col: -1 },  // Left
    { row: 0, col: 1 },   // Right
    { row: 1, col: -1 },  // Bottom-left
    { row: 1, col: 0 },   // Bottom
    { row: 1, col: 1 }    // Bottom-right
  ];

  function initGame() {
    grid.innerHTML = "";
    cells = [];
    gameOver = false;

    grid.style.gridTemplateRows = `repeat(${gridSize}, 40px)`;
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;

    for (let i = 0; i < gridSize * gridSize; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.index = i;
      grid.appendChild(cell);
      cells.push({
        element: cell,
        mine: false,
        revealed: false,
        flagged: false,
        adjacentMines: 0
      });

      cell.addEventListener("click", () => handleCellClick(i));
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(i);
      });
    }

    placeMines();
    calculateAdjacency();
  }

  function placeMines() {
    let minesPlaced = 0;

    while (minesPlaced < mineCount) {
      const index = Math.floor(Math.random() * cells.length);
      if (!cells[index].mine) {
        cells[index].mine = true;
        minesPlaced++;
      }
    }
  }

  function calculateAdjacency() {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const currentIndex = row * gridSize + col;
        if (cells[currentIndex].mine) continue;

        let adjacentMines = 0;

        directions.forEach(({ row: dRow, col: dCol }) => {
          const neighborRow = row + dRow;
          const neighborCol = col + dCol;

          if (neighborRow >= 0 && neighborRow < gridSize && neighborCol >= 0 && neighborCol < gridSize) {
            const neighborIndex = neighborRow * gridSize + neighborCol;

            if (cells[neighborIndex].mine) {
              adjacentMines++;
            }
          }
        });

        cells[currentIndex].adjacentMines = adjacentMines;
      }
    }
  }

  function handleCellClick(index) {
    if (gameOver || cells[index].revealed || cells[index].flagged) return;

    const cell = cells[index];
    cell.revealed = true;
    cell.element.classList.add("revealed");

    if (cell.mine) {
      cell.element.classList.add("mine");
      gameOver = true;

      sessionStorage.setItem("minigameResult", "fail");
      alert("Game Over! You hit a mine!");
      window.location.href = "game-over.html";
      return;
    }

    if (cell.adjacentMines > 0) {
      cell.element.textContent = cell.adjacentMines;
    } else {
      revealAdjacentCells(index);
    }

    checkWin();
  }

  function revealAdjacentCells(index) {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    directions.forEach(({ row: dRow, col: dCol }) => {
      const neighborRow = row + dRow;
      const neighborCol = col + dCol;

      if (neighborRow >= 0 && neighborRow < gridSize && neighborCol >= 0 && neighborCol < gridSize) {
        const neighborIndex = neighborRow * gridSize + neighborCol;
        const neighbor = cells[neighborIndex];

        if (!neighbor.revealed && !neighbor.mine) {
          handleCellClick(neighborIndex);
        }
      }
    });
  }

  function toggleFlag(index) {
    if (gameOver || cells[index].revealed) return;

    const cell = cells[index];
    cell.flagged = !cell.flagged;
    cell.element.classList.toggle("flagged");
  }

  function revealAll() {
    cells.forEach((cell) => {
      if (cell.mine) {
        cell.element.classList.add("mine");
      } else {
        cell.element.classList.add("revealed");
        if (cell.adjacentMines > 0) {
          cell.element.textContent = cell.adjacentMines;
        }
      }
    });
  }

  function checkWin() {
    const unrevealedCells = cells.filter((cell) => !cell.revealed && !cell.mine);
    if (unrevealedCells.length === 0) {
      gameOver = true;

      sessionStorage.setItem("minigameResult", "success");
      alert("Congratulations! You cleared the minefield!");
      redirectToMainGame();
    }
  }

  function redirectToMainGame() {
    window.location.href = "mission.html";
  }


  initGame();
});
