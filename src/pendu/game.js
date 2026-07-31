import { useState } from 'react';
import styles from './game.module.css';
import { pickRandomWord, getDisplayWord, isWordFound } from './functions';

const ALPHABET = 'AZERTYUIOPQSDFGHJKLMWXCVBN'.split('');
const MAX_WRONG = 6;

function Gallows({ wrongCount }) {
  return (
    <div className={`${styles.gallows} ${styles[`wrong-${wrongCount}`] || ''}`}>
      <div className={styles.base}></div>
      <div className={styles.pole}></div>
      <div className={styles.beam}></div>
      <div className={styles.rope}></div>
      <div className={styles.head}></div>
      <div className={styles.body}></div>
      <div className={styles['arm-left']}></div>
      <div className={styles['arm-right']}></div>
      <div className={styles['leg-left']}></div>
      <div className={styles['leg-right']}></div>
    </div>
  );
}

export default function Pendu() {
  const [word, setWord] = useState(() => pickRandomWord());
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);

  const wrongCount = wrongLetters.length;
  const won = isWordFound(word, guessedLetters);
  const lost = wrongCount >= MAX_WRONG;
  const gameOver = won || lost;

  function handleGuess(letter) {
    if (gameOver || guessedLetters.includes(letter) || wrongLetters.includes(letter)) {
      return;
    }
    if (word.includes(letter)) {
      setGuessedLetters([...guessedLetters, letter]);
    } else {
      setWrongLetters([...wrongLetters, letter]);
    }
  }

  function restartGame() {
    setWord(pickRandomWord());
    setGuessedLetters([]);
    setWrongLetters([]);
  }

  let status;
  if (won) {
    status = '🎉 Gagné ! Le mot était : ' + word;
  } else if (lost) {
    status = '💀 Perdu ! Le mot était : ' + word;
  } else {
    status = `Il te reste ${MAX_WRONG - wrongCount} essai(s)`;
  }

  return (
    <div className={styles.game}>
      <div className={styles['game-board']}>
        <div
          className={`${styles.status} ${won ? styles.won : ''} ${lost ? styles.lost : ''}`}
        >
          {status}
        </div>

        <Gallows wrongCount={wrongCount} />

        <div className={styles.word}>{getDisplayWord(word, guessedLetters)}</div>

        <div className={styles.keyboard}>
          {ALPHABET.map((letter) => {
            const isCorrect = guessedLetters.includes(letter);
            const isWrong = wrongLetters.includes(letter);
            const buttonClass = `${styles['letter-button']} ${
              isCorrect ? styles.correct : ''
            } ${isWrong ? styles.wrong : ''}`;

            return (
              <button
                key={letter}
                className={buttonClass}
                onClick={() => handleGuess(letter)}
                disabled={isCorrect || isWrong || gameOver}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {gameOver && (
          <button className={styles['restart-button']} onClick={restartGame}>
            🔄 Nouvelle partie
          </button>
        )}
      </div>
    </div>
  );
}