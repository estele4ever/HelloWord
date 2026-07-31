import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './game.module.css';
import {
  GRID_SIZE,
  DIRECTIONS,
  isOppositeDirection,
  getInitialSnake,
  getRandomFoodPosition,
  getNextHead,
  isOutOfBounds,
  isSelfCollision,
  SPEED_BY_LEVEL,
} from './functions';

export default function Snake() {
  const [snake, setSnake] = useState(() => getInitialSnake());
  const [food, setFood] = useState(() => getRandomFoodPosition(getInitialSnake()));
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [speedKey, setSpeedKey] = useState('normal');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);

  // useRef : garde en mémoire la dernière direction traitée, SANS provoquer de re-render
  // (utile ici pour éviter qu'un joueur appuie 2 touches très vite entre deux ticks du jeu
  // et fasse accidentellement demi-tour sur lui-même)
  const directionRef = useRef(direction);
  directionRef.current = direction;

  function restartGame() {
    const initialSnake = getInitialSnake();
    setSnake(initialSnake);
    setFood(getRandomFoodPosition(initialSnake));
    setDirection(DIRECTIONS.RIGHT);
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
  }

  const changeDirection = useCallback((newDirection) => {
    if (isGameOver) return;
    if (isOppositeDirection(newDirection, directionRef.current)) return;
    setDirection(newDirection);
  }, [isGameOver]);

  // Écoute les touches du clavier une seule fois (au montage du composant)
  useEffect(() => {
    function handleKeyDown(e) {
      switch (e.key) {
        case 'ArrowUp':
          changeDirection(DIRECTIONS.UP);
          break;
        case 'ArrowDown':
          changeDirection(DIRECTIONS.DOWN);
          break;
        case 'ArrowLeft':
          changeDirection(DIRECTIONS.LEFT);
          break;
        case 'ArrowRight':
          changeDirection(DIRECTIONS.RIGHT);
          break;
        case ' ':
          setIsPaused((p) => !p);
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    // Fonction de nettoyage : retire l'écouteur quand le composant est démonté
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection]);

  // La boucle de jeu : avance le serpent d'une case à intervalle régulier
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const intervalId = setInterval(() => {
      setSnake((currentSnake) => {
        const currentDirection = directionRef.current;
        const newHead = getNextHead(currentSnake[0], currentDirection);

        if (isOutOfBounds(newHead) || isSelfCollision(currentSnake, newHead)) {
          setIsGameOver(true);
          return currentSnake;
        }

        const ateFood = newHead.row === food.row && newHead.col === food.col;
        const newSnake = [newHead, ...currentSnake];

        if (ateFood) {
          setScore((s) => s + 10);
          setFood(getRandomFoodPosition(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, SPEED_BY_LEVEL[speedKey]);

    // Nettoyage : annule l'intervalle précédent à chaque changement de vitesse,
    // ou quand le composant est démonté (sinon plusieurs boucles tourneraient en même temps !)
    return () => clearInterval(intervalId);
  }, [food, speedKey, isGameOver, isPaused]);

  const cells = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const isHead = snake[0].row === row && snake[0].col === col;
      const isBody = !isHead && snake.some((s) => s.row === row && s.col === col);
      const isFood = food.row === row && food.col === col;

      const cellClass = [
        styles.cell,
        isHead ? styles.snakeHead : '',
        isBody ? styles.snakeBody : '',
        isFood ? styles.food : '',
      ].join(' ');

      cells.push(<div key={`${row}-${col}`} className={cellClass}></div>);
    }
  }

  return (
    <div className={styles.game}>
      <div className={styles.panel}>
        <div className={styles['speed-group']}>
          {Object.keys(SPEED_BY_LEVEL).map((key) => (
            <button
              key={key}
              className={`${styles['speed-button']} ${key === speedKey ? styles.active : ''}`}
              onClick={() => setSpeedKey(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.score}>Score: {score}</div>
        <button className={styles['restart-button']} onClick={restartGame}>
          🔄 Recommencer
        </button>
      </div>

      {isGameOver && (
        <div className={styles['status-message']}>
          💀 Perdu ! Score final : {score}
        </div>
      )}
      {!isGameOver && isPaused && (
        <div className={`${styles['status-message']} ${styles.paused}`}>
          ⏸ Pause (Espace pour reprendre)
        </div>
      )}

      <div className={styles['board-wrapper']}>
        <div className={styles.board}>{cells}</div>
      </div>

      <div className={styles['controls-hint']}>
        Flèches du clavier pour se déplacer · Espace pour mettre en pause
      </div>

      <div className={styles['mobile-controls']}>
        <button className={`${styles['direction-button']} ${styles.up}`} onClick={() => changeDirection(DIRECTIONS.UP)}>⬆</button>
        <button className={`${styles['direction-button']} ${styles.left}`} onClick={() => changeDirection(DIRECTIONS.LEFT)}>⬅</button>
        <button className={`${styles['direction-button']} ${styles.down}`} onClick={() => changeDirection(DIRECTIONS.DOWN)}>⬇</button>
        <button className={`${styles['direction-button']} ${styles.right}`} onClick={() => changeDirection(DIRECTIONS.RIGHT)}>➡</button>
      </div>
    </div>
  );
}