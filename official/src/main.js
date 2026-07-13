import { SolenneGame } from './game.js';
import { GameUI } from './ui.js';

const canvas = document.querySelector('#game-canvas');
const ui = new GameUI();
const game = new SolenneGame(canvas, ui);
ui.bindGame(game);
window.__solenneGame = game;

game.init().catch((error) => {
  console.error(error);
  ui.showInfoDialog('Erreur de démarrage', `<p>Le jeu n’a pas pu démarrer : ${String(error.message ?? error)}</p>`);
});

if ('serviceWorker' in navigator && location.protocol !== 'file:' && !new URLSearchParams(location.search).has('qa')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('Service worker non enregistré :', error);
    });
  });
}
