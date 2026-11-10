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
