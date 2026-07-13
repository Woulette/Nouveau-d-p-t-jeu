const CARDINAL_DIRS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

function key(x, y) {
  return `${x},${y}`;
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function findPath(start, goal, isWalkable, maxVisited = 2200) {
  if (start.x === goal.x && start.y === goal.y) return [];
  if (!isWalkable(goal.x, goal.y)) return [];

  const open = [{ x: start.x, y: start.y, g: 0, f: heuristic(start, goal) }];
  const cameFrom = new Map();
  const gScore = new Map([[key(start.x, start.y), 0]]);
  const closed = new Set();
  let visited = 0;

  while (open.length > 0 && visited < maxVisited) {
    visited += 1;
    open.sort((a, b) => a.f - b.f || a.g - b.g);
    const current = open.shift();
    const currentKey = key(current.x, current.y);
    if (closed.has(currentKey)) continue;
    closed.add(currentKey);

    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let cursor = currentKey;
      while (cameFrom.has(cursor)) {
        const [cx, cy] = cursor.split(',').map(Number);
        path.push({ x: cx, y: cy });
        cursor = cameFrom.get(cursor);
      }
      path.reverse();
      return path;
    }

    for (const dir of CARDINAL_DIRS) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      const neighborKey = key(nx, ny);
      if (closed.has(neighborKey) || !isWalkable(nx, ny)) continue;
      const tentative = current.g + 1;
      if (tentative < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, currentKey);
        gScore.set(neighborKey, tentative);
        open.push({ x: nx, y: ny, g: tentative, f: tentative + heuristic({ x: nx, y: ny }, goal) });
      }
    }
  }

  return [];
}

export function findPathToRange(start, target, range, isWalkable, hasLineOfSight) {
  const candidates = [];
  for (let y = target.y - range; y <= target.y + range; y += 1) {
    for (let x = target.x - range; x <= target.x + range; x += 1) {
      const distance = Math.abs(x - target.x) + Math.abs(y - target.y);
      if (distance === 0 || distance > range || !isWalkable(x, y)) continue;
      if (range > 1 && !hasLineOfSight({ x, y }, target)) continue;
      candidates.push({ x, y, score: Math.abs(x - start.x) + Math.abs(y - start.y) });
    }
  }
  candidates.sort((a, b) => a.score - b.score);

  for (const candidate of candidates) {
    const path = findPath(start, candidate, isWalkable);
    if (path.length > 0 || (start.x === candidate.x && start.y === candidate.y)) return path;
  }
  return [];
}

export function lineOfSight(start, end, isBlocked) {
  let x0 = start.x;
  let y0 = start.y;
  const x1 = end.x;
  const y1 = end.y;
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let first = true;

  while (true) {
    if (!first && !(x0 === x1 && y0 === y1) && isBlocked(x0, y0)) return false;
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
    first = false;
  }
  return true;
}
