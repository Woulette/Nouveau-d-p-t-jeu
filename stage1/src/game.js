const BUILD = '0.8.0-alpha.1';
const TILE = 32;
const MAP_W = 64;
const MAP_H = 44;
const SAVE_KEY = 'chroniques-solenne-stage1-v1';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const key = (x, y) => `${x},${y}`;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const hash = (x, y, seed = 0) => {
  let n = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
};

const canvas = $('#game');
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;

const ui = {
  level: $('#general-level'), classLevel: $('#class-level'), className: $('#class-name'), playerName: $('#player-name'),
  hpBar: $('#hp-bar'), hpText: $('#hp-text'), mpBar: $('#mp-bar'), mpText: $('#mp-text'),
  xpBar: $('#xp-bar'), xpText: $('#xp-text'), classXpBar: $('#class-xp-bar'), classXpText: $('#class-xp-text'),
  gold: $('#gold-text'), quest: $('#quest-progress'), targetCard: $('#target-card'), targetName: $('#target-name'),
  targetLevel: $('#target-level'), targetHp: $('#target-hp-bar'), hint: $('#world-hint-text'),
  inventoryCount: $('#inventory-count'), potionCount: $('#potion-count'), portrait: $('#portrait'),
  drawer: $('#drawer'), backdrop: $('#drawer-backdrop'), drawerTitle: $('#drawer-title'), drawerKicker: $('#drawer-kicker'),
  drawerContent: $('#drawer-content'), mentorModal: $('#mentor-modal'), fatal: $('#fatal-error'), fatalMessage: $('#fatal-message')
};

const fatal = (error) => {
  console.error(error);
  ui.fatalMessage.textContent = String(error?.stack || error?.message || error);
  ui.fatal.classList.add('show');
};
window.addEventListener('error', event => fatal(event.error || event.message));
window.addEventListener('unhandledrejection', event => fatal(event.reason));

const loadImage = (url) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error(`Asset introuvable : ${url}`));
  image.src = url;
});

const assetPaths = {
  tiles: './assets/tiles.svg', hero: './assets/hero.svg', monsters: './assets/monsters.svg',
  decor: './assets/decor.svg', house: './assets/house.svg', items: './assets/items.svg'
};
const assets = {};
for (const [name, url] of Object.entries(assetPaths)) assets[name] = await loadImage(url);

const TILE_ATLAS = {
  grass1: [0, 0], grass2: [1, 0], path: [2, 0], dirt: [3, 0], water: [4, 0], stone: [5, 0],
  flowers: [6, 0], tall: [7, 0], grass3: [0, 1], pathEdge: [1, 1], meadow: [2, 1], sand: [3, 1],
  water2: [4, 1], stone2: [5, 1], flowers2: [6, 1], weeds: [7, 1]
};
const DECOR_ATLAS = {
  tree1: [0, 0], tree2: [1, 0], bush: [2, 0], berry: [3, 0], rock: [4, 0], sign: [5, 0],
  lamp: [0, 1], fence: [1, 1], barrel: [2, 1], flowers: [3, 1], stump: [4, 1], well: [5, 1]
};
const ITEM_ATLAS = {
  staff: [0, 0], sling: [1, 0], orb: [2, 0], potion: [3, 0], bag: [4, 0],
  coin: [0, 1], stats: [1, 1], settings: [2, 1], sword: [3, 1], bow: [4, 1]
};
const MONSTER_ROWS = { slime: 0, rat: 1, boar: 2, wolf: 3, wisp: 4 };
const DIRECTIONS = { down: 0, left: 1, right: 2, up: 3 };

function drawAtlas(image, cellW, cellH, col, row, x, y, width = cellW, height = cellH) {
  ctx.drawImage(image, col * cellW, row * cellH, cellW, cellH, Math.round(x), Math.round(y), width, height);
}
function drawItemIcon(context, type, x, y, size = 48) {
  const pos = ITEM_ATLAS[type] || ITEM_ATLAS.bag;
  context.imageSmoothingEnabled = false;
  context.drawImage(assets.items, pos[0] * 48, pos[1] * 48, 48, 48, x, y, size, size);
}
function paintInterfaceIcons() {
  $$('canvas[data-icon]').forEach(icon => {
    const context = icon.getContext('2d');
    context.clearRect(0, 0, icon.width, icon.height);
    drawItemIcon(context, icon.dataset.icon, 0, 0, Math.min(icon.width, icon.height));
  });
  const portrait = ui.portrait.getContext('2d');
  portrait.imageSmoothingEnabled = false;
  portrait.clearRect(0, 0, 64, 64);
  portrait.fillStyle = '#1b3027'; portrait.fillRect(0, 0, 64, 64);
  portrait.drawImage(assets.hero, 0, 0, 32, 48, 12, 7, 40, 60);
}
paintInterfaceIcons();

const defaultSave = () => ({
  playerName: 'Voyageur 801', generalLevel: 1, generalXp: 0, className: 'Aventurier', classLevel: 1, classXp: 0,
  hp: 100, maxHp: 100, mp: 40, maxMp: 40, gold: 0, questSlimes: 0,
  masteries: {
    melee: { level: 1, xp: 0 }, ranged: { level: 1, xp: 0 }, magic: { level: 1, xp: 0 }, defense: { level: 1, xp: 0 }
  },
  inventory: { Potion: 2, 'Morceau de Gelée': 0, Peau: 0, Bois: 0 },
  equipment: { weapon: 'Bâton simple', armor: 'Tunique d’aventurier' },
  permanentClassChoice: false
});
function readSave() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY));
    const base = defaultSave();
    if (!parsed || typeof parsed !== 'object') return base;
    return {
      ...base, ...parsed,
      masteries: { ...base.masteries, ...(parsed.masteries || {}) },
      inventory: { ...base.inventory, ...(parsed.inventory || {}) },
      equipment: { ...base.equipment, ...(parsed.equipment || {}) }
    };
  } catch { return defaultSave(); }
}
let save = readSave();
const persist = () => localStorage.setItem(SAVE_KEY, JSON.stringify(save));

const weaponData = {
  staff: { label: 'Bâton', range: 1.25, cooldown: .78, damage: [8, 13], mp: 0, mastery: 'melee', projectile: false },
  sling: { label: 'Fronde', range: 5.2, cooldown: .95, damage: [6, 11], mp: 0, mastery: 'ranged', projectile: 'stone' },
  orb: { label: 'Orbe', range: 5.6, cooldown: 1.1, damage: [10, 16], mp: 4, mastery: 'magic', projectile: 'magic' }
};

const player = {
  gx: 15, gy: 20, x: 15 * TILE, y: 20 * TILE, fromX: 15 * TILE, fromY: 20 * TILE,
  toX: 15 * TILE, toY: 20 * TILE, stepT: 1, path: [], dir: 'down', state: 'idle',
  weapon: 'staff', attackCooldown: 0, attackAnim: 0, hitAnim: 0, dead: false, deathTimer: 0,
  target: null, requestedTile: null
};
const camera = { x: 0, y: 0, w: innerWidth, h: innerHeight };
const projectiles = [];
const particles = [];
const floaters = [];
let lastTime = performance.now();
let saveTimer = 0;

const obstacles = new Set();
const decor = [];
const mentors = [
  { type: 'Épéiste', x: 12, y: 9, tint: 'sepia(1) saturate(1.4) hue-rotate(330deg)', icon: 'sword' },
  { type: 'Archer', x: 15, y: 9, tint: 'sepia(1) saturate(1.4) hue-rotate(55deg)', icon: 'bow' },
  { type: 'Mage', x: 18, y: 9, tint: 'sepia(1) saturate(1.5) hue-rotate(235deg)', icon: 'orb' }
];

function isPathTile(x, y) {
  const vertical = x >= 14 && x <= 17 && y >= 4 && y <= 35;
  const horizontal = y >= 19 && y <= 22 && x >= 5 && x <= 57;
  const village = x >= 7 && x <= 24 && y >= 8 && y <= 22;
  const branch = Math.abs((x - 42) - (y - 20) * .45) < 1.6 && x >= 32 && y >= 12 && y <= 34;
  return vertical || horizontal || (village && (x + y) % 9 < 2) || branch;
}
function isWaterTile(x, y) {
  const dx = x - 49, dy = y - 8;
  return dx * dx / 42 + dy * dy / 17 < 1;
}
function groundTile(x, y) {
  if (isWaterTile(x, y)) return hash(x, y, 5) > .5 ? 'water' : 'water2';
  if (isPathTile(x, y)) return hash(x, y, 4) > .18 ? 'path' : 'pathEdge';
  const n = hash(x, y, 9);
  if (n > .94) return 'flowers';
  if (n > .89) return 'flowers2';
  if (n > .83) return 'tall';
  if (n > .76) return 'weeds';
  if (n > .52) return 'grass2';
  if (n > .25) return 'grass3';
  return 'grass1';
}

function addDecor(kind, x, y, blocking = true) {
  decor.push({ kind, x, y, sortY: y * TILE + 56 });
  if (blocking) obstacles.add(key(x, y));
}
function clearAround(cx, cy, radius = 2) {
  for (let y = cy - radius; y <= cy + radius; y++) for (let x = cx - radius; x <= cx + radius; x++) obstacles.delete(key(x, y));
}
function buildWorld() {
  for (let x = 0; x < MAP_W; x++) { obstacles.add(key(x, 0)); obstacles.add(key(x, MAP_H - 1)); }
  for (let y = 0; y < MAP_H; y++) { obstacles.add(key(0, y)); obstacles.add(key(MAP_W - 1, y)); }
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if (isWaterTile(x, y)) obstacles.add(key(x, y));

  for (let y = 1; y < MAP_H - 1; y++) {
    for (let x = 1; x < MAP_W - 1; x++) {
      if (isPathTile(x, y) || isWaterTile(x, y) || (x > 4 && x < 25 && y > 6 && y < 24)) continue;
      const edge = Math.min(x, y, MAP_W - 1 - x, MAP_H - 1 - y);
      const n = hash(x, y, 21);
      if ((edge < 5 && n > .48) || (edge < 9 && n > .82) || n > .975) addDecor(n > .75 ? 'tree2' : 'tree1', x, y, true);
      else if (n > .925) addDecor(n > .96 ? 'berry' : 'bush', x, y, true);
      else if (n > .89) addDecor('rock', x, y, true);
      else if (n > .84) addDecor('flowers', x, y, false);
    }
  }

  const manual = [
    ['sign', 12, 14, true], ['lamp', 9, 19, true], ['lamp', 23, 19, true], ['well', 21, 13, true],
    ['barrel', 8, 14, true], ['barrel', 9, 14, true], ['barrel', 22, 14, true], ['stump', 26, 25, true],
    ['rock', 27, 16, true], ['rock', 36, 27, true], ['rock', 44, 18, true], ['rock', 54, 26, true],
    ['berry', 29, 12, true], ['berry', 38, 18, true], ['bush', 30, 27, true], ['bush', 47, 25, true],
    ['flowers', 25, 17, false], ['flowers', 34, 22, false], ['flowers', 42, 28, false], ['flowers', 52, 18, false]
  ];
  manual.forEach(([kind, x, y, blocking]) => addDecor(kind, x, y, blocking));
  for (let x = 7; x <= 12; x++) addDecor('fence', x, 24, true);
  for (let x = 20; x <= 25; x++) addDecor('fence', x, 24, true);

  // Maison : base logique sur cinq cases par quatre.
  for (let y = 7; y <= 10; y++) for (let x = 5; x <= 9; x++) obstacles.add(key(x, y));
  clearAround(15, 20, 3);
  clearAround(12, 9, 1); clearAround(15, 9, 1); clearAround(18, 9, 1);
}
buildWorld();

const monsterTemplates = {
  slime: { name: 'Gelée verte', level: 1, hp: 34, damage: 4, speed: 82, aggro: 5, xp: 26, classXp: 17, gold: [5, 10] },
  rat: { name: 'Rat des champs', level: 1, hp: 28, damage: 3, speed: 92, aggro: 4, xp: 20, classXp: 13, gold: [3, 7] },
  boar: { name: 'Sanglier', level: 2, hp: 60, damage: 7, speed: 76, aggro: 6, xp: 42, classXp: 27, gold: [8, 15] },
  wolf: { name: 'Loup sauvage', level: 3, hp: 74, damage: 9, speed: 105, aggro: 7, xp: 55, classXp: 34, gold: [10, 20] },
  wisp: { name: 'Feu follet', level: 3, hp: 52, damage: 8, speed: 96, aggro: 6, xp: 50, classXp: 32, gold: [9, 18] }
};
let monsterId = 1;
function makeMonster(type, gx, gy) {
  const t = monsterTemplates[type];
  return {
    id: monsterId++, type, ...t, maxHp: t.hp, gx, gy, homeX: gx, homeY: gy, x: gx * TILE, y: gy * TILE,
    fromX: gx * TILE, fromY: gy * TILE, toX: gx * TILE, toY: gy * TILE, stepT: 1, path: [],
    dir: 'down', state: 'idle', anim: 0, attackCooldown: Math.random(), hitAnim: 0, dead: false, respawn: 0, wander: 1 + Math.random() * 2
  };
}
const monsters = [
  makeMonster('slime', 24, 19), makeMonster('slime', 30, 15), makeMonster('slime', 35, 24), makeMonster('slime', 47, 19),
  makeMonster('rat', 27, 28), makeMonster('boar', 39, 17), makeMonster('boar', 50, 26),
  makeMonster('wolf', 32, 31), makeMonster('wolf', 55, 17), makeMonster('wisp', 43, 29)
];

function entityBlocks(x, y, ignore = null) {
  if (obstacles.has(key(x, y))) return true;
  for (const m of monsters) if (m !== ignore && !m.dead && m.gx === x && m.gy === y) return true;
  return false;
}
function walkable(x, y, ignore = null) {
  return x > 0 && y > 0 && x < MAP_W - 1 && y < MAP_H - 1 && !entityBlocks(x, y, ignore);
}
function findPath(start, goal, options = {}) {
  const range = options.range || 0;
  const ignore = options.ignore || null;
  const maxNodes = options.maxNodes || 2600;
  const startKey = key(start.x, start.y);
  const open = [{ x: start.x, y: start.y, g: 0, f: 0 }];
  const came = new Map();
  const cost = new Map([[startKey, 0]]);
  let visited = 0;
  let found = null;
  const isGoal = (node) => range > 0 ? Math.hypot(node.x - goal.x, node.y - goal.y) <= range : node.x === goal.x && node.y === goal.y;
  while (open.length && visited++ < maxNodes) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    if (isGoal(current)) { found = current; break; }
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = current.x + dx, ny = current.y + dy;
      if (!walkable(nx, ny, ignore) && !(nx === goal.x && ny === goal.y && range === 0)) continue;
      const nk = key(nx, ny), ng = current.g + 1;
      if (ng >= (cost.get(nk) ?? Infinity)) continue;
      cost.set(nk, ng); came.set(nk, { x: current.x, y: current.y });
      open.push({ x: nx, y: ny, g: ng, f: ng + manhattan({ x: nx, y: ny }, goal) });
    }
  }
  if (!found) return [];
  const result = [];
  let cursor = { x: found.x, y: found.y };
  while (key(cursor.x, cursor.y) !== startKey) {
    result.push(cursor);
    cursor = came.get(key(cursor.x, cursor.y));
    if (!cursor) return [];
  }
  return result.reverse();
}

function startStep(entity, next, speed) {
  entity.fromX = entity.x; entity.fromY = entity.y;
  entity.toX = next.x * TILE; entity.toY = next.y * TILE;
  entity.stepT = 0; entity.nextGX = next.x; entity.nextGY = next.y;
  if (Math.abs(next.x - entity.gx) > Math.abs(next.y - entity.gy)) entity.dir = next.x > entity.gx ? 'right' : 'left';
  else entity.dir = next.y > entity.gy ? 'down' : 'up';
  entity.stepDuration = TILE / Math.max(30, speed);
}
function updateMovement(entity, dt, speed) {
  if (entity.stepT >= 1 && entity.path.length) startStep(entity, entity.path.shift(), speed);
  if (entity.stepT < 1) {
    entity.stepT = Math.min(1, entity.stepT + dt / entity.stepDuration);
    const eased = entity.stepT < .5 ? 2 * entity.stepT * entity.stepT : 1 - Math.pow(-2 * entity.stepT + 2, 2) / 2;
    entity.x = lerp(entity.fromX, entity.toX, eased); entity.y = lerp(entity.fromY, entity.toY, eased);
    if (entity.stepT >= 1) {
      entity.gx = entity.nextGX; entity.gy = entity.nextGY; entity.x = entity.gx * TILE; entity.y = entity.gy * TILE;
    }
    return true;
  }
  return false;
}

const generalNeed = level => 100 + level * 60;
const classNeed = level => 60 + level * 45;
const masteryNeed = level => 35 + level * 22;
const playerSpeed = () => 100 + (save.generalLevel - 1);
function addMastery(type, amount) {
  const mastery = save.masteries[type];
  mastery.xp += amount;
  while (mastery.xp >= masteryNeed(mastery.level)) { mastery.xp -= masteryNeed(mastery.level); mastery.level++; toast(`${masteryLabel(type)} passe au niveau ${mastery.level}`); }
}
function masteryLabel(type) { return ({ melee: 'Corps à corps', ranged: 'Distance', magic: 'Magie', defense: 'Défense' })[type]; }
function addGeneralXp(amount) {
  save.generalXp += amount;
  while (save.generalXp >= generalNeed(save.generalLevel)) {
    save.generalXp -= generalNeed(save.generalLevel); save.generalLevel++; save.maxHp += 8; save.maxMp += 2; save.hp = save.maxHp; save.mp = save.maxMp;
    toast(`Niveau général ${save.generalLevel} — vitesse ${playerSpeed()}`);
  }
}
function addClassXp(amount) {
  save.classXp += amount;
  while (save.classXp >= classNeed(save.classLevel)) {
    save.classXp -= classNeed(save.classLevel); save.classLevel++; toast(`${save.className} rang ${save.classLevel}`);
    if (save.className === 'Aventurier' && save.classLevel >= 20 && !save.permanentClassChoice) openMentorModal();
  }
}

function addFloater(textValue, x, y, color = '#fff') { floaters.push({ text: textValue, x, y, color, life: 1.2, vy: -24 }); }
function burst(x, y, color, count = 7) {
  for (let i = 0; i < count; i++) particles.push({ x, y, vx: (Math.random() - .5) * 70, vy: (Math.random() - .7) * 70, life: .45 + Math.random() * .35, color });
}
function toast(message) {
  let node = $('.toast');
  if (!node) { node = document.createElement('div'); node.className = 'toast'; node.style.cssText = 'position:absolute;z-index:70;left:50%;top:20%;transform:translate(-50%,-12px);padding:9px 14px;border-radius:12px;background:#0b1b15ef;border:1px solid #d4ad5f88;box-shadow:0 8px 26px #000a;font-weight:800;opacity:0;transition:.18s;pointer-events:none'; $('#game-shell').append(node); }
  node.textContent = message; node.style.opacity = '1'; node.style.transform = 'translate(-50%,0)';
  clearTimeout(node._timer); node._timer = setTimeout(() => { node.style.opacity = '0'; node.style.transform = 'translate(-50%,-12px)'; }, 1700);
}

function requestMove(x, y) {
  if (player.dead) return;
  player.target = null;
  player.requestedTile = { x, y };
  player.path = findPath({ x: player.gx, y: player.gy }, { x, y });
  if (!player.path.length && (player.gx !== x || player.gy !== y)) toast('Cette case est inaccessible');
  updateTargetCard();
}
function targetMonster(monster) {
  if (player.dead || monster.dead) return;
  player.target = monster; player.requestedTile = null;
  const range = Math.max(1, Math.floor(weaponData[player.weapon].range));
  player.path = findPath({ x: player.gx, y: player.gy }, { x: monster.gx, y: monster.gy }, { range, ignore: monster });
  updateTargetCard();
}
function chooseWeapon(type) {
  if (!weaponData[type]) return;
  player.weapon = type;
  $$('[data-weapon]').forEach(button => button.classList.toggle('selected', button.dataset.weapon === type));
  if (player.target && !player.target.dead) targetMonster(player.target);
  toast(`${weaponData[type].label} équipé`);
}

function dealDamage(monster, weapon) {
  if (monster.dead) return;
  const data = weaponData[weapon];
  const mastery = save.masteries[data.mastery].level;
  const base = data.damage[0] + Math.random() * (data.damage[1] - data.damage[0]);
  const damage = Math.max(1, Math.round(base + mastery * .45 + save.generalLevel * .25));
  monster.hp -= damage; monster.hitAnim = .2; monster.state = 'hit';
  addMastery(data.mastery, 2 + monster.level * .15);
  addFloater(`-${damage}`, monster.x + 16, monster.y - 7, '#ff6d62'); burst(monster.x + 16, monster.y + 20, weapon === 'orb' ? '#91eaff' : '#ffd66b');
  if (monster.hp <= 0) killMonster(monster);
}
function launchProjectile(monster, weapon) {
  const startX = player.x + 16, startY = player.y + 20;
  const endX = monster.x + 20, endY = monster.y + 20;
  const d = Math.hypot(endX - startX, endY - startY) || 1;
  const speed = weapon === 'orb' ? 330 : 420;
  projectiles.push({ x: startX, y: startY, vx: (endX - startX) / d * speed, vy: (endY - startY) / d * speed, target: monster, weapon, life: d / speed + .2 });
}
function attackTarget() {
  const monster = player.target;
  if (!monster || monster.dead) { player.target = null; return; }
  const data = weaponData[player.weapon];
  if (save.mp < data.mp) { toast('Pas assez de PM'); player.attackCooldown = .5; return; }
  save.mp -= data.mp; player.attackCooldown = data.cooldown; player.attackAnim = .38; player.state = 'attack';
  const dx = monster.gx - player.gx, dy = monster.gy - player.gy;
  if (Math.abs(dx) > Math.abs(dy)) player.dir = dx > 0 ? 'right' : 'left'; else player.dir = dy > 0 ? 'down' : 'up';
  if (data.projectile) launchProjectile(monster, player.weapon); else dealDamage(monster, player.weapon);
}
function killMonster(monster) {
  monster.dead = true; monster.state = 'death'; monster.respawn = 8 + Math.random() * 5; monster.hp = 0; monster.path = [];
  const gold = Math.floor(monster.gold[0] + Math.random() * (monster.gold[1] - monster.gold[0] + 1));
  save.gold += gold; addGeneralXp(monster.xp); addClassXp(monster.classXp);
  addFloater(`+${monster.xp} XP`, monster.x + 16, monster.y - 20, '#d8a1ff'); addFloater(`+${gold} or`, monster.x + 16, monster.y - 4, '#ffe27f');
  if (monster.type === 'slime') { save.questSlimes = Math.min(5, save.questSlimes + 1); save.inventory['Morceau de Gelée']++; }
  else if (monster.type === 'boar' || monster.type === 'wolf') save.inventory.Peau++;
  else if (Math.random() < .35) save.inventory.Bois++;
  if (Math.random() < .16) { save.inventory.Potion++; toast('Butin rare : Potion de vie'); }
  if (Math.random() < .08) { save.equipment.armor = 'Gilet renforcé'; toast('Équipement obtenu : Gilet renforcé'); }
  player.target = null; player.path = []; updateTargetCard(); persist();
}
function receiveDamage(monster) {
  if (player.dead) return;
  const reduction = Math.min(.5, save.masteries.defense.level * .012);
  const damage = Math.max(1, Math.round(monster.damage * (1 - reduction) + Math.random() * 2));
  save.hp -= damage; player.hitAnim = .25; addMastery('defense', 1.5 + monster.level * .12);
  addFloater(`-${damage}`, player.x + 16, player.y - 8, '#ff8179'); burst(player.x + 16, player.y + 20, '#e96666', 5);
  if (save.hp <= 0) playerDies();
}
function playerDies() {
  save.hp = 0; player.dead = true; player.deathTimer = 2.2; player.path = []; player.target = null; player.state = 'death'; updateTargetCard(); toast('Vous avez été vaincu');
}
function respawnPlayer() {
  player.dead = false; player.gx = 15; player.gy = 20; player.x = 15 * TILE; player.y = 20 * TILE; player.stepT = 1; player.path = []; player.state = 'idle';
  save.hp = save.maxHp; save.mp = save.maxMp; toast('Réapparition au village de Solenne'); persist();
}

function updatePlayer(dt) {
  player.attackCooldown = Math.max(0, player.attackCooldown - dt);
  player.attackAnim = Math.max(0, player.attackAnim - dt);
  player.hitAnim = Math.max(0, player.hitAnim - dt);
  save.mp = Math.min(save.maxMp, save.mp + dt * 1.25);
  if (player.dead) { player.deathTimer -= dt; if (player.deathTimer <= 0) respawnPlayer(); return; }

  const moving = updateMovement(player, dt, playerSpeed());
  if (moving) player.state = 'walk';
  else if (player.hitAnim > 0) player.state = 'hit';
  else if (player.attackAnim > 0) player.state = 'attack';
  else player.state = 'idle';

  if (player.target && !player.target.dead && player.stepT >= 1 && !player.path.length) {
    const data = weaponData[player.weapon];
    const d = Math.hypot(player.gx - player.target.gx, player.gy - player.target.gy);
    if (d > data.range) {
      player.path = findPath({ x: player.gx, y: player.gy }, { x: player.target.gx, y: player.target.gy }, { range: Math.max(1, Math.floor(data.range)), ignore: player.target });
    } else if (player.attackCooldown <= 0) attackTarget();
  }
}
function updateMonster(monster, dt) {
  monster.anim += dt; monster.attackCooldown = Math.max(0, monster.attackCooldown - dt); monster.hitAnim = Math.max(0, monster.hitAnim - dt);
  if (monster.dead) {
    monster.respawn -= dt;
    if (monster.respawn <= 0) { monster.dead = false; monster.hp = monster.maxHp; monster.gx = monster.homeX; monster.gy = monster.homeY; monster.x = monster.gx * TILE; monster.y = monster.gy * TILE; monster.stepT = 1; monster.state = 'idle'; }
    return;
  }
  const dPlayer = Math.hypot(monster.gx - player.gx, monster.gy - player.gy);
  if (!player.dead && dPlayer <= monster.aggro) {
    if (dPlayer <= 1.25 && monster.stepT >= 1) {
      monster.path = []; monster.state = 'attack';
      if (monster.attackCooldown <= 0) { monster.attackCooldown = 1.25 + Math.random() * .35; receiveDamage(monster); }
    } else if (monster.stepT >= 1 && !monster.path.length) {
      monster.path = findPath({ x: monster.gx, y: monster.gy }, { x: player.gx, y: player.gy }, { range: 1, ignore: monster, maxNodes: 650 });
    }
  } else {
    monster.wander -= dt;
    if (monster.wander <= 0 && monster.stepT >= 1 && !monster.path.length) {
      monster.wander = 1.4 + Math.random() * 2.8;
      const tx = clamp(monster.homeX + Math.floor(Math.random() * 7) - 3, 1, MAP_W - 2);
      const ty = clamp(monster.homeY + Math.floor(Math.random() * 7) - 3, 1, MAP_H - 2);
      monster.path = findPath({ x: monster.gx, y: monster.gy }, { x: tx, y: ty }, { ignore: monster, maxNodes: 400 });
    }
  }
  const moving = updateMovement(monster, dt, monster.speed);
  if (monster.hitAnim > 0) monster.state = 'hit'; else if (moving) monster.state = 'walk'; else if (monster.state !== 'attack' || monster.attackCooldown < .8) monster.state = 'idle';
}
function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.target?.dead) { projectiles.splice(i, 1); continue; }
    if (p.target && Math.hypot(p.x - (p.target.x + 20), p.y - (p.target.y + 20)) < 16) { dealDamage(p.target, p.weapon); projectiles.splice(i, 1); continue; }
    if (p.life <= 0) projectiles.splice(i, 1);
  }
}
function updateEffects(dt) {
  for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 100 * dt; if (p.life <= 0) particles.splice(i, 1); }
  for (let i = floaters.length - 1; i >= 0; i--) { const f = floaters[i]; f.life -= dt; f.y += f.vy * dt; if (f.life <= 0) floaters.splice(i, 1); }
}
function checkMentorInteraction() {
  if (save.className !== 'Aventurier' || save.permanentClassChoice) return;
  for (const mentor of mentors) {
    if (Math.hypot(player.gx - mentor.x, player.gy - mentor.y) <= 1.5) {
      if (save.classLevel >= 20) openMentorModal(); else toast(`Le mentor demande le rang Aventurier 20 (${save.classLevel}/20)`);
      return;
    }
  }
}

function updateCamera(dt) {
  camera.w = innerWidth; camera.h = innerHeight;
  const targetX = clamp(player.x + 16 - camera.w / 2, 0, MAP_W * TILE - camera.w);
  const targetY = clamp(player.y + 24 - camera.h / 2, 0, MAP_H * TILE - camera.h);
  const smoothing = 1 - Math.pow(.002, dt);
  camera.x = lerp(camera.x, targetX, smoothing); camera.y = lerp(camera.y, targetY, smoothing);
}

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
  canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingEnabled = false;
  camera.w = innerWidth; camera.h = innerHeight;
}
addEventListener('resize', resize); resize();

function drawGround() {
  const startX = Math.max(0, Math.floor(camera.x / TILE) - 1), endX = Math.min(MAP_W, Math.ceil((camera.x + camera.w) / TILE) + 1);
  const startY = Math.max(0, Math.floor(camera.y / TILE) - 1), endY = Math.min(MAP_H, Math.ceil((camera.y + camera.h) / TILE) + 1);
  for (let y = startY; y < endY; y++) for (let x = startX; x < endX; x++) {
    const tile = TILE_ATLAS[groundTile(x, y)];
    drawAtlas(assets.tiles, 32, 32, tile[0], tile[1], x * TILE - camera.x, y * TILE - camera.y);
  }
}
function drawHouse() { ctx.drawImage(assets.house, Math.round(4 * TILE - camera.x), Math.round(5 * TILE - camera.y), 160, 128); }
function drawDecorObject(object) {
  const pos = DECOR_ATLAS[object.kind]; if (!pos) return;
  drawAtlas(assets.decor, 64, 64, pos[0], pos[1], object.x * TILE - 16 - camera.x, object.y * TILE - 35 - camera.y, 64, 64);
}
function drawMentor(mentor, time) {
  const x = mentor.x * TILE - camera.x, y = mentor.y * TILE - camera.y;
  ctx.save(); ctx.filter = mentor.tint; ctx.drawImage(assets.hero, 0, 0, 32, 48, x, y - 20 + Math.sin(time * 2 + mentor.x) * .5, 32, 48); ctx.restore();
  ctx.textAlign = 'center'; ctx.font = '800 11px system-ui'; ctx.fillStyle = '#07100cbb'; ctx.fillText(mentor.type, x + 17, y - 24 + 1); ctx.fillStyle = '#ffe17e'; ctx.fillText(mentor.type, x + 16, y - 24);
  ctx.fillStyle = '#f5d858'; ctx.font = '900 16px system-ui'; ctx.fillText('!', x + 16, y - 38);
}
function heroFrame() {
  const row = DIRECTIONS[player.dir];
  let col = 0;
  if (player.state === 'walk') col = 2;
  else if (player.state === 'hit') col = 3;
  else col = Math.floor(performance.now() / 430) % 2;
  return [col, row];
}
function drawPlayer(time) {
  const [col, row] = heroFrame();
  const x = player.x - camera.x, y = player.y - camera.y - 16;
  ctx.save();
  if (player.dead) {
    const t = clamp(1 - player.deathTimer / 2.2, 0, 1); ctx.globalAlpha = 1 - t * .35; ctx.translate(x + 16, y + 39); ctx.rotate(Math.min(Math.PI / 2, t * Math.PI / 2)); ctx.drawImage(assets.hero, col * 32, row * 48, 32, 48, -16, -39, 32, 48); ctx.restore(); return;
  }
  const bob = player.state === 'walk' ? Math.sin(time * 18) * 1.2 : Math.sin(time * 3) * .4;
  ctx.drawImage(assets.hero, col * 32, row * 48, 32, 48, Math.round(x), Math.round(y + bob), 32, 48);
  if (player.attackAnim > 0) drawWeaponSwing(x + 16, y + 29, player.weapon, player.dir, player.attackAnim / .38);
  ctx.restore();
  drawNameplate(save.playerName, `Niv. ${save.generalLevel}`, x + 16, y - 5, '#66d36f');
}
function drawWeaponSwing(x, y, weapon, dir, phase) {
  const directionAngle = ({ right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 })[dir];
  let angle = directionAngle;
  if (weapon === 'staff') angle += lerp(-1.1, .8, 1 - phase);
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  const pos = ITEM_ATLAS[weapon];
  const size = weapon === 'staff' ? 34 : 25;
  ctx.drawImage(assets.items, pos[0] * 48, pos[1] * 48, 48, 48, 5, -size / 2, size, size);
  ctx.restore();
}
function monsterFrame(monster) {
  if (monster.dead) return 5;
  if (monster.hitAnim > 0) return 4;
  if (monster.state === 'attack') return 3;
  if (monster.state === 'walk') return 2;
  return Math.floor(monster.anim * 3) % 2;
}
function drawMonster(monster) {
  if (monster.dead && monster.respawn < 1) return;
  const row = MONSTER_ROWS[monster.type], col = monsterFrame(monster);
  const x = monster.x - camera.x - 4, y = monster.y - camera.y - 8;
  ctx.globalAlpha = monster.dead ? clamp(monster.respawn / 2, 0, .7) : 1;
  drawAtlas(assets.monsters, 40, 40, col, row, x, y, 40, 40); ctx.globalAlpha = 1;
  if (!monster.dead) {
    drawNameplate(monster.name, `Niv. ${monster.level}`, x + 20, y - 9, '#e54d4e', monster.hp / monster.maxHp);
    if (player.target === monster) { ctx.strokeStyle = '#ffe275'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x + 20, y + 35, 17, 6, 0, 0, Math.PI * 2); ctx.stroke(); }
  }
}
function drawNameplate(name, sub, x, y, color, ratio = 1) {
  ctx.textAlign = 'center'; ctx.font = '800 11px system-ui';
  ctx.fillStyle = '#07100ccc'; ctx.fillText(name, x + 1, y + 1); ctx.fillStyle = '#fff'; ctx.fillText(name, x, y);
  const width = 66; ctx.fillStyle = '#07100ddd'; ctx.fillRect(Math.round(x - width / 2), Math.round(y + 5), width, 6);
  ctx.fillStyle = color; ctx.fillRect(Math.round(x - width / 2 + 1), Math.round(y + 6), Math.round((width - 2) * clamp(ratio, 0, 1)), 4);
  if (sub) { ctx.font = '800 9px system-ui'; ctx.fillStyle = '#ffe191'; ctx.fillText(sub, x, y + 19); }
}
function drawProjectiles() {
  for (const p of projectiles) {
    const x = p.x - camera.x, y = p.y - camera.y;
    if (p.weapon === 'orb') { ctx.fillStyle = '#6ee6ff55'; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#93efff'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, y - 2, 2, 2); }
    else { ctx.fillStyle = '#776f64'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#c9c1ad'; ctx.fillRect(x - 1, y - 2, 2, 2); }
  }
}
function drawEffects() {
  for (const p of particles) { ctx.globalAlpha = clamp(p.life * 2, 0, 1); ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x - camera.x), Math.round(p.y - camera.y), 3, 3); }
  ctx.globalAlpha = 1;
  for (const f of floaters) { ctx.globalAlpha = clamp(f.life, 0, 1); ctx.textAlign = 'center'; ctx.font = '900 15px system-ui'; ctx.fillStyle = '#07100c'; ctx.fillText(f.text, f.x - camera.x + 1, f.y - camera.y + 1); ctx.fillStyle = f.color; ctx.fillText(f.text, f.x - camera.x, f.y - camera.y); }
  ctx.globalAlpha = 1;
}
function draw(time) {
  ctx.fillStyle = '#31552c'; ctx.fillRect(0, 0, camera.w, camera.h); drawGround();
  const renderables = [];
  renderables.push({ sortY: 10 * TILE, draw: drawHouse });
  for (const object of decor) renderables.push({ sortY: object.sortY, draw: () => drawDecorObject(object) });
  for (const mentor of mentors) renderables.push({ sortY: mentor.y * TILE + 34, draw: () => drawMentor(mentor, time) });
  for (const monster of monsters) renderables.push({ sortY: monster.y + 32, draw: () => drawMonster(monster) });
  renderables.push({ sortY: player.y + 32, draw: () => drawPlayer(time) });
  renderables.sort((a, b) => a.sortY - b.sortY).forEach(entry => entry.draw());
  drawProjectiles(); drawEffects();
}

function updateHud() {
  ui.playerName.textContent = save.playerName; ui.level.textContent = save.generalLevel; ui.className.textContent = save.className; ui.classLevel.textContent = save.classLevel;
  ui.hpBar.style.width = `${clamp(save.hp / save.maxHp * 100, 0, 100)}%`; ui.hpText.textContent = `${Math.ceil(save.hp)}/${save.maxHp}`;
  ui.mpBar.style.width = `${clamp(save.mp / save.maxMp * 100, 0, 100)}%`; ui.mpText.textContent = `${Math.floor(save.mp)}/${save.maxMp}`;
  const gn = generalNeed(save.generalLevel), cn = classNeed(save.classLevel);
  ui.xpBar.style.width = `${save.generalXp / gn * 100}%`; ui.xpText.textContent = `${Math.floor(save.generalXp)}/${gn}`;
  ui.classXpBar.style.width = `${save.classXp / cn * 100}%`; ui.classXpText.textContent = `${Math.floor(save.classXp)}/${cn}`;
  ui.gold.textContent = save.gold; ui.quest.textContent = `${save.questSlimes} / 5`;
  ui.potionCount.textContent = save.inventory.Potion || 0;
  ui.inventoryCount.textContent = Object.values(save.inventory).filter(v => v > 0).length;
}
function updateTargetCard() {
  const target = player.target;
  if (!target || target.dead) { ui.targetCard.classList.remove('visible'); ui.hint.textContent = 'Touchez une case ou un monstre'; return; }
  ui.targetCard.classList.add('visible'); ui.targetName.textContent = target.name; ui.targetLevel.textContent = `Niv. ${target.level}`; ui.targetHp.style.width = `${clamp(target.hp / target.maxHp * 100, 0, 100)}%`; ui.hint.textContent = `Cible : ${target.name}`;
}

function openDrawer(type) {
  ui.drawer.classList.add('open'); ui.backdrop.classList.add('open'); ui.drawer.setAttribute('aria-hidden', 'false');
  if (type === 'stats') renderStats(); else if (type === 'inventory') renderInventory(); else renderSettings();
}
function closeDrawer() { ui.drawer.classList.remove('open'); ui.backdrop.classList.remove('open'); ui.drawer.setAttribute('aria-hidden', 'true'); }
function statCard(label, value, xp = null, need = null) {
  return `<div class="stat-card"><small>${label}</small><b>${value}</b>${xp !== null ? `<progress max="${need}" value="${xp}"></progress><small>${Math.floor(xp)} / ${need} XP</small>` : ''}</div>`;
}
function renderStats() {
  ui.drawerKicker.textContent = 'Progression'; ui.drawerTitle.textContent = 'Statistiques et maîtrises';
  const m = save.masteries;
  ui.drawerContent.innerHTML = `<div class="stat-grid">
    ${statCard('Niveau général', save.generalLevel, save.generalXp, generalNeed(save.generalLevel))}
    ${statCard('Vitesse', playerSpeed())}
    ${statCard('Corps à corps', m.melee.level, m.melee.xp, masteryNeed(m.melee.level))}
    ${statCard('Distance', m.ranged.level, m.ranged.xp, masteryNeed(m.ranged.level))}
    ${statCard('Magie', m.magic.level, m.magic.xp, masteryNeed(m.magic.level))}
    ${statCard('Défense', m.defense.level, m.defense.xp, masteryNeed(m.defense.level))}
  </div><div class="info-card" style="margin-top:10px"><b>${save.className} — rang ${save.classLevel}</b><p>Au rang Aventurier 20, parlez à un mentor pour choisir définitivement Épéiste, Archer ou Mage.</p></div>`;
}
function itemIconCanvas(type) { return `<canvas width="42" height="42" data-drawer-icon="${type}"></canvas>`; }
function renderInventory() {
  ui.drawerKicker.textContent = 'Personnage'; ui.drawerTitle.textContent = 'Inventaire';
  const rows = Object.entries(save.inventory).filter(([, count]) => count > 0).map(([name, count]) => {
    const icon = name === 'Potion' ? 'potion' : name.includes('Gelée') ? 'orb' : name === 'Bois' ? 'staff' : 'bag';
    return `<div class="inventory-item">${itemIconCanvas(icon)}<div><b>${name}</b><small>Objet conservé à la mort</small></div><span>x${count}</span></div>`;
  }).join('') || '<div class="info-card">Votre inventaire est vide.</div>';
  ui.drawerContent.innerHTML = `<div class="inventory-list">${rows}</div><div class="equipment-row"><div class="equipment-card"><small>Arme</small><b>${save.equipment.weapon}</b></div><div class="equipment-card"><small>Armure</small><b>${save.equipment.armor}</b></div></div><div class="info-card" style="margin-top:10px"><b>${save.gold} pièces d’or</b><p>Les monstres peuvent donner de l’or, des matériaux, des potions et parfois de l’équipement.</p></div>`;
  $$('canvas[data-drawer-icon]', ui.drawerContent).forEach(c => drawItemIcon(c.getContext('2d'), c.dataset.drawerIcon, 0, 0, 42));
}
function renderSettings() {
  ui.drawerKicker.textContent = 'Fondation'; ui.drawerTitle.textContent = 'Paramètres';
  ui.drawerContent.innerHTML = `<div class="info-card"><b>Build ${BUILD}</b><p>Mode mobile paysage, déplacement case par case, assets originaux séparés et sauvegarde locale.</p></div><div class="info-card" style="margin-top:10px"><b>Contrôles</b><p>Touchez le sol pour vous déplacer. Touchez un monstre pour marcher à portée et l’attaquer automatiquement.</p></div><button id="reset-save" class="secondary-button">Réinitialiser le personnage</button>`;
  $('#reset-save').onclick = () => { if (confirm('Réinitialiser toute la progression locale ?')) { localStorage.removeItem(SAVE_KEY); location.reload(); } };
}
function usePotion() {
  if ((save.inventory.Potion || 0) <= 0) { toast('Aucune potion'); return; }
  if (save.hp >= save.maxHp) { toast('Vos PV sont déjà au maximum'); return; }
  save.inventory.Potion--; save.hp = Math.min(save.maxHp, save.hp + 45); burst(player.x + 16, player.y + 15, '#6be78b', 10); toast('Potion utilisée : +45 PV'); persist();
}
function openMentorModal() { ui.mentorModal.classList.add('open'); ui.mentorModal.setAttribute('aria-hidden', 'false'); }
function closeMentorModal() { ui.mentorModal.classList.remove('open'); ui.mentorModal.setAttribute('aria-hidden', 'true'); }
function selectClass(name) {
  if (save.permanentClassChoice || save.className !== 'Aventurier' || save.classLevel < 20) return;
  save.className = name; save.classLevel = 1; save.classXp = 0; save.permanentClassChoice = true; persist(); closeMentorModal(); toast(`Vous êtes désormais ${name}`); updateHud();
}

function pointerToWorld(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left + camera.x, y: event.clientY - rect.top + camera.y };
}
canvas.addEventListener('pointerdown', event => {
  event.preventDefault();
  const point = pointerToWorld(event);
  const monster = [...monsters].reverse().find(m => !m.dead && point.x >= m.x - 5 && point.x <= m.x + 42 && point.y >= m.y - 10 && point.y <= m.y + 38);
  if (monster) { targetMonster(monster); return; }
  const mentor = mentors.find(m => Math.hypot(point.x / TILE - m.x, point.y / TILE - m.y) < 1.1);
  if (mentor) { player.path = findPath({ x: player.gx, y: player.gy }, { x: mentor.x, y: mentor.y }, { range: 1 }); setTimeout(checkMentorInteraction, 700); return; }
  requestMove(clamp(Math.floor(point.x / TILE), 1, MAP_W - 2), clamp(Math.floor(point.y / TILE), 1, MAP_H - 2));
});
$$('[data-weapon]').forEach(button => button.addEventListener('click', () => chooseWeapon(button.dataset.weapon)));
$('#inventory-button').onclick = () => openDrawer('inventory');
$('#stats-button').onclick = () => openDrawer('stats');
$('#settings-button').onclick = () => openDrawer('settings');
$('#potion-button').onclick = usePotion;
$('#drawer-close').onclick = closeDrawer; ui.backdrop.onclick = closeDrawer;
$('#mentor-cancel').onclick = closeMentorModal;
$$('[data-class]').forEach(button => button.onclick = () => selectClass(button.dataset.class));

function update(dt) {
  updatePlayer(dt); monsters.forEach(monster => updateMonster(monster, dt)); updateProjectiles(dt); updateEffects(dt); updateCamera(dt);
  saveTimer += dt; if (saveTimer > 4) { saveTimer = 0; persist(); }
  updateHud(); updateTargetCard();
}
function loop(now) {
  const dt = Math.min(.05, (now - lastTime) / 1000); lastTime = now;
  update(dt); draw(now / 1000); requestAnimationFrame(loop);
}

updateHud(); updateTargetCard();
if (new URLSearchParams(location.search).get('mentor') === '1') { save.classLevel = 20; openMentorModal(); }
window.__SOLENNE__ = {
  build: BUILD, player, monsters, save,
  test: {
    moveTo: (x, y) => requestMove(x, y), targetFirst: () => targetMonster(monsters.find(m => !m.dead)),
    setWeapon: chooseWeapon, killTarget: () => player.target && killMonster(player.target),
    openStats: () => openDrawer('stats'), openInventory: () => openDrawer('inventory'),
    die: playerDies, reset: () => { localStorage.removeItem(SAVE_KEY); location.reload(); }
  }
};
requestAnimationFrame(loop);

if ('serviceWorker' in navigator && location.protocol !== 'file:' && !new URLSearchParams(location.search).has('qa')) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Service worker non enregistré', error)));
}
