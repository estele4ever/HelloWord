export const WORDS = [
  'REACT', 'JAVASCRIPT', 'ORDINATEUR', 'CLAVIER', 'PROGRAMMATION',
  'FONCTION', 'VARIABLE', 'COMPOSANT', 'NAVIGATEUR', 'ALGORITHME',
  'INTERFACE', 'DEVELOPPEUR', 'BOUCLE', 'TABLEAU', 'OBJET',
];

export function pickRandomWord() {
  const index = Math.floor(Math.random() * WORDS.length);
  return WORDS[index];
}

// Renvoie le mot avec les lettres devinées visibles et les autres cachées : "R _ A _ T"
export function getDisplayWord(word, guessedLetters) {
  return word
    .split('')
    .map((letter) => (guessedLetters.includes(letter) ? letter : '_'))
    .join(' ');
}

export function isWordFound(word, guessedLetters) {
  return word.split('').every((letter) => guessedLetters.includes(letter));
}