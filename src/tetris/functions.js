export const COLS = 10;
export const ROWS = 20;

// Chaque pièce est définie par ses formes dans ses 4 rotations possibles (0, 90, 180, 270)
export const TETROMINOES = {
  I: {
    color: 'cyan',
    rotations: [
      [[0, 0], [0, 1], [0, 2], [0, 3]],
      [[0, 0], [1, 0], [2, 0], [3, 0]],
      [[0, 0], [0, 1], [0, 2], [0, 3]],
      [[0, 0], [1, 0], [2, 0], [3, 0]],
    ],
  },
  O: {
    color: 'yellow',
    rotations: [
      [[0, 0], [0, 1], [1, 0], [1, 1]],
      [[0, 0], [0, 1], [1, 0], [1, 1]],
      [[0, 0], [0, 1], [1, 0], [1, 1]],
      [[0, 0], [0, 1], [1, 0], [1, 1]],
    ],
  },
  T: {
    color: 'purple',
    rotations: [
      [[0, 1], [1, 0], [1, 1], [1, 2]],
      [[0, 1], [1, 1], [1, 2], [2, 1]],
      [[1, 0], [1, 1], [1, 2], [2, 1]],
      [[0, 1], [1, 0], [1, 1], [2, 1]],
    ],
  },
  S: {
    color: 'green',
    rotations: [
      [[0, 1], [0, 2], [1, 0], [1, 1]],
      [[0, 1], [1, 1], [1, 2], [2, 2]],
      [[0, 1], [0, 2], [1, 0], [1, 1]],
      [[0, 1], [1, 1], [1, 2], [2, 2]],
    ],
  },
  Z: {
    color: 'red',
    rotations: [
      [[0, 0], [0, 1], [1, 1], [1, 2]],
      [[0, 2], [1, 1], [1, 2], [2, 1]],
      [[0, 0], [0, 1], [1, 1], [1, 2]],
      [[0, 2], [1, 1], [1, 2], [2, 1]],
    ],
  },
  J: {
    color: 'blue',
    rotations: [
      [[0, 0], [1, 0], [1, 1], [1, 2]],
      [[0, 1], [0, 2], [1, 1], [2, 1]],
      [[1, 0], [1, 1], [1, 2], [2, 2]],
      [[0, 1], [1, 1], [2, 0], [2, 1]],
    ],
  },
  L: {
    color: 'orange',
    rotations: [
      [[0, 2], [1, 0], [1, 1], [1, 2]],
      [[0, 1], [1, 1], [2, 1], [2, 2]],
      [[1, 0], [1, 1], [1, 2], [2, 0]],
      [[0, 0], [0, 1], [1, 1], [2, 1]],
    ],
  },
};

const PIECE_KEYS = Object.keys(TETROMINOES);

export function getRandomPieceType() {
  return PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
}

export function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function createPiece(type) {
  return {
    type,
    rotation: 0,
    row: 0,
    col: type === 'I' ? 3 : 3,
  };
}

function getShape(piece) {
  return TETROMINOES[piece.type].rotations[piece.rotation];
}

// Renvoie les positions absolues (sur le plateau) occupées par la pièce
export function getPieceCells(piece) {
  return getShape(piece).map(([r, c]) => ({
    row: piece.row + r,
    col: piece.col + c,
  }));
}

export function isValidPosition(board, piece) {
  const cells = getPieceCells(piece);
  return cells.every(({ row, col }) => {
    if (col < 0 || col >= COLS || row >= ROWS) return false;
    if (row < 0) return true; // au-dessus du plateau : autorisé (pièce qui apparaît)
    return board[row][col] === null;
  });
}

export function movePiece(board, piece, deltaRow, deltaCol) {
  const moved = { ...piece, row: piece.row + deltaRow, col: piece.col + deltaCol };
  return isValidPosition(board, moved) ? moved : null;
}

export function rotatePiece(board, piece) {
  const nextRotation = (piece.rotation + 1) % 4;
  const rotated = { ...piece, rotation: nextRotation };
  if (isValidPosition(board, rotated)) return rotated;

  // Petits ajustements ("kicks") si la rotation seule ne passe pas : on essaie de décaler d'une case
  for (const [dr, dc] of [[0, -1], [0, 1], [0, -2], [0, 2]]) {
    const kicked = { ...rotated, row: rotated.row + dr, col: rotated.col + dc };
    if (isValidPosition(board, kicked)) return kicked;
  }
  return null;
}

// Fusionne la pièce dans le plateau (quand elle a fini de tomber)
export function mergePieceIntoBoard(board, piece) {
  const newBoard = board.map((row) => [...row]);
  const color = TETROMINOES[piece.type].color;
  getPieceCells(piece).forEach(({ row, col }) => {
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      newBoard[row][col] = color;
    }
  });
  return newBoard;
}

// Retire les lignes complètes, fait descendre les lignes au-dessus, et renvoie le nombre retiré
export function clearFullLines(board) {
  const remainingRows = board.filter((row) => row.some((cell) => cell === null));
  const clearedCount = ROWS - remainingRows.length;
  const newEmptyRows = Array.from({ length: clearedCount }, () => Array(COLS).fill(null));
  return { newBoard: [...newEmptyRows, ...remainingRows], clearedCount };
}

export function calculateScore(clearedCount, level) {
  const basePoints = { 0: 0, 1: 100, 2: 300, 3: 500, 4: 800 };
  return (basePoints[clearedCount] || 0) * level;
}

export function getSpeedForLevel(level) {
  return Math.max(100, 800 - (level - 1) * 70);
}