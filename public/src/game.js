(() => {
  'use strict';

  const BUILD = '1.1.0-foundation.1';
  const TILE = 32;
  const SAVE_KEY = 'chroniques-solenne-save-v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const key = (x, y) => `${x},${y}`;
  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const now = () => performance.now() / 1000;
  const randomInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));

  const canvas = $('#game');
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;

  const ui = {
    loading: $('#loading-screen'), loadingLabel: $('#loading-label'), loadingProgress: $('#loading-progress'),
    zoneName: $('#zone-name'), portrait: $('#portrait'), playerName: $('#player-name'), className: $('#class-name'),
    generalLevel: $('#general-level'), classLevel: $('#class-level'), hpBar: $('#hp-bar'), hpText: $('#hp-text'),
    mpBar: $('#mp-bar'), mpText: $('#mp-text'), xpBar: $('#xp-bar'), xpText: $('#xp-text'),
    classXpBar: $('#class-xp-bar'), classXpText: $('#class-xp-text'), gold: $('#gold-text'),
    targetCard: $('#target-card'), targetName: $('#target-name'), targetLevel: $('#target-level'), targetHp: $('#target-hp-bar'),
    worldHint: $('#world-hint-text'), inventoryCount: $('#inventory-count'), potionCount: $('#potion-count'),
    drawer: $('#drawer'), drawerBackdrop: $('#drawer-backdrop'), drawerTitle: $('#drawer-title'), drawerKicker: $('#drawer-kicker'), drawerContent: $('#drawer-content'),
    classModal: $('#class-modal'), settingsModal: $('#settings-modal'), toastStack: $('#toast-stack'),
    deathVignette: $('#death-vignette'), effectsToggle: $('#effects-toggle'), gridToggle: $('#grid-toggle'),
    fatal: $('#fatal-error'), fatalMessage: $('#fatal-message')
  };

  const HERO_STATES = {
    idle: { start: 0, count: 4, fps: 3.2, loop: true },
    walk: { start: 4, count: 6, fps: 9.5, loop: true },
    staff: { start: 10, count: 6, fps: 12, loop: false },
    sling: { start: 16, count: 6, fps: 11, loop: false },
    cast: { start: 22, count: 6, fps: 11, loop: false },
    hit: { start: 28, count: 3, fps: 9, loop: false },
    death: { start: 31, count: 6, fps: 8, loop: false }
  };
  const HERO_DIR = { up: 0, left: 1, right: 2, down: 3 };
  const MONSTER_STATES = {
    idle: { start: 0, count: 4, fps: 3, loop: true },
    walk: { start: 4, count: 4, fps: 7, loop: true },
    attack: { start: 8, count: 6, fps: 10, loop: false },
    hit: { start: 14, count: 3, fps: 9, loop: false },
    death: { start: 17, count: 6, fps: 8, loop: false }
  };
  const MONSTER_ROW = { slime: 0, rat: 1, boar: 2, wolf: 3, wisp: 4 };
  const UI_ICON = { staff: 0, sling: 1, orb: 2, bag: 3, stats: 4, potion: 5, coin: 6, settings: 7, sword: 8, archer: 9, mage: 10, boots: 11 };
  const EFFECT_FRAME = { hit: [0, 6], stone: [6, 4], magic: [10, 8], level: [18, 8], heal: [26, 6] };

  const WEAPONS = {
    staff: { label: 'Bâton', state: 'staff', mastery: 'melee', range: 1.2, cooldown: 0.86, mana: 0, projectile: null, baseDamage: 7, hitAt: 0.30 },
    sling: { label: 'Fronde', state: 'sling', mastery: 'ranged', range: 5.2, cooldown: 1.08, mana: 0, projectile: 'stone', baseDamage: 6, hitAt: 0.39 },
    orb: { label: 'Orbe', state: 'cast', mastery: 'magic', range: 5.6, cooldown: 1.18, mana: 4, projectile: 'magic', baseDamage: 8, hitAt: 0.40 }
  };

  const MONSTER_DEFS = {
    slime: { name: 'Gelée des prés', hp: 34, damage: 3, speed: 76, attackRate: 1.45, xp: 22, classXp: 14, gold: [2, 7], aggro: 4.6 },
    rat: { name: 'Rat des chemins', hp: 42, damage: 4, speed: 92, attackRate: 1.25, xp: 28, classXp: 17, gold: [3, 9], aggro: 5.2 },
    boar: { name: 'Sanglier brun', hp: 68, damage: 7, speed: 84, attackRate: 1.55, xp: 44, classXp: 25, gold: [5, 13], aggro: 5.5 },
    wolf: { name: 'Loup des lisières', hp: 82, damage: 9, speed: 110, attackRate: 1.18, xp: 58, classXp: 32, gold: [7, 17], aggro: 6.2 },
    wisp: { name: 'Feu follet', hp: 74, damage: 8, speed: 98, attackRate: 1.35, xp: 62, classXp: 36, gold: [8, 19], aggro: 6.6 }
  };

  const ITEMS = {
    potion: { id: 'potion', name: 'Potion rouge', description: 'Rend 45 PV.', icon: 'potion', type: 'consumable', rarity: 'common' },
    hide: { id: 'hide', name: 'Peau robuste', description: 'Matériau récupéré sur les bêtes.', icon: 'bag', type: 'material', rarity: 'common' },
    slimeGel: { id: 'slimeGel', name: 'Gelée lumineuse', description: 'Un composant légèrement magique.', icon: 'orb', type: 'material', rarity: 'uncommon' },
    wornBoots: { id: 'wornBoots', name: 'Bottes de voyage', description: '+2 défense. Un équipement simple mais fiable.', icon: 'boots', type: 'equipment', slot: 'feet', stats: { defense: 2 }, rarity: 'uncommon' },
    forestCharm: { id: 'forestCharm', name: 'Charme forestier', description: '+2 magie et +5 PM.', icon: 'orb', type: 'equipment', slot: 'charm', stats: { magic: 2, maxMp: 5 }, rarity: 'rare' },
    hunterBand: { id: 'hunterBand', name: 'Bandeau du chasseur', description: '+2 distance et +1 défense.', icon: 'sling', type: 'equipment', slot: 'head', stats: { ranged: 2, defense: 1 }, rarity: 'rare' },
    oakRing: { id: 'oakRing', name: 'Anneau de chêne', description: '+2 corps à corps et +8 PV.', icon: 'staff', type: 'equipment', slot: 'ring', stats: { melee: 2, maxHp: 8 }, rarity: 'rare' }
  };

  const DEFAULT_SAVE = {
    version: 1,
    player: {
      name: 'Voyageur 801', x: 24, y: 22, level: 1, xp: 0, className: 'Aventurier', classLevel: 1, classXp: 0,
      hp: 100, baseMaxHp: 100, mp: 40, baseMaxMp: 40, gold: 0, weapon: 'staff', village: 'Village de Solenne'
    },
    masteries: {
      melee: { level: 1, xp: 0 }, ranged: { level: 1, xp: 0 }, magic: { level: 1, xp: 0 }, defense: { level: 1, xp: 0 }
    },
    inventory: { potion: 2 },
    equipment: { head: null, feet: null, charm: null, ring: null },
    settings: { effects: true, grid: false },
    classChoiceLocked: false,
    discoveredVillages: ['Village de Solenne']
  };

  const EMBEDDED = window.__SOLENNE_EMBEDDED__ || null;
  const assetUrl = (name, fallback) => EMBEDDED?.[name] || fallback;

  const game = {
    ready: false,
    assets: {},
    map: null,
    blocked: new Set(),
    state: loadSave(),
    player: null,
    monsters: [],
    projectiles: [],
    effects: [],
    floaters: [],
    camera: { x: 0, y: 0, targetX: 0, targetY: 0 },
    viewport: { w: innerWidth, h: innerHeight, dpr: Math.min(devicePixelRatio || 1, 2) },
    selectedMonsterId: null,
    lastTime: performance.now(),
    uiDirty: true,
    autosaveAt: 0,
    zoneName: 'Clairière de Solenne',
    debug: new URLSearchParams(location.search).has('debug')
  };

  function fatal(error) {
    console.error(error);
    ui.fatalMessage.textContent = String(error?.stack || error?.message || error || 'Erreur inconnue');
    ui.fatal.classList.add('show');
  }
  window.addEventListener('error', event => fatal(event.error || event.message));
  window.addEventListener('unhandledrejection', event => fatal(event.reason));

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return deepClone(DEFAULT_SAVE);
      const parsed = JSON.parse(raw);
      const save = deepClone(DEFAULT_SAVE);
      Object.assign(save.player, parsed.player || {});
      Object.assign(save.masteries, parsed.masteries || {});
      Object.assign(save.inventory, parsed.inventory || {});
      Object.assign(save.equipment, parsed.equipment || {});
      Object.assign(save.settings, parsed.settings || {});
      save.classChoiceLocked = Boolean(parsed.classChoiceLocked);
      save.discoveredVillages = Array.isArray(parsed.discoveredVillages) ? parsed.discoveredVillages : ['Village de Solenne'];
      return save;
    } catch (error) {
      console.warn('Sauvegarde illisible, réinitialisation.', error);
      return deepClone(DEFAULT_SAVE);
    }
  }

  function saveGame() {
    try {
      if (game.player) {
        game.state.player.x = game.player.x;
        game.state.player.y = game.player.y;
        game.state.player.hp = Math.ceil(game.player.hp);
        game.state.player.mp = Math.floor(game.player.mp);
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(game.state));
    } catch (error) {
      console.warn('Sauvegarde impossible', error);
    }
  }

  function generalXpNeeded(level) { return 90 + level * 38 + Math.floor(level ** 1.45 * 7); }
  function classXpNeeded(level) { return 62 + level * 27 + Math.floor(level ** 1.35 * 6); }
  function masteryXpNeeded(level) { return 24 + level * 16 + Math.floor(level ** 1.2 * 3); }
  function playerSpeed() { return 100 + Math.max(0, game.state.player.level - 1); }

  function equipmentStats() {
    const total = { maxHp: 0, maxMp: 0, melee: 0, ranged: 0, magic: 0, defense: 0 };
    for (const itemId of Object.values(game.state.equipment)) {
      const item = itemId ? ITEMS[itemId] : null;
      if (!item?.stats) continue;
      for (const [stat, value] of Object.entries(item.stats)) total[stat] = (total[stat] || 0) + value;
    }
    return total;
  }

  function maxHp() { return game.state.player.baseMaxHp + equipmentStats().maxHp; }
  function maxMp() { return game.state.player.baseMaxMp + equipmentStats().maxMp; }
  function effectiveMastery(name) { return game.state.masteries[name].level + (equipmentStats()[name] || 0); }
  function defenseValue() { return effectiveMastery('defense'); }

  function image(src, progress) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { progress(); resolve(img); };
      img.onerror = () => reject(new Error(`Asset impossible à charger : ${src}`));
      img.src = src;
    });
  }

  async function loadAssets() {
    let loaded = 0;
    const total = 8;
    const progress = label => {
      loaded += 1;
      ui.loadingProgress.style.width = `${Math.round(loaded / total * 100)}%`;
      ui.loadingLabel.textContent = label || 'Chargement des assets…';
    };
    const mapPromise = EMBEDDED?.map
      ? Promise.resolve(EMBEDDED.map).then(value => { progress('Grille et collisions…'); return value; })
      : fetch('./assets/map-data.json').then(async response => {
          if (!response.ok) throw new Error('Carte introuvable');
          const json = await response.json();
          progress('Grille et collisions…');
          return json;
        });
    const [mapBase, mapOverlay, hero, monsters, uiAtlas, effects, portrait, mapData] = await Promise.all([
      image(assetUrl('mapBase','./assets/map-base.png'), () => progress('Décors de la Clairière…')),
      image(assetUrl('mapOverlay','./assets/map-overlay.png'), () => progress('Canopées et bâtiments…')),
      image(assetUrl('hero','./assets/hero.png'), () => progress('Animations de l’Aventurier…')),
      image(assetUrl('monsters','./assets/monsters.png'), () => progress('Monstres de Solenne…')),
      image(assetUrl('ui','./assets/ui.png'), () => progress('Interface mobile…')),
      image(assetUrl('effects','./assets/effects.png'), () => progress('Effets de combat…')),
      image(assetUrl('portrait','./assets/portrait.png'), () => progress('Portrait du voyageur…')),
      mapPromise
    ]);
    game.assets = { mapBase, mapOverlay, hero, monsters, ui: uiAtlas, effects, portrait };
    game.map = mapData;
    game.blocked = new Set(mapData.blocked.map(([x, y]) => key(x, y)));
    ui.portrait.src = portrait.src;
  }

  function makeMover(x, y) {
    return { x, y, px: x, py: y, path: [], from: null, to: null, step: 0, direction: 'down' };
  }

  function initWorld() {
    const p = game.state.player;
    const spawn = isWalkable(p.x, p.y) ? { x: p.x, y: p.y } : game.map.spawn;
    game.player = {
      ...makeMover(spawn.x, spawn.y), hp: clamp(p.hp, 1, maxHp()), mp: clamp(p.mp, 0, maxMp()),
      state: 'idle', stateTime: 0, attackCooldown: 0, pendingAttack: null, hitLock: 0, dying: false, respawnTimer: 0, interaction: null
    };
    game.monsters = game.map.monsterSpawns.map((spawnData, index) => createMonster(spawnData, index));
    game.camera.x = clamp(game.player.px * TILE - innerWidth / 2, 0, game.map.width * TILE - innerWidth);
    game.camera.y = clamp(game.player.py * TILE - innerHeight / 2, 0, game.map.height * TILE - innerHeight);
    drawUiIcons();
    bindControls();
    syncUi(true);
    game.ready = true;
    setTimeout(() => ui.loading.classList.add('hidden'), 250);
    toast('Bienvenue dans la Clairière de Solenne', 'level');
  }

  function createMonster(spawn, index) {
    const def = MONSTER_DEFS[spawn.type];
    const max = def.hp + Math.max(0, spawn.level - 1) * 9;
    return {
      id: `m-${index}`, type: spawn.type, level: spawn.level, spawnX: spawn.x, spawnY: spawn.y,
      ...makeMover(spawn.x, spawn.y), hp: max, maxHp: max, state: 'idle', stateTime: Math.random(),
      attackCooldown: Math.random(), pendingAttack: null, hitLock: 0, dead: false, respawnAt: 0,
      aggro: false, wanderAt: now() + 1 + Math.random() * 4, targetX: spawn.x, targetY: spawn.y
    };
  }

  function isInside(x, y) { return x >= 0 && y >= 0 && x < game.map.width && y < game.map.height; }
  function isWalkable(x, y, options = {}) {
    if (!isInside(x, y) || game.blocked.has(key(x, y))) return false;
    if (!options.ignoreMonsters) {
      for (const monster of game.monsters) {
        if (!monster.dead && monster.id !== options.ignoreMonsterId && monster.x === x && monster.y === y) return false;
      }
    }
    return true;
  }

  function findPath(start, goal, range = 0, options = {}) {
    const startKey = key(start.x, start.y);
    const open = [{ x: start.x, y: start.y, g: 0, f: manhattan(start, goal) }];
    const came = new Map();
    const gScore = new Map([[startKey, 0]]);
    const closed = new Set();
    let found = null;
    let iterations = 0;
    while (open.length && iterations++ < 9000) {
      open.sort((a, b) => a.f - b.f || a.g - b.g);
      const current = open.shift();
      const ck = key(current.x, current.y);
      if (closed.has(ck)) continue;
      closed.add(ck);
      const d = Math.abs(current.x - goal.x) + Math.abs(current.y - goal.y);
      if (d <= range) { found = current; break; }
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = current.x + dx, ny = current.y + dy, nk = key(nx, ny);
        if (closed.has(nk) || !isWalkable(nx, ny, options)) continue;
        const tentative = current.g + 1;
        if (tentative >= (gScore.get(nk) ?? Infinity)) continue;
        came.set(nk, ck);
        gScore.set(nk, tentative);
        open.push({ x: nx, y: ny, g: tentative, f: tentative + manhattan({x:nx,y:ny}, goal) });
      }
    }
    if (!found) return [];
    const result = [];
    let cursor = key(found.x, found.y);
    while (cursor !== startKey) {
      const [x, y] = cursor.split(',').map(Number);
      result.push({ x, y });
      cursor = came.get(cursor);
      if (!cursor) return [];
    }
    return result.reverse();
  }

  function lineOfSight(a, b) {
    let x0 = Math.round(a.x), y0 = Math.round(a.y), x1 = Math.round(b.x), y1 = Math.round(b.y);
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
      if (!(x0 === Math.round(a.x) && y0 === Math.round(a.y)) && game.blocked.has(key(x0, y0))) return false;
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return true;
  }

  function setDirection(entity, from, to) {
    const dx = to.x - from.x, dy = to.y - from.y;
    if (Math.abs(dx) > Math.abs(dy)) entity.direction = dx < 0 ? 'left' : 'right';
    else if (dy !== 0) entity.direction = dy < 0 ? 'up' : 'down';
  }

  function beginStep(entity) {
    if (entity.to || !entity.path.length) return;
    entity.from = { x: entity.x, y: entity.y };
    entity.to = entity.path.shift();
    entity.step = 0;
    setDirection(entity, entity.from, entity.to);
    entity.state = 'walk';
    entity.stateTime = 0;
  }

  function movementDuration(entity, isPlayer) {
    const speed = isPlayer ? playerSpeed() : MONSTER_DEFS[entity.type].speed;
    return 0.34 * (100 / speed);
  }

  function updateMovement(entity, dt, isPlayer) {
    beginStep(entity);
    if (!entity.to) return false;
    if (!isPlayer && game.player && entity.to.x === game.player.x && entity.to.y === game.player.y) {
      entity.path = []; entity.to = null; entity.from = null; entity.step = 0;
      return false;
    }
    entity.step += dt / movementDuration(entity, isPlayer);
    const t = clamp(entity.step, 0, 1);
    const smooth = t * t * (3 - 2 * t);
    entity.px = lerp(entity.from.x, entity.to.x, smooth);
    entity.py = lerp(entity.from.y, entity.to.y, smooth);
    if (t >= 1) {
      entity.x = entity.to.x; entity.y = entity.to.y; entity.px = entity.x; entity.py = entity.y;
      entity.to = null; entity.from = null; entity.step = 0;
      beginStep(entity);
    }
    return true;
  }

  function stopMovement(entity) {
    entity.path = [];
    if (!entity.to) return;
    if (entity.step >= .5) {
      entity.x = entity.to.x; entity.y = entity.to.y;
    } else if (entity.from) {
      entity.x = entity.from.x; entity.y = entity.from.y;
    }
    entity.px = entity.x; entity.py = entity.y; entity.to = null; entity.from = null; entity.step = 0;
  }

  function setPlayerPath(destination, range = 0, targetId = null) {
    if (game.player.dying) return;
    game.selectedMonsterId = targetId;
    const path = findPath(game.player, destination, range, { ignoreMonsterId: targetId });
    if (!path.length && manhattan(game.player, destination) > range) {
      toast('Ce passage est bloqué');
      return;
    }
    game.player.path = path;
    game.player.pendingAttack = null;
    if (!path.length) game.player.state = 'idle';
    syncUi(true);
  }

  function selectedMonster() { return game.monsters.find(monster => monster.id === game.selectedMonsterId && !monster.dead) || null; }

  function faceToward(entity, target) { setDirection(entity, entity, target); }

  function updatePlayer(dt) {
    const player = game.player;
    if (player.dying) {
      player.stateTime += dt;
      player.respawnTimer -= dt;
      if (player.respawnTimer <= 0) respawnPlayer();
      return;
    }
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    player.hitLock = Math.max(0, player.hitLock - dt);
    const previousMp = Math.floor(player.mp);
    player.mp = Math.min(maxMp(), player.mp + dt * 1.7);
    if (Math.floor(player.mp) !== previousMp) game.uiDirty = true;

    if (player.pendingAttack) {
      player.stateTime += dt;
      const attack = player.pendingAttack;
      if (!attack.fired && player.stateTime >= attack.hitAt) {
        attack.fired = true;
        executePlayerHit(attack);
      }
      if (player.stateTime >= attack.duration) {
        player.pendingAttack = null;
        player.state = 'idle';
        player.stateTime = 0;
      }
      return;
    }

    const moving = updateMovement(player, dt, true);
    if (moving) {
      player.stateTime += dt;
      return;
    }

    if (player.interaction === 'mentor' && distance(player, game.map.mentor) <= 1.45) {
      player.interaction = null;
      if (game.state.player.className === 'Aventurier' && game.state.player.classLevel >= 20 && !game.state.classChoiceLocked) openModal(ui.classModal);
    }

    const target = selectedMonster();
    if (target) {
      const weapon = WEAPONS[game.state.player.weapon];
      const d = distance(player, target);
      if (d > weapon.range || !lineOfSight(player, target)) {
        if (!player.path.length && !player.to) {
          player.path = findPath(player, target, Math.max(1, Math.floor(weapon.range)), { ignoreMonsterId: target.id });
          if (!player.path.length) {
            toast('La cible est inaccessible');
            game.selectedMonsterId = null;
          }
        }
      } else if (player.attackCooldown <= 0) {
        startPlayerAttack(target, weapon);
      } else {
        player.state = 'idle'; player.stateTime += dt;
      }
    } else {
      player.state = player.hitLock > 0 ? 'hit' : 'idle';
      player.stateTime += dt;
    }
  }

  function startPlayerAttack(target, weapon) {
    if (game.player.mp < weapon.mana) {
      toast('Pas assez de PM');
      game.player.attackCooldown = .5;
      return;
    }
    stopMovement(game.player);
    faceToward(game.player, target);
    game.player.mp -= weapon.mana;
    game.player.state = weapon.state;
    game.player.stateTime = 0;
    game.player.attackCooldown = weapon.cooldown;
    game.player.pendingAttack = { targetId: target.id, weapon: game.state.player.weapon, hitAt: weapon.hitAt, duration: weapon.cooldown * .76, fired: false };
    game.uiDirty = true;
  }

  function executePlayerHit(attack) {
    const monster = game.monsters.find(m => m.id === attack.targetId && !m.dead);
    if (!monster) return;
    const weapon = WEAPONS[attack.weapon];
    if (distance(game.player, monster) > weapon.range + .55 || !lineOfSight(game.player, monster)) return;
    const mastery = effectiveMastery(weapon.mastery);
    const variance = randomInt(-1, 2);
    const damage = Math.max(1, Math.floor(weapon.baseDamage + mastery * .72 + variance));
    if (weapon.projectile) {
      game.projectiles.push({ type: weapon.projectile, x: game.player.px, y: game.player.py - .15, targetId: monster.id, damage, mastery: weapon.mastery, speed: weapon.projectile === 'magic' ? 9 : 7.5, life: 2 });
    } else {
      applyDamageToMonster(monster, damage, weapon.mastery);
      spawnEffect('hit', monster.px, monster.py - .15, .34);
    }
  }

  function applyDamageToMonster(monster, damage, mastery) {
    if (monster.dead) return;
    monster.hp -= damage;
    monster.hitLock = .22;
    monster.state = 'hit'; monster.stateTime = 0; monster.aggro = true;
    gainMastery(mastery, randomInt(2, 4));
    floatText(`-${damage}`, monster.px, monster.py - .7, '#ffe18b');
    if (monster.hp <= 0) killMonster(monster);
    game.uiDirty = true;
  }

  function updateProjectiles(dt) {
    for (let i = game.projectiles.length - 1; i >= 0; i--) {
      const projectile = game.projectiles[i];
      projectile.life -= dt;
      const target = game.monsters.find(m => m.id === projectile.targetId && !m.dead);
      if (!target || projectile.life <= 0) { game.projectiles.splice(i, 1); continue; }
      const dx = target.px - projectile.x, dy = target.py - .18 - projectile.y;
      const d = Math.hypot(dx, dy);
      if (d < .15) {
        applyDamageToMonster(target, projectile.damage, projectile.mastery);
        spawnEffect('hit', target.px, target.py - .15, .34);
        game.projectiles.splice(i, 1);
        continue;
      }
      const amount = Math.min(d, projectile.speed * dt);
      projectile.x += dx / d * amount; projectile.y += dy / d * amount;
    }
  }

  function updateMonsters(dt) {
    const t = now();
    for (const monster of game.monsters) {
      if (monster.dead) {
        if (t >= monster.respawnAt) respawnMonster(monster);
        continue;
      }
      monster.attackCooldown = Math.max(0, monster.attackCooldown - dt);
      monster.hitLock = Math.max(0, monster.hitLock - dt);

      if (monster.pendingAttack) {
        monster.stateTime += dt;
        const attack = monster.pendingAttack;
        if (!attack.fired && monster.stateTime >= attack.hitAt) {
          attack.fired = true;
          if (!game.player.dying && distance(monster, game.player) <= 1.45) damagePlayer(attack.damage);
        }
        if (monster.stateTime >= attack.duration) {
          monster.pendingAttack = null; monster.state = 'idle'; monster.stateTime = 0;
        }
        continue;
      }
      if (monster.hitLock > 0) { monster.state = 'hit'; monster.stateTime += dt; continue; }

      const playerDistance = distance(monster, game.player);
      if (!game.player.dying && (monster.aggro || playerDistance <= MONSTER_DEFS[monster.type].aggro)) monster.aggro = true;
      if (monster.aggro && !game.player.dying) {
        if (playerDistance <= 1.25 && monster.attackCooldown <= 0) startMonsterAttack(monster);
        else if (playerDistance > 1.1) {
          if (!monster.path.length && !monster.to) monster.path = findPath(monster, game.player, 1, { ignoreMonsters: true });
          if (updateMovement(monster, dt, false)) monster.stateTime += dt;
          else { monster.state = 'idle'; monster.stateTime += dt; }
        }
        if (playerDistance > 10) { monster.aggro = false; monster.path = []; }
      } else {
        if (updateMovement(monster, dt, false)) monster.stateTime += dt;
        else {
          monster.state = 'idle'; monster.stateTime += dt;
          if (t >= monster.wanderAt) {
            monster.wanderAt = t + 2 + Math.random() * 5;
            const goal = { x: clamp(monster.spawnX + randomInt(-3, 3), 1, game.map.width - 2), y: clamp(monster.spawnY + randomInt(-3, 3), 1, game.map.height - 2) };
            monster.path = findPath(monster, goal, 0, { ignoreMonsters: true });
          }
        }
      }
    }
  }

  function startMonsterAttack(monster) {
    stopMovement(monster);
    faceToward(monster, game.player);
    const def = MONSTER_DEFS[monster.type];
    monster.state = 'attack'; monster.stateTime = 0; monster.attackCooldown = def.attackRate;
    monster.pendingAttack = { hitAt: .42, duration: .70, fired: false, damage: def.damage + Math.floor(monster.level * .7) };
  }

  function damagePlayer(rawDamage) {
    const reduction = Math.min(rawDamage - 1, Math.floor(defenseValue() * .17));
    const damage = Math.max(1, rawDamage - reduction);
    game.player.hp -= damage;
    game.player.hitLock = .25; game.player.state = 'hit'; game.player.stateTime = 0;
    gainMastery('defense', randomInt(2, 4));
    floatText(`-${damage}`, game.player.px, game.player.py - .8, '#ff918d');
    spawnEffect('hit', game.player.px, game.player.py - .15, .32);
    if (game.player.hp <= 0) killPlayer();
    game.uiDirty = true;
  }

  function killPlayer() {
    if (game.player.dying) return;
    stopMovement(game.player);
    game.player.hp = 0; game.player.dying = true; game.player.state = 'death'; game.player.stateTime = 0; game.player.respawnTimer = 2.2;
    game.selectedMonsterId = null;
    ui.deathVignette.classList.add('show');
    for (const monster of game.monsters) { monster.aggro = false; monster.path = []; monster.pendingAttack = null; }
    saveGame(); syncUi(true);
  }

  function respawnPlayer() {
    const respawn = game.map.villageRespawn;
    Object.assign(game.player, makeMover(respawn.x, respawn.y));
    game.player.hp = maxHp(); game.player.mp = maxMp(); game.player.state = 'idle'; game.player.stateTime = 0;
    game.player.dying = false; game.player.respawnTimer = 0; game.player.pendingAttack = null; game.player.attackCooldown = .5;
    ui.deathVignette.classList.remove('show');
    toast('Réapparition au Village de Solenne', 'level');
    saveGame(); syncUi(true);
  }

  function killMonster(monster) {
    monster.hp = 0; monster.dead = true; monster.state = 'death'; monster.stateTime = 0; monster.path = []; monster.pendingAttack = null;
    monster.respawnAt = now() + 10 + Math.random() * 7;
    if (game.selectedMonsterId === monster.id) game.selectedMonsterId = null;
    const def = MONSTER_DEFS[monster.type];
    const generalXp = def.xp + monster.level * 5;
    const classXp = def.classXp + monster.level * 3;
    const gold = randomInt(def.gold[0], def.gold[1]);
    gainGeneralXp(generalXp); gainClassXp(classXp); game.state.player.gold += gold;
    toast(`+${generalXp} XP · +${classXp} classe · +${gold} or`, 'loot');
    rollLoot(monster);
    saveGame(); syncUi(true);
  }

  function respawnMonster(monster) {
    const def = MONSTER_DEFS[monster.type];
    monster.dead = false; monster.x = monster.spawnX; monster.y = monster.spawnY; monster.px = monster.x; monster.py = monster.y;
    monster.path = []; monster.to = null; monster.from = null; monster.state = 'idle'; monster.stateTime = 0; monster.aggro = false;
    monster.maxHp = def.hp + Math.max(0, monster.level - 1) * 9; monster.hp = monster.maxHp;
  }

  function gainGeneralXp(amount) {
    game.state.player.xp += amount;
    let needed = generalXpNeeded(game.state.player.level);
    while (game.state.player.xp >= needed) {
      game.state.player.xp -= needed;
      game.state.player.level += 1;
      game.state.player.baseMaxHp += 9;
      if (game.state.player.level % 3 === 0) game.state.player.baseMaxMp += 2;
      game.player.hp = maxHp(); game.player.mp = maxMp();
      toast(`Niveau ${game.state.player.level} ! Vitesse ${playerSpeed()}`, 'level');
      spawnEffect('level', game.player.px, game.player.py - .4, .9);
      needed = generalXpNeeded(game.state.player.level);
    }
  }

  function gainClassXp(amount) {
    game.state.player.classXp += amount;
    let needed = classXpNeeded(game.state.player.classLevel);
    while (game.state.player.classXp >= needed) {
      game.state.player.classXp -= needed;
      game.state.player.classLevel += 1;
      toast(`${game.state.player.className} rang ${game.state.player.classLevel}`, 'level');
      if (game.state.player.className === 'Aventurier' && game.state.player.classLevel === 20) {
        toast('Les mentors de Solenne vous attendent au cristal.', 'level');
      }
      needed = classXpNeeded(game.state.player.classLevel);
    }
  }

  function gainMastery(name, amount) {
    const mastery = game.state.masteries[name];
    mastery.xp += amount;
    let needed = masteryXpNeeded(mastery.level);
    while (mastery.xp >= needed) {
      mastery.xp -= needed; mastery.level += 1;
      const label = { melee: 'Corps à corps', ranged: 'Distance', magic: 'Magie', defense: 'Défense' }[name];
      toast(`${label} ${mastery.level}`, 'level');
      needed = masteryXpNeeded(mastery.level);
    }
    game.uiDirty = true;
  }

  function rollLoot(monster) {
    let itemId = null;
    const r = Math.random();
    if (r < .17) itemId = 'potion';
    else if (r < .31) itemId = monster.type === 'slime' || monster.type === 'wisp' ? 'slimeGel' : 'hide';
    else if (r < .355) itemId = ['wornBoots','oakRing','hunterBand','forestCharm'][randomInt(0,3)];
    if (!itemId) return;
    game.state.inventory[itemId] = (game.state.inventory[itemId] || 0) + 1;
    toast(`Butin : ${ITEMS[itemId].name}`, 'loot');
  }

  function usePotion() {
    const count = game.state.inventory.potion || 0;
    if (!count) { toast('Vous n’avez plus de potion.'); return; }
    if (game.player.hp >= maxHp()) { toast('Vos PV sont déjà au maximum.'); return; }
    game.state.inventory.potion -= 1;
    game.player.hp = Math.min(maxHp(), game.player.hp + 45);
    spawnEffect('heal', game.player.px, game.player.py - .2, .6);
    toast('+45 PV', 'level'); saveGame(); syncUi(true);
  }

  function equipItem(itemId) {
    const item = ITEMS[itemId];
    if (!item || item.type !== 'equipment' || !(game.state.inventory[itemId] > 0)) return;
    const previous = game.state.equipment[item.slot];
    if (previous === itemId) return;
    game.state.inventory[itemId] -= 1;
    if (game.state.inventory[itemId] <= 0) delete game.state.inventory[itemId];
    if (previous) game.state.inventory[previous] = (game.state.inventory[previous] || 0) + 1;
    game.state.equipment[item.slot] = itemId;
    game.player.hp = Math.min(game.player.hp, maxHp()); game.player.mp = Math.min(game.player.mp, maxMp());
    toast(`${item.name} équipé`, 'loot'); saveGame(); openInventory(); syncUi(true);
  }

  function rollClassChoice(className) {
    if (game.state.player.className !== 'Aventurier' || game.state.player.classLevel < 20 || game.state.classChoiceLocked) return;
    game.state.player.className = className; game.state.player.classLevel = 1; game.state.player.classXp = 0;
    game.state.classChoiceLocked = true;
    closeModal(ui.classModal);
    toast(`Vous êtes désormais ${className}. Le choix est permanent.`, 'level');
    saveGame(); syncUi(true);
  }

  function spawnEffect(type, x, y, duration) {
    if (!game.state.settings.effects) return;
    game.effects.push({ type, x, y, age: 0, duration });
  }

  function updateEffects(dt) {
    for (let i = game.effects.length - 1; i >= 0; i--) {
      game.effects[i].age += dt;
      if (game.effects[i].age >= game.effects[i].duration) game.effects.splice(i, 1);
    }
    for (let i = game.floaters.length - 1; i >= 0; i--) {
      const floater = game.floaters[i]; floater.age += dt; floater.y -= dt * .45;
      if (floater.age >= 1) game.floaters.splice(i, 1);
    }
  }

  function floatText(text, x, y, color) { game.floaters.push({ text, x, y, color, age: 0 }); }

  function updateCamera(dt) {
    const worldW = game.map.width * TILE, worldH = game.map.height * TILE;
    game.camera.targetX = clamp(game.player.px * TILE + TILE / 2 - game.viewport.w / 2, 0, Math.max(0, worldW - game.viewport.w));
    game.camera.targetY = clamp(game.player.py * TILE + TILE / 2 - game.viewport.h / 2, 0, Math.max(0, worldH - game.viewport.h));
    const ease = 1 - Math.pow(.0005, dt);
    game.camera.x = lerp(game.camera.x, game.camera.targetX, ease);
    game.camera.y = lerp(game.camera.y, game.camera.targetY, ease);
  }

  function update(dt) {
    updatePlayer(dt); updateMonsters(dt); updateProjectiles(dt); updateEffects(dt); updateCamera(dt);
    game.autosaveAt += dt;
    if (game.autosaveAt > 5) { game.autosaveAt = 0; saveGame(); }
    syncUi();
  }

  function getFrame(stateName, time, definitions) {
    const info = definitions[stateName] || definitions.idle;
    let index = Math.floor(time * info.fps);
    if (info.loop) index %= info.count;
    else index = Math.min(info.count - 1, index);
    return info.start + index;
  }

  function screenX(worldX) { return worldX * TILE + TILE / 2 - game.camera.x; }
  function screenY(worldY) { return worldY * TILE + TILE - game.camera.y; }

  function drawSprite(image, sx, sy, sw, sh, worldX, worldY, dw = sw, dh = sh) {
    const x = Math.round(screenX(worldX) - dw / 2);
    const y = Math.round(screenY(worldY) - dh);
    ctx.drawImage(image, sx, sy, sw, sh, x, y, dw, dh);
  }

  function drawWorld() {
    const { w, h } = game.viewport;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(game.assets.mapBase, game.camera.x, game.camera.y, w, h, 0, 0, w, h);

    if (game.state.settings.grid) {
      ctx.strokeStyle = 'rgba(18,55,28,.25)'; ctx.lineWidth = 1;
      const startX = -((game.camera.x % TILE) + TILE) % TILE;
      const startY = -((game.camera.y % TILE) + TILE) % TILE;
      for (let x = startX; x < w; x += TILE) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
      for (let y = startY; y < h; y += TILE) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    }

    const target = selectedMonster();
    if (target) drawTargetRing(target);
    if (game.player.path.length) drawDestinationRing(game.player.path.at(-1));

    const entities = [game.player, ...game.monsters.filter(m => !m.dead || now() < m.respawnAt - 8.2)];
    entities.sort((a, b) => a.py - b.py);
    for (const entity of entities) {
      if (entity === game.player) drawPlayer(); else drawMonster(entity);
    }
    drawProjectiles();
    drawEffects();
    ctx.drawImage(game.assets.mapOverlay, game.camera.x, game.camera.y, w, h, 0, 0, w, h);
    drawWorldLabels();
  }

  function drawTargetRing(monster) {
    const x = screenX(monster.px), y = screenY(monster.py) - 3;
    ctx.save(); ctx.strokeStyle = '#ffd56e'; ctx.lineWidth = 2; ctx.globalAlpha = .85;
    ctx.beginPath(); ctx.ellipse(x, y, 19, 7, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }

  function drawDestinationRing(tile) {
    const x = screenX(tile.x), y = screenY(tile.y) - 3;
    ctx.save(); ctx.strokeStyle = '#d5f4d0'; ctx.lineWidth = 2; ctx.globalAlpha = .55 + Math.sin(performance.now()/180)*.2;
    ctx.beginPath(); ctx.ellipse(x,y,12,5,0,0,Math.PI*2); ctx.stroke(); ctx.restore();
  }

  function drawPlayer() {
    const p = game.player;
    const frame = getFrame(p.state, p.stateTime, HERO_STATES);
    const dir = HERO_DIR[p.direction] ?? 3;
    drawSprite(game.assets.hero, frame * 32, dir * 48, 32, 48, p.px, p.py);
  }

  function drawMonster(monster) {
    const row = MONSTER_ROW[monster.type];
    const state = monster.dead ? 'death' : monster.state;
    const frame = getFrame(state, monster.stateTime, MONSTER_STATES);
    drawSprite(game.assets.monsters, frame * 48, row * 48, 48, 48, monster.px, monster.py, 48, 48);
    if (!monster.dead) {
      const x = screenX(monster.px), y = screenY(monster.py) - 51;
      ctx.font = '800 10px ui-rounded, system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(6,15,10,.82)'; ctx.fillRect(Math.round(x-42),Math.round(y-9),84,15);
      ctx.fillStyle = '#fff8e9'; ctx.fillText(`${MONSTER_DEFS[monster.type].name} · Niv. ${monster.level}`, x, y-1);
      if (monster.hp < monster.maxHp || game.selectedMonsterId === monster.id) {
        ctx.fillStyle = '#111c16'; ctx.fillRect(Math.round(x-28),Math.round(y+9),56,5);
        ctx.fillStyle = '#d85b63'; ctx.fillRect(Math.round(x-27),Math.round(y+10),54 * clamp(monster.hp/monster.maxHp,0,1),3);
      }
    }
  }

  function drawProjectiles() {
    for (const projectile of game.projectiles) {
      const [start, count] = EFFECT_FRAME[projectile.type];
      const frame = start + Math.floor(performance.now()/90) % count;
      drawSprite(game.assets.effects, frame*48,0,48,48,projectile.x,projectile.y,32,32);
    }
  }

  function drawEffects() {
    for (const effect of game.effects) {
      const [start, count] = EFFECT_FRAME[effect.type];
      const frame = start + Math.min(count-1, Math.floor(effect.age/effect.duration*count));
      drawSprite(game.assets.effects,frame*48,0,48,48,effect.x,effect.y,48,48);
    }
    ctx.save(); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font='900 15px ui-rounded, system-ui';
    for (const floater of game.floaters) {
      const alpha = 1 - floater.age; const x=screenX(floater.x), y=screenY(floater.y)-38;
      ctx.globalAlpha=alpha; ctx.lineWidth=3; ctx.strokeStyle='#1a130e'; ctx.strokeText(floater.text,x,y); ctx.fillStyle=floater.color; ctx.fillText(floater.text,x,y);
    }
    ctx.restore();
  }

  function drawWorldLabels() {
    const p = game.player;
    const x=screenX(p.px), y=screenY(p.py)-58;
    ctx.save(); ctx.font='900 11px ui-rounded,system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle';
    const label=`${game.state.player.name} · Niv. ${game.state.player.level}`;
    const width=ctx.measureText(label).width+18;
    ctx.fillStyle='rgba(7,18,12,.80)'; ctx.fillRect(Math.round(x-width/2),Math.round(y-8),Math.round(width),17);
    ctx.fillStyle='#f7f2e4'; ctx.fillText(label,x,y);
    ctx.restore();

    const mentor = game.map.mentor;
    const mx=screenX(mentor.x), my=screenY(mentor.y)-48;
    if (mx > -100 && mx < game.viewport.w+100 && my > -50 && my < game.viewport.h+50) {
      ctx.save(); ctx.font='900 10px ui-rounded,system-ui'; ctx.textAlign='center';
      ctx.fillStyle='rgba(6,25,21,.82)'; ctx.fillRect(mx-55,my-12,110,18);
      ctx.fillStyle=game.state.player.classLevel>=20 && game.state.player.className==='Aventurier'?'#ffe083':'#a9d9c6';
      ctx.fillText(game.state.player.classLevel>=20?'Cristal des mentors':'Mentors · Rang 20',mx,my+1); ctx.restore();
    }
  }

  function render() { drawWorld(); }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    game.viewport.w = Math.max(1, rect.width); game.viewport.h = Math.max(1, rect.height);
    game.viewport.dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(game.viewport.w * game.viewport.dpr);
    canvas.height = Math.round(game.viewport.h * game.viewport.dpr);
    ctx.setTransform(game.viewport.dpr,0,0,game.viewport.dpr,0,0);
    ctx.imageSmoothingEnabled = false;
  }

  function loop(timestamp) {
    const dt = Math.min(.05, Math.max(0, (timestamp - game.lastTime) / 1000));
    game.lastTime = timestamp;
    if (game.ready) { update(dt); render(); }
    requestAnimationFrame(loop);
  }

  function canvasToWorld(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) + game.camera.x, y: (event.clientY - rect.top) + game.camera.y };
  }

  function onWorldPointer(event) {
    if (!game.ready || game.player.dying || ui.drawer.classList.contains('open') || $$('.modal.open').length) return;
    event.preventDefault();
    const point = canvasToWorld(event);
    const tile = { x: Math.floor(point.x / TILE), y: Math.floor(point.y / TILE) };
    let chosen = null, best = Infinity;
    for (const monster of game.monsters) {
      if (monster.dead) continue;
      const d = Math.hypot(point.x - (monster.px*TILE+TILE/2), point.y - (monster.py*TILE+TILE-22));
      if (d < 30 && d < best) { chosen = monster; best = d; }
    }
    if (chosen) {
      const weapon = WEAPONS[game.state.player.weapon];
      game.selectedMonsterId = chosen.id;
      setPlayerPath(chosen, Math.max(1, Math.floor(weapon.range)), chosen.id);
      game.player.path = findPath(game.player, chosen, Math.max(1, Math.floor(weapon.range)), {ignoreMonsterId:chosen.id});
      ui.worldHint.textContent = `Cible : ${MONSTER_DEFS[chosen.type].name}`;
      syncUi(true);
      return;
    }
    if (Math.abs(tile.x-game.map.mentor.x)+Math.abs(tile.y-game.map.mentor.y)<=1) {
      if (game.state.player.className==='Aventurier' && game.state.player.classLevel>=20 && !game.state.classChoiceLocked) {
        game.player.interaction='mentor';
        setPlayerPath(game.map.mentor,1,null);
        ui.worldHint.textContent='En route vers les mentors';
      } else toast('Les mentors vous recevront au rang Aventurier 20.');
      return;
    }
    if (!isWalkable(tile.x,tile.y)) { toast('Cette case est bloquée.'); return; }
    setPlayerPath(tile,0,null);
    ui.worldHint.textContent='Destination sélectionnée';
  }

  function drawUiIcons() {
    $$('canvas[data-icon]').forEach(iconCanvas => {
      const name=iconCanvas.dataset.icon; const index=UI_ICON[name];
      const c=iconCanvas.getContext('2d'); c.imageSmoothingEnabled=false; c.clearRect(0,0,48,48);
      c.drawImage(game.assets.ui,index*48,0,48,48,0,0,48,48);
    });
  }

  function bindControls() {
    canvas.addEventListener('pointerdown', onWorldPointer, { passive: false });
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(resize, 150), { passive: true });
    window.addEventListener('pagehide', saveGame);
    document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); game.lastTime=performance.now(); });

    $$('.weapon-button').forEach(button => button.addEventListener('click', () => {
      game.state.player.weapon=button.dataset.weapon; game.player.pendingAttack=null; game.player.state='idle';
      const target=selectedMonster();
      if (target) game.player.path=findPath(game.player,target,Math.max(1,Math.floor(WEAPONS[button.dataset.weapon].range)),{ignoreMonsterId:target.id});
      saveGame(); syncUi(true);
    }));
    $('#inventory-button').addEventListener('click',openInventory);
    $('#stats-button').addEventListener('click',openStats);
    $('#potion-button').addEventListener('click',usePotion);
    $('#drawer-close').addEventListener('click',closeDrawer);
    ui.drawerBackdrop.addEventListener('click',closeDrawer);
    $('#settings-button').addEventListener('click',()=>openModal(ui.settingsModal));
    $('#settings-close').addEventListener('click',()=>closeModal(ui.settingsModal));
    $('#class-cancel').addEventListener('click',()=>closeModal(ui.classModal));
    $$('#class-modal [data-class]').forEach(button=>button.addEventListener('click',()=>rollClassChoice(button.dataset.class)));
    ui.effectsToggle.addEventListener('change',()=>{game.state.settings.effects=ui.effectsToggle.checked;saveGame();});
    ui.gridToggle.addEventListener('change',()=>{game.state.settings.grid=ui.gridToggle.checked;saveGame();});
    $('#reset-save').addEventListener('click',()=>{
      if (!confirm('Supprimer définitivement la progression locale ?')) return;
      localStorage.removeItem(SAVE_KEY); location.reload();
    });
    document.addEventListener('click', event => {
      const button=event.target.closest('[data-equip]'); if(button) equipItem(button.dataset.equip);
    });
  }

  function openDrawer() { ui.drawer.classList.add('open'); ui.drawerBackdrop.classList.add('open'); ui.drawer.setAttribute('aria-hidden','false'); }
  function closeDrawer() { ui.drawer.classList.remove('open'); ui.drawerBackdrop.classList.remove('open'); ui.drawer.setAttribute('aria-hidden','true'); }
  function openModal(modal) { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
  function closeModal(modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }

  function rarityLabel(rarity) { return { common:'Commun',uncommon:'Inhabituel',rare:'Rare' }[rarity] || rarity; }
  function iconCanvasHtml(icon, size=42) { return `<canvas width="48" height="48" data-dynamic-icon="${icon}" style="width:${size}px;height:${size}px;image-rendering:pixelated"></canvas>`; }
  function drawDynamicIcons(root=ui.drawerContent) {
    $$('canvas[data-dynamic-icon]',root).forEach(c=>{
      const index=UI_ICON[c.dataset.dynamicIcon]??UI_ICON.bag, g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(game.assets.ui,index*48,0,48,48,0,0,48,48);
    });
  }

  function openStats() {
    ui.drawerKicker.textContent='Progression du personnage'; ui.drawerTitle.textContent='Statistiques';
    const masteries=game.state.masteries;
    const labels={melee:'Corps à corps',ranged:'Distance',magic:'Magie',defense:'Défense'};
    const cards=Object.entries(masteries).map(([name,m])=>{
      const needed=masteryXpNeeded(m.level), bonus=equipmentStats()[name]||0;
      return `<article class="stat-card"><small>${labels[name]}</small><strong>${m.level}${bonus?` <em>+${bonus}</em>`:''}</strong><span>${m.xp}/${needed} XP</span><div class="mini-progress"><i style="width:${clamp(m.xp/needed*100,0,100)}%"></i></div></article>`;
    }).join('');
    ui.drawerContent.innerHTML=`<div class="stat-grid">${cards}<article class="stat-card"><small>Vitesse</small><strong>${playerSpeed()}</strong><span>+1 par niveau général</span></article><article class="stat-card"><small>Défense effective</small><strong>${defenseValue()}</strong><span>Maîtrise + équipement</span></article></div><h3 class="section-title">Progression</h3><div class="equipment-card"><span>Niveau général</span><b>${game.state.player.level}</b></div><div class="equipment-card"><span>${game.state.player.className}</span><b>Rang ${game.state.player.classLevel}</b></div><div class="equipment-card"><span>Prochaine évolution</span><b>${game.state.player.className==='Aventurier'?'Mentor au rang 20':'Voie avancée au rang 50'}</b></div>`;
    openDrawer();
  }

  function openInventory() {
    ui.drawerKicker.textContent='Sac et équipement'; ui.drawerTitle.textContent='Inventaire';
    const slots={head:'Tête',feet:'Pieds',charm:'Charme',ring:'Anneau'};
    const equipHtml=Object.entries(slots).map(([slot,label])=>{
      const itemId=game.state.equipment[slot]; return `<div class="equipment-card"><span>${label}</span><b>${itemId?ITEMS[itemId].name:'Vide'}</b></div>`;
    }).join('');
    const items=Object.entries(game.state.inventory).filter(([,count])=>count>0).map(([itemId,count])=>{
      const item=ITEMS[itemId]; if(!item)return'';
      const action=item.type==='equipment'?`<button data-equip="${itemId}">Équiper</button>`:`<span>x${count}</span>`;
      return `<article class="inventory-item rarity-${item.rarity}">${iconCanvasHtml(item.icon)}<div><b>${item.name} ×${count}</b><small>${rarityLabel(item.rarity)} · ${item.description}</small></div>${action}</article>`;
    }).join('')||'<p>Votre sac est vide.</p>';
    ui.drawerContent.innerHTML=`<h3 class="section-title">Équipement</h3>${equipHtml}<h3 class="section-title">Objets</h3>${items}`;
    drawDynamicIcons(); openDrawer();
  }

  function toast(message,type='') {
    const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=message;ui.toastStack.appendChild(el);setTimeout(()=>el.remove(),2900);
  }

  function syncUi(force=false) {
    if (!force && !game.uiDirty) return;
    game.uiDirty=false;
    const p=game.state.player, player=game.player;
    const hpMax=maxHp(), mpMax=maxMp(), xpNeed=generalXpNeeded(p.level), classNeed=classXpNeeded(p.classLevel);
    ui.zoneName.textContent=game.zoneName;ui.playerName.textContent=p.name;ui.className.textContent=p.className;
    ui.generalLevel.textContent=p.level;ui.classLevel.textContent=p.classLevel;
    ui.hpBar.style.width=`${clamp(player.hp/hpMax*100,0,100)}%`;ui.hpText.textContent=`${Math.ceil(player.hp)}/${hpMax}`;
    ui.mpBar.style.width=`${clamp(player.mp/mpMax*100,0,100)}%`;ui.mpText.textContent=`${Math.floor(player.mp)}/${mpMax}`;
    ui.xpBar.style.width=`${clamp(p.xp/xpNeed*100,0,100)}%`;ui.xpText.textContent=`${p.xp}/${xpNeed}`;
    ui.classXpBar.style.width=`${clamp(p.classXp/classNeed*100,0,100)}%`;ui.classXpText.textContent=`${p.classXp}/${classNeed}`;
    ui.gold.textContent=p.gold;ui.potionCount.textContent=game.state.inventory.potion||0;
    ui.inventoryCount.textContent=Object.values(game.state.inventory).reduce((sum,n)=>sum+n,0);
    $$('.weapon-button').forEach(button=>button.classList.toggle('selected',button.dataset.weapon===p.weapon));
    const target=selectedMonster();
    ui.targetCard.classList.toggle('visible',Boolean(target));
    if(target){ui.targetName.textContent=MONSTER_DEFS[target.type].name;ui.targetLevel.textContent=`Niv. ${target.level}`;ui.targetHp.style.width=`${clamp(target.hp/target.maxHp*100,0,100)}%`;}
    else {ui.targetName.textContent='Aucune cible';ui.targetLevel.textContent='';ui.targetHp.style.width='0%';}
    ui.effectsToggle.checked=game.state.settings.effects;ui.gridToggle.checked=game.state.settings.grid;
  }

  async function boot() {
    resize();
    await loadAssets();
    initWorld();
    requestAnimationFrame(loop);
    if (!EMBEDDED && 'serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(console.warn);
  }

  window.__SOLENNE__ = {
    build: BUILD,
    get state() { return game.state; },
    get player() { return game.player; },
    get monsters() { return game.monsters; },
    get camera() { return game.camera; },
    get viewport() { return game.viewport; },
    snapshot() {
      const player = deepClone(game.state.player);
      if (game.player) { player.x=game.player.x; player.y=game.player.y; player.hp=Math.ceil(game.player.hp); player.mp=Math.floor(game.player.mp); }
      return { build:BUILD,player,masteries:deepClone(game.state.masteries),inventory:deepClone(game.state.inventory),selected:game.selectedMonsterId,ready:game.ready };
    },
    test: {
      teleport(x,y){if(isWalkable(x,y)){Object.assign(game.player,makeMover(x,y));syncUi(true);}},
      setClassLevel(level){game.state.player.classLevel=level;game.state.player.classXp=0;syncUi(true);},
      damagePlayer(amount){damagePlayer(amount);},
      killSelected(){const m=selectedMonster();if(m)killMonster(m);},
      grantItem(id,count=1){game.state.inventory[id]=(game.state.inventory[id]||0)+count;syncUi(true);},
      clearSave(){localStorage.removeItem(SAVE_KEY);}
    }
  };

  boot().catch(fatal);
})();
