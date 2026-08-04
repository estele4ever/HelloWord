import { useState } from 'react';
import styles from './Footer.module.css';
import emailjs from "@emailjs/browser";

const FAQ_ITEMS = [
  {
    question: 'Est-ce que mes parties sont sauvegardées ?',
    answer: 'Non, pour l\'instant chaque partie repart de zéro si tu recharges la page.',
  },
  {
    question: 'Les jeux fonctionnent-ils sur mobile ?',
    answer: 'Oui, tous les jeux sont adaptés aux écrans de téléphone et de tablette.',
  },
  {
    question: 'Comment signaler un bug ?',
    answer: 'Utilise le formulaire de contact ci-dessus en décrivant le problème rencontré.',
  },
  {
    question: 'De nouveaux jeux seront-ils ajoutés ?',
    answer: 'Oui, d\'autres jeux de réflexion viendront enrichir la plateforme au fil du temps.',
  },
];

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
  e.preventDefault();

  try {
    await emailjs.send(
      "service_ggt8q64",
      "template_xk4jy5d",
      {
        name: formData.name,
        email: formData.email,
        message: formData.message,
      },
      "s6m8EKE1vHZFs6Dk1"
    );

    setIsSubmitted(true);
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  } catch (error) {
    console.error(error);
    alert("Impossible d'envoyer le message.");
  }
}

  if (isSubmitted) {
    return (
      <div className={styles.confirmation}>
        ✅ Merci ! Ton message a bien été envoyé.
        <button className={styles.linkButton} onClick={() => setIsSubmitted(false)}>
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Ton nom"
        value={formData.name}
        onChange={handleChange}
        required
        className={styles.input}
      />
      <input
        type="email"
        name="email"
        placeholder="Ton email"
        value={formData.email}
        onChange={handleChange}
        required
        className={styles.input}
      />
      <textarea
        name="message"
        placeholder="Ton message"
        value={formData.message}
        onChange={handleChange}
        required
        rows={4}
        className={styles.textarea}
      />
      <button type="submit" className={styles.submitButton}>
        Envoyer
      </button>
    </form>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  function toggleItem(index) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className={styles.faqList}>
      {FAQ_ITEMS.map((item, index) => (
        <div key={index} className={styles.faqItem}>
          <button
            className={styles.faqQuestion}
            onClick={() => toggleItem(index)}
          >
            {item.question}
            <span className={styles.faqIcon}>{openIndex === index ? '−' : '+'}</span>
          </button>
          {openIndex === index && (
            <div className={styles.faqAnswer}>{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Footer({ onShowPrivacyPolicy }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <section className={styles.column}>
          <h3 className={styles.columnTitle}>Contactez-nous</h3>
          <ContactForm />
        </section>

        <section className={styles.column}>
          <h3 className={styles.columnTitle}>FAQ</h3>
          <FAQ />
        </section>
      </div>

      <div className={styles.bottomBar}>
        <button className={styles.privacyLink} onClick={onShowPrivacyPolicy}>
          Politique de confidentialité
        </button>
        <span className={styles.copyright}>© 2026 Jeux de réflexion</span>
      </div>
    </footer>
  );
}