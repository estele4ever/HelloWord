import React, { useState } from 'react';
import styles from './game.module.css';
import { calculateWinner } from './functions';

// Composant Square
function Square({ value, onSquareClick, disabled }) {
  const squareClass = `${styles.square} ${disabled ? styles.squareDisabled : ''} ${
    value === 'X' ? styles.squareX : value === 'O' ? styles.squareO : ''
  }`;
  
  return (
    <button className={squareClass} onClick={onSquareClick} disabled={disabled}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className={styles.status}>{status}</div>
      <div className={styles['board-row']}>
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className={styles['board-row']}>
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className={styles['board-row']}>
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function restartGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  function goToPrevious() {
    if (currentMove > 0) {
      setCurrentMove(currentMove - 1);
    }
  }

  function goToNext() {
    if (currentMove < history.length - 1) {
      setCurrentMove(currentMove + 1);
    }
  }

  const canGoBack = currentMove > 0;
  const canGoForward = currentMove < history.length - 1;
  const moveNumber = currentMove > 0 ? `Coup #${currentMove}` : 'Début de partie';

  return (
    <div className={styles.game}>
      <div className={styles['game-board']}>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className={styles['game-info']}>
        <div className={styles.navigation}>
          <div className={styles['move-info']}>{moveNumber}</div>
          <div className={styles['button-group']}>
            <button
              onClick={restartGame}
              className={`${styles['nav-button']} ${styles.restart}`}
            >
              🔄 Restart
            </button>
            <button
              onClick={goToPrevious}
              className={`${styles['nav-button']} ${canGoBack ? styles.active : styles.inactive}`}
              disabled={!canGoBack}
            >
              ⬅ Précédent
            </button>
            <button
              onClick={goToNext}
              className={`${styles['nav-button']} ${canGoForward ? styles.active : styles.inactive}`}
              disabled={!canGoForward}
            >
              Suivant ➡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}