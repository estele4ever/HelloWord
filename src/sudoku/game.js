import { useState } from 'react';
import styles from './game.module.css';
import {
  DIFFICULTIES,
  generatePuzzle,
  getFixedCells,
  hasConflict,
  isGridComplete,
  isGridCorrect,
} from './functions';

function Cell({ value, row, col, isFixed, isSelected, isHighlighted, isConflict, onClick }) {
  const cellClass = [
    styles.cell,
    isFixed ? styles.fixed : '',
    isSelected ? styles.selected : '',
    isHighlighted && !isSelected ? styles.highlighted : '',
    isConflict ? styles.conflict : '',
    (row + 1) % 3 === 0 && row !== 8 ? styles['row-thick-bottom'] : '',
  ].join(' ');

  return (
    <button className={cellClass} onClick={onClick}>
      {value !== 0 ? value : ''}
    </button>
  );
}

export default function Sudoku() {
  const [difficultyKey, setDifficultyKey] = useState('facile');
  const [{ puzzle, solution }, setGameData] = useState(() => generatePuzzle('facile'));
  const [grid, setGrid] = useState(() => puzzle.map((r) => [...r]));
  const [fixedCells, setFixedCells] = useState(() => getFixedCells(puzzle));
  const [selectedCell, setSelectedCell] = useState(null);
  const [status, setStatus] = useState(null); // null | 'won' | 'wrong'

  function startNewGame(key = difficultyKey) {
    const data = generatePuzzle(key);
    setDifficultyKey(key);
    setGameData(data);
    setGrid(data.puzzle.map((r) => [...r]));
    setFixedCells(getFixedCells(data.puzzle));
    setSelectedCell(null);
    setStatus(null);
  }

  function handleCellClick(row, col) {
    if (fixedCells[row][col] || status === 'won') return;
    setSelectedCell({ row, col });
    setStatus(null);
  }

  function handleNumberInput(value) {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (fixedCells[row][col]) return;

    const nextGrid = grid.map((r) => [...r]);
    nextGrid[row][col] = value;
    setGrid(nextGrid);

    if (isGridComplete(nextGrid)) {
      setStatus(isGridCorrect(nextGrid, solution) ? 'won' : 'wrong');
    } else {
      setStatus(null);
    }
  }

  return (
    <div className={styles.game}>
      <div className={styles.panel}>
        {Object.entries(DIFFICULTIES).map(([key, { label }]) => (
          <button
            key={key}
            className={`${styles['difficulty-button']} ${
              key === difficultyKey ? styles.active : ''
            }`}
            onClick={() => startNewGame(key)}
          >
            {label}
          </button>
        ))}
        <button className={styles['new-game-button']} onClick={() => startNewGame()}>
          🔄 Nouvelle grille
        </button>
      </div>

      {status === 'won' && (
        <div className={`${styles['status-message']} ${styles.won}`}>
          🎉 Bravo, grille résolue !
        </div>
      )}
      {status === 'wrong' && (
        <div className={`${styles['status-message']} ${styles.wrong}`}>
          ❌ La grille est complète mais contient des erreurs.
        </div>
      )}

      <div className={styles.board}>
        {grid.map((rowArr, row) =>
          rowArr.map((value, col) => {
            const isSelected =
              selectedCell && selectedCell.row === row && selectedCell.col === col;
            const isHighlighted =
              selectedCell && (selectedCell.row === row || selectedCell.col === col);
            const isConflict = value !== 0 && hasConflict(grid, row, col, value);

            return (
              <Cell
                key={`${row}-${col}`}
                value={value}
                row={row}
                col={col}
                isFixed={fixedCells[row][col]}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                isConflict={isConflict}
                onClick={() => handleCellClick(row, col)}
              />
            );
          })
        )}
      </div>

      <div className={styles['number-pad']}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            className={styles['number-button']}
            onClick={() => handleNumberInput(num)}
          >
            {num}
          </button>
        ))}
        <button className={styles['erase-button']} onClick={() => handleNumberInput(0)}>
          ✕
        </button>
      </div>
    </div>
  );
}