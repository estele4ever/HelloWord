import styles from './PrivacyPolicy.module.css';

export default function PrivacyPolicy({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>
        <h2>Politique de confidentialité</h2>
        <p>
          Cette application est un projet d'apprentissage. Les données saisies dans le
          formulaire de contact sont transmises à un serveur et stockées ; elles
          sont prises en considerations en vues de modifier le comportement de l'application.
        </p>
        <p>
          Aucun cookie de suivi ni outil d'analyse tiers n'est utilisé sur ce site pour
          le moment.
        </p>
        <p>
          Pour toute question, utilise le formulaire de contact en bas de page.
        </p>
      </div>
    </div>
  );
}