/* Lantern Hollow — a small cozy dungeon crawler.
   Vanilla canvas, no dependencies, no build step. */
(function () {
  'use strict';

  const W = CozyWorld.W;
  const H = CozyWorld.H;
  const FLOOR = CozyWorld.FLOOR;
  const TS = 40;

  const FONT_UI = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
  const FONT_SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const lightCanvas = document.createElement('canvas');
  const lctx = lightCanvas.getContext('2d');

  const titleEl = document.getElementById('title');
  const endingEl = document.getElementById('ending');
  const statsEl = document.getElementById('stats');
  const touchEl = document.getElementById('touch');
  const touchTea = document.getElementById('touch-tea');
  const touchUse = document.getElementById('touch-use');
  const isTouch =
    window.matchMedia('(pointer: coarse)').matches ||
    (navigator.maxTouchPoints || 0) > 0;
  const safe = { t: 0, r: 0, b: 0, l: 0 };

  const THEMES = [
    { name: 'The Root Cellars',     bg: '#0c0911', floorA: '#4b3a36', floorB: '#564540', wallA: '#241b26', wallB: '#3a2c38', moss: '#6e7d52', glow: '#ffb46b' },
    { name: 'The Mossy Stair',      bg: '#080f0c', floorA: '#3c4a3d', floorB: '#465545', wallA: '#1c2822', wallB: '#304136', moss: '#8aa869', glow: '#ffd08a' },
    { name: 'The Tea Vault',        bg: '#100b0a', floorA: '#4a3a34', floorB: '#57453c', wallA: '#2a1e1e', wallB: '#41312f', moss: '#9a8a55', glow: '#ffc07a' },
    { name: 'The Glowworm Gallery', bg: '#080a12', floorA: '#343a4c', floorB: '#3f4659', wallA: '#1c2030', wallB: '#30364a', moss: '#6d8b98', glow: '#9fd8ff' },
    { name: 'The Sunroom',          bg: '#120d07', floorA: '#5a4935', floorB: '#6a5640', wallA: '#33261a', wallB: '#4d3a27', moss: '#b4a466', glow: '#ffe6a0' }
  ];

  const G = {
    scene: 'title',
    seed: 1,
    floor: 1,
    world: null,
    tiles: null,
    explored: null,
    player: null,
    enemies: [],
    items: [],
    particles: [],
    fire: null,
    stairs: null,
    sun: null,
    hearts: 3,
    maxHearts: 4,
    tea: 0,
    oil: 1,
    invuln: 0,
    hurtFlash: 0,
    shake: 0,
    time: 0,
    steps: 0,
    soothed: 0,
    startedAt: 0,
    cam: { x: 0, y: 0 },
    keys: {},
    hold: 0,
    bumpLock: 0,
    messages: [],
    fade: 0,
    fadeDir: 0,
    pending: null,
    muted: false,
    hinted: false,
    urlSeed: false,
    touch: { up: false, down: false, left: false, right: false }
  };

  let viewW = 0;
  let viewH = 0;
  let dpr = 1;
  let audioCtx = null;
  let masterGain = null;

  // ---------------------------------------------------------------- utils

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  function hash2(x, y, s) {
    let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  function roundRect(c, x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  const theme = () => THEMES[(G.floor - 1) % THEMES.length];

  function toast(text) {
    G.messages.push({ text, life: 3.6, max: 3.6 });
    while (G.messages.length > 3) G.messages.shift();
  }

  // ---------------------------------------------------------------- audio

  function initAudio() {
    if (audioCtx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = G.muted ? 0 : 0.55;
      masterGain.connect(audioCtx.destination);
    } catch (err) {
      audioCtx = null;
    }
  }

  function tone(freq, dur, type, vol, delay, slideTo) {
    if (!audioCtx || G.muted) return;
    const t0 = audioCtx.currentTime + (delay || 0);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.05, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  const sfx = {
    pickup() { tone(720, 0.14, 'sine', 0.05); tone(1080, 0.22, 'sine', 0.032, 0.07); },
    soothe() { tone(523, 0.18, 'triangle', 0.045); tone(659, 0.2, 'triangle', 0.045, 0.09); tone(784, 0.34, 'triangle', 0.04, 0.18); },
    hurt() { tone(150, 0.28, 'sawtooth', 0.035, 0, 90); tone(90, 0.3, 'sine', 0.05); },
    rest() { tone(262, 0.9, 'sine', 0.032); tone(330, 0.9, 'sine', 0.028, 0.05); tone(392, 1.1, 'sine', 0.026, 0.1); },
    descend() { tone(440, 0.5, 'sine', 0.04, 0, 220); },
    ending() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 1.8, 'sine', 0.036, i * 0.18)); },
    quip() { tone(880, 0.07, 'sine', 0.022); }
  };

  // ---------------------------------------------------------------- layout

  function readSafe() {
    const probe = document.getElementById('safe-probe');
    if (!probe) return;
    const cs = getComputedStyle(probe);
    safe.t = parseFloat(cs.paddingTop) || 0;
    safe.r = parseFloat(cs.paddingRight) || 0;
    safe.b = parseFloat(cs.paddingBottom) || 0;
    safe.l = parseFloat(cs.paddingLeft) || 0;
  }

  function resize() {
    readSafe();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(viewW * dpr));
    canvas.height = Math.max(1, Math.floor(viewH * dpr));
    canvas.style.width = viewW + 'px';
    canvas.style.height = viewH + 'px';
    lightCanvas.width = canvas.width;
    lightCanvas.height = canvas.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (G.player) snapCamera();
  }

  function clampCam(v, worldPx, viewPx) {
    if (worldPx <= viewPx) return (worldPx - viewPx) / 2;
    return clamp(v, 0, worldPx - viewPx);
  }

  function camTarget() {
    const p = G.player;
    return {
      x: clampCam(p.px * TS + TS / 2 - viewW / 2, W * TS, viewW),
      y: clampCam(p.py * TS + TS / 2 - viewH / 2, H * TS, viewH)
    };
  }

  function snapCamera() {
    const t = camTarget();
    G.cam.x = t.x;
    G.cam.y = t.y;
  }

  function updateCamera(dt) {
    const t = camTarget();
    const k = 1 - Math.exp(-dt * 7);
    G.cam.x = lerp(G.cam.x, t.x, k);
    G.cam.y = lerp(G.cam.y, t.y, k);
  }

  // ---------------------------------------------------------------- world

  function revealAround(cx, cy, r) {
    const x0 = Math.ceil(cx - r);
    const x1 = Math.floor(cx + r);
    const y0 = Math.ceil(cy - r);
    const y1 = Math.floor(cy + r);
    for (let y = y0; y <= y1; y++) {
      if (y < 0 || y >= H) continue;
      for (let x = x0; x <= x1; x++) {
        if (x < 0 || x >= W) continue;
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r * r) G.explored[y * W + x] = 1;
      }
    }
  }

  function reveal() {
    const p = G.player;
    revealAround(p.px, p.py, 2.0 + G.oil * 2.4 + 1.1);
  }

  function loadFloor(n) {
    const world = CozyWorld.generate(G.seed, n);
    G.floor = n;
    G.world = world;
    G.tiles = world.tiles;
    G.explored = new Uint8Array(W * H);
    G.fire = world.fire;
    G.stairs = world.stairs;
    G.sun = world.sun;

    G.items = world.items.map((it) => ({
      x: it.x,
      y: it.y,
      type: it.type,
      phase: Math.random() * Math.PI * 2
    }));

    G.enemies = world.enemies.map((e) => ({
      tx: e.x,
      ty: e.y,
      px: e.x,
      py: e.y,
      fromX: e.x,
      fromY: e.y,
      kind: e.kind,
      grump: e.grump,
      maxGrump: e.grump,
      wait: 0.7 + Math.random() * 1.8,
      moving: 0,
      dur: 0.4,
      face: Math.random() < 0.5 ? -1 : 1,
      flash: 0,
      phase: Math.random() * Math.PI * 2
    }));

    const st = world.start;
    G.player = {
      tx: st.x, ty: st.y,
      px: st.x, py: st.y,
      fromX: st.x, fromY: st.y,
      toX: st.x, toY: st.y,
      moving: 0, moveT: 0,
      facing: 1
    };

    G.particles = [];
    G.messages = [];
    G.invuln = 1.4;
    G.bumpLock = 0;
    G.hold = 0;

    revealAround(st.x, st.y, 5);
    snapCamera();
    toast(n === 5 ? 'The Sunroom · follow the warm light' : theme().name + ' · find the staircase');
    if (n === 1) {
      toast(isTouch ? 'Pad to walk · TEA heals · USE rests' : 'WASD to wander · Space to rest');
    }
  }

  function newRun(keepSeed) {
    if (!keepSeed) G.seed = (Math.random() * 2147483647) | 0;
    G.hearts = 3;
    G.tea = 0;
    G.oil = 1;
    G.steps = 0;
    G.soothed = 0;
    G.startedAt = performance.now();
    G.invuln = 0;
    G.hurtFlash = 0;
    G.shake = 0;
    G.fade = 0;
    G.fadeDir = 0;
    G.pending = null;
    loadFloor(1);
  }

  function begin() {
    if (G.scene !== 'title') return;
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    titleEl.classList.add('hidden');
    G.scene = 'playing';
    newRun(G.urlSeed);
    syncTouchUI();
    sfx.rest();
  }

  // ---------------------------------------------------------------- flow

  function transition(cb) {
    if (G.fadeDir !== 0) return;
    G.fadeDir = 1;
    G.pending = cb;
  }

  function updateFade(dt) {
    if (G.fadeDir === 0) return;
    G.fade += (G.fadeDir * dt) / 0.3;
    if (G.fadeDir > 0 && G.fade >= 1) {
      G.fade = 1;
      const cb = G.pending;
      G.pending = null;
      G.fadeDir = -1;
      if (cb) cb();
    } else if (G.fadeDir < 0 && G.fade <= 0) {
      G.fade = 0;
      G.fadeDir = 0;
    }
  }

  function respawn() {
    const spots = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let spot = { x: G.fire.x, y: G.fire.y + 1 };
    for (const [dx, dy] of spots) {
      const nx = G.fire.x + dx;
      const ny = G.fire.y + dy;
      if (walkable(nx, ny)) {
        spot = { x: nx, y: ny };
        break;
      }
    }
    const p = G.player;
    p.tx = p.px = p.fromX = p.toX = spot.x;
    p.ty = p.py = p.fromY = p.toY = spot.y;
    p.moving = 0;
    G.hearts = 2;
    G.oil = 0.7;
    G.invuln = 2.2;
    G.hurtFlash = 0;
    snapCamera();
    toast('You wake by the fire, a little wiser. No harm done.');
  }

  function descend() {
    if (G.scene !== 'playing' || G.fade > 0 || !G.stairs) return;
    const p = G.player;
    if (p.tx !== G.stairs.x || p.ty !== G.stairs.y) return;
    sfx.descend();
    transition(() => loadFloor(G.floor + 1));
  }

  function finish() {
    if (G.scene !== 'playing') return;
    G.scene = 'ending';
    syncTouchUI();
    const total = Math.round((performance.now() - G.startedAt) / 1000);
    const mins = Math.floor(total / 60);
    const secs = String(total % 60).padStart(2, '0');
    statsEl.innerHTML =
      '<div><dt>Floors wandered</dt><dd>' + G.floor + '</dd></div>' +
      '<div><dt>Grumbles soothed</dt><dd>' + G.soothed + '</dd></div>' +
      '<div><dt>Steps taken</dt><dd>' + G.steps + '</dd></div>' +
      '<div><dt>Time underground</dt><dd>' + mins + ':' + secs + '</dd></div>';
    endingEl.classList.remove('hidden');
    sfx.ending();
  }

  // ---------------------------------------------------------------- actions

  const MOVE_KEYS = {
    arrowup: [0, -1], w: [0, -1],
    arrowdown: [0, 1], s: [0, 1],
    arrowleft: [-1, 0], a: [-1, 0],
    arrowright: [1, 0], d: [1, 0]
  };

  function walkable(x, y) {
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    if (G.tiles[y * W + x] !== FLOOR) return false;
    if (G.fire && G.fire.x === x && G.fire.y === y) return false;
    return true;
  }

  function enemyAt(x, y) {
    return G.enemies.find((e) => e.tx === x && e.ty === y);
  }

  function playerOccupies(x, y) {
    const p = G.player;
    if (p.tx === x && p.ty === y) return true;
    if (p.moving > 0 && p.toX === x && p.toY === y) return true;
    return false;
  }

  function heldDir() {
    const t = G.touch;
    if (t.left) return [-1, 0];
    if (t.right) return [1, 0];
    if (t.up) return [0, -1];
    if (t.down) return [0, 1];

    const k = G.keys;
    if (k.arrowleft || k.a) return [-1, 0];
    if (k.arrowright || k.d) return [1, 0];
    if (k.arrowup || k.w) return [0, -1];
    if (k.arrowdown || k.s) return [0, 1];
    return null;
  }

  function tryMove(dx, dy) {
    const p = G.player;
    if (G.scene !== 'playing' || G.fade > 0 || p.moving > 0 || G.bumpLock > 0) return;
    if (dx < 0) p.facing = -1;
    else if (dx > 0) p.facing = 1;

    const nx = p.tx + dx;
    const ny = p.ty + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;

    if (G.tiles[ny * W + nx] !== FLOOR) {
      stepDust((p.px + dx * 0.4) * TS + TS / 2, (p.py + dy * 0.4) * TS + TS / 2);
      G.bumpLock = 0.14;
      return;
    }
    if (G.fire && G.fire.x === nx && G.fire.y === ny) {
      toast('The fire crackles. Press Space to rest.');
      G.bumpLock = 0.6;
      return;
    }

    const foe = enemyAt(nx, ny);
    if (foe) {
      soothe(foe);
      G.bumpLock = 0.32;
      return;
    }

    p.fromX = p.px;
    p.fromY = p.py;
    p.toX = nx;
    p.toY = ny;
    p.moving = 1;
    p.moveT = 0;
    G.hold = 0.16;
    G.steps++;
  }

  function arrive() {
    pickup();
    stepDust(G.player.px * TS + TS / 2, G.player.py * TS + TS / 2 + 12);
  }

  function pickup() {
    const p = G.player;
    const i = G.items.findIndex((it) => it.x === p.tx && it.y === p.ty);
    if (i < 0) return;
    const it = G.items.splice(i, 1)[0];
    const cx = it.x * TS + TS / 2;
    const cy = it.y * TS + TS / 2;

    if (it.type === 'leaf') {
      G.tea++;
      toast('Tea leaf · ' + G.tea + ' in your pocket');
    } else if (it.type === 'oil') {
      G.oil = Math.min(1, G.oil + 0.45);
      toast('Lantern oil · the flame steadies');
    } else if (G.hearts < G.maxHearts) {
      G.hearts++;
      toast('Warm mushroom · +1 heart');
    } else {
      toast('A warm mushroom. You are already full of soup.');
    }
    sfx.pickup();
    burst(cx, cy, it.type === 'leaf' ? '#9fd4a0' : it.type === 'oil' ? '#ffd08a' : '#e8a58e', 12);
  }

  function soothe(foe) {
    foe.grump--;
    foe.flash = 1;
    foe.wait = Math.max(foe.wait, 0.8);
    G.bumpLock = 0.3;
    G.shake = Math.max(G.shake, 2.6);
    const cx = foe.px * TS + TS / 2;
    const cy = foe.py * TS + TS / 2;

    if (foe.grump <= 0) {
      const i = G.enemies.indexOf(foe);
      if (i >= 0) G.enemies.splice(i, 1);
      G.tea++;
      G.soothed++;
      burst(cx, cy, '#a9d8a7', 18);
      burst(cx, cy - 8, '#f6e2b8', 8);
      toast('The grumble sighs, leaves you a tea leaf, and wanders off.');
      sfx.soothe();
    } else {
      burst(cx, cy, '#f3d9a4', 7);
      toast(foe.grump === 1
        ? 'Almost soothed. One more bonk of kindness.'
        : 'The grumble softens a little.');
      sfx.quip();
    }
  }

  function hurtPlayer() {
    if (G.invuln > 0 || G.hearts <= 0) return;
    G.hearts--;
    G.invuln = 1.6;
    G.hurtFlash = 0.6;
    G.shake = 8;
    sfx.hurt();
    if (G.hearts <= 0) {
      G.hearts = 0;
      transition(respawn);
    } else {
      toast('Oof. The grumble is having a day.');
    }
  }

  function rest() {
    G.hearts = G.maxHearts;
    G.oil = 1;
    G.invuln = 1.4;
    burst(G.fire.x * TS + TS / 2, G.fire.y * TS + TS / 2 - 6, '#ffcf87', 20);
    sfx.rest();
    toast('You rest by the fire. Lantern full, hearts warm.');
  }

  function drinkTea() {
    if (G.scene !== 'playing' || G.fade > 0) return;
    if (G.tea <= 0) {
      toast('No tea leaves yet. The grumbles have plenty.');
      sfx.quip();
      return;
    }
    if (G.hearts >= G.maxHearts) {
      toast('You are already perfectly cozy.');
      return;
    }
    G.tea--;
    G.hearts++;
    burst(G.player.px * TS + TS / 2, G.player.py * TS + TS / 2 - 10, '#e8b56a', 14);
    sfx.rest();
    toast('A sip of tea · +1 heart');
  }

  function promptText() {
    const p = G.player;
    if (!p) return null;
    if (G.sun && p.tx === G.sun.x && p.ty === G.sun.y) return 'Space · bask in the sunroom';
    if (G.stairs && p.tx === G.stairs.x && p.ty === G.stairs.y) return 'Space · descend';
    if (G.fire && Math.abs(p.tx - G.fire.x) + Math.abs(p.ty - G.fire.y) <= 1) return 'Space · rest by the fire';
    return null;
  }

  function interact() {
    if (G.scene !== 'playing' || G.fade > 0) return;
    const p = G.player;
    if (G.sun && p.tx === G.sun.x && p.ty === G.sun.y) { finish(); return; }
    if (G.stairs && p.tx === G.stairs.x && p.ty === G.stairs.y) { descend(); return; }
    if (G.fire && Math.abs(p.tx - G.fire.x) + Math.abs(p.ty - G.fire.y) <= 1) { rest(); return; }
    toast('A quiet corner. Nothing to do but breathe.');
  }

  function toggleMute() {
    G.muted = !G.muted;
    if (masterGain) masterGain.gain.value = G.muted ? 0 : 0.55;
    if (G.scene === 'playing') toast(G.muted ? 'Sound off' : 'Sound on');
  }

  function syncTouchUI() {
    if (!touchEl) return;
    const show = isTouch && G.scene === 'playing';
    touchEl.classList.toggle('show', show);
    touchEl.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  function touchLabel() {
    const p = G.player;
    if (!p) return 'USE';
    if (G.sun && p.tx === G.sun.x && p.ty === G.sun.y) return 'BASK';
    if (G.stairs && p.tx === G.stairs.x && p.ty === G.stairs.y) return 'DOWN';
    if (G.fire && Math.abs(p.tx - G.fire.x) + Math.abs(p.ty - G.fire.y) <= 1) return 'REST';
    return 'USE';
  }

  function updateTouchAction() {
    if (!isTouch || !touchUse) return;
    const label = touchLabel();
    if (touchUse.textContent !== label) touchUse.textContent = label;
  }

  // ---------------------------------------------------------------- update

  function update(dt) {
    updateTouchAction();
    G.shake *= Math.exp(-dt * 9);
    G.hurtFlash = Math.max(0, G.hurtFlash - dt * 1.6);
    updateFade(dt);
    updateMessages(dt);
    updateParticles(dt);
    if (G.fade > 0) {
      updateCamera(dt);
      return;
    }

    G.invuln = Math.max(0, G.invuln - dt);
    G.hold -= dt;
    G.bumpLock = Math.max(0, G.bumpLock - dt);
    G.oil = Math.max(0, G.oil - dt * 0.0045);

    const p = G.player;
    if (p.moving > 0) {
      p.moveT += dt / 0.14;
      const t = Math.min(1, p.moveT);
      const k = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      p.px = lerp(p.fromX, p.toX, k);
      p.py = lerp(p.fromY, p.toY, k);
      if (t >= 1) {
        p.moving = 0;
        p.px = p.toX;
        p.py = p.toY;
        p.tx = p.toX;
        p.ty = p.toY;
        arrive();
      }
    } else {
      const dir = heldDir();
      if (dir && G.hold <= 0) {
        tryMove(dir[0], dir[1]);
        G.hold = 0.15;
      }
    }

    updateEnemies(dt);
    reveal();
    updateCamera(dt);
  }

  function updateEnemies(dt) {
    const p = G.player;

    for (const foe of G.enemies) {
      foe.flash = Math.max(0, foe.flash - dt * 3.2);
      if (foe.moving > 0) {
        foe.moving -= dt;
        const t = 1 - Math.max(0, foe.moving) / foe.dur;
        const k = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        foe.px = lerp(foe.fromX, foe.tx, k);
        foe.py = lerp(foe.fromY, foe.ty, k);
      } else {
        foe.wait -= dt;
        if (foe.wait <= 0) {
          foe.wait = 1.1 + Math.random() * 1.7;
          const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
          for (let i = dirs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = dirs[i]; dirs[i] = dirs[j]; dirs[j] = tmp;
          }
          for (const [dx, dy] of dirs) {
            const nx = foe.tx + dx;
            const ny = foe.ty + dy;
            if (!walkable(nx, ny)) continue;
            if (playerOccupies(nx, ny)) continue;
            if (G.sun && G.sun.x === nx && G.sun.y === ny) continue;
            foe.fromX = foe.px;
            foe.fromY = foe.py;
            foe.tx = nx;
            foe.ty = ny;
            foe.face = dx || foe.face;
            foe.moving = foe.dur;
            break;
          }
        }
      }

      if (G.invuln <= 0 && Math.hypot(foe.px - p.px, foe.py - p.py) < 0.72) {
        hurtPlayer();
      }
    }
  }

  function updateMessages(dt) {
    for (let i = G.messages.length - 1; i >= 0; i--) {
      G.messages[i].life -= dt;
      if (G.messages[i].life <= 0) G.messages.splice(i, 1);
    }
  }

  function updateParticles(dt) {
    for (let i = G.particles.length - 1; i >= 0; i--) {
      const q = G.particles[i];
      q.life -= dt;
      if (q.life <= 0) { G.particles.splice(i, 1); continue; }
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vy += (q.g || 0) * dt;
      q.vx *= 1 - dt * 0.7;
    }

    if (G.fire && Math.random() < dt * 7) {
      const life = 0.6 + Math.random() * 0.7;
      G.particles.push({
        x: G.fire.x * TS + TS / 2 + (Math.random() - 0.5) * 14,
        y: G.fire.y * TS + TS / 2 - 2,
        vx: (Math.random() - 0.5) * 8,
        vy: -14 - Math.random() * 16,
        g: -4,
        life, max: life,
        color: 'rgba(255,180,100,0.9)',
        size: 1 + Math.random() * 1.6,
        glow: true
      });
    }

    if (G.player && G.particles.length < 80 && Math.random() < dt * 10) {
      const life = 1.4 + Math.random() * 1.6;
      G.particles.push({
        x: G.player.px * TS + TS / 2 + (Math.random() - 0.5) * 260,
        y: G.player.py * TS + TS / 2 + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 6,
        vy: -4 - Math.random() * 6,
        g: 0,
        life, max: life,
        color: 'rgba(220,200,170,0.5)',
        size: 0.9 + Math.random() * 1.2,
        glow: false
      });
    }
  }

  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 22 + Math.random() * 70;
      const life = 0.4 + Math.random() * 0.6;
      G.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 26,
        g: 55,
        life, max: life,
        color,
        size: 1.4 + Math.random() * 2.1,
        glow: true
      });
    }
  }

  function stepDust(x, y) {
    for (let i = 0; i < 2; i++) {
      const life = 0.35 + Math.random() * 0.3;
      G.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y,
        vx: (Math.random() - 0.5) * 12,
        vy: -7 - Math.random() * 8,
        g: 5,
        life, max: life,
        color: 'rgba(215,195,165,0.42)',
        size: 1.3 + Math.random() * 1.8,
        glow: false
      });
    }
  }

  // ---------------------------------------------------------------- drawing

  function draw() {
    const th = theme();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#09070e';
    ctx.fillRect(0, 0, viewW, viewH);

    if (G.scene === 'title') {
      drawTitleScene();
      return;
    }

    const shakeX = G.shake > 0.1 ? (Math.random() - 0.5) * G.shake : 0;
    const shakeY = G.shake > 0.1 ? (Math.random() - 0.5) * G.shake : 0;
    const camX = G.cam.x + shakeX;
    const camY = G.cam.y + shakeY;

    ctx.save();
    ctx.translate(-camX, -camY);
    drawTiles(camX, camY, th);
    drawProps(camX, camY, th);
    drawEnemies();
    drawPlayer();
    drawParticles();
    ctx.restore();

    drawGlows(camX, camY, th);
    drawDarkness(camX, camY);
    drawVignette();
    drawHurtFlash();
    drawHUD(th);
    drawFade();
  }

  function drawTitleScene() {
    const g = ctx.createRadialGradient(
      viewW * 0.5, viewH * 1.02, 0,
      viewW * 0.5, viewH * 1.02, Math.max(viewW, viewH) * 0.95
    );
    g.addColorStop(0, 'rgba(92, 55, 28, 0.85)');
    g.addColorStop(0.4, 'rgba(32, 20, 24, 0.9)');
    g.addColorStop(1, 'rgba(6, 5, 10, 1)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, viewW, viewH);

    for (let i = 0; i < 44; i++) {
      const t = ((G.time * 0.018) + hash2(i, 3, 7)) % 1;
      const x = hash2(i, 1, 2) * viewW + Math.sin(G.time * 0.4 + i) * 26;
      const y = viewH * (1.06 - t * 0.95);
      const a = Math.sin(t * Math.PI) * 0.4;
      ctx.fillStyle = 'rgba(255, 190, 120, ' + (a * 0.55).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(x, y, 1 + hash2(i, 2, 3) * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawTiles(camX, camY, th) {
    const x0 = Math.max(0, Math.floor(camX / TS) - 1);
    const x1 = Math.min(W - 1, Math.ceil((camX + viewW) / TS) + 1);
    const y0 = Math.max(0, Math.floor(camY / TS) - 1);
    const y1 = Math.min(H - 1, Math.ceil((camY + viewH) / TS) + 1);

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = y * W + x;
        if (!G.explored[i]) continue;
        if (G.tiles[i] === FLOOR) drawFloorTile(x, y, th);
        else drawWallTile(x, y, th);
      }
    }
  }

  function drawFloorTile(x, y, th) {
    const px = x * TS;
    const py = y * TS;
    const h = hash2(x, y, G.seed & 0xffff);

    ctx.fillStyle = h < 0.5 ? th.floorA : th.floorB;
    ctx.fillRect(px, py, TS, TS);

    ctx.fillStyle = 'rgba(0,0,0,0.09)';
    ctx.fillRect(px, py, TS, 1);
    ctx.fillRect(px, py, 1, TS);
    ctx.fillStyle = 'rgba(255,240,215,0.038)';
    ctx.fillRect(px + 1, py + 1, TS - 2, 2);

    if (h > 0.88) {
      ctx.globalAlpha = 0.24;
      ctx.fillStyle = th.moss;
      ctx.beginPath();
      ctx.ellipse(px + TS * (0.3 + h * 0.3), py + TS * (0.55 + (h - 0.88) * 2), 7, 3.4, h, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (h > 0.83 && h < 0.87) {
      const bx = px + TS * (0.28 + (h - 0.83) * 6);
      const by = py + TS * 0.76;
      ctx.strokeStyle = 'rgba(132,152,104,0.42)';
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(bx + i * 4.2, by);
        ctx.quadraticCurveTo(bx + i * 4.2 + 1.5, by - 6, bx + i * 5.4, by - 10 - Math.abs(i) * -1);
        ctx.stroke();
      }
    } else if (h < 0.05) {
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      ctx.beginPath();
      ctx.ellipse(px + TS * 0.4, py + TS * 0.62, 3, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawWallTile(x, y, th) {
    const px = x * TS;
    const py = y * TS;

    ctx.fillStyle = th.wallA;
    ctx.fillRect(px, py, TS, TS);

    ctx.fillStyle = th.wallB;
    roundRect(ctx, px + 1.5, py + 1.5, TS - 3, TS - 3, 7);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,235,210,0.045)';
    roundRect(ctx, px + 3, py + 2.5, TS - 6, 5, 2.5);
    ctx.fill();

    if (y + 1 < H && G.tiles[(y + 1) * W + x] === FLOOR) {
      ctx.fillStyle = 'rgba(0,0,0,0.24)';
      ctx.fillRect(px, py + TS - 4, TS, 4);
    }
  }

  function drawProps(camX, camY, th) {
    if (G.fire) drawFire(G.fire.x, G.fire.y);
    if (G.stairs && seen(G.stairs.x, G.stairs.y)) drawStairs(G.stairs.x, G.stairs.y, th);
    if (G.sun && seen(G.sun.x, G.sun.y)) drawSun(G.sun.x, G.sun.y);
    for (const it of G.items) {
      if (seen(it.x, it.y)) drawItem(it);
    }
  }

  function seen(x, y) {
    return x >= 0 && y >= 0 && x < W && y < H && G.explored[y * W + x] === 1;
  }

  function drawFire(gx, gy) {
    const cx = gx * TS + TS / 2;
    const cy = gy * TS + TS / 2;
    const t = G.time;

    // braided rug
    ctx.save();
    ctx.translate(cx, cy + 11);
    ctx.fillStyle = 'rgba(98,58,54,0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 41, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,150,110,0.22)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 33, 19, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(54,32,34,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 13, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const pool = ctx.createRadialGradient(cx, cy, 0, cx, cy, 46);
    pool.addColorStop(0, 'rgba(255,170,80,0.2)');
    pool.addColorStop(1, 'rgba(255,170,80,0)');
    ctx.fillStyle = pool;
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.4;
      ctx.fillStyle = i % 2 ? '#4a4150' : '#3d3544';
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * 18, cy + Math.sin(a) * 13 + 5, 6.4, 4.4, a, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = '#5a3f31';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy + 9);
    ctx.lineTo(cx + 9, cy - 1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 11, cy + 9);
    ctx.lineTo(cx - 9, cy - 1);
    ctx.stroke();

    const sway = Math.sin(t * 5.2) * 2.4;
    const sway2 = Math.sin(t * 7.7 + 1.3) * 1.7;
    flameShape(cx - 3.5 + sway, cy + 4, 11, 25, 'rgba(255,116,58,0.8)');
    flameShape(cx + 4 + sway2, cy + 4, 9, 20, 'rgba(255,170,70,0.86)');
    flameShape(cx + sway * 0.6, cy + 4, 6, 14, 'rgba(255,233,170,0.95)');

    // a small kettle, because it is that kind of dungeon
    ctx.fillStyle = '#3d5d63';
    ctx.beginPath();
    ctx.ellipse(cx + 18, cy + 3, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3d5d63';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx + 18, cy - 1, 4.4, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 23, cy + 1);
    ctx.lineTo(cx + 27, cy - 3);
    ctx.stroke();
  }

  function flameShape(x, baseY, halfW, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, baseY - h);
    ctx.bezierCurveTo(x + halfW, baseY - h * 0.42, x + halfW * 0.85, baseY - h * 0.04, x, baseY);
    ctx.bezierCurveTo(x - halfW * 0.85, baseY - h * 0.04, x - halfW, baseY - h * 0.42, x, baseY - h);
    ctx.fill();
  }

  function drawStairs(gx, gy, th) {
    const cx = gx * TS + TS / 2;
    const cy = gy * TS + TS / 2;

    ctx.fillStyle = 'rgba(8,6,12,0.92)';
    roundRect(ctx, cx - 15, cy - 13, 30, 27, 8);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = 'rgba(150,125,98,' + (0.2 - i * 0.05).toFixed(2) + ')';
      roundRect(ctx, cx - 12 + i * 3.2, cy - 10 + i * 3.2, 24 - i * 6.4, 22 - i * 6.4, 4);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(255,200,130,' + (0.22 + Math.sin(G.time * 2) * 0.1).toFixed(2) + ')';
    ctx.lineWidth = 1.6;
    roundRect(ctx, cx - 15, cy - 13, 30, 27, 8);
    ctx.stroke();

    ctx.fillStyle = th.wallB;
    ctx.fillRect(cx - 17, cy - 16, 4, 8);
    ctx.fillRect(cx + 13, cy - 16, 4, 8);
  }

  function drawSun(gx, gy) {
    const cx = gx * TS + TS / 2;
    const cy = gy * TS + TS / 2;
    const t = G.time;

    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 46);
    halo.addColorStop(0, 'rgba(255,225,150,0.3)');
    halo.addColorStop(1, 'rgba(255,225,150,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = 'rgba(255,226,160,0.35)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + t * 0.06;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20);
      ctx.lineTo(Math.cos(a) * 27, Math.sin(a) * 27);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(255,230,170,0.16)';
    ctx.beginPath();
    ctx.arc(cx, cy, 19, 0, Math.PI * 2);
    ctx.fill();

    // saucer + teacup
    ctx.fillStyle = '#cdb894';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 9, 13, 4.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f3e7d1';
    roundRect(ctx, cx - 8, cy - 4, 16, 12, 4);
    ctx.fill();
    ctx.strokeStyle = '#f3e7d1';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cx + 9.5, cy + 1, 4.2, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = '#b5763f';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 4, 7, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,245,220,0.4)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 3 + i * 6, cy - 8);
      ctx.bezierCurveTo(cx - 6 + i * 6, cy - 13, cx + 1 + i * 6, cy - 15, cx - 2 + i * 6, cy - 20);
      ctx.stroke();
    }
  }

  function drawItem(it) {
    const cx = it.x * TS + TS / 2;
    const cy = it.y * TS + TS / 2;
    const bob = Math.sin(G.time * 2 + it.phase) * 2.2;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 9, 8, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.shadowColor = 'rgba(255,205,130,0.45)';
    ctx.shadowBlur = 10;

    if (it.type === 'leaf') {
      ctx.save();
      ctx.translate(cx, cy - 5 + bob);
      ctx.rotate(-0.45);
      ctx.fillStyle = '#86ac6d';
      ctx.beginPath();
      ctx.moveTo(0, 9);
      ctx.bezierCurveTo(-10, 3, -8, -8, 0, -10);
      ctx.bezierCurveTo(8, -8, 10, 3, 0, 9);
      ctx.fill();
      ctx.strokeStyle = 'rgba(220,240,200,0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 7);
      ctx.lineTo(0, -7);
      ctx.stroke();
      ctx.restore();
    } else if (it.type === 'oil') {
      ctx.save();
      ctx.translate(cx, cy - 4 + bob);
      ctx.fillStyle = '#a9702f';
      roundRect(ctx, -5, -8, 10, 3, 1.5);
      ctx.fill();
      ctx.fillStyle = '#e0a54f';
      roundRect(ctx, -6.5, -5, 13, 13, 5);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,240,200,0.55)';
      roundRect(ctx, -4, -2.5, 3.5, 7, 1.75);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(cx, cy - 4 + bob);
      ctx.fillStyle = '#e8d6b0';
      roundRect(ctx, -3, -1, 6, 9, 2.4);
      ctx.fill();
      ctx.fillStyle = '#c9705e';
      ctx.beginPath();
      ctx.ellipse(0, -4, 9, 6, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,235,210,0.8)';
      ctx.beginPath();
      ctx.arc(-3.4, -6, 1.1, 0, Math.PI * 2);
      ctx.arc(2.4, -7, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawEnemies() {
    for (const foe of G.enemies) {
      if (seen(foe.tx, foe.ty)) drawEnemy(foe);
    }
  }

  function drawEnemy(foe) {
    const cx = foe.px * TS + TS / 2;
    const cy = foe.py * TS + TS / 2;
    const bob = Math.sin(G.time * 3 + foe.phase) * 1.4;
    const colors = { grumble: '#7c6396', mope: '#5d7d92', fuss: '#9a7358' };
    const body = colors[foe.kind] || '#7c6396';

    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 11, 11, 4.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy - 2 + bob);
    ctx.scale(1, 1 + Math.sin(G.time * 3 + foe.phase) * 0.03);

    // feet
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(-5.5, 8, 3.4, 2.4, 0, 0, Math.PI * 2);
    ctx.ellipse(5.5, 8, 3.4, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // body
    ctx.beginPath();
    ctx.ellipse(0, 1, 11.5, 9.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,240,225,0.13)';
    ctx.beginPath();
    ctx.ellipse(-3, 3.5, 6.5, 4.4, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // face
    ctx.fillStyle = '#f4ead8';
    for (const ex of [-4.4, 4.4]) {
      ctx.beginPath();
      ctx.ellipse(ex, -1.4, 3.1, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#2a2130';
    const look = foe.face >= 0 ? 1 : -1;
    for (const ex of [-4.4, 4.4]) {
      ctx.beginPath();
      ctx.arc(ex + look * 0.8, -0.9, 1.45, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(40,30,45,0.85)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    if (foe.grump >= 2) {
      ctx.beginPath();
      ctx.moveTo(-7.4, -5.6);
      ctx.lineTo(-2.6, -4.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(7.4, -5.6);
      ctx.lineTo(2.6, -4.2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-7.2, -5.2);
      ctx.lineTo(-3, -6.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(7.2, -5.2);
      ctx.lineTo(3, -6.6);
      ctx.stroke();
    }

    ctx.beginPath();
    if (foe.grump >= 2) {
      ctx.arc(0, 3.6, 3.1, Math.PI * 1.15, Math.PI * 1.85);
    } else {
      ctx.arc(0, 2.4, 2.7, Math.PI * 0.15, Math.PI * 0.85);
    }
    ctx.stroke();

    if (foe.flash > 0) {
      ctx.globalAlpha = foe.flash * 0.65;
      ctx.fillStyle = '#fff7e8';
      ctx.beginPath();
      ctx.ellipse(0, 1, 11.5, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // grump pips
    for (let i = 0; i < foe.maxGrump; i++) {
      ctx.fillStyle = i < foe.grump ? 'rgba(255,170,150,0.85)' : 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.arc(cx - (foe.maxGrump - 1) * 2.5 + i * 5, cy - 18, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPlayer() {
    const p = G.player;
    const px = p.px * TS + TS / 2;
    const py = p.py * TS + TS / 2;
    const walk = p.moving > 0 ? Math.sin(p.moveT * Math.PI) : 0;
    const bob = walk * 3 + Math.sin(G.time * 2.2) * 0.9;

    ctx.save();
    if (G.invuln > 0 && Math.floor(G.time * 10) % 2 === 0) ctx.globalAlpha = 0.55;

    ctx.fillStyle = 'rgba(0,0,0,0.36)';
    ctx.beginPath();
    ctx.ellipse(px, py + 13, 13, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(px, py - 4 - bob);
    ctx.scale(p.facing, 1);

    ctx.fillStyle = '#2c5f5b';
    ctx.beginPath();
    ctx.moveTo(-11, 8);
    ctx.quadraticCurveTo(-13, -8, -6, -13);
    ctx.quadraticCurveTo(0, -17, 6, -13);
    ctx.quadraticCurveTo(13, -8, 11, 8);
    ctx.quadraticCurveTo(0, 12, -11, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(150,220,200,0.22)';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.fillStyle = '#c98a5a';
    ctx.beginPath();
    ctx.ellipse(0, -9, 8, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3c7f76';
    ctx.beginPath();
    ctx.ellipse(0, -14, 8.5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f0d3ac';
    ctx.beginPath();
    ctx.ellipse(1.5, -13, 5.3, 4.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2b2028';
    ctx.beginPath();
    ctx.arc(3.7, -13.4, 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2c5f5b';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-7, -6);
    ctx.lineTo(-14, 1);
    ctx.stroke();

    ctx.fillStyle = '#e8b05f';
    roundRect(ctx, -18, -1, 7.5, 9, 2);
    ctx.fill();
    ctx.fillStyle = '#ffe0a3';
    roundRect(ctx, -16.5, 0.5, 4.5, 6, 1.6);
    ctx.fill();

    const glow = ctx.createRadialGradient(-14, 3, 0, -14, 3, 24);
    glow.addColorStop(0, 'rgba(255,205,130,0.55)');
    glow.addColorStop(1, 'rgba(255,205,130,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(-14, 3, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawParticles() {
    for (const q of G.particles) {
      const a = clamp(q.life / q.max, 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = q.color;
      if (q.glow) {
        ctx.shadowColor = q.color;
        ctx.shadowBlur = 8;
      }
      ctx.beginPath();
      ctx.arc(q.x, q.y, q.size, 0, Math.PI * 2);
      ctx.fill();
      if (q.glow) ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  function addGlow(x, y, r, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  function drawGlows(camX, camY, th) {
    const p = G.player;
    addGlow(p.px * TS + TS / 2 - camX, p.py * TS + TS / 2 - camY - 6, 92, 'rgba(255,180,100,0.16)');
    if (G.fire) addGlow(G.fire.x * TS + TS / 2 - camX, G.fire.y * TS + TS / 2 - camY, 105, 'rgba(255,160,80,0.16)');
    if (G.sun) addGlow(G.sun.x * TS + TS / 2 - camX, G.sun.y * TS + TS / 2 - camY, 150, 'rgba(255,220,140,0.18)');
  }

  function cutLight(x, y, r, flicker) {
    const f = flicker ? 1 + Math.sin(G.time * 8.3) * 0.03 : 1;
    const g = lctx.createRadialGradient(x, y, 0, x, y, r * f);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.5, 'rgba(0,0,0,0.94)');
    g.addColorStop(0.8, 'rgba(0,0,0,0.4)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    lctx.fillStyle = g;
    lctx.beginPath();
    lctx.arc(x, y, r * f, 0, Math.PI * 2);
    lctx.fill();
  }

  function drawDarkness(camX, camY) {
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, viewW, viewH);
    lctx.fillStyle = 'rgba(9,7,18,0.66)';
    lctx.fillRect(0, 0, viewW, viewH);
    lctx.globalCompositeOperation = 'destination-out';

    const p = G.player;
    const flick = 1 + Math.sin(G.time * 9) * 0.02 + Math.sin(G.time * 17.3) * 0.012;
    const r = (2.1 + G.oil * 2.5) * TS * flick;
    cutLight(p.px * TS + TS / 2 - camX, p.py * TS + TS / 2 - camY - 5, r, false);
    if (G.fire) cutLight(G.fire.x * TS + TS / 2 - camX, G.fire.y * TS + TS / 2 - camY, 6 * TS, true);
    if (G.sun) cutLight(G.sun.x * TS + TS / 2 - camX, G.sun.y * TS + TS / 2 - camY, 6.2 * TS, true);

    lctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(lightCanvas, 0, 0, viewW, viewH);
  }

  function drawVignette() {
    const g = ctx.createRadialGradient(
      viewW / 2, viewH / 2, Math.min(viewW, viewH) * 0.34,
      viewW / 2, viewH / 2, Math.max(viewW, viewH) * 0.72
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, viewW, viewH);
  }

  function drawHurtFlash() {
    if (G.hurtFlash <= 0) return;
    ctx.fillStyle = 'rgba(150,30,40,' + (G.hurtFlash * 0.32).toFixed(3) + ')';
    ctx.fillRect(0, 0, viewW, viewH);
  }

  function drawHeart(x, y, s, filled) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.62);
    ctx.bezierCurveTo(x - s * 1.2, y - s * 0.12, x - s * 0.62, y - s * 1.02, x, y - s * 0.34);
    ctx.bezierCurveTo(x + s * 0.62, y - s * 1.02, x + s * 1.2, y - s * 0.12, x, y + s * 0.62);
    ctx.closePath();
    if (filled) {
      ctx.fillStyle = '#e07a63';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,215,185,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,220,190,0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawHUD(th) {
    ctx.save();
    ctx.textBaseline = 'middle';

    const phone = viewW < 620;
    const hx = (phone ? 20 : 28) + safe.l;
    const hy = (phone ? 27 : 30) + safe.t;
    const hs = phone ? 8 : 9;
    const step = phone ? 21 : 23;
    for (let i = 0; i < G.maxHearts; i++) {
      drawHeart(hx + i * step, hy, hs, i < G.hearts);
    }

    const ox = (phone ? 20 : 26) + safe.l;
    const oy = (phone ? 49 : 55) + safe.t;
    const ow = phone ? 92 : 108;
    const oh = 7;
    ctx.fillStyle = 'rgba(10,8,14,0.55)';
    roundRect(ctx, ox - 2, oy - 2, ow + 4, oh + 4, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, ox, oy, ow, oh, 3.5);
    ctx.fill();
    if (G.oil > 0.001) {
      const grad = ctx.createLinearGradient(ox, 0, ox + ow, 0);
      grad.addColorStop(0, '#c98a45');
      grad.addColorStop(1, '#ffcf87');
      ctx.fillStyle = grad;
      roundRect(ctx, ox, oy, Math.max(3, ow * G.oil), oh, 3.5);
      ctx.fill();
    }

    // tea leaf icon + count
    const ty = oy + 23;
    ctx.save();
    ctx.translate(ox + 3, ty);
    ctx.rotate(-0.45);
    ctx.fillStyle = '#86ac6d';
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.bezierCurveTo(-8, 2, -6, -6, 0, -8);
    ctx.bezierCurveTo(6, -6, 8, 2, 0, 7);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(242,228,205,0.85)';
    ctx.font = '600 13px ' + FONT_UI;
    ctx.textAlign = 'left';
    ctx.fillText('x ' + G.tea, ox + 18, ty);

    if (phone) {
      ctx.textAlign = 'right';
      ctx.font = '600 9.5px ' + FONT_UI;
      ctx.letterSpacing = '2px';
      ctx.fillStyle = 'rgba(240,226,200,0.55)';
      ctx.fillText('FLOOR ' + G.floor, viewW - 18 - safe.r, 26 + safe.t);
      ctx.letterSpacing = '0px';
    } else {
      ctx.textAlign = 'center';
      ctx.font = '600 11px ' + FONT_UI;
      ctx.letterSpacing = '3px';
      ctx.fillStyle = 'rgba(240,226,200,0.62)';
      ctx.fillText('FLOOR ' + G.floor + ' · ' + th.name.toUpperCase(), viewW / 2, 27 + safe.t);
      ctx.letterSpacing = '0px';
    }

    drawMinimap();
    const prompt = isTouch ? null : promptText();
    drawPrompt(prompt);
    drawMessages((prompt ? 46 : 0) + (isTouch ? 150 : 0) + safe.b);
    ctx.restore();
  }

  function drawMinimap() {
    if (viewW < 760) return;
    const cell = 3;
    const mw = W * cell;
    const mh = H * cell;
    const pad = 7;
    const x = viewW - mw - pad * 2 - 16 - safe.r;
    const y = 16 + safe.t;

    ctx.save();
    ctx.fillStyle = 'rgba(9,7,15,0.55)';
    roundRect(ctx, x - pad, y - pad, mw + pad * 2, mh + pad * 2, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,235,205,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    for (let ty = 0; ty < H; ty++) {
      for (let tx = 0; tx < W; tx++) {
        const i = ty * W + tx;
        if (!G.explored[i]) continue;
        ctx.fillStyle = G.tiles[i] === FLOOR
          ? 'rgba(240,215,180,0.26)'
          : 'rgba(255,255,255,0.045)';
        ctx.fillRect(x + tx * cell, y + ty * cell, cell, cell);
      }
    }

    const dot = (tx, ty, color) => {
      if (!G.explored[ty * W + tx]) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + tx * cell + cell / 2, y + ty * cell + cell / 2, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    if (G.fire) dot(G.fire.x, G.fire.y, 'rgba(255,170,90,0.95)');
    if (G.stairs) dot(G.stairs.x, G.stairs.y, 'rgba(255,215,140,0.95)');
    if (G.sun) dot(G.sun.x, G.sun.y, 'rgba(255,240,190,0.95)');

    const p = G.player;
    ctx.fillStyle = '#fff3dc';
    ctx.beginPath();
    ctx.arc(x + p.px * cell + cell / 2, y + p.py * cell + cell / 2, 2.3 + Math.sin(G.time * 3) * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPrompt(text) {
    if (!text) return;

    ctx.font = '600 12px ' + FONT_UI;
    ctx.textAlign = 'center';
    const w = ctx.measureText(text).width + 24;
    const bx = viewW / 2 - w / 2;
    const by = viewH - 74;

    ctx.fillStyle = 'rgba(10,8,16,0.82)';
    roundRect(ctx, bx, by, w, 25, 12.5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,170,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,236,205,0.96)';
    ctx.fillText(text, viewW / 2, by + 13);
  }

  function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawMessages(offset) {
    ctx.textAlign = 'center';
    ctx.font = (viewW < 620 ? '14px ' : '15px ') + FONT_SERIF;
    const base = viewH - 58 - (offset || 0);
    const maxW = Math.min(viewW - 44, 620);

    const rows = [];
    for (const m of G.messages) {
      const age = m.max - m.life;
      const alpha = Math.min(1, age * 5) * Math.min(1, m.life * 1.4);
      for (const line of wrapText(m.text, maxW)) rows.push({ line, alpha });
    }

    for (let i = 0; i < rows.length; i++) {
      const y = base - (rows.length - 1 - i) * 21;
      ctx.globalAlpha = rows[i].alpha;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillText(rows[i].line, viewW / 2 + 1, y + 1);
      ctx.fillStyle = 'rgba(246,232,208,0.95)';
      ctx.fillText(rows[i].line, viewW / 2, y);
    }
    ctx.globalAlpha = 1;
  }

  function drawFade() {
    if (G.fade <= 0) return;
    ctx.fillStyle = 'rgba(4,3,7,' + clamp(G.fade, 0, 1).toFixed(3) + ')';
    ctx.fillRect(0, 0, viewW, viewH);
  }

  // ---------------------------------------------------------------- input

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'arrowup' || k === 'arrowdown' || k === 'arrowleft' || k === 'arrowright') {
      e.preventDefault();
    }
    if (e.repeat) return;

    if (k === 'm') { toggleMute(); return; }

    if (G.scene === 'title') {
      if (k === 'enter' || k === ' ') begin();
      return;
    }
    if (G.scene !== 'playing') return;

    if (k === 'e') { drinkTea(); return; }
    if (k === ' ') { interact(); return; }

    const dir = MOVE_KEYS[k];
    if (dir && G.fade === 0) {
      G.keys[k] = true;
      G.hold = 0;
      tryMove(dir[0], dir[1]);
    }
  });

  window.addEventListener('keyup', (e) => {
    G.keys[e.key.toLowerCase()] = false;
  });

  window.addEventListener('blur', () => { G.keys = {}; });

  document.getElementById('begin').addEventListener('click', begin);

  document.getElementById('wander').addEventListener('click', () => {
    endingEl.classList.add('hidden');
    G.scene = 'playing';
    G.startedAt = performance.now();
    loadFloor(G.floor + 1);
    syncTouchUI();
  });

  document.getElementById('again').addEventListener('click', () => {
    endingEl.classList.add('hidden');
    G.scene = 'playing';
    G.urlSeed = false;
    newRun(false);
    syncTouchUI();
  });

  // ---------------------------------------------------------------- touch

  if (touchEl) {
    const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

    touchEl.querySelectorAll('[data-move]').forEach((btn) => {
      const name = btn.dataset.move;
      const [dx, dy] = dirs[name];

      const down = (e) => {
        e.preventDefault();
        try { btn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        G.touch[name] = true;
        G.hold = 0;
        btn.classList.add('pressed');
        tryMove(dx, dy);
      };
      const up = () => {
        G.touch[name] = false;
        btn.classList.remove('pressed');
      };

      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('lostpointercapture', up);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    const tap = (btn, fn) => {
      if (!btn) return;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        btn.classList.add('pressed');
        fn();
      });
      const up = () => btn.classList.remove('pressed');
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('pointerleave', up);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    };

    tap(touchTea, drinkTea);
    tap(touchUse, interact);
  }

  document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });

  // ---------------------------------------------------------------- boot

  const params = new URLSearchParams(window.location.search);
  const seedParam = parseInt(params.get('seed'), 10);
  if (Number.isFinite(seedParam) && seedParam > 0) {
    G.seed = seedParam;
    G.urlSeed = true;
  }

  window.addEventListener('resize', resize);
  resize();
  syncTouchUI();

  if (window.location.hash === '#play' || params.get('play') === '1') {
    setTimeout(begin, 80);
  }

  let last = 0;
  function frame(now) {
    if (!last) last = now;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    G.time += dt;
    if (G.scene === 'playing') update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
