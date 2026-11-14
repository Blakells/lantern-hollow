/* Lantern Hollow — dungeon generation.
   Pure and Node-testable: no DOM, no audio, no render state. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CozyWorld = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const W = 41;
  const H = 31;
  const WALL = 0;
  const FLOOR = 1;

  const SET_PIECE_INFO = {
    library: { name: 'The Tea Library', focus: 'desk' },
    grove: { name: 'The Mushroom Grove', focus: null },
    greenhouse: { name: "The Gardener's Greenhouse", focus: 'planter' },
    garden: { name: 'The Tea Garden', focus: 'gardenBed' },
    pond: { name: 'The Quiet Pond', focus: 'pond' },
    bath: { name: 'The Moonlit Bath', focus: null },
    teaParty: { name: 'The Tea Party', focus: 'teapot' }
  };

  const SET_PIECE_ORDER = ['library', 'grove', 'greenhouse', 'garden', 'pond', 'bath', 'teaParty'];

  const PET_KINDS = ['fox', 'squirrel', 'cat', 'dog', 'bear'];
  const PET_NAMES = {
    fox: ['Rusty', 'Juniper', 'Pip', 'Sorrel', 'Maple'],
    squirrel: ['Acorn', 'Hazel', 'Nutmeg', 'Bramble', 'Chestnut'],
    cat: ['Mochi', 'Clover', 'Miso', 'Willow', 'Sable'],
    dog: ['Biscuit', 'Waffle', 'Pepper', 'Barley', 'Poppy'],
    bear: ['Bumble', 'Honey', 'Cocoa', 'Cedar', 'Moss']
  };

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seedFor(seed, floor) {
    let h = Math.imul((seed ^ 0x9e3779b9) >>> 0, 0x85ebca6b) ^ Math.imul(floor, 0xc2b2ae35);
    h ^= h >>> 13;
    h = Math.imul(h, 0x27d4eb2d);
    h ^= h >>> 15;
    return h >>> 0;
  }

  const ri = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
  const idx = (x, y) => y * W + x;
  const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;

  function carveRect(tiles, r) {
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) tiles[idx(x, y)] = FLOOR;
    }
  }

  function generate(rawSeed, floor) {
    floor = Math.max(1, floor | 0);
    const seed = (rawSeed | 0) >>> 0;
    const rng = mulberry32(seedFor(seed, floor));
    const tiles = new Uint8Array(W * H);

    // --- rooms -------------------------------------------------------------
    const rooms = [];
    const wanted = ri(rng, 9, 12);
    for (let tries = 0; tries < 260 && rooms.length < wanted; tries++) {
      const rw = ri(rng, 5, 9);
      const rh = ri(rng, 4, 7);
      const x = ri(rng, 1, W - rw - 2);
      const y = ri(rng, 1, H - rh - 2);
      let clash = false;
      for (const o of rooms) {
        if (x < o.x + o.w + 1 && x + rw + 1 > o.x &&
            y < o.y + o.h + 1 && y + rh + 1 > o.y) {
          clash = true;
          break;
        }
      }
      if (clash) continue;
      rooms.push({ x, y, w: rw, h: rh, cx: x + (rw >> 1), cy: y + (rh >> 1) });
    }

    for (const r of rooms) carveRect(tiles, r);

    // --- corridors ---------------------------------------------------------
    function connect(a, b) {
      const x1 = a.cx, y1 = a.cy, x2 = b.cx, y2 = b.cy;
      if (rng() < 0.5) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) tiles[idx(x, y1)] = FLOOR;
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) tiles[idx(x2, y)] = FLOOR;
      } else {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) tiles[idx(x1, y)] = FLOOR;
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) tiles[idx(x, y2)] = FLOOR;
      }
    }

    for (let i = 1; i < rooms.length; i++) connect(rooms[i - 1], rooms[i]);
    const extra = Math.min(3, rooms.length - 2);
    for (let i = 0; i < extra; i++) {
      const a = rooms[ri(rng, 0, rooms.length - 1)];
      const b = rooms[ri(rng, 0, rooms.length - 1)];
      if (a !== b) connect(a, b);
    }

    // --- start + fire ------------------------------------------------------
    const first = rooms[0];
    const fire = { x: first.cx, y: first.cy };
    tiles[idx(fire.x, fire.y)] = FLOOR;

    let start = { x: fire.x, y: fire.y };
    for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const nx = fire.x + dx, ny = fire.y + dy;
      if (inside(nx, ny) && tiles[idx(nx, ny)] === FLOOR) {
        start = { x: nx, y: ny };
        break;
      }
    }

    const { dist } = bfs(tiles, start.x, start.y);

    // --- goal --------------------------------------------------------------
    let goalRoom = rooms[Math.min(1, rooms.length - 1)];
    let best = -1;
    for (let i = 1; i < rooms.length; i++) {
      const d = dist[idx(rooms[i].cx, rooms[i].cy)];
      if (d > best) {
        best = d;
        goalRoom = rooms[i];
      }
    }
    const goal = { x: goalRoom.cx, y: goalRoom.cy };
    const isFinal = floor === 5;
    const stairs = isFinal ? null : { x: goal.x, y: goal.y };
    const sun = isFinal ? { x: goal.x, y: goal.y } : null;

    // --- items -------------------------------------------------------------
    const occupied = new Set();
    const mark = (x, y) => occupied.add(x + ',' + y);
    mark(fire.x, fire.y);
    mark(start.x, start.y);
    if (stairs) mark(stairs.x, stairs.y);
    if (sun) mark(sun.x, sun.y);

    // --- one cracked-wall secret alcove ------------------------------------
    let secret = null;

    function trySecret(fx, fy, dx, dy) {
      const wx = fx + dx;
      const wy = fy + dy;
      if (wx < 2 || wy < 2 || wx >= W - 2 || wy >= H - 2) return false;

      let ax;
      let ay;
      if (dx === 1) { ax = wx + 1; ay = wy - 1; }
      else if (dx === -1) { ax = wx - 3; ay = wy - 1; }
      else if (dy === 1) { ax = wx - 1; ay = wy + 1; }
      else { ax = wx - 1; ay = wy - 3; }

      if (ax < 2 || ay < 2 || ax + 2 >= W - 2 || ay + 2 >= H - 2) return false;

      for (let y = ay; y <= ay + 2; y++) {
        for (let x = ax; x <= ax + 2; x++) {
          if (tiles[idx(x, y)] !== WALL) return false;
        }
      }

      for (let y = ay - 1; y <= ay + 3; y++) {
        for (let x = ax - 1; x <= ax + 3; x++) {
          if (x === wx && y === wy) continue;
          if (tiles[idx(x, y)] !== WALL) return false;
        }
      }

      for (let y = ay; y <= ay + 2; y++) {
        for (let x = ax; x <= ax + 2; x++) tiles[idx(x, y)] = FLOOR;
      }

      secret = {
        wall: { x: wx, y: wy },
        room: { x: ax, y: ay, w: 3, h: 3 },
        chest: { x: ax + 1, y: ay + 1 },
        approach: { x: fx, y: fy },
        opened: false,
        revealed: false
      };

      for (let y = ay; y <= ay + 2; y++) {
        for (let x = ax; x <= ax + 2; x++) mark(x, y);
      }
      return true;
    }

    const secretDirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let y = 1; y < H - 1 && !secret; y++) {
      for (let x = 1; x < W - 1 && !secret; x++) {
        if (tiles[idx(x, y)] !== FLOOR) continue;
        if (Math.hypot(x - start.x, y - start.y) < 3) continue;
        for (const [dx, dy] of secretDirs) {
          if (trySecret(x, y, dx, dy)) break;
        }
      }
    }

    // --- one authored set-piece room per floor -----------------------------
    const setType = SET_PIECE_ORDER[(floor - 1) % SET_PIECE_ORDER.length];
    const setMeta = SET_PIECE_INFO[setType];
    const candidates = rooms.filter((r, i) => i > 0 && r !== goalRoom);
    let setPiece = null;

    if (candidates.length) {
      const setRoom = candidates[ri(rng, 0, candidates.length - 1)];
      let focus = null;
      let water = [];
      let boss = null;
      const cx = setRoom.cx;
      const cy = setRoom.cy;

      if (setType === 'bath') {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const x = cx + dx;
            const y = cy + dy;
            if (x <= setRoom.x || y <= setRoom.y || x >= setRoom.x + setRoom.w - 1 || y >= setRoom.y + setRoom.h - 1) continue;
            if (tiles[idx(x, y)] !== FLOOR) continue;
            water.push({ x, y });
            mark(x, y);
          }
        }
      } else if (setType === 'greenhouse' && floor % 5 === 3) {
        boss = { x: cx, y: cy };
        mark(cx, cy);
      } else if (setMeta.focus) {
        focus = { x: cx, y: cy, type: setMeta.focus };
        mark(cx, cy);
      }

      setPiece = { type: setType, name: setMeta.name, room: setRoom, focus, water, boss };
    }

    // --- request board in the start room -----------------------------------
    let favorBoard = null;
    for (let y = first.y + 1; y <= first.y + first.h - 2 && !favorBoard; y++) {
      for (let x = first.x + 1; x <= first.x + first.w - 2; x++) {
        if (tiles[idx(x, y)] !== FLOOR || occupied.has(x + ',' + y)) continue;
        if (Math.abs(x - fire.x) + Math.abs(y - fire.y) < 2) continue;
        favorBoard = { x, y };
        mark(x, y);
        break;
      }
    }

    // --- traveling merchant on even floors ---------------------------------
    let merchant = null;
    if (floor % 2 === 0) {
      for (let t = 0; t < 160 && !merchant; t++) {
        const room = rooms[ri(rng, 1, rooms.length - 1)];
        if (setPiece && room === setPiece.room) continue;
        const x = ri(rng, room.x + 1, room.x + room.w - 2);
        const y = ri(rng, room.y + 1, room.y + room.h - 2);
        if (tiles[idx(x, y)] !== FLOOR || occupied.has(x + ',' + y)) continue;
        if (Math.hypot(x - start.x, y - start.y) < 4) continue;
        merchant = { x, y, name: 'Pip' };
        mark(x, y);
      }
    }

    // All loot now comes from grumbles: no pre-placed ground items.
    const items = [];

    // --- grumbles ----------------------------------------------------------
    const enemies = [];
    const kinds = ['grumble', 'mope', 'fuss'];
    const count = Math.min(14, 3 + floor * 2 + (rng() < 0.5 ? 1 : 0));
    for (let i = 0; i < count && rooms.length > 1; i++) {
      for (let t = 0; t < 80; t++) {
        const room = rooms[ri(rng, 1, rooms.length - 1)];
        if (setPiece && room === setPiece.room) continue;
        const x = ri(rng, room.x + 1, room.x + room.w - 2);
        const y = ri(rng, room.y + 1, room.y + room.h - 2);
        if (tiles[idx(x, y)] !== FLOOR || occupied.has(x + ',' + y)) continue;
        if (Math.hypot(x - start.x, y - start.y) < 4.5) continue;
        mark(x, y);
        enemies.push({
          x, y,
          kind: kinds[ri(rng, 0, kinds.length - 1)],
          grump: 2 + (floor >= 4 ? 1 : 0) + (rng() < 0.3 ? 1 : 0)
        });
        break;
      }
    }

    // --- grumble drops: about half of the grumbles carry one item ----------
    const dropPool = [
      'leaf', 'leaf', 'herb', 'oil', 'oil', 'mushroom',
      'potion', 'haste', 'seed', 'flower', 'stone', 'trinket', 'letter', 'lost'
    ];
    for (const foe of enemies) {
      if (rng() < 0.5) foe.drop = dropPool[ri(rng, 0, dropPool.length - 1)];
    }

    function ensureDrop(type) {
      if (enemies.some((foe) => foe.drop === type)) return;
      const target = enemies.find((foe) => !foe.drop) ||
        enemies.find((foe) => foe.drop && foe.drop !== 'leaf' && foe.drop !== 'oil') ||
        enemies[0];
      if (target) target.drop = type;
    }

    if (enemies.length) {
      ensureDrop('leaf');
      ensureDrop('oil');
      ensureDrop('herb');
    }

    // --- one small companion per floor -------------------------------------
    let pet = null;

    function makePet(room) {
      const x = ri(rng, room.x + 1, room.x + room.w - 2);
      const y = ri(rng, room.y + 1, room.y + room.h - 2);
      if (tiles[idx(x, y)] !== FLOOR || occupied.has(x + ',' + y)) return false;
      if (Math.hypot(x - start.x, y - start.y) < 4) return false;
      if (Math.hypot(x - fire.x, y - fire.y) < 3) return false;
      const kind = PET_KINDS[ri(rng, 0, PET_KINDS.length - 1)];
      const names = PET_NAMES[kind];
      pet = { x, y, kind, name: names[ri(rng, 0, names.length - 1)] };
      mark(x, y);
      return true;
    }

    if (rooms.length > 1) {
      for (let t = 0; t < 120 && !pet; t++) {
        makePet(rooms[ri(rng, 1, rooms.length - 1)]);
      }
    }
    if (!pet) {
      for (let y = 1; y < H - 1 && !pet; y++) {
        for (let x = 1; x < W - 1; x++) {
          if (tiles[idx(x, y)] !== FLOOR || occupied.has(x + ',' + y)) continue;
          if (Math.hypot(x - start.x, y - start.y) < 3) continue;
          if (Math.hypot(x - fire.x, y - fire.y) < 3) continue;
          const kind = PET_KINDS[ri(rng, 0, PET_KINDS.length - 1)];
          const names = PET_NAMES[kind];
          pet = { x, y, kind, name: names[ri(rng, 0, names.length - 1)] };
          mark(x, y);
          break;
        }
      }
    }

    // --- one treasure chest per floor --------------------------------------
    let chest = null;

    function makeChest(room) {
      const x = ri(rng, room.x + 1, room.x + room.w - 2);
      const y = ri(rng, room.y + 1, room.y + room.h - 2);
      if (tiles[idx(x, y)] !== FLOOR || occupied.has(x + ',' + y)) return false;
      if (Math.hypot(x - start.x, y - start.y) < 4) return false;
      chest = { x, y };
      mark(x, y);
      return true;
    }

    if (rooms.length > 1) {
      for (let t = 0; t < 120 && !chest; t++) {
        makeChest(rooms[ri(rng, 1, rooms.length - 1)]);
      }
    }
    if (!chest) {
      for (let y = 1; y < H - 1 && !chest; y++) {
        for (let x = 1; x < W - 1; x++) {
          if (tiles[idx(x, y)] !== FLOOR || occupied.has(x + ',' + y)) continue;
          if (Math.hypot(x - start.x, y - start.y) < 3) continue;
          chest = { x, y };
          mark(x, y);
          break;
        }
      }
    }

    // --- one doorway to a little room beyond the hollow --------------------
    let portal = null;
    const portalRooms = rooms.filter((r, i) =>
      i > 0 && r !== goalRoom && !(setPiece && r === setPiece.room));
    const portalCandidates = portalRooms.length ? portalRooms : rooms;

    function findPortalTile(room) {
      for (let t = 0; t < 80; t++) {
        const x = ri(rng, room.x + 1, room.x + room.w - 2);
        const y = ri(rng, room.y + 1, room.y + room.h - 2);
        if (tiles[idx(x, y)] !== FLOOR || occupied.has(x + ',' + y)) continue;
        if (Math.hypot(x - start.x, y - start.y) < 4) continue;
        if (Math.hypot(x - fire.x, y - fire.y) < 2) continue;
        const kinds = ['home', 'kitchen', 'apothecary', 'observatory', 'bathhouse', 'lostfound', 'nook'];
        portal = { x, y, kind: kinds[(floor - 1) % kinds.length] };
        mark(x, y);
        return true;
      }
      return false;
    }

    for (let i = 0; i < portalCandidates.length && !portal; i++) {
      findPortalTile(portalCandidates[i]);
    }
    if (!portal) {
      for (let y = 1; y < H - 1 && !portal; y++) {
        for (let x = 1; x < W - 1; x++) {
          if (tiles[idx(x, y)] !== FLOOR || occupied.has(x + ',' + y)) continue;
          if (Math.hypot(x - start.x, y - start.y) < 3) continue;
          portal = { x, y, kind: 'home' };
          mark(x, y);
          break;
        }
      }
    }

    return {
      floor, seed, isFinal,
      tiles, rooms, fire, start, stairs, sun,
      items, enemies, pet, chest, setPiece, favorBoard, merchant, secret, portal
    };
  }

  function bfs(tiles, sx, sy) {
    const dist = new Int32Array(W * H).fill(-1);
    const order = [];
    if (!inside(sx, sy) || tiles[idx(sx, sy)] !== FLOOR) return { dist, order };

    const start = idx(sx, sy);
    dist[start] = 0;
    order.push(start);

    function visit(nx, ny, d) {
      if (!inside(nx, ny)) return;
      const n = idx(nx, ny);
      if (tiles[n] !== FLOOR || dist[n] >= 0) return;
      dist[n] = d + 1;
      order.push(n);
    }

    for (let i = 0; i < order.length; i++) {
      const p = order[i];
      const d = dist[p];
      const x = p % W;
      const y = (p / W) | 0;
      visit(x + 1, y, d);
      visit(x - 1, y, d);
      visit(x, y + 1, d);
      visit(x, y - 1, d);
    }

    return { dist, order };
  }

  return { W, H, WALL, FLOOR, generate, bfs, mulberry32, seedFor };
});
