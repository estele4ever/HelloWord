import styles from './Welcome.module.css';

export default function Welcome() {
  return (
    <div className={styles.welcome}>
      <div className={styles.card}>
        <h1 className={styles.title}>🧠 Bienvenue !</h1>
        <p className={styles.subtitle}>
          Teste ton quotient intellectuel en t'entraînant aux jeux de réflexion
        </p>
        <p className={styles.hint}>
          Choisis un jeu ci-dessus pour commencer 👆
        </p>
      </div>
    </div>
  );
}