import { MONSTER_TYPES, TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from './data.js';

function seededNoise(x, y, salt = 0) { const value = Math.sin(x * 12.9898 + y * 78.233 + salt * 37.719) * 43758.5453; return value - Math.floor(value); }

function makeTiles() {
  const tiles = Array.from({ length: WORLD_HEIGHT }, (_, y) => Array.from({ length: WORLD_WIDTH }, (_, x) => ({ type: 'grass', variant: Math.floor(seededNoise(x, y) * 4) })));
  for (let x = 0; x < WORLD_WIDTH; x += 1) { const bend = x > 24 ? 1 : x > 12 ? 0 : -1; for (let dy = 0; dy < 2; dy += 1) { const y = 23 + bend + dy; if (tiles[y]?.[x]) tiles[y][x] = { type: 'path', variant: 0 }; } }
  for (let y = 18; y <= 27; y += 1) for (let x = 2; x <= 14; x += 1) if ((x >= 6 && x <= 10) || (y >= 21 && y <= 24)) tiles[y][x] = { type: 'stone', variant: 0 };
  for (let y = 14; y <= 23; y += 1) { tiles[y][9] = { type: 'path', variant: 0 }; tiles[y][10] = { type: 'path', variant: 0 }; }
  for (let y = 19; y <= 25; y += 1) for (let x = 16; x <= 22; x += 1) if (seededNoise(x, y, 4) > 0.12) tiles[y][x] = { type: 'dirt', variant: 0 };
  for (let y = 23; y <= 28; y += 1) for (let x = 31; x <= 39; x += 1) { const edge = x === 31 || x === 39 || y === 23 || y === 28; if (!edge || seededNoise(x, y, 8) > 0.45) tiles[y][x] = { type: 'water', variant: (x + y) % 2 }; }
  for (let y = 5; y <= 9; y += 1) for (let x = 30; x <= 35; x += 1) if ((x + y) % 3 !== 0) tiles[y][x] = { type: 'stone', variant: 0 };
  return tiles;
}

function object(type, x, y, options = {}) { return { id: options.id ?? `${type}-${x}-${y}`, type, x, y, blocking: options.blocking ?? [{ x: 0, y: 0 }], zOffset: options.zOffset ?? 0, interactable: options.interactable ?? null, label: options.label ?? null }; }
function borderTrees() { const result = []; for (let x = 0; x < WORLD_WIDTH; x += 2) { result.push(object(x % 4 === 0 ? 'tree_large' : 'tree_small', x, 1)); if (x < 29 || x > 40) result.push(object('tree_large', x, WORLD_HEIGHT - 1)); } for (let y = 3; y < WORLD_HEIGHT - 2; y += 3) { result.push(object(y % 2 ? 'tree_small' : 'tree_large', 0, y)); result.push(object(y % 2 ? 'tree_large' : 'tree_small', WORLD_WIDTH - 1, y)); } return result; }

function makeObjects() {
  const objects = borderTrees();
  objects.push(
    object('house', 4, 22, { id: 'house-inn', blocking: [{ x:-1,y:-1},{x:0,y:-1},{x:1,y:-1},{x:-1,y:0},{x:0,y:0},{x:1,y:0}], label: 'Auberge du Bourgeon' }),
    object('house', 12, 26, { id: 'house-store', blocking: [{ x:-1,y:-1},{x:0,y:-1},{x:1,y:-1},{x:-1,y:0},{x:0,y:0},{x:1,y:0}], label: 'Échoppe' }),
    object('well', 7, 21, { blocking: [{x:0,y:0}], interactable: 'bindRespawn', label: 'Puits de retour' }),
    object('lamp', 6, 25), object('lamp', 11, 20),
    object('sign', 15, 23, { interactable: 'sign', label: 'Vers les terres sauvages' }),
    object('mentor_crystal', 13, 18, { interactable: 'mentorHub', label: 'Cristal des voies' }),
  );
  for (const x of [2,3,4,5,11,12,13,14]) objects.push(object('fence_h', x, 18));
  for (const y of [19,20,25,26,27]) objects.push(object('fence_v', 2, y));
  const treeCells=[[4,5],[7,4],[10,6],[13,4],[16,6],[19,4],[3,9],[6,10],[12,9],[16,11],[20,9],[4,14],[7,15],[13,13],[18,15],[24,3],[27,5],[37,3],[39,7],[24,9],[27,12],[38,12],[40,16],[25,18],[28,20],[38,18],[40,21],[24,27],[27,25],[29,28]];
  treeCells.forEach(([x,y],i)=>objects.push(object(i%4===0?'tree_small':'tree_large',x,y)));
  [[2,12],[9,12],[15,8],[22,6],[22,16],[25,13],[29,16],[36,15],[39,19],[18,27]].forEach(([x,y],i)=>objects.push(object(i%3===0?'berry_bush':'bush',x,y)));
  [[5,7],[11,15],[17,4],[20,13],[23,20],[26,8],[29,5],[35,11],[37,17],[29,24]].forEach(([x,y],i)=>objects.push(object(i%3===0?'rock_large':'rock',x,y)));
  const kinds=['flowers_red','flowers_blue','flowers_yellow','flowers_white'];
  [[3,17],[5,19],[12,17],[15,20],[18,17],[21,22],[23,11],[28,14],[34,16],[39,10],[8,27],[17,10],[31,19]].forEach(([x,y],i)=>objects.push(object(kinds[i%kinds.length],x,y,{blocking:[]})));
  objects.push(object('tree_autumn',30,27),object('rock_large',39,27)); return objects;
}

function monster(id,type,x,y){const d=MONSTER_TYPES[type];return{id,type,x,y,spawnX:x,spawnY:y,renderX:x,renderY:y,direction:'down',frame:0,hp:d.maxHp,maxHp:d.maxHp,alive:true,respawnAt:0,lastAttackAt:0,lastDecisionAt:0,nextWanderAt:performance.now()+Math.random()*2600,path:[],move:null,aggro:false,hitFlashUntil:0};}
function makeMonsters(){return [monster('slime-1','slime',17,22),monster('slime-2','slime',19,20),monster('slime-3','slime',21,24),monster('slime-4','slime',23,18),monster('rat-1','rat',16,14),monster('rat-2','rat',20,16),monster('rat-3','rat',24,14),monster('rat-4','rat',26,17),monster('wolf-1','wolf',6,7),monster('wolf-2','wolf',10,11),monster('wolf-3','wolf',14,7),monster('boar-1','boar',29,18),monster('boar-2','boar',34,20),monster('boar-3','boar',37,15),monster('goblin-1','goblin',30,7),monster('goblin-2','goblin',34,6),monster('goblin-3','goblin',37,10)];}
function makeMentors(){return [{id:'mentor-sword',name:'Maître Kael',className:'Épéiste',sprite:'mentor_sword',x:11,y:18,description:'Choisir la voie de l’Épéiste.'},{id:'mentor-archer',name:'Maîtresse Lyra',className:'Archer',sprite:'mentor_archer',x:13,y:17,description:'Choisir la voie de l’Archer.'},{id:'mentor-mage',name:'Maître Orin',className:'Mage',sprite:'mentor_mage',x:15,y:18,description:'Choisir la voie du Mage.'}];}
function makeTravelers(){return [{id:'traveler-1',name:'Aube 214',sprite:0,x:8,y:24,renderX:8,renderY:24,direction:'right',frame:0,path:[],move:null,nextWanderAt:performance.now()+900,bubble:null},{id:'traveler-2',name:'Milo 637',sprite:1,x:18,y:21,renderX:18,renderY:21,direction:'left',frame:0,path:[],move:null,nextWanderAt:performance.now()+1700,bubble:null},{id:'traveler-3',name:'Nox 092',sprite:2,x:9,y:15,renderX:9,renderY:15,direction:'down',frame:0,path:[],move:null,nextWanderAt:performance.now()+2400,bubble:null}];}

export function createWorld(){const tiles=makeTiles(),objects=makeObjects(),blocked=new Set();for(const item of objects)for(const cell of item.blocking)blocked.add(`${item.x+cell.x},${item.y+cell.y}`);for(let y=0;y<WORLD_HEIGHT;y++)for(let x=0;x<WORLD_WIDTH;x++)if(tiles[y][x].type==='water')blocked.add(`${x},${y}`);return{tiles,objects,blocked,monsters:makeMonsters(),mentors:makeMentors(),travelers:makeTravelers(),spawn:{x:8,y:23}};}
export function getLocationName(x,y){if(x<=15&&y>=17)return'Village de Solenne';if(x>=28&&y<=13)return'Ruines des Brumes';if(x>=28&&y>=21)return'Étang d’Ambre';if(x<=20&&y<=15)return'Bois Murmurant';if(x>=16&&y>=17&&x<=24)return'Terrain des Novices';return'Clairière de Solenne';}
export function getObjectImagePath(type){return`./public/assets/objects/${type}.png`;}
export function getCharacterImagePath(name){return`./public/assets/characters/${name}.png`;}
export function getMonsterImagePath(type,frame){return`./public/assets/monsters/${type}_${frame}.png`;}
export function tileImagePath(tile,waterFrame=0){if(tile.type==='grass')return`./public/assets/tiles/grass_${tile.variant}.png`;if(tile.type==='water')return`./public/assets/tiles/water_${waterFrame}.png`;return`./public/assets/tiles/${tile.type}.png`;}
export function worldToPixel(x,y){return{x:x*TILE_SIZE+TILE_SIZE/2,y:(y+1)*TILE_SIZE};}
