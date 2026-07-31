import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './game.module.css';
import {
  COLS,
  ROWS,
  TETROMINOES,
  getRandomPieceType,
  createEmptyBoard,
  createPiece,
  getPieceCells,
  isValidPosition,
  movePiece,
  rotatePiece,
  mergePieceIntoBoard,
  clearFullLines,
  calculateScore,
  getSpeedForLevel,
} from './functions';

const LINES_PER_LEVEL = 10;

export default function Tetris() {
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(() => createPiece(getRandomPieceType()));
  const [nextPieceType, setNextPieceType] = useState(() => getRandomPieceType());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const boardRef = useRef(board);
  boardRef.current = board;
  const pieceRef = useRef(currentPiece);
  pieceRef.current = currentPiece;

  function spawnNextPiece(withBoard) {
    const newPiece = createPiece(nextPieceType);
    if (!isValidPosition(withBoard, newPiece)) {
      setIsGameOver(true);
      return;
    }
    setCurrentPiece(newPiece);
    setNextPieceType(getRandomPieceType());
  }

  // Verrouille la pièce en place, nettoie les lignes complètes, met à jour le score, et fait apparaître la suivante
  const lockPiece = useCallback(() => {
    const mergedBoard = mergePieceIntoBoard(boardRef.current, pieceRef.current);
    const { newBoard, clearedCount } = clearFullLines(mergedBoard);

    if (clearedCount > 0) {
      setScore((s) => s + calculateScore(clearedCount, level));
      setLines((l) => {
        const nextLines = l + clearedCount;
        setLevel(Math.floor(nextLines / LINES_PER_LEVEL) + 1);
        return nextLines;
      });
    }

    setBoard(newBoard);
    spawnNextPiece(newBoard);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, nextPieceType]);

  const moveDown = useCallback(() => {
    if (isGameOver || isPaused) return;
    const moved = movePiece(boardRef.current, pieceRef.current, 1, 0);
    if (moved) {
      setCurrentPiece(moved);
    } else {
      lockPiece();
    }
  }, [isGameOver, isPaused, lockPiece]);

  const moveHorizontal = useCallback((deltaCol) => {
    if (isGameOver || isPaused) return;
    const moved = movePiece(boardRef.current, pieceRef.current, 0, deltaCol);
    if (moved) setCurrentPiece(moved);
  }, [isGameOver, isPaused]);

  const handleRotate = useCallback(() => {
    if (isGameOver || isPaused) return;
    const rotated = rotatePiece(boardRef.current, pieceRef.current);
    if (rotated) setCurrentPiece(rotated);
  }, [isGameOver, isPaused]);

  const hardDrop = useCallback(() => {
    if (isGameOver || isPaused) return;
    let piece = pieceRef.current;
    let next = movePiece(boardRef.current, piece, 1, 0);
    while (next) {
      piece = next;
      next = movePiece(boardRef.current, piece, 1, 0);
    }
    setCurrentPiece(piece);
    pieceRef.current = piece;
    lockPiece();
  }, [isGameOver, isPaused, lockPiece]);

  function restartGame() {
    setBoard(createEmptyBoard());
    setCurrentPiece(createPiece(getRandomPieceType()));
    setNextPieceType(getRandomPieceType());
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
  }

  // Écoute du clavier
  useEffect(() => {
    function handleKeyDown(e) {
      switch (e.key) {
        case 'ArrowLeft':
          moveHorizontal(-1);
          break;
        case 'ArrowRight':
          moveHorizontal(1);
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          handleRotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          setIsPaused((p) => !p);
          break;
        default:
          break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveHorizontal, moveDown, handleRotate, hardDrop]);

  // Chute automatique
  useEffect(() => {
    if (isGameOver || isPaused) return;
    const intervalId = setInterval(moveDown, getSpeedForLevel(level));
    return () => clearInterval(intervalId);
  }, [level, isGameOver, isPaused, moveDown]);

  // Construction de la grille affichée (plateau fixe + pièce active superposée)
  const activeCells = new Set(
    getPieceCells(currentPiece).map(({ row, col }) => `${row}-${col}`)
  );
  const activeColor = TETROMINOES[currentPiece.type].color;

  const cells = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const isActive = activeCells.has(`${row}-${col}`);
      const fixedColor = board[row][col];
      const color = isActive ? activeColor : fixedColor;

      const cellClass = [
        styles.cell,
        color ? styles.filled : '',
        color ? styles[`color-${color}`] : '',
      ].join(' ');

      cells.push(<div key={`${row}-${col}`} className={cellClass}></div>);
    }
  }

  const nextShape = TETROMINOES[nextPieceType].rotations[0];
  const nextCellsSet = new Set(nextShape.map(([r, c]) => `${r}-${c}`));
  const nextCells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const isFilled = nextCellsSet.has(`${r}-${c}`);
      nextCells.push(
        <div
          key={`${r}-${c}`}
          className={`${styles['next-cell']} ${
            isFilled ? styles[`color-${TETROMINOES[nextPieceType].color}`] : ''
          }`}
        ></div>
      );
    }
  }

  return (
    <div className={styles.game}>
      <div className={styles['board-wrapper']}>
        <div className={styles.board}>{cells}</div>
      </div>

      <div className={styles['side-panel']}>
        <div className={styles['panel-box']}>
          <h3>Score</h3>
          <div className={styles['panel-value']}>{score}</div>
        </div>
        <div className={styles['panel-box']}>
          <h3>Niveau</h3>
          <div className={styles['panel-value']}>{level}</div>
        </div>
        <div className={styles['panel-box']}>
          <h3>Lignes</h3>
          <div className={styles['panel-value']}>{lines}</div>
        </div>
        <div className={styles['panel-box']}>
          <h3>Suivant</h3>
          <div className={styles['next-piece-grid']}>{nextCells}</div>
        </div>

        {isGameOver && (
          <div className={styles['status-message']}>💀 Game Over ! Score : {score}</div>
        )}
        {!isGameOver && isPaused && (
          <div className={`${styles['status-message']} ${styles.paused}`}>⏸ Pause (P)</div>
        )}

        <button className={styles['restart-button']} onClick={restartGame}>
          🔄 Recommencer
        </button>

        <div className={styles['controls-hint']}>
          ← → : déplacer <br />
          ↑ : rotation <br />
          ↓ : descendre <br />
          Espace : chute rapide <br />
          P : pause
        </div>

        <div className={styles['mobile-controls']}>
          <button className={`${styles['control-button']} ${styles.rotate}`} onClick={handleRotate}>⟳</button>
          <button className={`${styles['control-button']} ${styles.left}`} onClick={() => moveHorizontal(-1)}>⬅</button>
          <button className={`${styles['control-button']} ${styles.down}`} onClick={moveDown}>⬇</button>
          <button className={`${styles['control-button']} ${styles.right}`} onClick={() => moveHorizontal(1)}>➡</button>
        </div>
      </div>
    </div>
  );
}