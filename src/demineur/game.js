import { useState } from 'react';
import styles from './game.module.css';
import {
  DIFFICULTIES,
  createGrid,
  revealCell,
  toggleFlag,
  revealAllMines,
  checkWin,
  countFlags,
} from './functions';

function Cell({ cell, onReveal, onFlag }) {
  let content = '';
  let numberClass = '';

  if (cell.isRevealed && cell.isMine) {
    content = '💣';
  } else if (cell.isRevealed && cell.adjacentMines > 0) {
    content = cell.adjacentMines;
    numberClass = styles[`num-${cell.adjacentMines}`];
  } else if (cell.isFlagged) {
    content = '🚩';
  }

  const cellClass = `${styles.cell} ${cell.isRevealed ? styles.revealed : ''} ${
    cell.isRevealed && cell.isMine ? styles.mine : ''
  } ${cell.isFlagged ? styles.flagged : ''} ${numberClass}`;

  return (
    <button
      className={cellClass}
      onClick={onReveal}
      onContextMenu={(e) => {
        e.preventDefault();
        onFlag();
      }}
    >
      {content}
    </button>
  );
}

export default function Demineur() {
  const [difficultyKey, setDifficultyKey] = useState('facile');
  const { rows, cols, mines } = DIFFICULTIES[difficultyKey];

  const [grid, setGrid] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  function startNewGame(key = difficultyKey) {
    setDifficultyKey(key);
    setGrid(null);
    setGameStarted(false);
    setGameOver(false);
    setWon(false);
  }

  function handleReveal(row, col) {
    if (gameOver) return;

    let currentGrid = grid;

    // Premier clic : on génère la grille en s'assurant que cette case est sûre
    if (!gameStarted) {
      currentGrid = createGrid(rows, cols, mines, row, col);
      setGameStarted(true);
    }

    if (currentGrid[row][col].isFlagged) return;

    if (currentGrid[row][col].isMine) {
      setGrid(revealAllMines(currentGrid));
      setGameOver(true);
      return;
    }

    const nextGrid = revealCell(currentGrid, row, col);
    setGrid(nextGrid);

    if (checkWin(nextGrid)) {
      setWon(true);
      setGameOver(true);
    }
  }

  function handleFlag(row, col) {
    if (gameOver || !gameStarted) return;
    setGrid(toggleFlag(grid, row, col));
  }

  const flagsUsed = grid ? countFlags(grid) : 0;
  const minesLeft = mines - flagsUsed;

  // Grille affichée : vide (avant le premier clic) ou celle en cours
  const displayGrid =
    grid ||
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      }))
    );

  return (
    <div className={styles.game}>
      <div className={styles.panel}>
        <div className={styles['difficulty-group']}>
          {Object.keys(DIFFICULTIES).map((key) => (
            <button
              key={key}
              className={`${styles['difficulty-button']} ${
                key === difficultyKey ? styles.active : ''
              }`}
              onClick={() => startNewGame(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles['info-box']}>
          <div className={styles.counter}>💣 {minesLeft}</div>
          <button className={styles['restart-button']} onClick={() => startNewGame()}>
            {gameOver ? (won ? '😎' : '💀') : '🙂'}
          </button>
        </div>
      </div>

      {gameOver && (
        <div
          className={`${styles['status-message']} ${won ? styles.won : styles.lost}`}
        >
          {won ? '🎉 Bravo, toutes les mines sont repérées !' : '💥 Boom ! Partie perdue.'}
        </div>
      )}

      <div className={styles['board-wrapper']}>
        <div
          className={styles.board}
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {displayGrid.map((rowArr, r) =>
            rowArr.map((cell, c) => (
              <Cell
                key={`${r}-${c}`}
                cell={cell}
                onReveal={() => handleReveal(r, c)}
                onFlag={() => handleFlag(r, c)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}