const SIZE = 9;
const BOX_SIZE = 3;

function createEmptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function isValidPlacement(grid, row, col, value) {
  for (let i = 0; i < SIZE; i++) {
    if (grid[row][i] === value || grid[i][col] === value) {
      return false;
    }
  }
  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      if (grid[r][c] === value) {
        return false;
      }
    }
  }
  return true;
}

// Remplit la grille par backtracking (avec de l'aléatoire pour varier les parties)
function fillGrid(grid) {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (grid[row][col] === 0) {
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) {
              return true;
            }
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function generateSolvedGrid() {
  const grid = createEmptyGrid();
  fillGrid(grid);
  return grid;
}

export const DIFFICULTIES = {
  facile: { label: 'Facile', clues: 42 },
  moyen: { label: 'Moyen', clues: 32 },
  difficile: { label: 'Difficile', clues: 26 },
};

// Retire des cases de la grille résolue pour créer le puzzle à jouer
export function generatePuzzle(difficultyKey) {
  const solution = generateSolvedGrid();
  const clueCount = DIFFICULTIES[difficultyKey].clues;
  const cellsToRemove = SIZE * SIZE - clueCount;

  const puzzle = solution.map((row) => [...row]);
  const positions = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, i) => i)
  ).slice(0, cellsToRemove);

  positions.forEach((pos) => {
    const row = Math.floor(pos / SIZE);
    const col = pos % SIZE;
    puzzle[row][col] = 0;
  });

  return { puzzle, solution };
}

// Renvoie une grille de booléens : true si la case fait partie de l'énoncé (non modifiable)
export function getFixedCells(puzzle) {
  return puzzle.map((row) => row.map((value) => value !== 0));
}

// Vérifie si une valeur posée par le joueur entre en conflit avec les règles du sudoku
export function hasConflict(grid, row, col, value) {
  if (value === 0) return false;

  for (let i = 0; i < SIZE; i++) {
    if (i !== col && grid[row][i] === value) return true;
    if (i !== row && grid[i][col] === value) return true;
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      if ((r !== row || c !== col) && grid[r][c] === value) {
        return true;
      }
    }
  }
  return false;
}

export function isGridComplete(grid) {
  return grid.every((row) => row.every((value) => value !== 0));
}

export function isGridCorrect(grid, solution) {
  return grid.every((row, r) => row.every((value, c) => value === solution[r][c]));
}