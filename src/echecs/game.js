import { useState } from 'react';
import styles from './game.module.css';
import {
  createInitialBoard,
  getLegalMoves,
  applyMove,
  getGameStatus,
  PIECE_SYMBOLS,
} from './functions';

export default function Echecs() {
  const [board, setBoard] = useState(() => createInitialBoard());
  const [currentTurn, setCurrentTurn] = useState('white');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [status, setStatus] = useState('playing');

  function handleSquareClick(row, col) {
    if (status === 'checkmate' || status === 'stalemate') return;

    const piece = board[row][col];

    if (selectedSquare) {
      const move = legalMoves.find((m) => m.row === row && m.col === col);

      if (move) {
        const movedPiece = board[selectedSquare.row][selectedSquare.col];
        const newBoard = applyMove(board, selectedSquare, { row, col }, move);
        const newLastMove = {
          piece: movedPiece,
          from: selectedSquare,
          to: { row, col },
          isDoubleStep: !!move.isDoubleStep,
        };
        const nextTurn = currentTurn === 'white' ? 'black' : 'white';

        setBoard(newBoard);
        setLastMove(newLastMove);
        setCurrentTurn(nextTurn);
        setSelectedSquare(null);
        setLegalMoves([]);
        setStatus(getGameStatus(newBoard, nextTurn, newLastMove));
        return;
      }

      if (piece && piece.color === currentTurn) {
        setSelectedSquare({ row, col });
        setLegalMoves(getLegalMoves(board, row, col, lastMove));
        return;
      }

      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (piece && piece.color === currentTurn) {
      setSelectedSquare({ row, col });
      setLegalMoves(getLegalMoves(board, row, col, lastMove));
    }
  }

  function restartGame() {
    setBoard(createInitialBoard());
    setCurrentTurn('white');
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setStatus('playing');
  }

  let statusMessage;
  if (status === 'checkmate') {
    const winner = currentTurn === 'white' ? 'noirs' : 'blancs';
    statusMessage = `Échec et mat ! Les ${winner} gagnent.`;
  } else if (status === 'stalemate') {
    statusMessage = 'Pat ! Partie nulle.';
  } else if (status === 'check') {
    statusMessage = `Échec au roi ${currentTurn === 'white' ? 'blanc' : 'noir'} !`;
  } else {
    statusMessage = `Au tour des ${currentTurn === 'white' ? 'blancs' : 'noirs'}`;
  }

  return (
    <div className={styles.game}>
      <div className={styles.panel}>
        <div
          className={`${styles['status-message']} ${
            status === 'checkmate' || status === 'stalemate' ? styles.over : ''
          } ${status === 'check' ? styles.check : ''}`}
        >
          {statusMessage}
        </div>
        <button className={styles['restart-button']} onClick={restartGame}>
          🔄 Nouvelle partie
        </button>
      </div>

      <div className={styles.board}>
        {board.map((rowArr, row) =>
          rowArr.map((piece, col) => {
            const isDark = (row + col) % 2 === 1;
            const isSelected =
              selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
            const isLegalTarget = legalMoves.some((m) => m.row === row && m.col === col);
            const isLastMoveSquare =
              lastMove &&
              ((lastMove.from.row === row && lastMove.from.col === col) ||
                (lastMove.to.row === row && lastMove.to.col === col));

            const squareClass = [
              styles.square,
              isDark ? styles.dark : styles.light,
              isSelected ? styles.selected : '',
              isLastMoveSquare ? styles.lastMove : '',
            ].join(' ');

            return (
              <button
                key={`${row}-${col}`}
                className={squareClass}
                onClick={() => handleSquareClick(row, col)}
              >
                {piece && (
                  <span className={styles.piece}>
                    {PIECE_SYMBOLS[piece.color][piece.type]}
                  </span>
                )}
                {isLegalTarget && !piece && <span className={styles.dot}></span>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}