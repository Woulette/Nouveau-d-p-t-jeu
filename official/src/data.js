export const TILE_SIZE = 48;
export const WORLD_WIDTH = 42;
export const WORLD_HEIGHT = 30;
export const SAVE_KEY = 'chroniques-de-solenne-save-v1';

export const WEAPONS = {
  staff: {
    id: 'staff',
    label: 'Bâton',
    shortLabel: 'CORPS',
    mastery: 'melee',
    range: 1,
    cooldown: 760,
    baseDamage: 4.2,
    levelScale: 0.82,
    masteryXp: 5,
    manaCost: 0,
    projectile: null,
    icon: './public/assets/ui/staff.png',
  },
  sling: {
    id: 'sling',
    label: 'Lance-pierre',
    shortLabel: 'DIST.',
    mastery: 'ranged',
    range: 5,
    cooldown: 920,
    baseDamage: 3.5,
    levelScale: 0.72,
    masteryXp: 5,
    manaCost: 0,
    projectile: 'stone',
    icon: './public/assets/ui/sling.png',
  },
  orb: {
    id: 'orb',
    label: 'Orbe magique',
    shortLabel: 'MAGIE',
    mastery: 'magic',
    range: 5,
    cooldown: 1080,
    baseDamage: 5.6,
    levelScale: 0.9,
    masteryXp: 6,
    manaCost: 4,
    projectile: 'magic',
    icon: './public/assets/ui/orb.png',
  },
};

export const ITEMS = {
  weak_potion: { id: 'weak_potion', name: 'Petite potion', type: 'consumable', description: 'Rend 30 PV.', value: 8 },
  mana_potion: { id: 'mana_potion', name: 'Potion de mana', type: 'consumable', description: 'Rend 22 PM.', value: 10 },
  knotted_staff: { id: 'knotted_staff', name: 'Bâton noueux', type: 'equipment', slot: 'weaponMelee', description: '+2 puissance corps à corps', bonuses: { meleePower: 2 }, rarity: 'uncommon' },
  reinforced_sling: { id: 'reinforced_sling', name: 'Fronde renforcée', type: 'equipment', slot: 'weaponRanged', description: '+2 puissance à distance', bonuses: { rangedPower: 2 }, rarity: 'uncommon' },
  dew_orb: { id: 'dew_orb', name: 'Orbe de rosée', type: 'equipment', slot: 'weaponMagic', description: '+2 puissance magique', bonuses: { magicPower: 2 }, rarity: 'rare' },
  leather_vest: { id: 'leather_vest', name: 'Gilet de cuir', type: 'equipment', slot: 'armor', description: '+2 défense', bonuses: { defensePower: 2 }, rarity: 'uncommon' },
  trail_boots: { id: 'trail_boots', name: 'Bottes du sentier', type: 'equipment', slot: 'boots', description: '+2 vitesse', bonuses: { speed: 2 }, rarity: 'rare' },
  green_gel: { id: 'green_gel', name: 'Gelée verdoyante', type: 'material', description: 'Un ingrédient gluant.', value: 2 },
  rat_tail: { id: 'rat_tail', name: 'Queue de rat', type: 'material', description: 'Utilisée par certains artisans.', value: 3 },
  wolf_pelt: { id: 'wolf_pelt', name: 'Fourrure de loup', type: 'material', description: 'Une peau résistante.', value: 7 },
  goblin_token: { id: 'goblin_token', name: 'Jeton gobelin', type: 'material', description: 'Preuve d’une victoire.', value: 9 },
  boar_tusk: { id: 'boar_tusk', name: 'Défense de sanglier', type: 'material', description: 'Solide et recherchée.', value: 8 },
};

export const MONSTER_TYPES = {
  slime: { id: 'slime', name: 'Gelée des prés', level: 1, maxHp: 28, damage: 4, defense: 0, attackCooldown: 1350, aggroRange: 3, moveDelay: 650, xp: 22, jobXp: 16, gold: [1, 5], respawnMs: 7000, sprite: 'slime', drops: [{ item: 'green_gel', chance: 0.42, min: 1, max: 2 }, { item: 'weak_potion', chance: 0.08, min: 1, max: 1 }, { item: 'knotted_staff', chance: 0.018, min: 1, max: 1 }] },
  rat: { id: 'rat', name: 'Rat des champs', level: 2, maxHp: 39, damage: 5, defense: 1, attackCooldown: 1200, aggroRange: 4, moveDelay: 530, xp: 30, jobXp: 22, gold: [2, 7], respawnMs: 8500, sprite: 'rat', drops: [{ item: 'rat_tail', chance: 0.38, min: 1, max: 1 }, { item: 'weak_potion', chance: 0.09, min: 1, max: 1 }, { item: 'reinforced_sling', chance: 0.018, min: 1, max: 1 }] },
  wolf: { id: 'wolf', name: 'Loup des lisières', level: 4, maxHp: 66, damage: 8, defense: 2, attackCooldown: 1050, aggroRange: 5, moveDelay: 470, xp: 52, jobXp: 36, gold: [4, 11], respawnMs: 11000, sprite: 'wolf', drops: [{ item: 'wolf_pelt', chance: 0.44, min: 1, max: 2 }, { item: 'leather_vest', chance: 0.025, min: 1, max: 1 }, { item: 'trail_boots', chance: 0.012, min: 1, max: 1 }] },
  boar: { id: 'boar', name: 'Sanglier hargneux', level: 5, maxHp: 84, damage: 10, defense: 3, attackCooldown: 1300, aggroRange: 4, moveDelay: 540, xp: 68, jobXp: 44, gold: [5, 14], respawnMs: 13000, sprite: 'boar', drops: [{ item: 'boar_tusk', chance: 0.48, min: 1, max: 2 }, { item: 'weak_potion', chance: 0.12, min: 1, max: 2 }, { item: 'dew_orb', chance: 0.01, min: 1, max: 1 }] },
  goblin: { id: 'goblin', name: 'Éclaireur gobelin', level: 7, maxHp: 118, damage: 13, defense: 4, attackCooldown: 1120, aggroRange: 6, moveDelay: 510, xp: 96, jobXp: 62, gold: [9, 22], respawnMs: 16000, sprite: 'goblin', drops: [{ item: 'goblin_token', chance: 0.62, min: 1, max: 2 }, { item: 'mana_potion', chance: 0.16, min: 1, max: 1 }, { item: 'dew_orb', chance: 0.018, min: 1, max: 1 }, { item: 'trail_boots', chance: 0.012, min: 1, max: 1 }] },
};

export const CLASS_DEFINITIONS = {
  Aventurier: { label: 'Aventurier', style: null, bonus: 0, description: 'Apprend les trois styles de base.' },
  Épéiste: { label: 'Épéiste', style: 'melee', bonus: 0.12, description: 'Spécialiste du combat rapproché.' },
  Archer: { label: 'Archer', style: 'ranged', bonus: 0.12, description: 'Maître des attaques à distance.' },
  Mage: { label: 'Mage', style: 'magic', bonus: 0.12, description: 'Canalise la magie et prépare ses futures évolutions.' },
};

export function characterXpRequired(level) { return Math.floor(64 * Math.pow(level, 1.34)); }
export function jobXpRequired(level) { return Math.floor(30 + level * 14 + Math.pow(level, 1.45) * 3.2); }
export function masteryXpRequired(level) { return Math.floor(22 + level * 14 + level * level * 0.65); }
export function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
export function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
