import { access, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'index.html','styles.css','src/game.js','manifest.webmanifest','sw.js',
  'assets/app-icon.svg','assets/tiles.svg','assets/hero.svg','assets/monsters.svg','assets/decor.svg','assets/house.svg','assets/items.svg'
];
const missing=[];
for(const file of required){try{await access(resolve(root,file));}catch{missing.push(file)}}
const html=await readFile(resolve(root,'index.html'),'utf8');
const js=await readFile(resolve(root,'src/game.js'),'utf8');
const css=await readFile(resolve(root,'styles.css'),'utf8');
const assertions={
  allFiles:missing.length===0,
  landscape:html.includes('orientation')&&css.includes('@media(orientation:portrait)'),
  noJoystick:!html.toLowerCase().includes('joystick'),
  pathfinding:js.includes('findPath('),
  tileMovement:js.includes('updateMovement(')&&js.includes('TILE'),
  threeStyles:['staff','sling','orb'].every(value=>js.includes(value)),
  masteryXp:['melee','ranged','magic','defense'].every(value=>js.includes(value)),
  speedFormula:js.includes("100 + (save.generalLevel - 1)"),
  classChoice:['Épéiste','Archer','Mage'].every(value=>html.includes(value)),
  respawn:js.includes('respawnPlayer'),
  localSave:js.includes('localStorage'),
  assetFiles:['tiles.svg','hero.svg','monsters.svg','decor.svg','house.svg','items.svg'].every(value=>js.includes(value)),
  noEmojiPlaceholders:!/[🪵🪨🔵🎒⚔🧪🪙]/u.test(html+js+css)
};
const pass=Object.values(assertions).every(Boolean);
console.log(JSON.stringify({status:pass?'PASS':'FAIL',missing,assertions},null,2));
if(!pass)process.exit(1);
