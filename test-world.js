/* Generation smoke tests.  Run: node test-world.js */
'use strict';

const C = require('./world.js');

let failures = 0;
let floors = 0;
let rooms = 0;
let items = 0;
let enemies = 0;

function fail(msg) {
  failures++;
  console.error('FAIL  ' + msg);
}

for (let seed = 1; seed <= 200; seed++) {
  for (let floor = 1; floor <= 6; floor++) {
    const w = C.generate(seed, floor);
    const where = 'seed=' + seed + ' floor=' + floor;
    floors++;
    rooms += w.rooms.length;
    items += w.items.length;
    enemies += w.enemies.length;

    if (w.rooms.length < 5) fail(where + ': too few rooms');
    if (w.tiles[w.start.y * C.W + w.start.x] !== C.FLOOR) fail(where + ': start is not floor');
    if (w.tiles[w.fire.y * C.W + w.fire.x] !== C.FLOOR) fail(where + ': fire is not floor');

    const { dist } = C.bfs(w.tiles, w.start.x, w.start.y);
    const reachable = (p) => dist[p.y * C.W + p.x] >= 0;

    if (w.stairs && !reachable(w.stairs)) fail(where + ': stairs unreachable');
    if (w.sun && !reachable(w.sun)) fail(where + ': sunroom unreachable');
    if (!w.stairs && !w.sun) fail(where + ': no goal');
    if (floor === 5 && (w.stairs || !w.sun)) fail(where + ': floor 5 goal is wrong');
    if (floor !== 5 && (w.sun || !w.stairs)) fail(where + ': non-final goal is wrong');

    for (const it of w.items) if (!reachable(it)) fail(where + ': unreachable ' + it.type);
    for (const e of w.enemies) if (!reachable(e)) fail(where + ': unreachable grumble');

    const spots = new Set();
    for (const it of w.items) {
      const key = it.x + ',' + it.y;
      if (spots.has(key)) fail(where + ': two items on one tile');
      spots.add(key);
    }
    if (!w.items.some((it) => it.type === 'oil')) fail(where + ': no lantern oil');
    if (!w.items.some((it) => it.type === 'potion')) fail(where + ': no red potion');
    if (!w.pet) fail(where + ': no floor pet');
    else if (!reachable(w.pet)) fail(where + ': pet unreachable');
    if (!w.chest) fail(where + ': no chest');
    else if (!reachable(w.chest)) fail(where + ': chest unreachable');

    if (!w.setPiece) fail(where + ': no set piece');
    else {
      const sp = w.setPiece;
      const pointReachable = (tx, ty) => tx >= 0 && ty >= 0 && tx < C.W && ty < C.H && dist[ty * C.W + tx] >= 0;
      const neighbourReachable = (p) =>
        [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => pointReachable(p.x + dx, p.y + dy));
      if (sp.focus && !neighbourReachable(sp.focus)) fail(where + ': focus unreachable');
      if (sp.boss && !neighbourReachable(sp.boss)) fail(where + ': boss unreachable');
      for (const wt of sp.water) {
        if (!pointReachable(wt.x, wt.y)) fail(where + ': bath water unreachable');
      }
    }
    if (!w.items.some((it) => it.type === 'herb')) fail(where + ': no herb');

    const pointReachable = (tx, ty) => tx >= 0 && ty >= 0 && tx < C.W && ty < C.H && dist[ty * C.W + tx] >= 0;
    const neighbourReachable = (p) =>
      [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => pointReachable(p.x + dx, p.y + dy));

    if (!w.secret) fail(where + ': no secret alcove');
    else {
      const sec = w.secret;
      if (w.tiles[sec.wall.y * C.W + sec.wall.x] !== C.WALL) fail(where + ': secret wall is not wall');
      if (!pointReachable(sec.approach.x, sec.approach.y)) fail(where + ': secret approach unreachable');
      if (w.tiles[sec.chest.y * C.W + sec.chest.x] !== C.FLOOR) fail(where + ': secret chest not on floor');
      for (let y = sec.room.y; y < sec.room.y + sec.room.h; y++) {
        for (let x = sec.room.x; x < sec.room.x + sec.room.w; x++) {
          if (w.tiles[y * C.W + x] !== C.FLOOR) fail(where + ': secret pocket not carved');
        }
      }
    }

    if (!w.portal) fail(where + ': no portal doorway');
    else {
      const portal = w.portal;
      if (!pointReachable(portal.x, portal.y)) fail(where + ': portal unreachable');
      if (portal.x === w.start.x && portal.y === w.start.y) fail(where + ': portal on start');
    }

    if (!w.favorBoard) fail(where + ': no favor board');
    else if (!neighbourReachable(w.favorBoard)) fail(where + ': favor board unreachable');
    if (floor % 2 === 0) {
      if (!w.merchant) fail(where + ': no merchant');
      else if (!neighbourReachable(w.merchant)) fail(where + ': merchant unreachable');
    } else if (w.merchant) {
      fail(where + ': merchant on odd floor');
    }

    for (let x = 0; x < C.W; x++) {
      if (w.tiles[x] !== C.WALL || w.tiles[(C.H - 1) * C.W + x] !== C.WALL) fail(where + ': border leak');
    }
    for (let y = 0; y < C.H; y++) {
      if (w.tiles[y * C.W] !== C.WALL || w.tiles[y * C.W + C.W - 1] !== C.WALL) fail(where + ': border leak');
    }
  }
}

const avg = (n) => (n / floors).toFixed(1);
console.log(
  floors + ' floors checked · avg ' + avg(rooms) + ' rooms, ' +
  avg(items) + ' items, ' + avg(enemies) + ' grumbles'
);

if (failures) {
  console.error('\n' + failures + ' failure(s)');
  process.exit(1);
}
console.log('All generation tests passed.');
