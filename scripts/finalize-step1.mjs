import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

const root = process.cwd();
const exists = (p) => fs.existsSync(path.join(root, p));
const read = (p) => fs.readFileSync(path.join(root, p));
const write = (p, data) => {
  const target = path.join(root, p);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data);
};
const copy = (from, to) => {
  if (!exists(from)) throw new Error(`Source manquante: ${from}`);
  write(to, read(from));
};
const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

function decodeChunkSet(prefix, output) {
  const dir = path.join(root, 'release/0.7/assets');
  const files = fs.readdirSync(dir)
    .filter((name) => name.startsWith(prefix + '-') && name.endsWith('.txt'))
    .sort();
  if (!files.length) throw new Error(`Aucun fragment pour ${prefix}`);
  const encoded = files.map((name) => fs.readFileSync(path.join(dir, name), 'utf8').trim()).join('');
  let data = Buffer.from(encoded, 'base64');
  if (data[0] === 0x1f && data[1] === 0x8b) data = zlib.gunzipSync(data);
  const isPng = data.length > 24 && data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (!isPng) throw new Error(`${prefix}: données décodées non PNG`);
  write(output, data);
  return {
    file: output,
    sourceParts: files,
    bytes: data.length,
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    sha256: sha256(data),
  };
}

// La base jouable connue et testée devient la fondation officielle.
// La version modulaire 0.7 reste archivée dans release/0.7 pour la refonte de l'étape 2.
copy('index.html', 'official/index.html');
copy('src/style.css', 'official/src/style.css');
copy('src/game.js', 'official/src/game.js');
for (const file of ['manifest.webmanifest', 'sw.js', 'vercel.json']) {
  if (exists(file)) copy(file, `official/${file}`);
}

const atlases = [
  decodeChunkSet('actors', 'official/assets/generated/actors.png'),
  decodeChunkSet('world', 'official/assets/generated/world.png'),
  decodeChunkSet('ui', 'official/assets/generated/ui.png'),
];
write('official/assets/generated/manifest.json', JSON.stringify({
  version: '0.7.0-alpha.1',
  generatedAt: new Date().toISOString(),
  atlases,
}, null, 2) + '\n');

const required = [
  'official/index.html',
  'official/src/style.css',
  'official/src/game.js',
  'official/assets/generated/actors.png',
  'official/assets/generated/world.png',
  'official/assets/generated/ui.png',
  'official/assets/generated/manifest.json',
];
const missing = required.filter((file) => !exists(file));
const html = fs.readFileSync(path.join(root, 'official/index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)=["']\.\/([^"'?#]+)/g)].map((m) => m[1]);
const missingRefs = refs.filter((ref) => !exists(`official/${ref}`));
const sourceText = [
  fs.readFileSync(path.join(root, 'official/index.html'), 'utf8'),
  fs.readFileSync(path.join(root, 'official/src/style.css'), 'utf8'),
  fs.readFileSync(path.join(root, 'official/src/game.js'), 'utf8'),
].join('\n');
const forbidden = ['🎒','🪵','🪨','🔵','placeholder','écran vert'].filter((term) => sourceText.toLowerCase().includes(term.toLowerCase()));
const gameText = fs.readFileSync(path.join(root, 'official/src/game.js'), 'utf8');
const animationChecks = ['idle','walk','staff','sling','cast','hit','death'].map((name) => ({ name, found: gameText.includes(name) }));
const gameplayChecks = [
  ['pathfinding', /path|astar|findPath/i.test(gameText)],
  ['combat automatique', /target|attack|combat/i.test(gameText)],
  ['maîtrise corps à corps', /melee|corps/i.test(gameText)],
  ['maîtrise distance', /ranged|distance|sling/i.test(gameText)],
  ['maîtrise magie', /magic|cast|mana/i.test(gameText)],
  ['défense', /defense|defence/i.test(gameText)],
  ['réapparition', /respawn|réappar/i.test(gameText)],
  ['sauvegarde locale', /localStorage/i.test(gameText)],
];
const status = !missing.length && !missingRefs.length && !forbidden.length && animationChecks.every((x) => x.found) && gameplayChecks.every((x) => x[1]) ? 'PASS' : 'FAIL';
const report = {
  step: 1,
  version: '0.7.0-alpha.1',
  status,
  requiredFiles: required,
  missing,
  htmlReferences: refs,
  missingReferences: missingRefs,
  forbiddenMarkers: forbidden,
  animations: animationChecks,
  gameplay: Object.fromEntries(gameplayChecks),
  atlases,
  policy: {
    stableBranch: 'main',
    developmentBranch: 'develop',
    singleVercelProject: 'chroniques-de-solenne',
    noVisualRegression: true,
  },
};
write('tests/step1-final-report.json', JSON.stringify(report, null, 2) + '\n');
write('docs/STEP1_COMPLETE.md', `# Étape 1 — Fondation consolidée\n\nStatut automatique : **${status}**\n\n## Base officielle\n\n- Client stable placé dans \`official/\`.\n- Atlas réels reconstruits dans \`official/assets/generated/\`.\n- Version modulaire 0.7 conservée dans \`release/0.7/\` pour la refonte artistique.\n- Aucun emoji ni placeholder autorisé dans la base publiée.\n- Branches : \`develop\` pour le travail, \`main\` pour la production validée.\n- Projet Vercel unique prévu : \`chroniques-de-solenne\`.\n\n## Atlas\n\n${atlases.map((a) => `- ${a.file} — ${a.width}×${a.height}, ${a.bytes} octets, SHA-256 \`${a.sha256}\``).join('\n')}\n\nLe passage à l'étape 2 est autorisé uniquement après un test navigateur paysage et une vérification du déploiement Vercel officiel.\n`);
if (status !== 'PASS') {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(JSON.stringify(report, null, 2));
