import { useState } from 'react';
import Morpion from './morpion/game';
import Pendu from './pendu/game';
import Demineur from './demineur/game';
import Sudoku from './sudoku/game';
import Echecs from './echecs/game';
import Snake from './snake/game';
import Tetris from './tetris/game';
 import './App.css';

const GAMES = {
  morpion: { label: 'Morpion', component: Morpion },
  pendu: { label: 'Pendu', component: Pendu },
  demineur: { label: 'Démineur', component: Demineur },
  sudoku: { label: 'Sudoku', component: Sudoku },
  echecs: { label: 'Échecs', component: Echecs },
  Snake: { label: 'Snake', component: Snake },
  tetris: { label: 'Tetris', component: Tetris },
};

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const SelectedComponent = selectedGame ? GAMES[selectedGame].component : null;

  return (
    <div className="App">
      <div className="game-selector">
        {Object.entries(GAMES).map(([key, game]) => (
          <button
            key={key}
            onClick={() => setSelectedGame(key)}
            className={key === selectedGame ? 'game-button active' : 'game-button'}
          >
            {game.label}
          </button>
        ))}
      </div>
      {SelectedComponent && <SelectedComponent />}
    </div>
  );
}