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
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.imageSmoothingQuality = 'high';
  const lightCanvas = document.createElement('canvas');
  const lctx = lightCanvas.getContext('2d');

  const shadowSprite = document.createElement('canvas');
  shadowSprite.width = 64;
  shadowSprite.height = 64;
  const shadowCtx = shadowSprite.getContext('2d');
  const shadowGrad = shadowCtx.createRadialGradient(32, 32, 2, 32, 32, 31);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.42)');
  shadowGrad.addColorStop(0.55, 'rgba(0,0,0,0.2)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  shadowCtx.fillStyle = shadowGrad;
  shadowCtx.fillRect(0, 0, 64, 64);

  function drawShadow(x, y, rx, ry) {
    ctx.drawImage(shadowSprite, x - rx, y - ry, rx * 2, ry * 2);
  }

  const titleEl = document.getElementById('title');
  const endingEl = document.getElementById('ending');
  const statsEl = document.getElementById('stats');
  const touchEl = document.getElementById('touch');
  const touchTea = document.getElementById('touch-tea');
  const touchUse = document.getElementById('touch-use');
  const petDialog = document.getElementById('pet-dialog');
  const petKicker = document.getElementById('pet-kicker');
  const petTitle = document.getElementById('pet-title');
  const petText = document.getElementById('pet-text');
  const petYes = document.getElementById('pet-yes');
  const petNo = document.getElementById('pet-no');
  const fireDialog = document.getElementById('fire-dialog');
  const fireStock = document.getElementById('fire-stock');
  const fireRest = document.getElementById('fire-rest');
  const fireClose = document.getElementById('fire-close');
  const brewNote = document.getElementById('brew-note');
  const shopDialog = document.getElementById('shop-dialog');
  const shopBalance = document.getElementById('shop-balance');
  const shopList = document.getElementById('shop-list');
  const shopClose = document.getElementById('shop-close');
  const favorDialog = document.getElementById('favor-dialog');
  const favorTitle = document.getElementById('favor-title');
  const favorText = document.getElementById('favor-text');
  const favorBar = document.getElementById('favor-bar');
  const favorReward = document.getElementById('favor-reward');
  const favorClaim = document.getElementById('favor-claim');
  const favorClose = document.getElementById('favor-close');
  const metaDialog = document.getElementById('meta-dialog');
  const metaBalance = document.getElementById('meta-balance');
  const metaList = document.getElementById('unlock-list');
  const metaNote = document.getElementById('meta-note');
  const metaClose = document.getElementById('meta-close');
  const sunroomTitle = document.getElementById('sunroom-title');
  const sunroomEnd = document.getElementById('sunroom-end');
  const brewButtons = Array.from(document.querySelectorAll('[data-brew]'));
  const isTouch =
    window.matchMedia('(pointer: coarse)').matches ||
    (navigator.maxTouchPoints || 0) > 0;
  const safe = { t: 0, r: 0, b: 0, l: 0 };

  const THEMES = [
    { name: 'The Root Cellars',     bg: '#0c0911', floorA: '#4c3c38', floorB: '#52423d', floorC: '#57463f', wallA: '#241b26', wallB: '#3a2c38', moss: '#6e7d52', glow: '#ffb46b' },
    { name: 'The Mossy Stair',      bg: '#080f0c', floorA: '#3f4c40', floorB: '#445245', floorC: '#495849', wallA: '#1c2822', wallB: '#304136', moss: '#8aa869', glow: '#ffd08a' },
    { name: 'The Tea Vault',        bg: '#100b0a', floorA: '#4c3c36', floorB: '#524139', floorC: '#57453d', wallA: '#2a1e1e', wallB: '#41312f', moss: '#9a8a55', glow: '#ffc07a' },
    { name: 'The Glowworm Gallery', bg: '#080a12', floorA: '#373d4f', floorB: '#3c4355', floorC: '#41485a', wallA: '#1c2030', wallB: '#30364a', moss: '#6d8b98', glow: '#9fd8ff' },
    { name: 'The Sunroom',          bg: '#120d07', floorA: '#5c4a36', floorB: '#634f3a', floorC: '#69543e', wallA: '#33261a', wallB: '#4d3a27', moss: '#b4a466', glow: '#ffe6a0' }
  ];

  const CHARM_INFO = {
    wide: { name: 'Wide glow', desc: '+15% lantern light' },
    warm: { name: 'Warm light', desc: 'soothes can count double' },
    seeker: { name: 'Seeker light', desc: 'nearby items glimmer' }
  };

  const BREWS = {
    hearty: { tea: 2, herbs: 1, oil: 0, effect: '+2 hearts' },
    swift: { tea: 1, herbs: 1, oil: 0, effect: '20s speed' },
    bright: { tea: 1, herbs: 2, oil: 0.12, effect: '60s bright light' }
  };

  const SHOP_ITEMS = {
    tea: { name: 'Tea leaves', desc: '+1 tea leaf', price: 2 },
    oil: { name: 'Lantern oil', desc: '+35% oil', price: 3 },
    herb: { name: 'Bitterleaf', desc: '+1 brewing herb', price: 2 },
    treat: { name: 'Honey biscuit', desc: '+1 heart · happy pet', price: 4 },
    charm: { name: 'Mystery charm', desc: 'one you do not own', price: 8 },
    map: { name: 'Map fragment', desc: 'reveal stairs & set piece', price: 6 }
  };

  const META_KEY = 'lantern-hollow-meta-v1';

  const DEFAULT_META = {
    sunmotes: 0,
    unlocks: { tea: false, charm: false, heart: false, collar: false },
    journal: { pets: {}, grumbles: {}, items: {}, charms: {}, floors: {}, bosses: {}, recipes: {} },
    home: { slots: { rug: null, lamp: null, plant: null }, decor: [] },
    settings: { music: 0.75, sfx: 0.75, shake: true, reduceMotion: false, tapMove: false }
  };

  const UNLOCKS = {
    tea: { name: "Traveler's kettle", desc: 'Begin each run with 2 tea', cost: 6 },
    charm: { name: 'Lucky charm', desc: 'Begin with a random charm', cost: 10 },
    heart: { name: 'Warm welcome', desc: 'Begin with +1 max heart', cost: 12 },
    collar: { name: 'Collar dyes', desc: 'A soft teal collar for your pet', cost: 8 }
  };

  const PET_LABEL = {
    fox: 'fox',
    squirrel: 'squirrel',
    cat: 'cat',
    dog: 'dog',
    bear: 'bear cub'
  };

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
    herbs: 0,
    oil: 1,
    haste: 0,
    bright: 0,
    charms: { wide: false, warm: false, seeker: false },
    chests: [],
    setPiece: null,
    boss: null,
    bathUsed: false,
    secret: null,
    buttons: 0,
    merchant: null,
    favorBoard: null,
    favor: null,
    shopStock: null,
    meta: null,
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
    touch: { up: false, down: false, left: false, right: false },
    pet: null,
    floorPet: null,
    petTrail: [],
    petNameTimer: 0,
    dialog: null
  };

  let viewW = 0;
  let viewH = 0;
  let dpr = 1;
  let audioCtx = null;
  let masterGain = null;
  let musicBus = null;
  let musicDelay = null;
  let musicTimer = null;
  let musicNext = 0;
  let musicStep = 0;

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
      masterGain.gain.value = G.muted ? 0 : 0.65;
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
    quip() { tone(880, 0.07, 'sine', 0.022); },
    haste() { tone(660, 0.12, 'triangle', 0.04); tone(880, 0.16, 'triangle', 0.034, 0.06); tone(1320, 0.32, 'sine', 0.024, 0.12); },
    hasteEnd() { tone(440, 0.35, 'sine', 0.03, 0, 330); },
    huff() { tone(190, 0.16, 'triangle', 0.03, 0, 130); },
    pet() { tone(660, 0.1, 'triangle', 0.04); tone(880, 0.14, 'triangle', 0.03, 0.07); tone(1180, 0.22, 'sine', 0.02, 0.14); },
    charm() { tone(784, 0.16, 'triangle', 0.045); tone(1046, 0.22, 'sine', 0.035, 0.08); tone(1318, 0.4, 'sine', 0.022, 0.16); },
    brew() { tone(392, 0.3, 'sine', 0.03); tone(523, 0.4, 'triangle', 0.025, 0.08); tone(659, 0.5, 'sine', 0.02, 0.16); },
    crumble() { tone(80, 0.5, 'sawtooth', 0.05, 0, 45); tone(120, 0.4, 'triangle', 0.035, 0.05, 60); },
    lunge() { tone(250, 0.22, 'sawtooth', 0.024, 0, 160); }
  };

  // ---------------------------------------------------------------- music

  // Fmaj7 · Cmaj7 · Dm7 · Bbmaj7 — a slow, warm loop in F major
  const MUSIC_CHORDS = [
    [174.61, 220.00, 261.63, 329.63],
    [130.81, 164.81, 196.00, 246.94],
    [146.83, 174.61, 220.00, 261.63],
    [116.54, 146.83, 174.61, 220.00]
  ];
  const MUSIC_SCALE = [349.23, 392.00, 440.00, 523.25, 587.33, 698.46];

  function musicVoice(freq, at, dur, vol, type, echo) {
    if (!audioCtx || !musicBus) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, at);
    osc.detune.setValueAtTime((Math.random() - 0.5) * 4, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(vol, at + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(gain);
    gain.connect(musicBus);
    if (echo && musicDelay) gain.connect(musicDelay);
    osc.start(at);
    osc.stop(at + dur + 0.1);
  }

  function scheduleMusicBar(at, step) {
    const chord = MUSIC_CHORDS[step % MUSIC_CHORDS.length];
    for (const f of chord) musicVoice(f, at, 4.4, 0.05, 'sine', false);
    musicVoice(chord[0] / 2, at, 4.4, 0.06, 'sine', false);

    for (const t of [at + 0.7, at + 2.5]) {
      if (Math.random() < 0.42) continue;
      const f = MUSIC_SCALE[Math.floor(Math.random() * MUSIC_SCALE.length)];
      musicVoice(f, t, 2.4, 0.055, 'triangle', true);
    }

    if (step % 4 === 2) musicVoice(1046.5, at + 3.1, 2.8, 0.02, 'sine', true);
  }

  function musicTick() {
    if (!audioCtx || !musicBus) return;
    if (musicNext < audioCtx.currentTime) musicNext = audioCtx.currentTime + 0.1;
    while (musicNext < audioCtx.currentTime + 2.2) {
      scheduleMusicBar(musicNext, musicStep);
      musicNext += 4;
      musicStep++;
    }
  }

  function startMusic() {
    if (!audioCtx || musicTimer) return;
    if (!musicBus) {
      musicBus = audioCtx.createGain();
      musicBus.gain.value = 0.85;
      musicBus.connect(masterGain);
    }
    if (!musicDelay) {
      musicDelay = audioCtx.createDelay(1);
      musicDelay.delayTime.value = 0.32;
      const feedback = audioCtx.createGain();
      feedback.gain.value = 0.22;
      const wet = audioCtx.createGain();
      wet.gain.value = 0.3;
      musicDelay.connect(feedback);
      feedback.connect(musicDelay);
      musicDelay.connect(wet);
      wet.connect(musicBus);
    }
    if (audioCtx.state !== 'running') audioCtx.resume();
    musicStep = 0;
    musicNext = audioCtx.currentTime + 0.25;
    musicTimer = setInterval(musicTick, 500);
    musicTick();
  }

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
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
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
        if (G.secret && !G.secret.opened && !G.secret.revealed) {
          const sr = G.secret.room;
          if (x >= sr.x && x < sr.x + sr.w && y >= sr.y && y < sr.y + sr.h) continue;
        }
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r * r) G.explored[y * W + x] = 1;
      }
    }
  }

  function lightTiles() {
    let r = 2.1 + G.oil * 2.5;
    if (G.bright > 0) r *= 1.35;
    if (G.charms.wide) r *= 1.15;
    return r;
  }

  function reveal() {
    const p = G.player;
    revealAround(p.px, p.py, lightTiles() + 1.1);
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
    G.floorPet = world.pet
      ? { ...world.pet, phase: Math.random() * Math.PI * 2 }
      : null;
    G.secret = world.secret
      ? {
          ...world.secret,
          opened: false,
          revealed: false,
          wall: { ...world.secret.wall },
          room: { ...world.secret.room },
          chest: { ...world.secret.chest },
          approach: { ...world.secret.approach }
        }
      : null;
    const chests = [];
    if (world.chest) chests.push({ ...world.chest, phase: Math.random() * Math.PI * 2 });
    if (world.secret && world.secret.chest) {
      chests.push({ ...world.secret.chest, secret: true, phase: Math.random() * Math.PI * 2 });
    }
    G.chests = chests;
    G.setPiece = world.setPiece
      ? {
          ...world.setPiece,
          seen: false,
          focus: world.setPiece.focus
            ? { ...world.setPiece.focus, used: false }
            : null
        }
      : null;
    G.boss = world.setPiece && world.setPiece.boss
      ? {
          ...world.setPiece.boss,
          mood: 3,
          done: false,
          phase: Math.random() * Math.PI * 2
        }
      : null;
    G.bathUsed = false;
    G.favorBoard = world.favorBoard ? { ...world.favorBoard } : null;
    G.merchant = world.merchant
      ? {
          ...world.merchant,
          stock: { tea: 2, oil: 1, herb: 2, treat: 1, charm: 1, map: 1 }
        }
      : null;
    G.shopStock = G.merchant ? G.merchant.stock : null;

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
      phase: Math.random() * Math.PI * 2,
      awake: e.kind !== 'mope',
      alertT: 0,
      justLunged: false,
      dir: Math.random() < 0.5 ? [1, 0] : [0, 1]
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
    G.petTrail = [{ x: st.x, y: st.y }];
    if (G.pet) {
      G.pet.px = st.x - 0.65;
      G.pet.py = st.y + 0.55;
      G.pet.face = 1;
      G.pet.moving = 0;
      G.petNameTimer = 2.6;
    }
    G.invuln = 1.4;
    G.bumpLock = 0;
    G.hold = 0;

    revealAround(st.x, st.y, 5);
    snapCamera();
    toast(n === 5 ? 'The Sunroom · follow the warm light' : theme().name + ' · find the staircase');
    if (G.pet && n > 1) toast(G.pet.name + ' pads down the stairs beside you.');
    if (n === 1) {
      toast(isTouch ? 'Pad to walk · TEA heals · USE rests' : 'WASD to wander · Space to rest');
    }
  }

  function newRun(keepSeed) {
    if (!keepSeed) G.seed = (Math.random() * 2147483647) | 0;
    G.hearts = 3;
    G.maxHearts = 4;
    G.tea = 0;
    G.herbs = 0;
    G.oil = 1;
    G.haste = 0;
    G.bright = 0;
    G.charms = { wide: false, warm: false, seeker: false };
    G.chests = [];
    G.setPiece = null;
    G.boss = null;
    G.bathUsed = false;
    G.secret = null;
    G.buttons = 0;
    G.merchant = null;
    G.favorBoard = null;
    G.shopStock = null;
    G.favor = newFavor();
    G.pet = null;
    G.floorPet = null;
    G.petTrail = [];
    G.petNameTimer = 0;
    G.dialog = null;
    if (petDialog) petDialog.classList.add('hidden');
    if (fireDialog) fireDialog.classList.add('hidden');
    if (shopDialog) shopDialog.classList.add('hidden');
    if (favorDialog) favorDialog.classList.add('hidden');
    if (metaDialog) metaDialog.classList.add('hidden');
    if (G.meta) {
      if (G.meta.unlocks.tea) G.tea += 2;
      if (G.meta.unlocks.heart) {
        G.maxHearts = 5;
        G.hearts = 4;
      }
      if (G.meta.unlocks.charm) {
        const keys = Object.keys(CHARM_INFO);
        G.charms[keys[Math.floor(Math.random() * keys.length)]] = true;
      }
    }
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
    if (audioCtx && audioCtx.state !== 'running') audioCtx.resume();
    startMusic();
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
    G.petTrail = [{ x: spot.x, y: spot.y }];
    if (G.pet) {
      G.pet.px = spot.x + 0.6;
      G.pet.py = spot.y + 0.5;
      G.pet.moving = 0;
    }
    snapCamera();
    toast('You wake by the fire, a little wiser. No harm done.');
  }

  function descend() {
    if (G.scene !== 'playing' || G.fade > 0 || !G.stairs) return;
    const p = G.player;
    if (p.tx !== G.stairs.x || p.ty !== G.stairs.y) return;
    advanceFavor('descend');
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
    const reward = 3 + Math.floor(G.soothed / 5);
    awardSunmotes(reward);
    statsEl.innerHTML =
      '<div><dt>Floors wandered</dt><dd>' + G.floor + '</dd></div>' +
      '<div><dt>Grumbles soothed</dt><dd>' + G.soothed + '</dd></div>' +
      '<div><dt>Steps taken</dt><dd>' + G.steps + '</dd></div>' +
      '<div><dt>Time underground</dt><dd>' + mins + ':' + secs + '</dd></div>' +
      '<div><dt>Sunmotes</dt><dd>+' + reward + '</dd></div>';
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
    if (G.floorPet && G.floorPet.x === x && G.floorPet.y === y) return false;
    if (G.chests.some((c) => c.x === x && c.y === y)) return false;
    if (G.setPiece && G.setPiece.focus && G.setPiece.focus.x === x && G.setPiece.focus.y === y) return false;
    if (G.boss && G.boss.x === x && G.boss.y === y) return false;
    if (G.favorBoard && G.favorBoard.x === x && G.favorBoard.y === y) return false;
    if (G.merchant && G.merchant.x === x && G.merchant.y === y) return false;
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

  function stepDuration() {
    return G.haste > 0 ? 0.075 : 0.14;
  }

  function stepCooldown() {
    return G.haste > 0 ? 0.08 : 0.15;
  }

  function tryMove(dx, dy) {
    const p = G.player;
    if (G.scene !== 'playing' || G.fade > 0 || p.moving > 0 || G.bumpLock > 0) return;
    if (dx < 0) p.facing = -1;
    else if (dx > 0) p.facing = 1;

    const nx = p.tx + dx;
    const ny = p.ty + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;

    if (G.secret && !G.secret.opened &&
        G.secret.wall.x === nx && G.secret.wall.y === ny) {
      openSecretWall();
      return;
    }

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

    if (G.chests.some((c) => c.x === nx && c.y === ny)) {
      G.bumpLock = 0.4;
      return;
    }
    if (G.setPiece && G.setPiece.focus && G.setPiece.focus.x === nx && G.setPiece.focus.y === ny) {
      G.bumpLock = 0.4;
      return;
    }
    if (G.boss && G.boss.x === nx && G.boss.y === ny) {
      G.bumpLock = 0.4;
      return;
    }
    if (G.favorBoard && G.favorBoard.x === nx && G.favorBoard.y === ny) {
      G.bumpLock = 0.4;
      return;
    }
    if (G.merchant && G.merchant.x === nx && G.merchant.y === ny) {
      G.bumpLock = 0.4;
      return;
    }
    if (G.floorPet && G.floorPet.x === nx && G.floorPet.y === ny) {
      G.bumpLock = 0.4;
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
    p.stepDur = stepDuration();
    G.hold = stepCooldown();
    G.steps++;
  }

  function arrive() {
    const p = G.player;
    pickup();
    stepDust(p.px * TS + TS / 2, p.py * TS + TS / 2 + 12);

    if (G.setPiece) {
      const sp = G.setPiece;
      const r = sp.room;
      if (!sp.seen && p.tx >= r.x && p.tx < r.x + r.w && p.ty >= r.y && p.ty < r.y + r.h) {
        sp.seen = true;
        toast(sp.name);
      }
      if (sp.type === 'bath' && !G.bathUsed && sp.water.some((w) => w.x === p.tx && w.y === p.ty)) {
        if (G.hearts < G.maxHearts) {
          G.bathUsed = true;
          G.hearts++;
          toast('The warm water loosens the day · +1 heart');
          burst(p.px * TS + TS / 2, p.py * TS + TS / 2, '#a9dce8', 14);
          sfx.rest();
        }
      }
    }

    if (G.pet) {
      const p = G.player;
      const trail = G.petTrail;
      const last = trail[trail.length - 1];
      if (!last || last.x !== p.tx || last.y !== p.ty) {
        trail.push({ x: p.tx, y: p.ty });
        if (trail.length > 40) trail.shift();
      }
    }
  }

  function pickup() {
    const p = G.player;
    const i = G.items.findIndex((it) => it.x === p.tx && it.y === p.ty);
    if (i < 0) return;
    const it = G.items[i];
    const cx = it.x * TS + TS / 2;
    const cy = it.y * TS + TS / 2;

    // a red potion waits for you rather than being wasted at full health
    if (it.type === 'potion' && G.hearts >= G.maxHearts) {
      toast('A red potion. Save it for when you are hurt.');
      sfx.quip();
      return;
    }

    G.items.splice(i, 1);

    if (it.type === 'leaf') {
      G.tea++;
      toast('Tea leaf · ' + G.tea + ' in your pocket');
    } else if (it.type === 'oil') {
      G.oil = Math.min(1, G.oil + 0.45);
      toast('Lantern oil · the flame steadies');
    } else if (it.type === 'potion') {
      const before = G.hearts;
      G.hearts = Math.min(G.maxHearts, G.hearts + 2);
      const gained = G.hearts - before;
      toast('Red potion · +' + gained + (gained === 1 ? ' heart' : ' hearts'));
    } else if (it.type === 'haste') {
      G.haste = 15;
      toast('Windflower · double speed for 15 seconds');
      sfx.haste();
    } else if (it.type === 'herb') {
      G.herbs++;
      advanceFavor('herbs');
      toast('Bitterleaf · ' + G.herbs + ' in your satchel');
    } else if (G.hearts < G.maxHearts) {
      G.hearts++;
      toast('Warm mushroom · +1 heart');
    } else {
      toast('A warm mushroom. You are already full of soup.');
    }

    sfx.pickup();
    const colors = {
      leaf: '#9fd4a0',
      oil: '#ffd08a',
      potion: '#ff8f8f',
      haste: '#9fe0d0',
      herb: '#d8d98a',
      mushroom: '#e8a58e'
    };
    burst(cx, cy, colors[it.type] || '#f0d9a4', 12);
  }

  function soothe(foe) {
    const timed = foe.alertT > 0;
    let dmg = timed ? 2 : 1;
    if (G.charms.warm && Math.random() < 0.25) dmg++;
    foe.grump -= dmg;
    foe.alertT = 0;
    foe.justLunged = false;
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
      G.buttons++;
      advanceFavor('soothe');
      burst(cx, cy, '#a9d8a7', 18);
      burst(cx, cy - 8, '#f6e2b8', 8);
      toast(timed
        ? 'A perfectly timed kindness. It sighs and wanders off.'
        : 'The grumble sighs, leaves you a tea leaf, and wanders off.');
      maybeDrop(foe);
      sfx.soothe();
    } else {
      burst(cx, cy, '#f3d9a4', 7);
      toast(timed
        ? 'A perfectly timed kindness · it softens double.'
        : foe.grump === 1
          ? 'Almost soothed. One more bonk of kindness.'
          : 'The grumble softens a little.');
      sfx.quip();
    }
  }

  function maybeDrop(foe) {
    if (Math.random() > 0.2) return;
    if (G.items.some((it) => it.x === foe.tx && it.y === foe.ty)) return;
    if (G.fire && G.fire.x === foe.tx && G.fire.y === foe.ty) return;
    const type = Math.random() < 0.6 ? 'potion' : 'haste';
    G.items.push({ x: foe.tx, y: foe.ty, type, phase: Math.random() * Math.PI * 2 });
    burst(foe.tx * TS + TS / 2, foe.ty * TS + TS / 2,
      type === 'potion' ? '#ff8f8f' : '#9fe0d0', 10);
    toast(type === 'potion'
      ? 'Something red glints where it sat.'
      : 'A windflower drifts down.');
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
    if (G.floorPet && Math.abs(p.tx - G.floorPet.x) + Math.abs(p.ty - G.floorPet.y) <= 1) {
      return 'Space · meet ' + G.floorPet.name;
    }
    const chest = G.chests.find((c) => Math.abs(p.tx - c.x) + Math.abs(p.ty - c.y) <= 1);
    if (chest) return 'Space · open chest';
    if (G.setPiece && G.setPiece.focus && !G.setPiece.focus.used &&
        Math.abs(p.tx - G.setPiece.focus.x) + Math.abs(p.ty - G.setPiece.focus.y) <= 1) {
      const type = G.setPiece.focus.type;
      return 'Space · ' + (type === 'desk' ? 'read the ledger' : type === 'teapot' ? 'pour a cup' : 'gather herbs');
    }
    if (G.boss && !G.boss.done &&
        Math.abs(p.tx - G.boss.x) + Math.abs(p.ty - G.boss.y) <= 1) {
      return 'Space · offer tea';
    }
    if (G.fire && Math.abs(p.tx - G.fire.x) + Math.abs(p.ty - G.fire.y) <= 1) return 'Space · campfire';
    if (G.favorBoard && Math.abs(p.tx - G.favorBoard.x) + Math.abs(p.ty - G.favorBoard.y) <= 1) {
      return 'Space · request board';
    }
    if (G.merchant && Math.abs(p.tx - G.merchant.x) + Math.abs(p.ty - G.merchant.y) <= 1) {
      return "Space · visit Pip's cart";
    }
    return null;
  }

  function interact() {
    if (G.scene !== 'playing' || G.fade > 0) return;
    const p = G.player;
    if (G.sun && p.tx === G.sun.x && p.ty === G.sun.y) { finish(); return; }
    if (G.stairs && p.tx === G.stairs.x && p.ty === G.stairs.y) { descend(); return; }
    if (G.floorPet && Math.abs(p.tx - G.floorPet.x) + Math.abs(p.ty - G.floorPet.y) <= 1) {
      openPetDialog();
      return;
    }
    const chest = G.chests.find((c) => Math.abs(p.tx - c.x) + Math.abs(p.ty - c.y) <= 1);
    if (chest) { openChest(chest); return; }
    if (G.setPiece && G.setPiece.focus && !G.setPiece.focus.used &&
        Math.abs(p.tx - G.setPiece.focus.x) + Math.abs(p.ty - G.setPiece.focus.y) <= 1) {
      useSetPieceFocus();
      return;
    }
    if (G.boss && !G.boss.done &&
        Math.abs(p.tx - G.boss.x) + Math.abs(p.ty - G.boss.y) <= 1) {
      offerBossTea();
      return;
    }
    if (G.fire && Math.abs(p.tx - G.fire.x) + Math.abs(p.ty - G.fire.y) <= 1) {
      openFireDialog();
      return;
    }
    if (G.favorBoard && Math.abs(p.tx - G.favorBoard.x) + Math.abs(p.ty - G.favorBoard.y) <= 1) {
      openFavorDialog();
      return;
    }
    if (G.merchant && Math.abs(p.tx - G.merchant.x) + Math.abs(p.ty - G.merchant.y) <= 1) {
      openShopDialog();
      return;
    }
    toast('A quiet corner. Nothing to do but breathe.');
  }

  function toggleMute() {
    G.muted = !G.muted;
    if (masterGain) masterGain.gain.value = G.muted ? 0 : 0.65;
    if (G.scene === 'playing') toast(G.muted ? 'Sound off' : 'Sound on');
  }

  function newFavor() {
    const pool = [
      { kind: 'soothe', target: 3, title: 'A gentler hollow', text: 'Soothe three grumbles.' },
      { kind: 'herbs', target: 3, title: 'A pinch of bitterleaf', text: 'Gather three bitterleaf herbs.' },
      { kind: 'chest', target: 1, title: 'A little treasure', text: 'Open a treasure chest.' },
      { kind: 'pet', target: 1, title: 'A new friend', text: 'Meet a companion.' },
      { kind: 'descend', target: 2, title: 'Deeper still', text: 'Reach the third floor.' }
    ];
    const f = pool[Math.floor(Math.random() * pool.length)];
    return {
      ...f,
      progress: 0,
      claimed: false,
      reward: { buttons: 5, tea: 2 }
    };
  }

  function advanceFavor(kind, amount) {
    const f = G.favor;
    if (!f || f.claimed || f.kind !== kind || f.progress >= f.target) return;
    const before = f.progress;
    f.progress = Math.min(f.target, f.progress + (amount || 1));
    if (before < f.target && f.progress >= f.target) {
      toast('Favor ready · claim it at the request board');
      sfx.quip();
    }
  }

  function mergeMeta(saved) {
    const out = JSON.parse(JSON.stringify(DEFAULT_META));
    if (!saved || typeof saved !== 'object') return out;
    if (Number.isFinite(saved.sunmotes)) out.sunmotes = Math.max(0, saved.sunmotes);
    if (saved.unlocks) Object.assign(out.unlocks, saved.unlocks);
    if (saved.settings) Object.assign(out.settings, saved.settings);
    if (saved.journal) Object.assign(out.journal, saved.journal);
    if (saved.home) {
      if (saved.home.slots) Object.assign(out.home.slots, saved.home.slots);
      if (Array.isArray(saved.home.decor)) out.home.decor = saved.home.decor;
    }
    return out;
  }

  function loadMeta() {
    try {
      const raw = localStorage.getItem(META_KEY);
      return mergeMeta(raw ? JSON.parse(raw) : null);
    } catch (err) {
      return mergeMeta(null);
    }
  }

  function saveMeta() {
    if (!G.meta) return;
    try {
      localStorage.setItem(META_KEY, JSON.stringify(G.meta));
    } catch (err) { /* private mode or full storage */ }
  }

  function awardSunmotes(amount) {
    if (!G.meta || !amount) return;
    G.meta.sunmotes += amount;
    saveMeta();
  }

  function openMetaDialog() {
    if (!metaDialog) return;
    G.dialog = { type: 'meta' };
    G.keys = {};
    G.touch = { up: false, down: false, left: false, right: false };
    if (metaNote) metaNote.textContent = '';
    renderMeta();
    metaDialog.classList.remove('hidden');
    syncTouchUI();
    try { metaClose.focus({ preventScroll: true }); } catch (err) { metaClose.focus(); }
  }

  function closeMetaDialog() {
    if (metaDialog) metaDialog.classList.add('hidden');
    G.dialog = null;
    syncTouchUI();
  }

  function renderMeta() {
    if (!metaList || !G.meta) return;
    if (metaBalance) metaBalance.textContent = String(G.meta.sunmotes);

    metaList.innerHTML = Object.keys(UNLOCKS).map((key) => {
      const item = UNLOCKS[key];
      const owned = !!G.meta.unlocks[key];
      const affordable = G.meta.sunmotes >= item.cost;
      return '<div class="shop-row' + (owned ? ' sold' : '') + '">' +
        '<div><div class="shop-item-name">' + item.name + '</div>' +
        '<div class="shop-item-desc">' + (owned ? 'Unlocked' : item.desc) + '</div></div>' +
        '<button type="button" class="shop-buy" data-unlock="' + key + '"' +
        (owned || !affordable ? ' disabled' : '') + '>' +
        (owned ? 'Owned' : item.cost + ' ✦') + '</button></div>';
    }).join('');

    metaList.querySelectorAll('[data-unlock]').forEach((btn) => {
      btn.addEventListener('click', () => buyUnlock(btn.dataset.unlock));
    });
  }

  function buyUnlock(key) {
    if (!G.meta || !UNLOCKS[key] || G.meta.unlocks[key]) return;
    const item = UNLOCKS[key];
    if (G.meta.sunmotes < item.cost) return;
    G.meta.sunmotes -= item.cost;
    G.meta.unlocks[key] = true;
    saveMeta();
    if (metaNote) metaNote.textContent = item.name + ' unlocked. It will apply at the start of your next run.';
    renderMeta();
    sfx.charm();
  }

  function openPetDialog() {
    if (!petDialog || !G.floorPet) return;
    G.dialog = { type: 'pet', pet: G.floorPet };
    G.keys = {};
    G.touch = { up: false, down: false, left: false, right: false };

    const next = G.floorPet;
    petKicker.textContent = G.pet ? 'a companion’s blessing' : 'a new friend';
    petTitle.textContent = next.name + ' the ' + (PET_LABEL[next.kind] || 'friend');
    if (G.pet) {
      petText.textContent =
        G.pet.name + ' sniffs ' + next.name + ', looks up at you, and nods. ' +
        'You can only keep one companion. Approve the swap?';
      petYes.textContent = 'Approve swap';
    } else {
      petText.textContent =
        next.name + ' has been waiting on a little cushion in the dark. ' +
        'Ask them to come along?';
      petYes.textContent = 'Adopt ' + next.name;
    }

    petDialog.classList.remove('hidden');
    syncTouchUI();
    try { petNo.focus({ preventScroll: true }); } catch (err) { petNo.focus(); }
    sfx.quip();
  }

  function closePetDialog() {
    if (petDialog) petDialog.classList.add('hidden');
    G.dialog = null;
    syncTouchUI();
  }

  function openFireDialog() {
    if (!fireDialog || !G.fire) return;
    G.dialog = { type: 'fire' };
    G.keys = {};
    G.touch = { up: false, down: false, left: false, right: false };
    fireDialog.classList.remove('hidden');
    if (brewNote) brewNote.textContent = '';
    updateFireDialog();
    syncTouchUI();
    try { fireClose.focus({ preventScroll: true }); } catch (err) { fireClose.focus(); }
  }

  function closeFireDialog() {
    if (fireDialog) fireDialog.classList.add('hidden');
    G.dialog = null;
    syncTouchUI();
  }

  function closeActiveDialog() {
    if (!G.dialog) return;
    if (G.dialog.type === 'fire') closeFireDialog();
    else if (G.dialog.type === 'shop') closeShopDialog();
    else if (G.dialog.type === 'favor') closeFavorDialog();
    else if (G.dialog.type === 'meta') closeMetaDialog();
    else closePetDialog();
  }

  function openShopDialog() {
    if (!shopDialog || !G.merchant) return;
    G.dialog = { type: 'shop' };
    G.keys = {};
    G.touch = { up: false, down: false, left: false, right: false };
    shopDialog.classList.remove('hidden');
    updateShopDialog();
    syncTouchUI();
    try { shopClose.focus({ preventScroll: true }); } catch (err) { shopClose.focus(); }
  }

  function closeShopDialog() {
    if (shopDialog) shopDialog.classList.add('hidden');
    G.dialog = null;
    syncTouchUI();
  }

  function updateShopDialog() {
    if (!shopBalance || !shopList || !G.merchant) return;
    shopBalance.textContent = G.buttons + ' button' + (G.buttons === 1 ? '' : 's');

    const allCharms = Object.keys(CHARM_INFO).every((k) => G.charms[k]);
    const keys = Object.keys(SHOP_ITEMS).filter((k) => k !== 'charm' || !allCharms);

    shopList.innerHTML = keys.map((key) => {
      const item = SHOP_ITEMS[key];
      const stock = G.merchant.stock[key] || 0;
      const sold = stock <= 0;
      const affordable = G.buttons >= item.price;
      return '<div class="shop-row' + (sold ? ' sold' : '') + '">' +
        '<div><div class="shop-item-name">' + item.name + '</div>' +
        '<div class="shop-item-desc">' + (sold ? 'sold out' : item.desc) + '</div></div>' +
        '<button type="button" class="shop-buy" data-buy="' + key + '"' +
        (sold || !affordable ? ' disabled' : '') + '>' +
        (sold ? '—' : item.price + ' b') + '</button></div>';
    }).join('');

    shopList.querySelectorAll('[data-buy]').forEach((btn) => {
      btn.addEventListener('click', () => buyShop(btn.dataset.buy));
    });
  }

  function revealMap() {
    const points = [];
    if (G.stairs) points.push(G.stairs);
    if (G.sun) points.push(G.sun);
    if (G.setPiece) points.push({ x: G.setPiece.room.cx, y: G.setPiece.room.cy });
    if (G.secret) {
      G.secret.revealed = true;
      points.push(G.secret.wall);
      points.push(G.secret.chest);
    }
    for (const p of points) revealAround(p.x, p.y, 4);
    toast('The map fills in · the way down, a set piece, and a cracked wall');
  }

  function buyShop(key) {
    if (!G.dialog || G.dialog.type !== 'shop' || !G.merchant) return;
    const item = SHOP_ITEMS[key];
    if (!item) return;
    const stock = G.merchant.stock[key] || 0;
    if (stock <= 0 || G.buttons < item.price) return;

    if (key === 'charm' && Object.keys(CHARM_INFO).every((k) => G.charms[k])) return;

    G.buttons -= item.price;
    G.merchant.stock[key] = stock - 1;

    if (key === 'tea') {
      G.tea++;
      toast('Pip tucks a tea leaf into your hand.');
    } else if (key === 'oil') {
      G.oil = Math.min(1, G.oil + 0.35);
      toast('Lantern oil · the flame steadies');
    } else if (key === 'herb') {
      G.herbs++;
      toast('Bitterleaf · +1 herb');
    } else if (key === 'treat') {
      if (G.hearts < G.maxHearts) G.hearts++;
      else G.tea++;
      G.petNameTimer = 3;
      if (G.pet) burst(G.pet.px * TS + TS / 2, G.pet.py * TS + TS / 2 - 8, '#ffd0c0', 12);
      toast('A honey biscuit · warm and sweet');
      sfx.soothe();
    } else if (key === 'charm') {
      const unowned = Object.keys(CHARM_INFO).filter((k) => !G.charms[k]);
      if (!unowned.length) return;
      const charm = unowned[Math.floor(Math.random() * unowned.length)];
      G.charms[charm] = true;
      toast('Charm found · ' + CHARM_INFO[charm].name);
      sfx.charm();
    } else if (key === 'map') {
      revealMap();
    }

    sfx.pickup();
    updateShopDialog();
  }

  function openFavorDialog() {
    if (!favorDialog) return;
    G.dialog = { type: 'favor' };
    G.keys = {};
    G.touch = { up: false, down: false, left: false, right: false };
    favorDialog.classList.remove('hidden');
    updateFavorDialog();
    syncTouchUI();
    try { favorClose.focus({ preventScroll: true }); } catch (err) { favorClose.focus(); }
  }

  function closeFavorDialog() {
    if (favorDialog) favorDialog.classList.add('hidden');
    G.dialog = null;
    syncTouchUI();
  }

  function updateFavorDialog() {
    const f = G.favor;
    if (!f || !favorTitle) return;
    favorTitle.textContent = f.claimed ? 'All settled' : f.title;
    favorText.textContent = f.claimed
      ? 'The board is quiet. Pip has already pinned your thanks to the corner.'
      : f.text + '  (' + f.progress + ' / ' + f.target + ')';
    favorBar.style.width = Math.min(100, (f.progress / f.target) * 100) + '%';
    favorReward.textContent = 'Reward: ' + f.reward.buttons + ' buttons and ' + f.reward.tea + ' tea';
    if (favorClaim) {
      favorClaim.disabled = f.claimed || f.progress < f.target;
      favorClaim.textContent = f.claimed ? 'Claimed' : 'Claim';
    }
  }

  function claimFavor() {
    const f = G.favor;
    if (!f || f.claimed || f.progress < f.target) return;
    f.claimed = true;
    G.buttons += f.reward.buttons;
    G.tea += f.reward.tea;
    toast('Favor complete · +' + f.reward.buttons + ' buttons, +' + f.reward.tea + ' tea');
    sfx.charm();
    updateFavorDialog();
  }

  function canBrew(key) {
    const r = BREWS[key];
    if (!r) return false;
    if (key === 'hearty' && G.hearts >= G.maxHearts) return false;
    return G.tea >= r.tea && G.herbs >= r.herbs && G.oil >= r.oil;
  }

  function updateFireDialog() {
    if (!fireStock) return;
    fireStock.textContent =
      'Tea ' + G.tea + ' · Herbs ' + G.herbs + ' · Oil ' + Math.round(G.oil * 100) + '%';

    for (const btn of brewButtons) {
      const key = btn.dataset.brew;
      const r = BREWS[key];
      if (!r) continue;
      const full = key === 'hearty' && G.hearts >= G.maxHearts;
      const ok = canBrew(key);
      btn.disabled = !ok;
      btn.classList.toggle('short', !ok && !full);
      const cost = document.getElementById('cost-' + key);
      if (cost) {
        cost.textContent = full
          ? 'At full hearts'
          : r.tea + ' tea · ' + r.herbs + ' herb' + (r.herbs > 1 ? 's' : '') +
            (r.oil ? ' · ' + Math.round(r.oil * 100) + '% oil' : '');
      }
    }
  }

  function brew(key) {
    if (!G.dialog || G.dialog.type !== 'fire' || !canBrew(key)) return;
    const r = BREWS[key];
    G.tea -= r.tea;
    G.herbs -= r.herbs;
    if (r.oil) G.oil = Math.max(0, G.oil - r.oil);

    if (key === 'hearty') {
      G.hearts = Math.min(G.maxHearts, G.hearts + 2);
      brewNote.textContent = 'Hearty tea. Warmth spreads through your boots.';
    } else if (key === 'swift') {
      G.haste = Math.max(G.haste, 20);
      brewNote.textContent = 'Swift tea. The air feels lighter.';
    } else {
      G.bright = 60;
      brewNote.textContent = 'Bright tea. The lantern burns clear and wide.';
    }

    burst(G.fire.x * TS + TS / 2, G.fire.y * TS + TS / 2 - 6, '#ffd89a', 14);
    sfx.brew();
    toast('Brewed · ' + key.charAt(0).toUpperCase() + key.slice(1) + ' tea');
    updateFireDialog();
  }

  function confirmPetSwap() {
    if (!G.dialog || !G.floorPet) return;
    const next = G.dialog.pet;
    const p = G.player;
    const had = G.pet;

    burst(p.px * TS + TS / 2, p.py * TS + TS / 2 - 4, '#ffd0c0', 16);
    toast(had
      ? had.name + ' heads home. ' + next.name + ' joins you.'
      : next.name + ' the ' + (PET_LABEL[next.kind] || 'friend') + ' joins you.');
    sfx.pet();

    G.pet = {
      kind: next.kind,
      name: next.name,
      px: p.px,
      py: p.py + 0.6,
      face: 1,
      phase: Math.random() * Math.PI * 2,
      moving: 0
    };
    G.floorPet = null;
    G.petTrail = [{ x: p.tx, y: p.ty }];
    G.petNameTimer = 3.4;
    advanceFavor('pet');
    closePetDialog();
  }

  function syncTouchUI() {
    if (!touchEl) return;
    const show = isTouch && G.scene === 'playing' && !G.dialog;
    touchEl.classList.toggle('show', show);
    touchEl.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  function touchLabel() {
    const p = G.player;
    if (!p) return 'USE';
    if (G.sun && p.tx === G.sun.x && p.ty === G.sun.y) return 'BASK';
    if (G.stairs && p.tx === G.stairs.x && p.ty === G.stairs.y) return 'DOWN';
    if (G.floorPet && Math.abs(p.tx - G.floorPet.x) + Math.abs(p.ty - G.floorPet.y) <= 1) {
      return G.pet ? 'SWAP' : 'MEET';
    }
    if (G.chests.some((c) => Math.abs(p.tx - c.x) + Math.abs(p.ty - c.y) <= 1)) return 'OPEN';
    if (G.setPiece && G.setPiece.focus && !G.setPiece.focus.used &&
        Math.abs(p.tx - G.setPiece.focus.x) + Math.abs(p.ty - G.setPiece.focus.y) <= 1) {
      const type = G.setPiece.focus.type;
      return type === 'desk' ? 'READ' : type === 'teapot' ? 'POUR' : 'GATHER';
    }
    if (G.boss && !G.boss.done &&
        Math.abs(p.tx - G.boss.x) + Math.abs(p.ty - G.boss.y) <= 1) return 'OFFER';
    if (G.fire && Math.abs(p.tx - G.fire.x) + Math.abs(p.ty - G.fire.y) <= 1) return 'FIRE';
    if (G.favorBoard && Math.abs(p.tx - G.favorBoard.x) + Math.abs(p.ty - G.favorBoard.y) <= 1) return 'BOARD';
    if (G.merchant && Math.abs(p.tx - G.merchant.x) + Math.abs(p.ty - G.merchant.y) <= 1) return 'SHOP';
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
    if (G.dialog) {
      updateCamera(dt);
      return;
    }
    if (G.fade > 0) {
      updateCamera(dt);
      return;
    }

    G.invuln = Math.max(0, G.invuln - dt);
    G.hold -= dt;
    G.bumpLock = Math.max(0, G.bumpLock - dt);
    G.oil = Math.max(0, G.oil - dt * 0.0045);

    const hasting = G.haste > 0;
    if (hasting) {
      G.haste = Math.max(0, G.haste - dt);
      if (G.haste > 0 && Math.random() < dt * 20) speedTrail();
      if (G.haste === 0) {
        toast('The wind settles.');
        sfx.hasteEnd();
      }
    }

    if (G.bright > 0) {
      G.bright = Math.max(0, G.bright - dt);
      if (G.bright === 0) {
        toast('The bright tea fades.');
        sfx.hasteEnd();
      }
    }

    const p = G.player;
    if (p.moving > 0) {
      p.moveT += dt / (p.stepDur || 0.14);
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
        G.hold = stepCooldown();
      }
    }

    updatePet(dt);
    updateEnemies(dt);
    reveal();
    updateCamera(dt);
  }

  function updatePet(dt) {
    const pet = G.pet;
    if (!pet) return;
    const p = G.player;
    if (!G.petTrail.length) G.petTrail.push({ x: p.tx, y: p.ty });

    let target;
    if (G.petTrail.length >= 3) {
      target = G.petTrail[G.petTrail.length - 3];
    } else {
      target = { x: p.px - p.facing * 0.75, y: p.py + 0.45 };
    }

    const dx = target.x - pet.px;
    const dy = target.y - pet.py;
    const dist = Math.hypot(dx, dy);

    if (dist > 6) {
      pet.px = target.x;
      pet.py = target.y;
      pet.moving = 0;
    } else if (dist > 0.05) {
      const speed = dist > 2 ? 8 : 5.4;
      const step = Math.min(dist, speed * dt);
      pet.px += (dx / dist) * step;
      pet.py += (dy / dist) * step;
      if (Math.abs(dx) > 0.12) pet.face = dx > 0 ? 1 : -1;
      pet.moving = 1;
    } else {
      pet.moving = 0;
      if (p.px > pet.px + 0.2) pet.face = 1;
      else if (p.px < pet.px - 0.2) pet.face = -1;
    }

    G.petNameTimer = Math.max(0, G.petNameTimer - dt);
  }

  function canEnemyStep(nx, ny) {
    if (!walkable(nx, ny)) return false;
    if (playerOccupies(nx, ny)) return false;
    if (G.sun && G.sun.x === nx && G.sun.y === ny) return false;
    return true;
  }

  function enemyStep(foe, nx, ny, dur) {
    foe.fromX = foe.px;
    foe.fromY = foe.py;
    foe.tx = nx;
    foe.ty = ny;
    if (nx !== foe.px) foe.face = nx > foe.px ? 1 : -1;
    foe.moving = dur;
    foe.dur = dur;
  }

  function wanderEnemy(foe, wait) {
    foe.wait = wait;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = dirs[i]; dirs[i] = dirs[j]; dirs[j] = tmp;
    }
    for (const [dx, dy] of dirs) {
      const nx = foe.tx + dx;
      const ny = foe.ty + dy;
      if (!canEnemyStep(nx, ny)) continue;
      enemyStep(foe, nx, ny, 0.42);
      return;
    }
  }

  function patrolEnemy(foe) {
    if (!foe.dir) foe.dir = [1, 0];
    const [dx, dy] = foe.dir;
    const nx = foe.tx + dx;
    const ny = foe.ty + dy;
    if (canEnemyStep(nx, ny)) {
      enemyStep(foe, nx, ny, 0.36);
      foe.wait = 0.35;
    } else {
      foe.dir = Math.random() < 0.5 ? [dy, -dx] : [-dy, dx];
      foe.wait = 0.25;
    }
  }

  function fleeEnemy(foe) {
    const p = G.player;
    let best = null;
    let bestDist = -1;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = foe.tx + dx;
      const ny = foe.ty + dy;
      if (!canEnemyStep(nx, ny)) continue;
      const d = Math.hypot(nx - p.px, ny - p.py);
      if (d > bestDist) {
        bestDist = d;
        best = [nx, ny];
      }
    }
    if (best) {
      enemyStep(foe, best[0], best[1], 0.3);
      foe.wait = 0.5;
      burst(foe.px * TS + TS / 2, foe.py * TS + TS / 2, '#bcd8e8', 4);
    } else {
      foe.wait = 0.5;
      foe.flash = Math.max(foe.flash, 0.25);
    }
  }

  function enemySpot(foe) {
    foe.alertT = 0.62;
    foe.wait = 0.8;
    sfx.huff();
    burst(foe.px * TS + TS / 2, foe.py * TS + TS / 2, '#f0c9a0', 4);
  }

  function lungeAtPlayer(foe) {
    const p = G.player;
    const ax = p.tx - foe.tx;
    const ay = p.ty - foe.ty;
    if (!ax && !ay) {
      foe.wait = 0.8;
      return;
    }
    let sx = Math.sign(ax);
    let sy = Math.sign(ay);
    if (Math.abs(ax) < Math.abs(ay)) sx = 0;
    else sy = 0;

    const maxSteps = Math.min(2, Math.max(Math.abs(ax), Math.abs(ay)) - 1);
    let nx = foe.tx;
    let ny = foe.ty;
    for (let i = 0; i < maxSteps; i++) {
      const tx = nx + sx;
      const ty = ny + sy;
      if (!walkable(tx, ty) || (p.tx === tx && p.ty === ty)) break;
      nx = tx;
      ny = ty;
    }
    if (nx === foe.tx && ny === foe.ty) {
      foe.wait = 0.7;
      return;
    }
    enemyStep(foe, nx, ny, 0.32);
    foe.justLunged = true;
    foe.wait = 1.1;
    G.shake = Math.max(G.shake, 2.4);
    sfx.lunge();
    burst(nx * TS + TS / 2, ny * TS + TS / 2, '#c9b0e0', 9);
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
        if (foe.moving <= 0) {
          foe.px = foe.tx;
          foe.py = foe.ty;
          if (foe.justLunged) {
            foe.justLunged = false;
            if (Math.hypot(foe.px - p.px, foe.py - p.py) < 1.05) hurtPlayer();
          }
        }
      } else {
        const dist = Math.hypot(foe.px - p.px, foe.py - p.py);

        if (foe.alertT > 0) {
          foe.alertT -= dt;
          if (foe.alertT <= 0) {
            foe.alertT = 0;
            lungeAtPlayer(foe);
          }
        } else {
          foe.wait -= dt;
          if (foe.wait <= 0) {
            if (foe.kind === 'grumble') {
              if (dist < 4.6 && Math.random() < 0.65) enemySpot(foe);
              else wanderEnemy(foe, 1.1 + Math.random() * 1.5);
            } else if (foe.kind === 'mope') {
              if (!foe.awake) {
                if (dist < 2.9) {
                  foe.awake = true;
                  foe.flash = 0.8;
                  foe.wait = 0.35;
                  sfx.quip();
                  burst(foe.px * TS + TS / 2, foe.py * TS + TS / 2, '#bcd8e8', 8);
                } else {
                  foe.wait = 1.2 + Math.random();
                }
              } else if (dist < 3.6) {
                fleeEnemy(foe);
              } else {
                wanderEnemy(foe, 1.2 + Math.random() * 1.2);
              }
            } else if (dist < 2.8 && Math.random() < 0.3) {
              foe.wait = 0.55;
              foe.flash = Math.max(foe.flash, 0.5);
              burst(foe.px * TS + TS / 2, foe.py * TS + TS / 2, '#e0b08a', 4);
            } else {
              patrolEnemy(foe);
            }
          }
        }
      }

      const awakeForContact = foe.kind !== 'mope' || foe.awake;
      if (awakeForContact && G.invuln <= 0 && Math.hypot(foe.px - p.px, foe.py - p.py) < 0.72) {
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

  function speedTrail() {
    const p = G.player;
    const life = 0.26 + Math.random() * 0.22;
    G.particles.push({
      x: p.px * TS + TS / 2 - p.facing * 9,
      y: p.py * TS + TS / 2 + 4 + (Math.random() - 0.5) * 10,
      vx: -p.facing * 24,
      vy: -7 - Math.random() * 8,
      g: 0,
      life, max: life,
      color: 'rgba(159,224,208,0.7)',
      size: 1.4 + Math.random() * 1.6,
      glow: true
    });
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
    drawFloorMottling(camX, camY, th);
    drawWallShadows(camX, camY);
    drawSetPiece(th);
    drawProps(camX, camY, th);
    drawChests();
    drawFavorBoard();
    drawMerchant();
    drawFloorPet();
    drawEnemies();
    drawBoss();
    drawFollowerPet();
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
    const color = h < 0.34 ? th.floorA : h < 0.67 ? th.floorB : th.floorC;

    ctx.fillStyle = color;
    ctx.fillRect(px, py, TS, TS);

    // ambient occlusion where walls meet the floor
    if (G.tiles[y * W + x - 1] === CozyWorld.WALL && x > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.07)';
      ctx.fillRect(px, py, 3, TS);
    }
    if (x < W - 1 && G.tiles[y * W + x + 1] === CozyWorld.WALL) {
      ctx.fillStyle = 'rgba(0,0,0,0.07)';
      ctx.fillRect(px + TS - 3, py, 3, TS);
    }
    if (y > 0 && G.tiles[(y - 1) * W + x] === CozyWorld.WALL) {
      ctx.fillStyle = 'rgba(0,0,0,0.07)';
      ctx.fillRect(px, py, TS, 3);
    }

    if (h > 0.88 && h < 0.965) {
      ctx.globalAlpha = 0.13;
      ctx.fillStyle = th.moss;
      ctx.beginPath();
      ctx.ellipse(px + TS * (0.3 + h * 0.25), py + TS * (0.55 + (h - 0.88) * 2), 12, 5.5, h, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.06;
      ctx.beginPath();
      ctx.ellipse(px + TS * (0.45 + h * 0.2), py + TS * 0.62, 19, 8, h, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (h > 0.83 && h < 0.865) {
      const bx = px + TS * (0.28 + (h - 0.83) * 6);
      const by = py + TS * 0.76;
      ctx.strokeStyle = 'rgba(132,152,104,0.34)';
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(bx + i * 4.2, by);
        ctx.quadraticCurveTo(bx + i * 4.2 + 1.5, by - 6, bx + i * 5.4, by - 10);
        ctx.stroke();
      }
    } else if (h < 0.035) {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.ellipse(px + TS * 0.4, py + TS * 0.62, 3.2, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (h > 0.965) {
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + TS * 0.25, py + TS * 0.2);
      ctx.lineTo(px + TS * 0.42, py + TS * 0.47);
      ctx.lineTo(px + TS * 0.39, py + TS * 0.72);
      ctx.stroke();
    }
  }

  function drawWallTile(x, y, th) {
    const px = x * TS;
    const py = y * TS;

    ctx.fillStyle = th.wallA;
    ctx.fillRect(px, py, TS, TS);

    ctx.fillStyle = th.wallB;
    roundRect(ctx, px + 1, py + 1, TS - 2, TS - 2, 6);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,240,220,0.05)';
    roundRect(ctx, px + 3.5, py + 2.5, TS - 7, 7, 3.5);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    roundRect(ctx, px + 3.5, py + TS - 8, TS - 7, 5, 2.5);
    ctx.fill();

    if (G.secret && !G.secret.opened &&
        G.secret.wall.x === x && G.secret.wall.y === y) {
      const cx = px + TS / 2;
      const cy = py + TS / 2;

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24);
      glow.addColorStop(0, 'rgba(255,205,140,' + (0.08 + Math.sin(G.time * 2) * 0.03).toFixed(3) + ')');
      glow.addColorStop(1, 'rgba(255,205,140,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(px, py, TS, TS);

      ctx.strokeStyle = 'rgba(18,11,10,0.9)';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 12, py + 5);
      ctx.lineTo(cx - 4, cy - 3);
      ctx.lineTo(cx - 7, py + TS - 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 2, py + 8);
      ctx.lineTo(cx + 9, cy + 2);
      ctx.lineTo(cx + 5, py + TS - 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy + 1);
      ctx.lineTo(cx + 2, py + TS - 12);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,222,175,0.45)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(cx - 10, py + 7);
      ctx.lineTo(cx - 5, py + 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 3, py + 12);
      ctx.lineTo(cx + 6, py + 17);
      ctx.stroke();

      ctx.fillStyle = 'rgba(25,16,14,0.55)';
      ctx.beginPath();
      ctx.ellipse(cx - 8, py + TS - 5, 4, 2, 0.3, 0, Math.PI * 2);
      ctx.ellipse(cx + 9, py + TS - 4, 3, 1.6, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFloorMottling(camX, camY, th) {
    const x0 = Math.max(1, Math.floor(camX / TS) - 1);
    const x1 = Math.min(W - 2, Math.ceil((camX + viewW) / TS) + 1);
    const y0 = Math.max(1, Math.floor(camY / TS) - 1);
    const y1 = Math.min(H - 2, Math.ceil((camY + viewH) / TS) + 1);

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (G.tiles[y * W + x] !== FLOOR || !G.explored[y * W + x]) continue;

        let clear = true;
        for (let oy = -1; oy <= 1 && clear; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            const nx = x + ox;
            const ny = y + oy;
            if (nx < 1 || ny < 1 || nx >= W - 1 || ny >= H - 1) { clear = false; break; }
            if (G.tiles[ny * W + nx] !== FLOOR || !G.explored[ny * W + nx]) { clear = false; break; }
          }
        }
        if (!clear) continue;

        const h = hash2(x, y, (G.seed >> 4) & 0xffff);
        if (h < 0.045) {
          ctx.globalAlpha = 0.045;
          ctx.fillStyle = th.moss;
          ctx.beginPath();
          ctx.ellipse(stainX(x, h), stainY(y, h), 28, 15, h * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else if (h > 0.965) {
          ctx.globalAlpha = 0.03;
          ctx.fillStyle = '#140f18';
          ctx.beginPath();
          ctx.ellipse(stainX(x, h + 0.2), stainY(y, h - 0.1), 26, 14, h * 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    }

    function stainX(tx, n) { return tx * TS + TS * (0.2 + (n % 0.6)); }
    function stainY(ty, n) { return ty * TS + TS * (0.25 + (n % 0.5)); }
  }

  function drawWallShadows(camX, camY) {
    const x0 = Math.max(0, Math.floor(camX / TS) - 1);
    const x1 = Math.min(W - 1, Math.ceil((camX + viewW) / TS) + 1);
    const y0 = Math.max(0, Math.floor(camY / TS) - 1);
    const y1 = Math.min(H - 1, Math.ceil((camY + viewH) / TS) + 1);

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (G.tiles[y * W + x] !== CozyWorld.WALL) continue;
        if (!G.explored[y * W + x]) continue;
        if (y + 1 >= H || G.tiles[(y + 1) * W + x] !== FLOOR) continue;
        const px = x * TS;
        const py = y * TS;
        ctx.fillStyle = 'rgba(0,0,0,0.09)';
        ctx.fillRect(px + 2, py + TS - 1, TS - 4, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.045)';
        ctx.fillRect(px + 1, py + TS + 2, TS - 2, 4);
      }
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

    drawShadow(cx, cy + 9, 11, 5);

    if (G.charms.seeker) {
      const dist = Math.hypot(it.x - G.player.px, it.y - G.player.py);
      if (dist < 5.5) {
        ctx.strokeStyle = 'rgba(255,225,150,' + (0.2 + Math.sin(G.time * 3 + it.phase) * 0.08).toFixed(3) + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 15 + Math.sin(G.time * 2.5 + it.phase) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.save();
    ctx.shadowColor = it.type === 'potion'
      ? 'rgba(255,120,120,0.55)'
      : it.type === 'haste'
        ? 'rgba(120,240,210,0.5)'
        : it.type === 'herb'
          ? 'rgba(210,225,140,0.45)'
          : 'rgba(255,205,130,0.45)';
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
    } else if (it.type === 'potion') {
      ctx.save();
      ctx.translate(cx, cy - 3 + bob);
      ctx.fillStyle = '#7a3a3f';
      roundRect(ctx, -4, -9, 8, 4, 1.5);
      ctx.fill();
      ctx.fillStyle = '#d9cbb8';
      roundRect(ctx, -3, -6, 6, 3, 1);
      ctx.fill();
      ctx.fillStyle = '#b8434a';
      roundRect(ctx, -7, -3, 14, 13, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,190,180,0.55)';
      roundRect(ctx, -4.5, -0.5, 3, 6, 1.5);
      ctx.fill();
      ctx.fillStyle = '#ffd9d2';
      ctx.beginPath();
      ctx.arc(-1.4, 2.2, 1.5, Math.PI, 0);
      ctx.arc(1.4, 2.2, 1.5, Math.PI, 0);
      ctx.lineTo(0, 5.6);
      ctx.fill();
      ctx.restore();
    } else if (it.type === 'haste') {
      ctx.save();
      ctx.translate(cx, cy - 4 + bob);
      ctx.rotate(-0.5 + Math.sin(G.time * 2 + it.phase) * 0.08);
      ctx.fillStyle = '#9fe0d0';
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.bezierCurveTo(-9, 2, -7, -8, 0, -11);
      ctx.bezierCurveTo(7, -8, 9, 2, 0, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,245,210,0.8)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(0, -8);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 4 - i * 4);
        ctx.lineTo(-4.5, 1 - i * 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 4 - i * 4);
        ctx.lineTo(4.5, 1 - i * 4);
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(159,224,208,0.55)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx + 9, cy + 2);
      ctx.lineTo(cx + 15, cy + 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 11, cy - 3);
      ctx.lineTo(cx + 16, cy - 3);
      ctx.stroke();
    } else if (it.type === 'herb') {
      ctx.save();
      ctx.translate(cx, cy - 4 + bob);
      ctx.strokeStyle = '#7f9a58';
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 9);
      ctx.quadraticCurveTo(-1, 0, 0, -8);
      ctx.stroke();
      ctx.fillStyle = '#8fae63';
      ctx.beginPath();
      ctx.ellipse(-4, -1, 4, 2.2, -0.6, 0, Math.PI * 2);
      ctx.ellipse(4, 1, 4, 2.2, 0.6, 0, Math.PI * 2);
      ctx.ellipse(-3, -6, 3.5, 2, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8d27a';
      ctx.beginPath();
      ctx.arc(0, -9, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,250,210,0.8)';
      ctx.beginPath();
      ctx.arc(0.4, -9.4, 0.7, 0, Math.PI * 2);
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

    drawShadow(cx, cy + 11, 15, 6);

    const sleeping = foe.kind === 'mope' && !foe.awake;
    const jitter = foe.alertT > 0 ? Math.sin(G.time * 42) * 1.7 : 0;

    ctx.save();
    ctx.translate(cx + jitter, cy - 2 + bob);
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
    if (sleeping) {
      ctx.strokeStyle = 'rgba(40,30,45,0.75)';
      ctx.lineWidth = 1.7;
      ctx.lineCap = 'round';
      for (const ex of [-4.4, 4.4]) {
        ctx.beginPath();
        ctx.arc(ex, -1.2, 2.7, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 3.4, 1.5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
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
    }

    if (foe.flash > 0) {
      ctx.globalAlpha = foe.flash * 0.65;
      ctx.fillStyle = '#fff7e8';
      ctx.beginPath();
      ctx.ellipse(0, 1, 11.5, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    if (sleeping) {
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      const zt = Math.sin(G.time * 1.6 + foe.phase);
      ctx.fillStyle = 'rgba(205,225,245,0.6)';
      ctx.font = '600 12px ' + FONT_UI;
      ctx.fillText('z', cx + 11, cy - 24 + zt * 2);
      ctx.font = '600 9px ' + FONT_UI;
      ctx.fillText('z', cx + 17, cy - 32 - zt * 2);
    }

    if (foe.alertT > 0) {
      const pulse = 1 + Math.sin(G.time * 20) * 0.08;
      ctx.fillStyle = 'rgba(255,244,220,0.95)';
      ctx.beginPath();
      ctx.arc(cx, cy - 35, 9 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a2a20';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.font = '700 12px ' + FONT_UI;
      ctx.fillText('!', cx, cy - 34.5);
    }

    // grump pips
    for (let i = 0; i < foe.maxGrump; i++) {
      ctx.fillStyle = i < foe.grump ? 'rgba(255,170,150,0.85)' : 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.arc(cx - (foe.maxGrump - 1) * 2.5 + i * 5, cy - 18, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const PET_STYLE = {
    fox: { body: '#d9854f', dark: '#b5623a', belly: '#f6e3c8', ear: 'tri', tail: 'bushy' },
    squirrel: { body: '#b97a4a', dark: '#8f5a33', belly: '#efd9b7', ear: 'tri', tail: 'big' },
    cat: { body: '#8f8fa3', dark: '#6f6f82', belly: '#e9e1d5', ear: 'tri', tail: 'thin' },
    dog: { body: '#c9a06a', dark: '#a07b4c', belly: '#f3e3c9', ear: 'flop', tail: 'stub' },
    bear: { body: '#8a6248', dark: '#6f4d38', belly: '#d9b894', ear: 'round', tail: 'stub' }
  };

  function drawPetAt(cx, cy, pet, opts) {
    opts = opts || {};
    const style = PET_STYLE[pet.kind] || PET_STYLE.fox;
    const face = opts.face || (pet.face >= 0 ? 1 : -1);
    const sitting = !!opts.sitting;
    const moving = !!pet.moving && !sitting;
    const t = G.time;
    const bob = moving
      ? Math.abs(Math.sin(t * 11 + pet.phase)) * 2
      : Math.sin(t * 2.2 + pet.phase) * 0.7;

    drawShadow(cx, cy + 9, 12, 5);

    ctx.save();
    ctx.translate(cx, cy - 2 + bob);
    ctx.scale(face, 1);

    // tail, behind everything
    if (style.tail === 'big') {
      ctx.strokeStyle = style.body;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-5, 2);
      ctx.bezierCurveTo(-20, 8, -22, -12, -9, -12);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,240,220,0.22)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.bezierCurveTo(-18, 5, -19, -8, -10, -9);
      ctx.stroke();
    } else if (style.tail === 'bushy') {
      ctx.fillStyle = style.body;
      ctx.beginPath();
      ctx.ellipse(-13, -1, 6.5, 5, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = style.belly;
      ctx.beginPath();
      ctx.ellipse(-17, -4, 3.2, 2.6, -0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (style.tail === 'thin') {
      const wag = Math.sin(t * 4 + pet.phase) * 1.5;
      ctx.strokeStyle = style.body;
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-6, 3);
      ctx.quadraticCurveTo(-15, 3 + wag, -12, -5 + wag);
      ctx.stroke();
    } else {
      const wag = Math.sin(t * 6 + pet.phase) * 2;
      ctx.strokeStyle = style.body;
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-7, 1);
      ctx.lineTo(-10, -2 + wag);
      ctx.stroke();
    }

    // legs
    if (!sitting) {
      ctx.fillStyle = style.dark;
      ctx.beginPath();
      ctx.ellipse(-5, 7, 3, 2.4, 0, 0, Math.PI * 2);
      ctx.ellipse(5, 7, 3, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // body
    ctx.fillStyle = style.body;
    ctx.beginPath();
    ctx.ellipse(0, 1, 9, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = style.belly;
    ctx.beginPath();
    ctx.ellipse(2.2, 3, 5.4, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // head
    ctx.fillStyle = style.body;
    ctx.beginPath();
    ctx.arc(6, -5, 7, 0, Math.PI * 2);
    ctx.fill();

    // ears
    if (style.ear === 'tri') {
      ctx.fillStyle = style.body;
      ctx.beginPath();
      ctx.moveTo(1.5, -9.5);
      ctx.lineTo(2.6, -16.5);
      ctx.lineTo(7.5, -10.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(9.5, -10.5);
      ctx.lineTo(12.5, -16);
      ctx.lineTo(13.2, -8.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = style.dark;
      ctx.beginPath();
      ctx.moveTo(3.2, -10);
      ctx.lineTo(3.8, -14);
      ctx.lineTo(6.2, -10.4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10.4, -10.4);
      ctx.lineTo(12.1, -13.8);
      ctx.lineTo(12.3, -9.4);
      ctx.closePath();
      ctx.fill();
    } else if (style.ear === 'flop') {
      ctx.fillStyle = style.dark;
      ctx.beginPath();
      ctx.ellipse(1.6, -3.4, 3.2, 5.2, 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(10.8, -3.4, 3.2, 5.2, -0.55, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = style.body;
      ctx.beginPath();
      ctx.arc(2.2, -10, 3.6, 0, Math.PI * 2);
      ctx.arc(10.2, -10, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = style.dark;
      ctx.beginPath();
      ctx.arc(2.2, -10, 1.9, 0, Math.PI * 2);
      ctx.arc(10.2, -10, 1.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // muzzle + nose
    ctx.fillStyle = style.belly;
    ctx.beginPath();
    ctx.ellipse(10, -2.8, 3.7, 2.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2a2a';
    ctx.beginPath();
    ctx.arc(12.3, -3.2, 1.15, 0, Math.PI * 2);
    ctx.fill();

    // eyes
    const blink = Math.sin(t * 1.3 + pet.phase) > 0.985;
    if (blink) {
      ctx.strokeStyle = '#3a2a2a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(3.3, -6.4);
      ctx.lineTo(5.2, -6.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(7.9, -6.4);
      ctx.lineTo(9.8, -6.4);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#2b2028';
      ctx.beginPath();
      ctx.arc(4.3, -6.5, 1.2, 0, Math.PI * 2);
      ctx.arc(8.9, -6.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.arc(4.7, -6.9, 0.4, 0, Math.PI * 2);
      ctx.arc(9.3, -6.9, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // collar tag
    ctx.fillStyle = G.meta && G.meta.unlocks.collar ? '#7fd0c0' : '#d9a45e';
    ctx.beginPath();
    ctx.arc(3, 0.5, 1.3, 0, Math.PI * 2);
    ctx.fill();

    if (sitting) {
      ctx.fillStyle = style.belly;
      ctx.beginPath();
      ctx.ellipse(6, 6, 2.6, 1.8, 0, 0, Math.PI * 2);
      ctx.ellipse(9.2, 6, 2.6, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    if (opts.hearts) {
      const hb = Math.sin(t * 2.5 + pet.phase) * 2;
      ctx.globalAlpha = 0.85;
      drawHeart(cx + 13, cy - 22 + hb, 4, true);
      ctx.globalAlpha = 0.55;
      drawHeart(cx + 20, cy - 28 - hb, 3, true);
      ctx.globalAlpha = 1;
    }

    if (opts.name) {
      const alpha = opts.nameAlpha == null ? 1 : clamp(opts.nameAlpha, 0, 1);
      ctx.font = '600 10px ' + FONT_UI;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const w = ctx.measureText(opts.name).width + 14;
      let tagX = cx;
      if (opts.nameSide) {
        const side = G.player.px >= pet.px ? -1 : 1;
        tagX = cx + side * (w / 2 + 15);
      }
      ctx.fillStyle = 'rgba(9,7,15,' + (0.5 * alpha).toFixed(3) + ')';
      roundRect(ctx, tagX - w / 2, cy - 38, w, 16, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(246,232,208,' + (0.92 * alpha).toFixed(3) + ')';
      ctx.fillText(opts.name, tagX, cy - 29.5);
    }
  }

  function drawChests() {
    for (const chest of G.chests) {
      if (chest.secret && G.secret && !G.secret.opened && !G.secret.revealed) continue;
      if (!seen(chest.x, chest.y)) continue;
      const cx = chest.x * TS + TS / 2;
      const cy = chest.y * TS + TS / 2;
      const pulse = 0.16 + Math.sin(G.time * 2.4 + chest.phase) * 0.05;

      drawShadow(cx, cy + 10, 14, 5.5);

      const glow = ctx.createRadialGradient(cx, cy - 2, 0, cx, cy - 2, 28);
      glow.addColorStop(0, 'rgba(255,210,120,' + pulse.toFixed(3) + ')');
      glow.addColorStop(1, 'rgba(255,210,120,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#6b442e';
      roundRect(ctx, cx - 15, cy - 3, 30, 15, 3);
      ctx.fill();
      ctx.fillStyle = '#8f5e3d';
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 3);
      ctx.quadraticCurveTo(cx, cy - 17, cx + 15, cy - 3);
      ctx.lineTo(cx + 15, cy + 1);
      ctx.lineTo(cx - 15, cy + 1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,220,170,0.14)';
      roundRect(ctx, cx - 11, cy + 1, 22, 7, 2);
      ctx.fill();
      ctx.fillStyle = '#d7a354';
      ctx.fillRect(cx - 2.5, cy - 12, 5, 23);
      ctx.fillRect(cx - 15, cy - 1, 30, 2);
      ctx.fillStyle = '#f6d38a';
      roundRect(ctx, cx - 4, cy - 1, 8, 8, 2);
      ctx.fill();
      ctx.fillStyle = '#5a3a22';
      ctx.beginPath();
      ctx.arc(cx, cy + 2, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 0.7, cy + 2, 1.4, 2.5);
      ctx.fillStyle = '#f0c878';
      for (const [sx, sy] of [[-12, 6], [12, 6], [-12, -9], [12, -9]]) {
        ctx.beginPath();
        ctx.arc(cx + sx, cy + sy, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(255,235,175,0.7)';
      ctx.beginPath();
      ctx.arc(cx + 9, cy - 13 + Math.sin(G.time * 1.8 + chest.phase) * 1.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function openChest(chest) {
    const i = G.chests.indexOf(chest);
    if (i < 0) return;
    G.chests.splice(i, 1);

    const cx = chest.x * TS + TS / 2;
    const cy = chest.y * TS + TS / 2;
    const isSecret = !!chest.secret;
    G.buttons += isSecret ? 5 : 2;
    if (isSecret) G.tea += 2;
    advanceFavor('chest');
    const unowned = Object.keys(CHARM_INFO).filter((k) => !G.charms[k]);

    if (unowned.length) {
      const key = unowned[Math.floor(Math.random() * unowned.length)];
      G.charms[key] = true;
      toast('Charm found · ' + CHARM_INFO[key].name + ' — ' + CHARM_INFO[key].desc);
      sfx.charm();
      burst(cx, cy - 4, '#ffd98a', 22);
      burst(cx, cy - 12, '#fff2ca', 10);
    } else {
      G.tea += 2;
      G.oil = Math.min(1, G.oil + 0.25);
      toast('A spare chest · +2 tea and a little oil');
      sfx.pickup();
      burst(cx, cy - 4, '#ffd98a', 14);
    }

    if (isSecret) {
      awardSunmotes(1);
      toast('Hidden cache · +5 buttons, +2 tea, +1 sunmote');
    }
  }

  function roomSeen(room) {
    return seen(room.cx, room.cy);
  }

  function drawCandle(x, y) {
    ctx.fillStyle = '#e8d6b0';
    ctx.fillRect(x - 1.5, y, 3, 6);
    ctx.fillStyle = '#ffd68a';
    ctx.beginPath();
    ctx.ellipse(x, y - 3 + Math.sin(G.time * 6 + x) * 0.7, 1.8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,190,100,0.16)';
    ctx.beginPath();
    ctx.arc(x, y - 2, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFocus(focus) {
    const cx = focus.x * TS + TS / 2;
    const cy = focus.y * TS + TS / 2;
    drawShadow(cx, cy + 9, 18, 7);

    if (focus.type === 'desk') {
      ctx.fillStyle = '#6d4a32';
      roundRect(ctx, cx - 15, cy - 6, 30, 12, 3);
      ctx.fill();
      ctx.fillStyle = '#8a6142';
      roundRect(ctx, cx - 15, cy - 9, 30, 5, 2);
      ctx.fill();
      ctx.fillStyle = '#e8dcc0';
      ctx.save();
      ctx.translate(cx - 4, cy - 7);
      ctx.rotate(-0.15);
      roundRect(ctx, -6, -5, 12, 8, 1);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(90,60,40,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 8);
      ctx.lineTo(cx + 5, cy - 9);
      ctx.stroke();
      drawCandle(cx + 11, cy - 11);
    } else if (focus.type === 'teapot') {
      ctx.fillStyle = '#6b4a33';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 1, 21, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a6142';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 2, 21, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3f6f6a';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 8, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5b9a90';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 10, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3f6f6a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + 6, cy - 8);
      ctx.lineTo(cx + 12, cy - 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 9, cy - 5, 3.5, -0.5, 1.4);
      ctx.stroke();
      ctx.fillStyle = '#e8dcc0';
      for (const ox of [-14, 14]) {
        ctx.beginPath();
        ctx.ellipse(cx + ox, cy - 5, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#8a5537';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 2);
      ctx.lineTo(cx + 10, cy - 2);
      ctx.lineTo(cx + 7, cy + 10);
      ctx.lineTo(cx - 7, cy + 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5f7d50';
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.36;
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(a) * 8, cy - 8 + Math.sin(a) * 6, 4, 2.4, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#c9e8a8';
      ctx.beginPath();
      ctx.arc(cx, cy - 12, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSetPiece(th) {
    const sp = G.setPiece;
    if (!sp || !roomSeen(sp.room)) return;

    const r = sp.room;
    const x0 = r.x * TS;
    const y0 = r.y * TS;
    const w = r.w * TS;
    const h = r.h * TS;
    const cx = r.cx * TS + TS / 2;
    const cy = r.cy * TS + TS / 2;

    if (sp.type === 'library') {
      ctx.fillStyle = 'rgba(96,54,58,0.2)';
      roundRect(ctx, cx - w * 0.26, cy - h * 0.24, w * 0.52, h * 0.48, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(230,190,150,0.18)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      for (let x = r.x + 1; x <= r.x + r.w - 2; x += 2) {
        const bxp = x * TS + 5;
        const byp = (r.y - 1) * TS + 4;
        if (G.tiles[(r.y - 1) * W + x] !== CozyWorld.WALL) continue;
        ctx.fillStyle = '#553924';
        roundRect(ctx, bxp, byp, 30, 30, 3);
        ctx.fill();
        ctx.fillStyle = '#6b4a30';
        roundRect(ctx, bxp + 2, byp + 2, 26, 26, 2);
        ctx.fill();
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = ['#a45c50', '#5c7a58', '#c9a45c'][i];
          ctx.fillRect(bxp + 5 + i * 7, byp + 7, 5, 15);
        }
      }
      drawFocus(sp.focus);
      drawCandle(x0 + 20, y0 + h - 18);
      drawCandle(x0 + w - 20, y0 + h - 18);
    } else if (sp.type === 'grove') {
      for (let i = 0; i < 6; i++) {
        const hx = hash2(r.x + i, r.y, G.seed + 7);
        const hy = hash2(r.x, r.y + i, G.seed + 11);
        const mx = (r.x + 1 + hx * (r.w - 2)) * TS;
        const my = (r.y + 1 + hy * (r.h - 2)) * TS;
        ctx.fillStyle = 'rgba(110,150,105,0.16)';
        ctx.beginPath();
        ctx.ellipse(mx, my + 4, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d9856b';
        ctx.beginPath();
        ctx.ellipse(mx, my - 2, 7, 4.5, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e8d6b0';
        ctx.fillRect(mx - 1.5, my - 1, 3, 6);
        ctx.fillStyle = 'rgba(255,220,150,0.8)';
        ctx.beginPath();
        ctx.arc(mx + 4, my - 8 + Math.sin(G.time * 2 + i) * 2, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (sp.type === 'bath') {
      if (sp.water.length) {
        const xs = sp.water.map((p) => p.x);
        const ys = sp.water.map((p) => p.y);
        const wx = Math.min(...xs) * TS;
        const wy = Math.min(...ys) * TS;
        const ww = (Math.max(...xs) - Math.min(...xs) + 1) * TS;
        const wh = (Math.max(...ys) - Math.min(...ys) + 1) * TS;
        const grad = ctx.createLinearGradient(wx, wy, wx, wy + wh);
        grad.addColorStop(0, 'rgba(70,130,140,0.62)');
        grad.addColorStop(1, 'rgba(46,96,110,0.62)');
        ctx.fillStyle = grad;
        roundRect(ctx, wx + 2, wy + 2, ww - 4, wh - 4, 18);
        ctx.fill();
        ctx.strokeStyle = 'rgba(160,220,220,0.28)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(200,240,235,0.3)';
        for (let i = 0; i < 3; i++) {
          const rr = 8 + ((G.time * 12 + i * 18) % 40);
          ctx.beginPath();
          ctx.ellipse(wx + ww / 2, wy + wh / 2, rr, rr * 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        drawCandle(wx + 8, wy + 10);
        drawCandle(wx + ww - 8, wy + 10);
      }
    } else if (sp.type === 'teaParty') {
      ctx.fillStyle = 'rgba(100,58,62,0.22)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, w * 0.3, h * 0.26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(235,195,150,0.2)';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      drawFocus(sp.focus);
      for (const [ox, oy] of [[-34, 12], [34, 12], [-26, -18], [26, -18]]) {
        ctx.fillStyle = ['#a45c50', '#5c7a58', '#c9a45c', '#7a5c8a'][(ox + oy + 100) % 4];
        ctx.beginPath();
        ctx.ellipse(cx + ox, cy + oy, 9, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // greenhouse
      for (let x = r.x + 1; x <= r.x + r.w - 2; x += 2) {
        if (G.tiles[(r.y - 1) * W + x] !== CozyWorld.WALL) continue;
        const bxp = x * TS + 4;
        const byp = (r.y - 1) * TS + 8;
        ctx.fillStyle = '#6d4a32';
        roundRect(ctx, bxp, byp, 32, 24, 3);
        ctx.fill();
        ctx.fillStyle = '#5f7d50';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(bxp + 7 + i * 9, byp + 4, 4, 7, (i - 1) * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.strokeStyle = 'rgba(110,150,105,0.45)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const vx = x0 + w * (0.2 + i * 0.3);
        ctx.beginPath();
        ctx.moveTo(vx, y0 - 8);
        ctx.bezierCurveTo(vx + 10, y0 + 10, vx - 10, y0 + 22, vx + 4, y0 + 36);
        ctx.stroke();
      }
      if (sp.focus) drawFocus(sp.focus);
      else {
        ctx.fillStyle = 'rgba(110,150,105,0.14)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 46, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawBoss() {
    const b = G.boss;
    if (!b || !seen(b.x, b.y)) return;
    const cx = b.x * TS + TS / 2;
    const cy = b.y * TS + TS / 2;
    const breathe = Math.sin(G.time * 1.6 + b.phase) * 1.5;

    drawShadow(cx, cy + 17, 34, 12);

    ctx.fillStyle = '#4f6d42';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3 + breathe, 30, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6f8f5a';
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy - 3 + breathe, 23, 19, 0, 0, Math.PI * 2);
    ctx.fill();

    // straw hat
    ctx.fillStyle = '#b98a4f';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 23 + breathe, 34, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d0a160';
    roundRect(ctx, cx - 14, cy - 42 + breathe, 28, 21, 8);
    ctx.fill();
    ctx.fillStyle = '#8a5f35';
    ctx.fillRect(cx - 14, cy - 25 + breathe, 28, 3);

    // face
    ctx.strokeStyle = '#33422c';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    for (const ex of [-9, 9]) {
      ctx.beginPath();
      if (b.done) {
        ctx.arc(cx + ex, cy - 8 + breathe, 3, Math.PI * 0.15, Math.PI * 0.85);
      } else {
        ctx.arc(cx + ex, cy - 6 + breathe, 3, Math.PI * 1.15, Math.PI * 1.85);
      }
      ctx.stroke();
    }
    ctx.beginPath();
    if (b.done) {
      ctx.arc(cx, cy + 2 + breathe, 5, Math.PI * 0.15, Math.PI * 0.85);
    } else {
      ctx.arc(cx, cy - 1 + breathe, 4, Math.PI * 1.15, Math.PI * 1.85);
    }
    ctx.stroke();

    // vines
    ctx.strokeStyle = 'rgba(90,130,75,0.6)';
    ctx.lineWidth = 1.6;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * 22, cy - 4);
      ctx.quadraticCurveTo(cx + side * 30, cy + 6, cx + side * 24, cy + 16);
      ctx.stroke();
    }

    if (b.done) {
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * Math.PI * 2;
        ctx.fillStyle = ['#f6c9a0', '#e8a0b8', '#ffe6a0'][i % 3];
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 27, cy + 12 + Math.sin(a) * 9, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // mood pips
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < b.mood ? 'rgba(190,235,160,0.95)' : 'rgba(255,255,255,0.14)';
      ctx.beginPath();
      ctx.ellipse(cx - 10 + i * 10, cy - 50, 2.4, 3.4, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const dist = Math.hypot(b.x - G.player.px, b.y - G.player.py);
    if (dist < 5) {
      const name = 'The Under-Gardener';
      ctx.font = '600 10px ' + FONT_UI;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const tw = ctx.measureText(name).width + 14;
      ctx.fillStyle = 'rgba(9,7,15,0.55)';
      roundRect(ctx, cx - tw / 2, cy - 68, tw, 16, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(230,246,215,0.92)';
      ctx.fillText(name, cx, cy - 59.5);
    }
  }

  function openSecretWall() {
    const sec = G.secret;
    if (!sec || sec.opened) return;
    sec.opened = true;
    G.tiles[sec.wall.y * W + sec.wall.x] = FLOOR;
    revealAround(sec.wall.x, sec.wall.y, 3);

    const cx = sec.wall.x * TS + TS / 2;
    const cy = sec.wall.y * TS + TS / 2;
    for (let i = 0; i < 16; i++) {
      const life = 0.4 + Math.random() * 0.5;
      G.particles.push({
        x: cx + (Math.random() - 0.5) * 20,
        y: cy + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 40,
        vy: -10 - Math.random() * 30,
        g: 70,
        life, max: life,
        color: 'rgba(190,170,150,0.75)',
        size: 1.5 + Math.random() * 2.5,
        glow: false
      });
    }
    G.shake = Math.max(G.shake, 4);
    G.bumpLock = 0.4;
    toast('The cracked wall gives way · a hidden nook');
    sfx.crumble();
  }

  function useSetPieceFocus() {
    const sp = G.setPiece;
    const f = sp && sp.focus;
    if (!f || f.used) return;
    f.used = true;

    const cx = f.x * TS + TS / 2;
    const cy = f.y * TS + TS / 2;

    if (f.type === 'desk') {
      G.tea += 2;
      toast('Pressed flowers and a note · +2 tea');
    } else if (f.type === 'teapot') {
      G.tea += 2;
      if (G.hearts < G.maxHearts) {
        G.hearts++;
        toast('A fresh pot · +2 tea, +1 heart');
      } else {
        toast('A fresh pot · +2 tea');
      }
    } else {
      G.herbs += 2;
      toast('Gardener\'s herbs · +2 bitterleaf');
    }

    burst(cx, cy - 6, '#ffd89a', 14);
    sfx.brew();
  }

  function offerBossTea() {
    const b = G.boss;
    if (!b || b.done) return;

    if (G.tea <= 0) {
      toast('The Under-Gardener waits for a cup. You have no tea leaves.');
      sfx.quip();
      return;
    }

    G.tea--;
    b.mood--;
    const cx = b.x * TS + TS / 2;
    const cy = b.y * TS + TS / 2;

    if (b.mood > 0) {
      toast(b.mood === 2
        ? 'The Under-Gardener takes the cup and sighs.'
        : 'The vines loosen. It pats the soil beside it.');
      burst(cx, cy - 10, '#b9d8a0', 10);
      sfx.soothe();
      return;
    }

    b.done = true;
    G.buttons += 3;
    awardSunmotes(2);
    G.maxHearts = Math.min(6, G.maxHearts + 1);
    G.hearts = G.maxHearts;

    const unowned = Object.keys(CHARM_INFO).filter((k) => !G.charms[k]);
    let reward;
    if (unowned.length) {
      const key = unowned[Math.floor(Math.random() * unowned.length)];
      G.charms[key] = true;
      reward = 'a ' + CHARM_INFO[key].name + ' charm';
    } else {
      G.tea += 3;
      reward = 'three tea leaves';
    }

    toast('The Under-Gardener blooms · +1 heart and ' + reward);
    toast('Two sunmotes drift up from the soil.');
    burst(cx, cy - 12, '#c9e8a8', 26);
    burst(cx, cy - 22, '#ffe6b0', 14);
    sfx.charm();
    sfx.soothe();
  }

  function drawFavorBoard() {
    const board = G.favorBoard;
    if (!board || !seen(board.x, board.y)) return;
    const cx = board.x * TS + TS / 2;
    const cy = board.y * TS + TS / 2;
    const ready = G.favor && !G.favor.claimed && G.favor.progress >= G.favor.target;

    drawShadow(cx, cy + 13, 14, 5);
    if (ready) {
      const glow = ctx.createRadialGradient(cx, cy - 8, 0, cx, cy - 8, 26);
      glow.addColorStop(0, 'rgba(255,220,140,' + (0.18 + Math.sin(G.time * 2) * 0.05).toFixed(3) + ')');
      glow.addColorStop(1, 'rgba(255,220,140,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy - 8, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#5a3f2b';
    ctx.fillRect(cx - 2, cy - 4, 4, 17);
    ctx.fillStyle = '#7b563a';
    roundRect(ctx, cx - 15, cy - 22, 30, 19, 3);
    ctx.fill();
    ctx.fillStyle = '#e8d9bc';
    roundRect(ctx, cx - 12, cy - 19, 24, 13, 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,90,60,0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy - 16 + i * 4);
      ctx.lineTo(cx + 8, cy - 16 + i * 4);
      ctx.stroke();
    }
    ctx.fillStyle = '#c9a45c';
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 19, 1.4, 0, Math.PI * 2);
    ctx.arc(cx + 10, cy - 19, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMerchant() {
    const m = G.merchant;
    if (!m || !seen(m.x, m.y)) return;
    const cx = m.x * TS + TS / 2;
    const cy = m.y * TS + TS / 2;

    drawShadow(cx, cy + 15, 24, 8);

    // cart
    ctx.fillStyle = '#6b4a30';
    roundRect(ctx, cx - 18, cy - 2, 36, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#8a6142';
    roundRect(ctx, cx - 18, cy - 8, 36, 8, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,225,180,0.15)';
    roundRect(ctx, cx - 14, cy - 6, 28, 3, 1.5);
    ctx.fill();

    // jars and wares
    const colors = ['#c9a45c', '#8fae63', '#d9856b'];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.ellipse(cx - 11 + i * 11, cy - 10, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,245,220,0.35)';
      ctx.beginPath();
      ctx.ellipse(cx - 12 + i * 11, cy - 11, 1.5, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // wheels
    ctx.fillStyle = '#3a2a20';
    for (const ox of [-13, 13]) {
      ctx.beginPath();
      ctx.arc(cx + ox, cy + 16, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(cx + ox, cy + 16, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a2a20';
    }

    // Pip the mole
    ctx.fillStyle = '#7a5a44';
    ctx.beginPath();
    ctx.ellipse(cx + 1, cy - 20, 8, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9a7358';
    ctx.beginPath();
    ctx.ellipse(cx + 1, cy - 19, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8b0a0';
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - 18, 2, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2b2028';
    ctx.beginPath();
    ctx.arc(cx - 1, cy - 21, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,30,0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx - 1, cy - 21, 2.2, Math.PI, Math.PI * 2);
    ctx.stroke();

    const dist = Math.hypot(m.x - G.player.px, m.y - G.player.py);
    if (dist < 5) {
      const name = "Pip's cart";
      ctx.font = '600 10px ' + FONT_UI;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const tw = ctx.measureText(name).width + 14;
      ctx.fillStyle = 'rgba(9,7,15,0.55)';
      roundRect(ctx, cx - tw / 2, cy - 40, tw, 16, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(246,232,208,0.92)';
      ctx.fillText(name, cx, cy - 31.5);
    }
  }

  function drawFloorPet() {
    const pet = G.floorPet;
    if (!pet || !seen(pet.x, pet.y)) return;
    const cx = pet.x * TS + TS / 2;
    const cy = pet.y * TS + TS / 2;
    const p = G.player;
    const dist = Math.hypot(pet.x - p.px, pet.y - p.py);

    // little cushion
    ctx.fillStyle = 'rgba(112,70,74,0.62)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 16, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(235,195,155,0.22)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 12.5, 4.8, 0, 0, Math.PI * 2);
    ctx.stroke();

    drawPetAt(cx, cy, pet, {
      sitting: true,
      face: p.px >= pet.x ? 1 : -1,
      name: dist < 5.5 ? pet.name : null,
      nameAlpha: 0.95,
      hearts: dist < 2.6
    });
  }

  function drawFollowerPet() {
    const pet = G.pet;
    if (!pet) return;
    const cx = pet.px * TS + TS / 2;
    const cy = pet.py * TS + TS / 2;
    drawPetAt(cx, cy, pet, {
      sitting: !pet.moving,
      name: G.petNameTimer > 0 ? pet.name : null,
      nameAlpha: Math.min(1, G.petNameTimer / 0.7),
      nameSide: true,
      hearts: false
    });
  }

  function drawPlayer() {
    const p = G.player;
    const px = p.px * TS + TS / 2;
    const py = p.py * TS + TS / 2;
    const walk = p.moving > 0 ? Math.sin(p.moveT * Math.PI) : 0;
    const bob = walk * 3 + Math.sin(G.time * 2.2) * 0.9;

    ctx.save();
    if (G.invuln > 0 && Math.floor(G.time * 10) % 2 === 0) ctx.globalAlpha = 0.55;

    drawShadow(px, py + 13, 17, 7);

    if (G.haste > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(159,224,208,0.4)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      const back = -p.facing;
      for (let i = 0; i < 3; i++) {
        const off = (G.time * 70 + i * 14) % 42;
        ctx.beginPath();
        ctx.moveTo(px + back * (18 + off), py + 1 + i * 3);
        ctx.lineTo(px + back * (6 + off), py + 1 + i * 3);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(159,224,208,' + (0.16 + Math.sin(G.time * 6) * 0.05).toFixed(3) + ')';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(px, py + 3, 20 + Math.sin(G.time * 4) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

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
    const r = lightTiles() * TS * flick;
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

    // herbs
    ctx.save();
    ctx.translate(ox + 62, ty);
    ctx.strokeStyle = '#8fae63';
    ctx.lineWidth = 1.3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(0, -6);
    ctx.stroke();
    ctx.fillStyle = '#a9c47a';
    ctx.beginPath();
    ctx.ellipse(-3.5, -1, 3.2, 1.8, -0.6, 0, Math.PI * 2);
    ctx.ellipse(3.5, 1, 3.2, 1.8, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8d27a';
    ctx.beginPath();
    ctx.arc(0, -6.5, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(242,228,205,0.8)';
    ctx.font = '600 12px ' + FONT_UI;
    ctx.textAlign = 'left';
    ctx.fillText('x ' + G.herbs, ox + 72, ty);

    ctx.fillStyle = '#d9b46a';
    ctx.beginPath();
    ctx.arc(ox + 100, ty, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(70,45,30,0.8)';
    ctx.beginPath();
    ctx.arc(ox + 98.6, ty, 0.9, 0, Math.PI * 2);
    ctx.arc(ox + 101.4, ty, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(242,228,205,0.8)';
    ctx.font = '600 12px ' + FONT_UI;
    ctx.fillText(String(G.buttons), ox + 108, ty);

    let buffY = ty + 22;

    if (G.haste > 0) {
      const bw = phone ? 80 : 88;
      const urgent = G.haste < 3;
      ctx.fillStyle = 'rgba(10,8,14,0.5)';
      roundRect(ctx, ox - 2, buffY - 9, bw, 18, 9);
      ctx.fill();
      ctx.strokeStyle = urgent ? 'rgba(255,180,140,0.35)' : 'rgba(159,224,208,0.28)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.strokeStyle = urgent ? '#ffc09a' : '#9fe0d0';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ox + 5, buffY + 4);
      ctx.quadraticCurveTo(ox + 10, buffY - 7, ox + 18, buffY - 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ox + 6, buffY + 1);
      ctx.lineTo(ox + 17, buffY - 2);
      ctx.stroke();

      ctx.fillStyle = urgent ? 'rgba(255,214,190,0.95)' : 'rgba(214,247,234,0.92)';
      ctx.font = '600 10px ' + FONT_UI;
      ctx.textAlign = 'left';
      ctx.fillText('2× · ' + Math.ceil(G.haste) + 's', ox + 23, buffY);
      buffY += 22;
    }

    if (G.bright > 0) {
      const bw = phone ? 90 : 98;
      const urgent = G.bright < 5;
      ctx.fillStyle = 'rgba(10,8,14,0.5)';
      roundRect(ctx, ox - 2, buffY - 9, bw, 18, 9);
      ctx.fill();
      ctx.strokeStyle = urgent ? 'rgba(255,180,140,0.35)' : 'rgba(255,225,150,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = urgent ? '#ffc09a' : '#ffe6a0';
      ctx.beginPath();
      ctx.arc(ox + 8, buffY, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = urgent ? 'rgba(255,192,154,0.8)' : 'rgba(255,230,160,0.8)';
      ctx.lineWidth = 1.1;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(ox + 8 + Math.cos(a) * 5, buffY + Math.sin(a) * 5);
        ctx.lineTo(ox + 8 + Math.cos(a) * 7, buffY + Math.sin(a) * 7);
        ctx.stroke();
      }

      ctx.fillStyle = urgent ? 'rgba(255,214,190,0.95)' : 'rgba(255,240,200,0.92)';
      ctx.font = '600 10px ' + FONT_UI;
      ctx.textAlign = 'left';
      ctx.fillText('bright · ' + Math.ceil(G.bright) + 's', ox + 20, buffY);
      buffY += 22;
    }

    const ownedCharms = Object.keys(CHARM_INFO).filter((k) => G.charms[k]);
    if (ownedCharms.length) {
      ctx.textAlign = 'left';
      for (let i = 0; i < ownedCharms.length; i++) {
        const bx = ox + i * 24;
        const by = buffY - 10;
        ctx.fillStyle = 'rgba(10,8,14,0.5)';
        roundRect(ctx, bx, by, 20, 20, 7);
        ctx.fill();
        ctx.strokeStyle = 'rgba(240,189,125,0.24)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const key = ownedCharms[i];
        if (key === 'wide') {
          ctx.strokeStyle = '#d9e6c8';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(bx + 10, by + 10, 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(bx + 10, by + 10, 6, 0, Math.PI * 2);
          ctx.stroke();
        } else if (key === 'warm') {
          ctx.fillStyle = '#ffbd7a';
          ctx.beginPath();
          ctx.moveTo(bx + 10, by + 3.5);
          ctx.bezierCurveTo(bx + 15, by + 8, bx + 14, by + 14, bx + 10, by + 16);
          ctx.bezierCurveTo(bx + 6, by + 14, bx + 5, by + 8, bx + 10, by + 3.5);
          ctx.fill();
          ctx.fillStyle = '#fff0c8';
          ctx.beginPath();
          ctx.ellipse(bx + 10, by + 12, 1.8, 2.6, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#ffe6a0';
          ctx.beginPath();
          ctx.moveTo(bx + 10, by + 3);
          ctx.lineTo(bx + 12, by + 8);
          ctx.lineTo(bx + 17, by + 10);
          ctx.lineTo(bx + 12, by + 12);
          ctx.lineTo(bx + 10, by + 17);
          ctx.lineTo(bx + 8, by + 12);
          ctx.lineTo(bx + 3, by + 10);
          ctx.lineTo(bx + 8, by + 8);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

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
    if (G.floorPet) dot(G.floorPet.x, G.floorPet.y, 'rgba(255,170,180,0.95)');
    for (const c of G.chests) dot(c.x, c.y, 'rgba(255,224,140,0.95)');
    if (G.setPiece && G.setPiece.focus) dot(G.setPiece.focus.x, G.setPiece.focus.y, 'rgba(212,185,255,0.95)');
    if (G.boss) dot(G.boss.x, G.boss.y, 'rgba(168,220,150,0.95)');
    if (G.favorBoard) dot(G.favorBoard.x, G.favorBoard.y, 'rgba(236,225,195,0.95)');
    if (G.merchant) dot(G.merchant.x, G.merchant.y, 'rgba(255,195,120,0.95)');
    if (G.secret && G.secret.revealed) {
      dot(G.secret.wall.x, G.secret.wall.y, 'rgba(205,185,255,0.95)');
    }

    if (G.charms.seeker) {
      for (const it of G.items) {
        if (!G.explored[it.y * W + it.x]) continue;
        if (Math.hypot(it.x - G.player.px, it.y - G.player.py) > 6) continue;
        ctx.fillStyle = 'rgba(255,230,160,0.85)';
        ctx.fillRect(x + it.x * cell + 0.5, y + it.y * cell + 0.5, 2, 2);
      }
    }

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

    if (G.dialog) {
      if (k === 'escape') closeActiveDialog();
      return;
    }

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

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && audioCtx && audioCtx.state !== 'running') audioCtx.resume();
  });

  document.getElementById('begin').addEventListener('click', begin);

  if (petYes) petYes.addEventListener('click', confirmPetSwap);
  if (petNo) petNo.addEventListener('click', closePetDialog);
  if (petDialog) {
    petDialog.addEventListener('click', (e) => {
      if (e.target === petDialog) closePetDialog();
    });
  }

  if (fireRest) {
    fireRest.addEventListener('click', () => {
      rest();
      closeFireDialog();
    });
  }
  if (fireClose) fireClose.addEventListener('click', closeFireDialog);
  if (fireDialog) {
    fireDialog.addEventListener('click', (e) => {
      if (e.target === fireDialog) closeFireDialog();
    });
  }
  brewButtons.forEach((btn) => {
    btn.addEventListener('click', () => brew(btn.dataset.brew));
  });

  if (shopClose) shopClose.addEventListener('click', closeShopDialog);
  if (shopDialog) {
    shopDialog.addEventListener('click', (e) => {
      if (e.target === shopDialog) closeShopDialog();
    });
  }

  if (favorClaim) favorClaim.addEventListener('click', claimFavor);
  if (favorClose) favorClose.addEventListener('click', closeFavorDialog);
  if (favorDialog) {
    favorDialog.addEventListener('click', (e) => {
      if (e.target === favorDialog) closeFavorDialog();
    });
  }

  if (sunroomTitle) sunroomTitle.addEventListener('click', openMetaDialog);
  if (sunroomEnd) sunroomEnd.addEventListener('click', openMetaDialog);
  if (metaClose) metaClose.addEventListener('click', closeMetaDialog);
  if (metaDialog) {
    metaDialog.addEventListener('click', (e) => {
      if (e.target === metaDialog) closeMetaDialog();
    });
  }

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
  G.meta = loadMeta();
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
