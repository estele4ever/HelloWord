export const PIECE_SYMBOLS = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
};

export function createInitialBoard() {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRank[col], color: 'black', hasMoved: false };
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
    board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
    board[7][col] = { type: backRank[col], color: 'white', hasMoved: false };
  }
  return board;
}

function cloneBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function isInBounds(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

const DIRECTIONS = {
  rook: [[-1, 0], [1, 0], [0, -1], [0, 1]],
  bishop: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
  queen: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]],
};

const KNIGHT_OFFSETS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const KING_OFFSETS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

// Coups "pseudo-légaux" d'une pièce : respecte les règles de déplacement,
// mais ne vérifie pas encore si ça met son propre roi en échec
function getPseudoMoves(board, row, col, lastMove) {
  const piece = board[row][col];
  if (!piece) return [];
  const moves = [];
  const { type, color } = piece;

  if (type === 'pawn') {
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;

    if (isInBounds(row + direction, col) && !board[row + direction][col]) {
      moves.push({ row: row + direction, col });
      if (row === startRow && !board[row + 2 * direction][col]) {
        moves.push({ row: row + 2 * direction, col, isDoubleStep: true });
      }
    }

    for (const dc of [-1, 1]) {
      const nr = row + direction;
      const nc = col + dc;
      if (isInBounds(nr, nc)) {
        const target = board[nr][nc];
        if (target && target.color !== color) {
          moves.push({ row: nr, col: nc });
        }
        if (
          lastMove &&
          lastMove.piece.type === 'pawn' &&
          lastMove.isDoubleStep &&
          lastMove.to.row === row &&
          lastMove.to.col === nc
        ) {
          moves.push({ row: nr, col: nc, isEnPassant: true });
        }
      }
    }
  } else if (type === 'knight') {
    for (const [dr, dc] of KNIGHT_OFFSETS) {
      const nr = row + dr;
      const nc = col + dc;
      if (isInBounds(nr, nc)) {
        const target = board[nr][nc];
        if (!target || target.color !== color) {
          moves.push({ row: nr, col: nc });
        }
      }
    }
  } else if (type === 'king') {
    for (const [dr, dc] of KING_OFFSETS) {
      const nr = row + dr;
      const nc = col + dc;
      if (isInBounds(nr, nc)) {
        const target = board[nr][nc];
        if (!target || target.color !== color) {
          moves.push({ row: nr, col: nc });
        }
      }
    }
    if (!piece.hasMoved) {
      const rookKingSide = board[row][7];
      if (
        rookKingSide &&
        rookKingSide.type === 'rook' &&
        !rookKingSide.hasMoved &&
        !board[row][5] &&
        !board[row][6]
      ) {
        moves.push({ row, col: 6, isCastling: 'kingside' });
      }
      const rookQueenSide = board[row][0];
      if (
        rookQueenSide &&
        rookQueenSide.type === 'rook' &&
        !rookQueenSide.hasMoved &&
        !board[row][1] &&
        !board[row][2] &&
        !board[row][3]
      ) {
        moves.push({ row, col: 2, isCastling: 'queenside' });
      }
    }
  } else {
    // Tour, fou, dame : pièces "glissantes"
    for (const [dr, dc] of DIRECTIONS[type]) {
      let nr = row + dr;
      let nc = col + dc;
      while (isInBounds(nr, nc)) {
        const target = board[nr][nc];
        if (!target) {
          moves.push({ row: nr, col: nc });
        } else {
          if (target.color !== color) {
            moves.push({ row: nr, col: nc });
          }
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  }

  return moves;
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

export function isSquareAttacked(board, row, col, byColor) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === byColor) {
        const moves = getPseudoMoves(board, r, c, null);
        if (moves.some((m) => m.row === row && m.col === col)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function isInCheck(board, color) {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const opponentColor = color === 'white' ? 'black' : 'white';
  return isSquareAttacked(board, kingPos.row, kingPos.col, opponentColor);
}

export function applyMove(board, from, to, move) {
  const newBoard = cloneBoard(board);
  const piece = newBoard[from.row][from.col];

  if (move.isEnPassant) {
    newBoard[from.row][to.col] = null;
  }

  if (move.isCastling === 'kingside') {
    newBoard[to.row][5] = newBoard[to.row][7];
    newBoard[to.row][7] = null;
    if (newBoard[to.row][5]) newBoard[to.row][5].hasMoved = true;
  } else if (move.isCastling === 'queenside') {
    newBoard[to.row][3] = newBoard[to.row][0];
    newBoard[to.row][0] = null;
    if (newBoard[to.row][3]) newBoard[to.row][3].hasMoved = true;
  }

  newBoard[from.row][from.col] = null;

  // Promotion automatique en dame
  if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
    newBoard[to.row][to.col] = { type: 'queen', color: piece.color, hasMoved: true };
  } else {
    newBoard[to.row][to.col] = { ...piece, hasMoved: true };
  }

  return newBoard;
}

// Coups légaux : coups pseudo-légaux qui ne mettent pas son propre roi en échec
export function getLegalMoves(board, row, col, lastMove) {
  const piece = board[row][col];
  if (!piece) return [];

  const pseudoMoves = getPseudoMoves(board, row, col, lastMove);

  return pseudoMoves.filter((move) => {
    const testBoard = applyMove(board, { row, col }, { row: move.row, col: move.col }, move);
    return !isInCheck(testBoard, piece.color);
  });
}

export function getAllLegalMoves(board, color, lastMove) {
  const allMoves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        allMoves.push(...getLegalMoves(board, r, c, lastMove));
      }
    }
  }
  return allMoves;
}

export function getGameStatus(board, color, lastMove) {
  const inCheck = isInCheck(board, color);
  const hasMoves = getAllLegalMoves(board, color, lastMove).length > 0;

  if (inCheck && !hasMoves) return 'checkmate';
  if (!inCheck && !hasMoves) return 'stalemate';
  if (inCheck) return 'check';
  return 'playing';
}