'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const readJson = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const required = ['public/index.html', 'public/src/game.js', 'public/assets/hero.png'];
const errors = [];

try {
  const source = readJson('package.json');
  const release = readJson('public/vercel-release.json');
  if (release.version !== source.version) errors.push(`version publique ${release.version} != source ${source.version}`);
  if (release.validation !== 'PASS') errors.push('la release publique n\'est pas validée');
  if (release.sourceBranch !== 'main') errors.push(`branche publique inattendue : ${release.sourceBranch}`);
} catch (error) {
  errors.push(`métadonnées de release invalides : ${error.message}`);
}

for (const relative of required) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) errors.push(`fichier public absent ou vide : ${relative}`);
}

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log('Validated Chroniques de Solenne static release ready');
