import {
  CLASS_DEFINITIONS,
  ITEMS,
  SAVE_KEY,
  characterXpRequired,
  clamp,
  jobXpRequired,
  masteryXpRequired,
} from './data.js';

function defaultMastery() { return { level: 1, xp: 0 }; }

export function createDefaultPlayer(spawn) {
  return {
    name: 'Voyageur 801', x: spawn.x, y: spawn.y, renderX: spawn.x, renderY: spawn.y,
    direction: 'down', frame: 0, path: [], move: null, pendingInteraction: null, targetId: null,
    selectedWeapon: 'staff', level: 1, xp: 0, maxHp: 100, hp: 100, maxMp: 40, mp: 40,
    className: 'Aventurier', jobLevel: 1, jobXp: 0,
    masteries: { melee: defaultMastery(), ranged: defaultMastery(), magic: defaultMastery(), defense: defaultMastery() },
    gold: 0, inventory: { weak_potion: 2, mana_potion: 1 },
    equipment: { weaponMelee: null, weaponRanged: null, weaponMagic: null, armor: null, boots: null },
    respawn: { x: spawn.x, y: spawn.y, label: 'Village de Solenne' },
    lastAttackAt: 0, lastHitAt: 0, nextRegenAt: 0, attackFlashUntil: 0,
    dead: false, respawnAt: 0, playtimeMs: 0, createdAt: Date.now(), version: 1,
  };
}

function sanitizeMastery(input) {
  return { level: clamp(Number(input?.level) || 1, 1, 999), xp: Math.max(0, Number(input?.xp) || 0) };
}

export function loadPlayer(spawn) {
  const fresh = createDefaultPlayer(spawn);
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw);
    const merged = {
      ...fresh, ...parsed,
      x: Number.isFinite(parsed.x) ? parsed.x : spawn.x,
      y: Number.isFinite(parsed.y) ? parsed.y : spawn.y,
      renderX: Number.isFinite(parsed.x) ? parsed.x : spawn.x,
      renderY: Number.isFinite(parsed.y) ? parsed.y : spawn.y,
      path: [], move: null, targetId: null, pendingInteraction: null, dead: false, respawnAt: 0,
      inventory: { ...fresh.inventory, ...(parsed.inventory ?? {}) },
      equipment: { ...fresh.equipment, ...(parsed.equipment ?? {}) },
      respawn: { ...fresh.respawn, ...(parsed.respawn ?? {}) },
      masteries: {
        melee: sanitizeMastery(parsed.masteries?.melee), ranged: sanitizeMastery(parsed.masteries?.ranged),
        magic: sanitizeMastery(parsed.masteries?.magic), defense: sanitizeMastery(parsed.masteries?.defense),
      },
    };
    merged.hp = clamp(merged.hp, 1, merged.maxHp);
    merged.mp = clamp(merged.mp, 0, merged.maxMp);
    if (!CLASS_DEFINITIONS[merged.className]) merged.className = 'Aventurier';
    return merged;
  } catch (error) {
    console.warn('Sauvegarde invalide, nouvelle partie créée.', error);
    return fresh;
  }
}

export function savePlayer(player) {
  const serializable = {
    name: player.name, x: player.x, y: player.y, level: player.level, xp: player.xp,
    maxHp: player.maxHp, hp: player.hp, maxMp: player.maxMp, mp: player.mp,
    className: player.className, jobLevel: player.jobLevel, jobXp: player.jobXp,
    masteries: player.masteries, gold: player.gold, inventory: player.inventory,
    equipment: player.equipment, respawn: player.respawn, selectedWeapon: player.selectedWeapon,
    playtimeMs: player.playtimeMs, createdAt: player.createdAt, version: 1,
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(serializable)); }
  catch (error) { console.warn('Sauvegarde locale indisponible.', error); }
}

export function getEquipmentBonuses(player) {
  const bonuses = { meleePower: 0, rangedPower: 0, magicPower: 0, defensePower: 0, speed: 0 };
  for (const itemId of Object.values(player.equipment)) {
    const item = ITEMS[itemId];
    if (!item?.bonuses) continue;
    for (const [key, value] of Object.entries(item.bonuses)) bonuses[key] = (bonuses[key] ?? 0) + value;
  }
  return bonuses;
}

export function getPlayerSpeed(player) { return 100 + Math.max(0, player.level - 1) + getEquipmentBonuses(player).speed; }
export function addItem(player, itemId, quantity = 1) { if (ITEMS[itemId] && quantity > 0) player.inventory[itemId] = (player.inventory[itemId] ?? 0) + quantity; }
export function removeItem(player, itemId, quantity = 1) { const current = player.inventory[itemId] ?? 0; if (current < quantity || quantity <= 0) return false; const next = current - quantity; if (next <= 0) delete player.inventory[itemId]; else player.inventory[itemId] = next; return true; }

export function useItem(player, itemId) {
  const item = ITEMS[itemId];
  if (!item || item.type !== 'consumable' || !removeItem(player, itemId, 1)) return null;
  if (itemId === 'weak_potion') { const before = player.hp; player.hp = clamp(player.hp + 30, 0, player.maxHp); return { label: `+${player.hp - before} PV`, kind: 'heal' }; }
  if (itemId === 'mana_potion') { const before = player.mp; player.mp = clamp(player.mp + 22, 0, player.maxMp); return { label: `+${player.mp - before} PM`, kind: 'mana' }; }
  return null;
}

export function equipItem(player, itemId) { const item = ITEMS[itemId]; if (!item || item.type !== 'equipment' || !item.slot || (player.inventory[itemId] ?? 0) <= 0) return false; player.equipment[item.slot] = itemId; return true; }

export function gainCharacterXp(player, amount, onEvent) {
  player.xp += Math.max(0, amount); let levels = 0;
  while (player.xp >= characterXpRequired(player.level)) {
    player.xp -= characterXpRequired(player.level); player.level += 1; player.maxHp += 8; player.maxMp += 4;
    player.hp = player.maxHp; player.mp = player.maxMp; levels += 1; onEvent?.({ type: 'character-level', level: player.level });
  }
  return levels;
}

export function gainJobXp(player, amount, onEvent) {
  player.jobXp += Math.max(0, amount); let levels = 0;
  while (player.jobXp >= jobXpRequired(player.jobLevel)) {
    player.jobXp -= jobXpRequired(player.jobLevel); player.jobLevel += 1; levels += 1;
    onEvent?.({ type: 'job-level', level: player.jobLevel, className: player.className });
    if (player.className === 'Aventurier' && player.jobLevel >= 20) {
      player.jobLevel = 20; player.jobXp = Math.min(player.jobXp, jobXpRequired(20) - 1); onEvent?.({ type: 'mentor-ready' }); break;
    }
  }
  return levels;
}

export function gainMasteryXp(player, masteryName, amount, onEvent) {
  const mastery = player.masteries[masteryName]; if (!mastery) return 0;
  mastery.xp += Math.max(0, amount); let levels = 0;
  while (mastery.xp >= masteryXpRequired(mastery.level)) {
    mastery.xp -= masteryXpRequired(mastery.level); mastery.level += 1; levels += 1;
    onEvent?.({ type: 'mastery-level', mastery: masteryName, level: mastery.level });
  }
  return levels;
}

export function chooseClass(player, className) {
  if (player.className !== 'Aventurier' || player.jobLevel < 20 || !['Épéiste', 'Archer', 'Mage'].includes(className)) return false;
  player.className = className; player.jobLevel = 1; player.jobXp = 0; return true;
}

export function resetSave() { try { localStorage.removeItem(SAVE_KEY); } catch (error) { console.warn('Impossible de réinitialiser la sauvegarde locale.', error); } }
