export const DIFFICULTIES = {
  facile: { rows: 8, cols: 8, mines: 10 },
  moyen: { rows: 12, cols: 12, mines: 25 },
  difficile: { rows: 16, cols: 16, mines: 50 },
};

// Crée une grille vide : chaque case est un objet avec ses infos
function createEmptyGrid(rows, cols) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      });
    }
    grid.push(row);
  }
  return grid;
}

// Place les mines aléatoirement, en évitant la case cliquée en premier
function placeMines(grid, rows, cols, mineCount, safeRow, safeCol) {
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    const isSafeZone = Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1;
    if (!grid[r][c].isMine && !isSafeZone) {
      grid[r][c].isMine = true;
      placed++;
    }
  }
  return grid;
}

// Calcule le nombre de mines adjacentes pour chaque case
function calculateAdjacentMines(grid, rows, cols) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) {
            count++;
          }
        }
      }
      grid[r][c].adjacentMines = count;
    }
  }
  return grid;
}

export function createGrid(rows, cols, mines, safeRow, safeCol) {
  let grid = createEmptyGrid(rows, cols);
  grid = placeMines(grid, rows, cols, mines, safeRow, safeCol);
  grid = calculateAdjacentMines(grid, rows, cols);
  return grid;
}

// Révèle une case, et si elle est vide (0 mine adjacente), révèle en cascade les voisines
export function revealCell(grid, row, col) {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = grid.map((r) => r.map((cell) => ({ ...cell })));

  function reveal(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    const cell = newGrid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;

    if (cell.adjacentMines === 0 && !cell.isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            reveal(r + dr, c + dc);
          }
        }
      }
    }
  }

  reveal(row, col);
  return newGrid;
}

export function toggleFlag(grid, row, col) {
  const newGrid = grid.map((r) => r.map((cell) => ({ ...cell })));
  const cell = newGrid[row][col];
  if (!cell.isRevealed) {
    cell.isFlagged = !cell.isFlagged;
  }
  return newGrid;
}

export function revealAllMines(grid) {
  return grid.map((row) =>
    row.map((cell) => (cell.isMine ? { ...cell, isRevealed: true } : cell))
  );
}

export function checkWin(grid) {
  return grid.every((row) =>
    row.every((cell) => cell.isMine || cell.isRevealed)
  );
}

export function countFlags(grid) {
  return grid.reduce(
    (total, row) => total + row.filter((cell) => cell.isFlagged).length,
    0
  );
}