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
  const petAbility = document.getElementById('pet-ability');
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
  const journalDialog = document.getElementById('journal-dialog');
  const journalBody = document.getElementById('journal-body');
  const journalClose = document.getElementById('journal-close');
  const journalBtn = document.getElementById('journal-btn');
  const metaUnlocks = document.getElementById('meta-unlocks');
  const metaHome = document.getElementById('meta-home');
  const homeCanvas = document.getElementById('home-canvas');
  const homeCtx = homeCanvas ? homeCanvas.getContext('2d') : null;
  const decorList = document.getElementById('decor-list');
  const homeNote = document.getElementById('home-note');
  const brewButtons = Array.from(document.querySelectorAll('[data-brew]'));
  const experimentBtn = document.getElementById('brew-experiment');
  const gardenDialog = document.getElementById('garden-dialog');
  const gardenStock = document.getElementById('garden-stock');
  const gardenPlots = document.getElementById('garden-plots');
  const gardenNote = document.getElementById('garden-note');
  const gardenClose = document.getElementById('garden-close');
  const visitorDialog = document.getElementById('visitor-dialog');
  const visitorKicker = document.getElementById('visitor-kicker');
  const visitorTitle = document.getElementById('visitor-title');
  const visitorText = document.getElementById('visitor-text');
  const visitorGift = document.getElementById('visitor-gift');
  const visitorYes = document.getElementById('visitor-yes');
  const visitorClose = document.getElementById('visitor-close');
  const fishingDialog = document.getElementById('fishing-dialog');
  const fishStatus = document.getElementById('fish-status');
  const fishNote = document.getElementById('fish-note');
  const fishAction = document.getElementById('fish-action');
  const fishClose = document.getElementById('fish-close');
  const cookDialog = document.getElementById('cook-dialog');
  const cookStock = document.getElementById('cook-stock');
  const cookList = document.getElementById('cook-list');
  const cookNote = document.getElementById('cook-note');
  const cookClose = document.getElementById('cook-close');
  const fireCook = document.getElementById('fire-cook');
  const homeStoreDialog = document.getElementById('home-store-dialog');
  const homeStoreBalance = document.getElementById('home-store-balance');
  const homeStoreList = document.getElementById('home-store-list');
  const homeStoreNote = document.getElementById('home-store-note');
  const homeStoreClose = document.getElementById('home-store-close');
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
    seeker: { name: 'Seeker light', desc: 'nearby items glimmer' },
    swift: { name: 'Feather charm', desc: 'walk 12% faster' },
    hush: { name: 'Hush charm', desc: 'grumbles move slower' }
  };

  const BREWS = {
    hearty: { name: 'Hearty tea', tea: 2, herbs: 1, mushrooms: 0, oil: 0, effect: 'Restore 2 hearts', base: true },
    swift: { name: 'Swift tea', tea: 1, herbs: 1, mushrooms: 0, oil: 0, effect: '20s double speed', base: true },
    bright: { name: 'Bright tea', tea: 1, herbs: 2, mushrooms: 0, oil: 0.12, effect: '60s bright light', base: true },
    honey: { name: 'Honey tea', tea: 1, herbs: 0, mushrooms: 1, oil: 0, effect: '+1 max heart this run', experimental: true },
    moon: { name: 'Moonlight tea', tea: 1, herbs: 2, mushrooms: 1, oil: 0.08, effect: 'reveal this floor\'s map', experimental: true },
    firefly: { name: 'Firefly tea', tea: 1, herbs: 2, mushrooms: 1, oil: 0, effect: 'pet gathers items for 25s', experimental: true },
    hush: { name: 'Hush tea', tea: 1, herbs: 1, mushrooms: 1, oil: 0, effect: 'grumbles doze for 20s', experimental: true }
  };

  const ITEM_INFO = {
    leaf: { name: 'Tea leaf', desc: 'A soft leaf that smells of warm afternoons.', use: 'Sip with E for +1 heart.', where: 'Left by soothed grumbles.' },
    herb: { name: 'Bitterleaf', desc: 'A sharp green herb for campfire brewing.', use: 'Brewing ingredient.', where: 'Floors, groves, and Pip.' },
    mushroom: { name: 'Warm mushroom', desc: 'A little cap that holds the heat of the soil.', use: '+1 heart on pickup; brews richer teas.', where: 'Damp corners and groves.' },
    oil: { name: 'Lantern oil', desc: 'Keeps the lantern bright and the dark soft.', use: 'Refills the lantern.', where: 'Floors, chests, and Pip.' },
    potion: { name: 'Red potion', desc: 'A berry-red cordial. It waits if you are full.', use: 'Restore 2 hearts when hurt.', where: 'Dropped by soothed grumbles.' },
    haste: { name: 'Windflower', desc: 'A flower that leans toward somewhere else.', use: '15s double speed.', where: 'Dropped by soothed grumbles.' },
    fish: { name: 'Pond fish', desc: 'A cool, silver fish from the quiet pond.', use: 'Cook at a fire, or feed to a companion.', where: 'Fished from the quiet pond.' },
    seed: { name: 'Tea seed', desc: 'A small seed with a whole garden inside.', use: 'Plant in a garden plot.', where: 'Groves, chests, and favors.' },
    letter: { name: 'Old letter', desc: 'A page from a lantern-keeper who came before.', use: 'Read in the almanac.', where: 'Hidden in quiet rooms.' }
  };

  const LORE_LETTERS = [
    { id: 'l1', title: 'To whoever finds the lantern', body: 'The dark is not empty. It is only quiet. Walk slowly, and the hollow will meet you halfway. — M.' },
    { id: 'l2', title: 'A recipe in the margin', body: 'Honey for courage. Moonlight for direction. Fireflies for company. Hush for the ones who need it. — a page from the Tea Vault' },
    { id: 'l3', title: 'The gardener\'s apology', body: 'I planted too many grumbles. They were supposed to be flowers. Please be kind to them; they are doing their best.' },
    { id: 'l4', title: 'Postcard, unsent', body: 'Wish you were here. The bath is warm. The pond is full of silver. The fox has stolen my left boot again.' },
    { id: 'l5', title: 'A list of small things', body: 'Tea. A dry match. A friend who waits. A map that is mostly wrong. The sound of rain on a lantern.' },
    { id: 'l6', title: 'The last keeper\'s note', body: 'If you are reading this, the Sunroom is still warm. That is all I wanted. Take the kettle. Leave the door open.' }
  ];

  const VISITORS = [
    { kind: 'moth', name: 'Moth the lantern-keeper', story: 'An old moth in a patched coat warms its wings at your fire. “I used to carry the light down here,” it says. “Now I mostly carry gossip.”', gift: 'tea', amount: 2, giftText: 'Moth presses two tea leaves into your palm. “For the next dark stretch.”' },
    { kind: 'mole', name: 'Pim the postal mole', story: 'A mole in a tiny postal cap is sorting letters by the fire. “Delivery route got longer,” Pim sighs. “The hollow keeps growing.”', gift: 'seed', amount: 2, giftText: 'Pim hands you a paper packet of tea seeds. “Plant these somewhere patient.”' },
    { kind: 'ghost', name: 'The ghost gardener', story: 'A soft green ghost is watering a patch of nothing in particular. “The garden remembers me,” it whispers. “That is enough.”', gift: 'recipe', amount: 1, giftText: 'The ghost traces a recipe in the ash. You feel a blend click into place.' },
    { kind: 'bard', name: 'Wren the wandering bard', story: 'A small bird with a lute too big for it is tuning up. “I only know one song,” Wren admits. “But I know it very well.”', gift: 'buttons', amount: 4, giftText: 'Wren plays a chorus and flips you four warm brass buttons. “For the next song.”' },
    { kind: 'spirit', name: 'A tea spirit', story: 'The steam above the kettle gathers into a small, curious face. It smells of honey and rain.', gift: 'sunmote', amount: 1, giftText: 'The spirit leaves a sunmote glowing on the hearthstone.' },
    { kind: 'frog', name: 'Bramble the pond frog', story: 'A frog with a reed hat sits far too close to the fire. “The pond is good today,” it says. “You should come sit.”', gift: 'herbs', amount: 2, giftText: 'Bramble offers two crisp bitterleaves, still wet from the pond.' }
  ];

  const FISH_INFO = {
    minnow: { name: 'Silver minnow', rarity: 'common', effect: '+1 heart', self: 'heal', desc: 'A quick little fish that tastes of cold clean water.' },
    carp: { name: 'Lantern carp', rarity: 'uncommon', effect: '+1 heart · +10% oil', self: 'carp', desc: 'Its scales hold a faint amber shine, like a lantern seen through fog.' },
    dace: { name: 'Tea dace', rarity: 'uncommon', effect: '+1 heart · +1 tea', self: 'dace', desc: 'A pond fish with a surprising leafy aftertaste.' },
    moonfin: { name: 'Moonfin', rarity: 'rare', effect: '+1 heart · reveals the floor map', self: 'moon', desc: 'Pale as a shaving of moon. Only rises when the water is very still.' },
    boot: { name: 'Old boot', rarity: 'junk', effect: '+1 button', self: 'boot', desc: 'Not a fish. Someone has tied a button to the laces, which feels like a hint.' }
  };

  const FISH_ORDER = ['minnow', 'carp', 'dace', 'moonfin', 'boot'];

  const PET_REQUESTS = [
    { kind: 'mushroom', target: 1, label: 'a warm mushroom', reward: { type: 'tea', amount: 2 } },
    { kind: 'herb', target: 2, label: 'two bitterleaves', reward: { type: 'buttons', amount: 3 } },
    { kind: 'soothe', target: 2, label: 'two soothed grumbles', reward: { type: 'sunmote', amount: 1 } },
    { kind: 'leaf', target: 2, label: 'two tea leaves', reward: { type: 'oil', amount: 0.25 } },
    { kind: 'descend', target: 1, label: 'the way down', reward: { type: 'tea', amount: 1 } }
  ];

  const PET_ABILITIES = {
    fox: { name: 'Keen nose', desc: 'Sniffs out the cracked secret wall on every floor.' },
    squirrel: { name: 'Forager', desc: 'Gathers nearby floor items for you.' },
    cat: { name: 'Chest sense', desc: 'Marks every chest on the minimap.' },
    dog: { name: 'Trot', desc: 'You walk 12% faster while it trots beside you.' },
    bear: { name: 'Warm bulk', desc: '+1 max heart while it travels with you.' }
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
    journal: { pets: {}, grumbles: {}, items: {}, charms: {}, floors: {}, bosses: {}, recipes: {}, letters: {}, fish: {} },
    home: {
      slots: { rug: 'rug-woven', lamp: 'lamp-lantern', plant: 'plant-fern' },
      decor: ['rug-woven', 'lamp-lantern', 'plant-fern'],
      companion: null
    },
    settings: { music: 0.75, sfx: 0.85, shake: true, reduceMotion: false, tapMove: false, bigHud: false, highContrast: false },
    lantern: 'brass',
    lanterns: ['brass'],
    postcards: [],
    homeRoom: {
      owned: ['rug-hearth', 'lamp-lantern-home', 'plant-fern-home', 'table-low', 'wall-none', 'cushion-patch'],
      slots: {
        rug: 'rug-hearth',
        lamp: 'lamp-lantern-home',
        plant: 'plant-fern-home',
        table: 'table-low',
        wall: 'wall-none',
        cushion: 'cushion-patch'
      }
    }
  };

  const UNLOCKS = {
    tea: { name: "Traveler's kettle", desc: 'Begin each run with 2 tea', cost: 6 },
    charm: { name: 'Lucky charm', desc: 'Begin with a random charm', cost: 10 },
    heart: { name: 'Warm welcome', desc: 'Begin with +1 max heart', cost: 12 },
    collar: { name: 'Collar dyes', desc: 'A soft teal collar for your pet', cost: 8 }
  };

  const DECOR = {
    rug: [
      { id: 'rug-woven', name: 'Woven rug', cost: 0, color: '#a45c50' },
      { id: 'rug-moon', name: 'Moon rug', cost: 5, color: '#5c6b8a' },
      { id: 'rug-tea', name: 'Tea-stain rug', cost: 4, color: '#8a6a4a' },
      { id: 'rug-fire', name: 'Hearth rug', cost: 6, color: '#b06a4a' },
      { id: 'rug-fern', name: 'Fern-green rug', cost: 5, color: '#5f7a55' }
    ],
    lamp: [
      { id: 'lamp-lantern', name: 'Lantern lamp', cost: 0, color: '#f0bd7d' },
      { id: 'lamp-firefly', name: 'Firefly jar', cost: 6, color: '#9fe0d0' },
      { id: 'lamp-sun', name: 'Sun orb', cost: 8, color: '#ffe6a0' },
      { id: 'lamp-star', name: 'Star jar', cost: 7, color: '#cfe0ff' },
      { id: 'lamp-honey', name: 'Honey glow', cost: 5, color: '#ffd08a' }
    ],
    plant: [
      { id: 'plant-fern', name: 'Potted fern', cost: 0, color: '#6f8f5a' },
      { id: 'plant-mushroom', name: 'Mushroom pot', cost: 4, color: '#c9705e' },
      { id: 'plant-tea', name: 'Tea plant', cost: 6, color: '#8fae63' },
      { id: 'plant-ivy', name: 'Trailing ivy', cost: 5, color: '#5f8f5a' },
      { id: 'plant-moon', name: 'Moon fern', cost: 7, color: '#9fb4d8' }
    ]
  };

  const INTERIOR_INFO = {
    home: { name: 'The Hearthroom' },
    nook: { name: 'The Reading Nook' }
  };

  const HOME_FURNITURE = {
    rug: [
      { id: 'rug-hearth', name: 'Hearth rug', cost: 0, color: '#a45c50' },
      { id: 'rug-moon-home', name: 'Moon rug', cost: 8, color: '#5c6b8a' },
      { id: 'rug-tea-home', name: 'Tea rug', cost: 6, color: '#8a6a4a' }
    ],
    lamp: [
      { id: 'lamp-lantern-home', name: 'Lantern lamp', cost: 0, color: '#f0bd7d' },
      { id: 'lamp-firefly-home', name: 'Firefly jar', cost: 10, color: '#9fe0d0' },
      { id: 'lamp-star-home', name: 'Star jar', cost: 12, color: '#cfe0ff' }
    ],
    plant: [
      { id: 'plant-fern-home', name: 'Potted fern', cost: 0, color: '#6f8f5a' },
      { id: 'plant-mushroom-home', name: 'Mushroom pot', cost: 7, color: '#c9705e' },
      { id: 'plant-tea-home', name: 'Tea plant', cost: 9, color: '#8fae63' }
    ],
    table: [
      { id: 'table-low', name: 'Low table', cost: 0, color: '#6d4a32' },
      { id: 'table-tea', name: 'Tea table', cost: 8, color: '#8a6142' }
    ],
    wall: [
      { id: 'wall-none', name: 'Bare wall', cost: 0, color: null },
      { id: 'wall-map', name: 'Framed map', cost: 6, color: '#c9a45c' },
      { id: 'wall-pressed', name: 'Pressed flowers', cost: 9, color: '#c9e8a8' }
    ],
    cushion: [
      { id: 'cushion-patch', name: 'Patchwork cushion', cost: 0, color: '#a45c50' },
      { id: 'cushion-bear', name: 'Bear cushion', cost: 8, color: '#8a6248' }
    ]
  };

  const HOME_SLOT_LABELS = {
    rug: 'Rug', lamp: 'Lamp', plant: 'Plant', table: 'Table', wall: 'Wall', cushion: 'Cushion'
  };

  const WEATHER_INFO = {
    rain: { name: 'Soft rain', color: '#a8c8d8' },
    fireflies: { name: 'Fireflies', color: '#d8f0a0' },
    leaves: { name: 'Falling leaves', color: '#d0a070' },
    snow: { name: 'Quiet snow', color: '#e0ecff' },
    mist: { name: 'Low mist', color: '#b0c0c0' }
  };
  const WEATHER_ORDER = ['rain', 'fireflies', 'leaves', 'snow', 'mist'];

  const LANTERN_SKINS = {
    brass: { name: 'Brass lantern', cost: 0, frame: '#e8b05f', glass: '#ffe0a3', glow: '255,205,130' },
    copper: { name: 'Copper lantern', cost: 5, frame: '#c97a4f', glass: '#ffd0a8', glow: '255,180,130' },
    moon: { name: 'Moon lantern', cost: 8, frame: '#9fb4d8', glass: '#e4ecff', glow: '205,225,255' },
    firefly: { name: 'Firefly lantern', cost: 6, frame: '#6f9f8a', glass: '#d8f5df', glow: '175,240,200' }
  };

  const JOURNAL_PETS = { fox: 'Fox', squirrel: 'Squirrel', cat: 'Cat', dog: 'Dog', bear: 'Bear cub' };
  const JOURNAL_GRUMBLES = { grumble: 'Grumble', mope: 'Mope', fuss: 'Fuss' };
  const JOURNAL_ITEMS = {
    leaf: 'Tea leaf',
    herb: 'Bitterleaf',
    oil: 'Lantern oil',
    mushroom: 'Warm mushroom',
    potion: 'Red potion',
    haste: 'Windflower'
  };
  const JOURNAL_RECIPES = {
    hearty: { name: 'Hearty tea', cost: '2 tea · 1 herb', effect: '+2 hearts' },
    swift: { name: 'Swift tea', cost: '1 tea · 1 herb', effect: '20s double speed' },
    bright: { name: 'Bright tea', cost: '1 tea · 2 herbs · 12% oil', effect: '60s bright light' }
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
    mushrooms: 0,
    loadout: [],
    moon: 0,
    firefly: 0,
    hush: 0,
    squirrelTimer: 0,
    oil: 1,
    haste: 0,
    bright: 0,
    charms: { wide: false, warm: false, seeker: false },
    chests: [],
    setPiece: null,
    boss: null,
    bathUsed: false,
    secret: null,
    garden: null,
    gardenUiTimer: 1,
    visitor: null,
    weather: null,
    portal: null,
    interior: null,
    homeStore: null,
    nookFocus: null,
    petRequest: null,
    fishBag: {},
    petBond: 0,
    fishing: null,
    fishingUiTimer: 0,
    cookReturn: false,
    buttons: 0,
    merchant: null,
    favorBoard: null,
    favor: null,
    shopStock: null,
    meta: null,
    journalTab: 'journal',
    metaTab: 'unlocks',
    tapPath: [],
    padPrev: {},
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
  let sfxGain = null;
  let ambientGain = null;
  let noiseBuffer = null;
  let ambienceTimer = null;
  let ambienceStarted = false;
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

      const st = (G.meta && G.meta.settings) || {};
      sfxGain = audioCtx.createGain();
      sfxGain.gain.value = st.sfx == null ? 0.85 : st.sfx;
      sfxGain.connect(masterGain);

      ambientGain = audioCtx.createGain();
      ambientGain.gain.value = (st.music == null ? 0.75 : st.music) * 0.35;
      ambientGain.connect(masterGain);
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
    gain.connect(sfxGain || masterGain);
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
    shutter() { tone(1240, 0.06, 'square', 0.025); tone(620, 0.1, 'triangle', 0.02, 0.04); },
    lunge() { tone(250, 0.22, 'sawtooth', 0.024, 0, 160); }
  };

  function applyAudioSettings() {
    if (!G.meta) return;
    const st = G.meta.settings;
    if (masterGain) masterGain.gain.value = G.muted ? 0 : 0.65;
    if (sfxGain) sfxGain.gain.value = st.sfx;
    if (musicBus) musicBus.gain.value = 0.85 * st.music;
    if (ambientGain) ambientGain.gain.value = st.music * 0.35;
  }

  function applySettings() {
    if (!G.meta) return;
    if (G.meta.settings.reduceMotion) G.meta.settings.shake = false;
    document.body.classList.toggle('high-contrast', !!G.meta.settings.highContrast);
    applyAudioSettings();
  }

  function makeNoiseBuffer() {
    if (!audioCtx) return null;
    const length = Math.floor(audioCtx.sampleRate * 2);
    const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function startAmbience() {
    if (!audioCtx || ambienceStarted) return;
    ambienceStarted = true;
    if (!noiseBuffer) noiseBuffer = makeNoiseBuffer();

    if (noiseBuffer) {
      const wind = audioCtx.createBufferSource();
      wind.buffer = noiseBuffer;
      wind.loop = true;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 360;
      const gain = audioCtx.createGain();
      gain.gain.value = 0.1;
      wind.connect(filter);
      filter.connect(gain);
      gain.connect(ambientGain);
      wind.start();
    }

    ambienceTimer = setInterval(ambienceTick, 700);
  }

  function ambienceCrackle(vol) {
    if (!audioCtx || !noiseBuffer) return;
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 700 + Math.random() * 1100;
    filter.Q.value = 1.1;
    const gain = audioCtx.createGain();
    const at = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.002, vol), at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.08 + Math.random() * 0.08);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ambientGain);
    src.start(at);
    src.stop(at + 0.22);
  }

  function ambienceDrip() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const at = audioCtx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900 + Math.random() * 300, at);
    osc.frequency.exponentialRampToValueAtTime(380, at + 0.18);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.022, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
    osc.connect(gain);
    gain.connect(ambientGain);
    osc.start(at);
    osc.stop(at + 0.25);
  }

  function ambienceChirp() {
    if (!audioCtx) return;
    const at = audioCtx.currentTime;
    [660, 880].forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const t = at + i * 0.08;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.012, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      osc.connect(gain);
      gain.connect(ambientGain);
      osc.start(t);
      osc.stop(t + 0.16);
    });
  }

  function ambienceTick() {
    if (!audioCtx || G.muted) return;
    if (G.scene === 'playing') {
      if (G.fire) {
        const dist = Math.hypot(G.fire.x - G.player.px, G.fire.y - G.player.py);
        if (Math.random() < 0.8) {
          const vol = 0.03 * clamp(1 - dist / 9, 0.08, 1);
          ambienceCrackle(vol);
        }
      }
      if (G.setPiece && G.setPiece.type === 'bath' && Math.random() < 0.25) ambienceDrip();
      if (G.weather === 'rain' && Math.random() < 0.25) ambienceDrip();
      if (G.weather === 'fireflies' && Math.random() < 0.08) ambienceChirp();
      if (G.pet && Math.random() < 0.03) ambienceChirp();
    }
  }

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
      const mv = (G.meta && G.meta.settings && G.meta.settings.music != null) ? G.meta.settings.music : 0.75;
      musicBus.gain.value = 0.85 * mv;
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
    if (hasCharm('wide')) r *= 1.15;
    return r;
  }

  function reveal() {
    const p = G.player;
    revealAround(p.px, p.py, lightTiles() + 1.1);
  }

  function spawnVisitor(n) {
    if (!G.fire) return null;
    const base = VISITORS[(n + (G.seed >>> 0)) % VISITORS.length];
    const spots = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    for (const [dx, dy] of spots) {
      const x = G.fire.x + dx;
      const y = G.fire.y + dy;
      if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
      if (G.tiles[y * W + x] !== FLOOR) continue;
      if (G.player && G.player.tx === x && G.player.ty === y) continue;
      if (G.items.some((it) => it.x === x && it.y === y)) continue;
      if (G.chests.some((c) => c.x === x && c.y === y)) continue;
      if (G.favorBoard && G.favorBoard.x === x && G.favorBoard.y === y) continue;
      if (G.merchant && G.merchant.x === x && G.merchant.y === y) continue;
      if (G.floorPet && G.floorPet.x === x && G.floorPet.y === y) continue;
      return { ...base, x, y, met: false, phase: Math.random() * Math.PI * 2 };
    }
    return null;
  }

  function snapshotFloor() {
    return {
      floor: G.floor,
      world: G.world,
      tiles: G.tiles,
      explored: G.explored,
      fire: G.fire,
      stairs: G.stairs,
      sun: G.sun,
      floorPet: G.floorPet,
      chests: G.chests,
      setPiece: G.setPiece,
      boss: G.boss,
      secret: G.secret,
      favorBoard: G.favorBoard,
      merchant: G.merchant,
      shopStock: G.shopStock,
      items: G.items,
      enemies: G.enemies,
      player: { ...G.player },
      garden: G.garden,
      weather: G.weather,
      visitor: G.visitor,
      portal: G.portal,
      petRequest: G.petRequest
    };
  }

  function enterInterior() {
    if (!G.portal || G.interior) return;
    const kind = G.portal.kind || 'home';
    const info = INTERIOR_INFO[kind] || INTERIOR_INFO.home;
    const snapshot = snapshotFloor();
    const room = { x: 14, y: 11, w: 13, h: 9 };
    room.cx = room.x + room.w / 2;
    room.cy = room.y + room.h / 2;
    const door = { x: room.x + Math.floor(room.w / 2), y: room.y + room.h - 1 };
    const store = kind === 'home' ? { x: room.x + 2, y: room.y + 2 } : null;
    const nook = kind === 'nook' ? { x: room.x + room.w - 3, y: room.y + 2 } : null;

    const tiles = new Uint8Array(W * H);
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) tiles[y * W + x] = FLOOR;
    }

    G.interior = {
      type: kind,
      name: info.name,
      room,
      door,
      store,
      nook,
      used: false,
      return: snapshot
    };
    G.tiles = tiles;
    G.explored = new Uint8Array(W * H);
    G.fire = null;
    G.stairs = null;
    G.sun = null;
    G.floorPet = null;
    G.chests = [];
    G.setPiece = null;
    G.boss = null;
    G.secret = null;
    G.favorBoard = null;
    G.merchant = null;
    G.shopStock = null;
    G.items = [];
    G.enemies = [];
    G.visitor = null;
    G.portal = null;
    G.weather = null;
    G.garden = null;
    G.petRequest = null;
    G.homeStore = store;
    G.nookFocus = nook;

    G.player = {
      tx: door.x, ty: door.y - 2,
      px: door.x, py: door.y - 2,
      fromX: door.x, fromY: door.y - 2,
      toX: door.x, toY: door.y - 2,
      moving: 0, moveT: 0, facing: 1
    };
    G.petTrail = [{ x: door.x, y: door.y - 2 }];
    if (G.pet) {
      G.pet.px = door.x - 0.65;
      G.pet.py = door.y - 1.4;
      G.pet.moving = 0;
    }
    G.particles = [];
    G.messages = [];
    G.tapPath = [];
    G.bumpLock = 0.2;
    revealAround(room.cx, room.cy, 14);
    snapCamera();
    syncTouchUI();
    toast(info.name + ' · a room beyond the hollow');
  }

  function exitInterior() {
    const interior = G.interior;
    if (!interior) return;
    const snap = interior.return;

    G.floor = snap.floor;
    G.world = snap.world;
    G.tiles = snap.tiles;
    G.explored = snap.explored;
    G.fire = snap.fire;
    G.stairs = snap.stairs;
    G.sun = snap.sun;
    G.floorPet = snap.floorPet;
    G.chests = snap.chests;
    G.setPiece = snap.setPiece;
    G.boss = snap.boss;
    G.secret = snap.secret;
    G.favorBoard = snap.favorBoard;
    G.merchant = snap.merchant;
    G.shopStock = snap.shopStock;
    G.items = snap.items;
    G.enemies = snap.enemies;
    G.garden = snap.garden;
    G.weather = snap.weather;
    G.visitor = snap.visitor;
    G.portal = snap.portal;
    G.petRequest = snap.petRequest;
    G.interior = null;
    G.homeStore = null;
    G.nookFocus = null;

    G.player = { ...snap.player };
    if (snap.portal) {
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dx, dy] of dirs) {
        const x = snap.portal.x + dx;
        const y = snap.portal.y + dy;
        if (!walkable(x, y)) continue;
        G.player.tx = x;
        G.player.ty = y;
        break;
      }
    }
    G.player.px = G.player.tx;
    G.player.py = G.player.ty;
    G.player.fromX = G.player.tx;
    G.player.fromY = G.player.ty;
    G.player.toX = G.player.tx;
    G.player.toY = G.player.ty;
    G.player.moving = 0;
    G.player.moveT = 0;
    G.petTrail = [{ x: G.player.tx, y: G.player.ty }];
    if (G.pet) {
      G.pet.px = G.player.tx - 0.65;
      G.pet.py = G.player.ty + 0.55;
      G.pet.moving = 0;
    }
    G.particles = [];
    G.messages = [];
    G.tapPath = [];
    G.bumpLock = 0.3;
    snapCamera();
    syncTouchUI();
    toast('Back in the hollow.');
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
    if (G.pet && G.pet.kind === 'fox' && G.secret) {
      G.secret.revealed = true;
      revealAround(G.secret.wall.x, G.secret.wall.y, 2);
    }
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
    G.weather = WEATHER_ORDER[(n - 1) % WEATHER_ORDER.length];
    G.portal = world.portal ? { ...world.portal } : null;
    G.interior = null;
    G.homeStore = null;
    G.nookFocus = null;
    G.garden = G.setPiece && G.setPiece.type === 'garden'
      ? { floor: n, plots: [null, null, null], gifted: false }
      : null;
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

    G.visitor = spawnVisitor(n);

    G.particles = [];
    G.messages = [];
    G.tapPath = [];
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
    recordJournal('floors', theme().name, 1);
    toast(n === 5 ? 'The Sunroom · follow the warm light' : theme().name + ' · find the staircase');
    if (G.pet && n > 1) toast(G.pet.name + ' pads down the stairs beside you.');
    if (G.pet) newPetRequest();
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
    G.mushrooms = 0;
    G.fish = 0;
    G.fishBag = {};
    G.petBond = 0;
    G.fishing = null;
    G.seeds = 0;
    G.letters = 0;
    G.oil = 1;
    G.moon = 0;
    G.firefly = 0;
    G.hush = 0;
    G.loadout = [];
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
    G.tapPath = [];
    G.padPrev = {};
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
    if (journalDialog) journalDialog.classList.add('hidden');
    if (gardenDialog) gardenDialog.classList.add('hidden');
    if (visitorDialog) visitorDialog.classList.add('hidden');
    if (fishingDialog) fishingDialog.classList.add('hidden');
    if (cookDialog) cookDialog.classList.add('hidden');
    if (homeStoreDialog) homeStoreDialog.classList.add('hidden');
    G.cookReturn = false;
    G.garden = null;
    G.visitor = null;
    G.weather = null;
    G.portal = null;
    G.interior = null;
    G.homeStore = null;
    G.nookFocus = null;
    G.petRequest = null;
    if (G.meta) {
      if (G.meta.unlocks.tea) G.tea += 2;
      if (G.meta.unlocks.heart) {
        G.maxHearts = 5;
        G.hearts = 4;
      }
      if (G.meta.unlocks.charm) {
        const keys = Object.keys(CHARM_INFO);
        const key = keys[Math.floor(Math.random() * keys.length)];
        grantCharm(key);
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
    startAmbience();
    applyAudioSettings();
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
    G.tapPath = [];
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
    advancePetRequest('descend', 1);
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
    if (G.visitor && G.visitor.x === x && G.visitor.y === y) return false;
    if (G.homeStore && G.homeStore.x === x && G.homeStore.y === y) return false;
    if (G.nookFocus && G.nookFocus.x === x && G.nookFocus.y === y) return false;
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

  function hasCharm(key) {
    return G.loadout.indexOf(key) >= 0;
  }

  function grantCharm(key) {
    if (!CHARM_INFO[key]) return;
    if (!G.charms[key]) {
      G.charms[key] = true;
      recordJournal('charms', key, true);
    }
    if (!G.loadout.includes(key) && G.loadout.length < 2) G.loadout.push(key);
  }

  function equippedCharmLabel() {
    if (!G.loadout.length) return '';
    return G.loadout.map((k) => CHARM_INFO[k].name).join(' · ');
  }

  function stepDuration() {
    let base = G.haste > 0 ? 0.075 : 0.14;
    if (hasCharm('swift')) base *= 0.88;
    if (G.pet && G.pet.kind === 'dog') base *= 0.88;
    return base;
  }

  function stepCooldown() {
    let base = G.haste > 0 ? 0.08 : 0.15;
    if (hasCharm('swift')) base *= 0.9;
    if (G.pet && G.pet.kind === 'dog') base *= 0.9;
    return base;
  }

  function findPath(sx, sy, tx, ty) {
    if (!walkable(sx, sy) || !walkable(tx, ty)) return [];
    const start = sy * W + sx;
    const target = ty * W + tx;
    if (start === target) return [];
    const prev = new Int32Array(W * H).fill(-2);
    prev[start] = -1;
    const queue = [start];
    let found = false;
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i];
      if (p === target) { found = true; break; }
      const x = p % W;
      const y = (p / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (!walkable(nx, ny)) continue;
        const n = ny * W + nx;
        if (prev[n] !== -2) continue;
        prev[n] = p;
        queue.push(n);
      }
    }
    if (!found) return [];
    const path = [];
    let cur = target;
    while (cur !== start) {
      path.push({ x: cur % W, y: (cur / W) | 0 });
      cur = prev[cur];
      if (path.length > 80) return [];
    }
    path.reverse();
    return path;
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
    if (G.visitor && G.visitor.x === nx && G.visitor.y === ny) {
      openVisitorDialog();
      G.bumpLock = 0.4;
      return;
    }
    if (G.homeStore && G.homeStore.x === nx && G.homeStore.y === ny) {
      G.bumpLock = 0.4;
      return;
    }
    if (G.nookFocus && G.nookFocus.x === nx && G.nookFocus.y === ny) {
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
    if (G.interior) {
      const door = G.interior.door;
      if (p.tx === door.x && p.ty === door.y) {
        transition(exitInterior);
        return;
      }
    } else if (G.portal && p.tx === G.portal.x && p.ty === G.portal.y) {
      transition(enterInterior);
      return;
    }
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
    const it = G.items.find((entry) => entry.x === p.tx && entry.y === p.ty);
    if (it) collectItem(it);
  }

  function autoCollectNearby(radius) {
    const p = G.player;
    const it = G.items.find((entry) =>
      Math.hypot(entry.x - p.tx, entry.y - p.ty) <= radius &&
      !(entry.type === 'potion' && G.hearts >= G.maxHearts));
    if (it) collectItem(it);
  }

  function collectItem(it) {
    const i = G.items.indexOf(it);
    if (i < 0) return;
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
    } else if (it.type === 'mushroom') {
      G.mushrooms++;
      if (G.hearts < G.maxHearts) {
        G.hearts++;
        toast('Warm mushroom · +1 heart · ' + G.mushrooms + ' in your satchel');
      } else {
        toast('Warm mushroom · ' + G.mushrooms + ' in your satchel');
      }
    } else if (it.type === 'fish') {
      G.fish = (G.fish || 0) + 1;
      toast('A pond fish · ' + G.fish + ' in your creel');
    } else if (it.type === 'seed') {
      G.seeds = (G.seeds || 0) + 1;
      toast('Tea seed · ' + G.seeds + ' in your pocket');
    } else if (it.type === 'letter') {
      G.letters = (G.letters || 0) + 1;
      const found = (G.meta && G.meta.journal && G.meta.journal.letters) || {};
      const letter = LORE_LETTERS.find((entry) => !found[entry.id]);
      if (letter) {
        recordJournal('letters', letter.id, true);
        toast('Old letter · ' + letter.title + ' · read it in the almanac');
      } else {
        toast('Another old letter · the almanac has them all');
      }
    } else {
      toast('A quiet little find.');
    }

    advancePetRequest(it.type, 1);
    recordJournal('items', it.type, 1);
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
    if (hasCharm('warm') && Math.random() < 0.25) dmg++;
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
      recordJournal('grumbles', foe.kind, 1);
      advanceFavor('soothe');
      advancePetRequest('soothe', 1);
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
    if (G.interior) {
      if (G.homeStore && Math.abs(p.tx - G.homeStore.x) + Math.abs(p.ty - G.homeStore.y) <= 1) {
        return 'Space · browse Hearth & Home';
      }
      if (G.nookFocus && Math.abs(p.tx - G.nookFocus.x) + Math.abs(p.ty - G.nookFocus.y) <= 1) {
        return 'Space · sit by the reading fire';
      }
      if (G.interior.door && Math.abs(p.tx - G.interior.door.x) + Math.abs(p.ty - G.interior.door.y) <= 1) {
        return 'Walk onto the door to leave';
      }
      return null;
    }
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
      return 'Space · ' + (type === 'desk' ? 'read the ledger' : type === 'teapot' ? 'pour a cup' : type === 'gardenBed' ? 'tend the garden' : type === 'pond' ? 'fish the pond' : 'gather herbs');
    }
    if (G.boss && !G.boss.done &&
        Math.abs(p.tx - G.boss.x) + Math.abs(p.ty - G.boss.y) <= 1) {
      return 'Space · offer tea';
    }
    if (G.portal && Math.abs(p.tx - G.portal.x) + Math.abs(p.ty - G.portal.y) <= 1) {
      return 'Walk into the doorway · ' + (G.portal.kind === 'home' ? 'Hearthroom' : 'Reading Nook');
    }
    if (G.visitor && Math.abs(p.tx - G.visitor.x) + Math.abs(p.ty - G.visitor.y) <= 1) {
      return 'Space · sit with ' + G.visitor.name.split(' ')[0];
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
    if (G.interior) {
      if (G.homeStore && Math.abs(p.tx - G.homeStore.x) + Math.abs(p.ty - G.homeStore.y) <= 1) {
        openHomeStore();
        return;
      }
      if (G.nookFocus && Math.abs(p.tx - G.nookFocus.x) + Math.abs(p.ty - G.nookFocus.y) <= 1) {
        useNookFocus();
        return;
      }
      toast('A quiet room. Wander, or step onto the door to leave.');
      return;
    }
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
    if (G.visitor && Math.abs(p.tx - G.visitor.x) + Math.abs(p.ty - G.visitor.y) <= 1) {
      openVisitorDialog();
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
    if (saved.lantern) out.lantern = saved.lantern;
    if (Array.isArray(saved.lanterns)) out.lanterns = saved.lanterns;
    if (Array.isArray(saved.postcards)) out.postcards = saved.postcards;
    if (saved.homeRoom) {
      if (Array.isArray(saved.homeRoom.owned)) out.homeRoom.owned = saved.homeRoom.owned;
      if (saved.homeRoom.slots) Object.assign(out.homeRoom.slots, saved.homeRoom.slots);
    }
    if (saved.home) {
      if (saved.home.slots) Object.assign(out.home.slots, saved.home.slots);
      if (Array.isArray(saved.home.decor)) out.home.decor = saved.home.decor;
      if (saved.home.companion !== undefined) out.home.companion = saved.home.companion;
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
    if (homeNote) homeNote.textContent = '';
    renderMeta();
    showMetaTab(G.metaTab || 'unlocks');
    metaDialog.classList.remove('hidden');
    syncTouchUI();
    try { metaClose.focus({ preventScroll: true }); } catch (err) { metaClose.focus(); }
  }

  function closeMetaDialog() {
    if (metaDialog) metaDialog.classList.add('hidden');
    if (journalDialog) journalDialog.classList.add('hidden');
    G.dialog = null;
    syncTouchUI();
  }

  function ensureHome() {
    if (!G.meta) return;
    if (!Array.isArray(G.meta.lanterns)) G.meta.lanterns = ['brass'];
    if (!G.meta.lanterns.includes('brass')) G.meta.lanterns.push('brass');
    if (!LANTERN_SKINS[G.meta.lantern]) G.meta.lantern = 'brass';
    if (!Array.isArray(G.meta.postcards)) G.meta.postcards = [];
    const home = G.meta.home;
    if (!home.slots) home.slots = {};
    if (!Array.isArray(home.decor)) home.decor = [];
    for (const slot of Object.keys(DECOR)) {
      if (!home.slots[slot]) home.slots[slot] = DECOR[slot][0].id;
      if (!home.decor.includes(DECOR[slot][0].id)) home.decor.push(DECOR[slot][0].id);
    }
  }

  function showMetaTab(tab) {
    G.metaTab = tab;
    document.querySelectorAll('[data-meta-tab]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.metaTab === tab);
    });
    if (metaUnlocks) metaUnlocks.classList.toggle('hidden', tab !== 'unlocks');
    if (metaHome) metaHome.classList.toggle('hidden', tab !== 'home');
    if (tab === 'home') renderHome();
  }

  function renderHome() {
    if (!G.meta) return;
    ensureHome();
    if (decorList) {
      let html = Object.keys(DECOR).map((slot) => {
        const options = DECOR[slot].map((item) => {
          const owned = G.meta.home.decor.includes(item.id);
          const selected = G.meta.home.slots[slot] === item.id;
          const disabled = !owned && G.meta.sunmotes < item.cost;
          return '<button type="button" class="decor-chip' + (selected ? ' selected' : '') + '"' +
            ' data-slot="' + slot + '" data-decor="' + item.id + '"' +
            (disabled ? ' disabled' : '') + '>' +
            (owned ? item.name : item.name + ' · ' + item.cost + ' ✦') + '</button>';
        }).join('');
        return '<div class="decor-slot"><div class="decor-label">' + slot + '</div>' +
          '<div class="decor-options">' + options + '</div></div>';
      }).join('');

      const lanternOptions = Object.keys(LANTERN_SKINS).map((id) => {
        const skin = LANTERN_SKINS[id];
        const owned = G.meta.lanterns.includes(id);
        const selected = G.meta.lantern === id;
        const disabled = !owned && G.meta.sunmotes < skin.cost;
        return '<button type="button" class="decor-chip' + (selected ? ' selected' : '') + '"' +
          ' data-lantern="' + id + '"' + (disabled ? ' disabled' : '') + '>' +
          (owned ? skin.name : skin.name + ' · ' + skin.cost + ' ✦') + '</button>';
      }).join('');
      html += '<div class="decor-slot"><div class="decor-label">Your lantern</div>' +
        '<div class="decor-options">' + lanternOptions + '</div></div>';

      const metKinds = Object.keys(G.meta.journal.pets || {});
      if (metKinds.length) {
        const chips = ['<button type="button" class="decor-chip' +
          (!G.meta.home.companion ? ' selected' : '') + '" data-companion="">Everyone</button>']
          .concat(metKinds.map((kind) => {
            const name = G.meta.journal.pets[kind];
            return '<button type="button" class="decor-chip' +
              (G.meta.home.companion === kind ? ' selected' : '') +
              '" data-companion="' + kind + '">' + name + '</button>';
          })).join('');
        html += '<div class="decor-slot"><div class="decor-label">Companion on the rug</div>' +
          '<div class="decor-options">' + chips + '</div></div>';
      }

      decorList.innerHTML = html;

      decorList.querySelectorAll('[data-decor]').forEach((btn) => {
        btn.addEventListener('click', () => chooseDecor(btn.dataset.slot, btn.dataset.decor));
      });
      decorList.querySelectorAll('[data-lantern]').forEach((btn) => {
        btn.addEventListener('click', () => chooseLantern(btn.dataset.lantern));
      });
      decorList.querySelectorAll('[data-companion]').forEach((btn) => {
        btn.addEventListener('click', () => {
          G.meta.home.companion = btn.dataset.companion || null;
          saveMeta();
          renderHome();
        });
      });
    }
    drawHome();
    saveMeta();
  }

  function chooseLantern(id) {
    if (!G.meta || !LANTERN_SKINS[id]) return;
    const skin = LANTERN_SKINS[id];
    if (!G.meta.lanterns.includes(id)) {
      if (G.meta.sunmotes < skin.cost) return;
      G.meta.sunmotes -= skin.cost;
      G.meta.lanterns.push(id);
      if (homeNote) homeNote.textContent = skin.name + ' bought. Your next walk will glow differently.';
      renderMeta();
      sfx.charm();
    } else if (homeNote) {
      homeNote.textContent = skin.name + ' chosen for the next walk.';
    }
    G.meta.lantern = id;
    saveMeta();
    renderHome();
  }

  function chooseDecor(slot, id) {
    if (!G.meta) return;
    const item = (DECOR[slot] || []).find((entry) => entry.id === id);
    if (!item) return;
    const owned = G.meta.home.decor.includes(id);
    if (!owned) {
      if (G.meta.sunmotes < item.cost) return;
      G.meta.sunmotes -= item.cost;
      G.meta.home.decor.push(id);
      if (homeNote) homeNote.textContent = item.name + ' bought for the Sunroom.';
      renderMeta();
      sfx.charm();
    } else if (homeNote) {
      homeNote.textContent = item.name + ' placed.';
    }
    G.meta.home.slots[slot] = id;
    saveMeta();
    renderHome();
  }

  function drawHomePet(c2d, x, y, kind) {
    const colors = {
      fox: '#d9854f', squirrel: '#b97a4a', cat: '#8f8fa3', dog: '#c9a06a', bear: '#8a6248'
    };
    const body = colors[kind] || '#b97a4a';
    c2d.fillStyle = body;
    c2d.beginPath();
    c2d.ellipse(x, y, 9, 7, 0, 0, Math.PI * 2);
    c2d.fill();
    c2d.beginPath();
    c2d.arc(x + 6, y - 4, 6, 0, Math.PI * 2);
    c2d.fill();
    if (kind === 'fox' || kind === 'cat' || kind === 'squirrel') {
      c2d.beginPath();
      c2d.moveTo(x + 2, y - 8);
      c2d.lineTo(x + 3, y - 15);
      c2d.lineTo(x + 7, y - 9);
      c2d.closePath();
      c2d.fill();
      c2d.beginPath();
      c2d.moveTo(x + 9, y - 9);
      c2d.lineTo(x + 12, y - 15);
      c2d.lineTo(x + 12.5, y - 7);
      c2d.closePath();
      c2d.fill();
    } else if (kind === 'dog') {
      c2d.beginPath();
      c2d.ellipse(x + 2, y - 4, 3, 5, 0.5, 0, Math.PI * 2);
      c2d.fill();
      c2d.beginPath();
      c2d.ellipse(x + 11, y - 4, 3, 5, -0.5, 0, Math.PI * 2);
      c2d.fill();
    } else {
      c2d.beginPath();
      c2d.arc(x + 3, y - 9, 3, 0, Math.PI * 2);
      c2d.arc(x + 10, y - 9, 3, 0, Math.PI * 2);
      c2d.fill();
    }
    c2d.fillStyle = '#f4ead8';
    c2d.beginPath();
    c2d.arc(x + 5, y - 5, 1.1, 0, Math.PI * 2);
    c2d.arc(x + 8, y - 5, 1.1, 0, Math.PI * 2);
    c2d.fill();
    c2d.fillStyle = '#2b2028';
    c2d.beginPath();
    c2d.arc(x + 5, y - 5, 0.5, 0, Math.PI * 2);
    c2d.arc(x + 8, y - 5, 0.5, 0, Math.PI * 2);
    c2d.fill();
    if (kind === 'fox') {
      c2d.fillStyle = '#f6e3c8';
      c2d.beginPath();
      c2d.ellipse(x - 8, y + 1, 4, 2.4, 0.4, 0, Math.PI * 2);
      c2d.fill();
    }
    if (kind === 'squirrel') {
      c2d.strokeStyle = body;
      c2d.lineWidth = 5;
      c2d.lineCap = 'round';
      c2d.beginPath();
      c2d.moveTo(x - 7, y + 1);
      c2d.bezierCurveTo(x - 18, y + 6, x - 17, y - 10, x - 8, y - 9);
      c2d.stroke();
    }
  }

  function drawHome() {
    if (!homeCtx || !G.meta) return;
    ensureHome();
    const c2d = homeCtx;
    c2d.setTransform(1, 0, 0, 1, 0, 0);
    c2d.clearRect(0, 0, 960, 440);
    c2d.setTransform(2, 0, 0, 2, 0, 0);

    const wall = c2d.createLinearGradient(0, 0, 0, 220);
    wall.addColorStop(0, '#2a1c22');
    wall.addColorStop(0.62, '#1d141b');
    wall.addColorStop(1, '#120d13');
    c2d.fillStyle = wall;
    c2d.fillRect(0, 0, 480, 220);

    c2d.fillStyle = '#3b2a2b';
    c2d.fillRect(0, 148, 480, 72);
    c2d.fillStyle = '#2a1d22';
    c2d.fillRect(0, 143, 480, 7);

    // window with a warm sun
    c2d.fillStyle = '#171019';
    c2d.fillRect(44, 26, 88, 66);
    const sky = c2d.createLinearGradient(48, 30, 48, 88);
    sky.addColorStop(0, '#8a6a8a');
    sky.addColorStop(0.55, '#c98a5a');
    sky.addColorStop(1, '#f0bd7d');
    c2d.fillStyle = sky;
    c2d.fillRect(48, 30, 80, 58);
    c2d.fillStyle = 'rgba(255,230,170,0.85)';
    c2d.beginPath();
    c2d.arc(88, 62, 13, 0, Math.PI * 2);
    c2d.fill();
    c2d.strokeStyle = '#3a2a2b';
    c2d.lineWidth = 3;
    c2d.strokeRect(44, 26, 88, 66);
    c2d.beginPath();
    c2d.moveTo(88, 26);
    c2d.lineTo(88, 92);
    c2d.moveTo(44, 59);
    c2d.lineTo(132, 59);
    c2d.stroke();

    // string lights
    c2d.strokeStyle = 'rgba(120,95,70,0.6)';
    c2d.lineWidth = 1;
    c2d.beginPath();
    c2d.moveTo(145, 24);
    c2d.quadraticCurveTo(260, 42, 445, 28);
    c2d.stroke();
    for (let i = 0; i < 9; i++) {
      const lx = 158 + i * 32;
      const ly = 31 + Math.sin(i * 0.6) * 8;
      c2d.fillStyle = i % 3 === 0 ? '#ffd68a' : i % 3 === 1 ? '#f0a87a' : '#9fd8c0';
      c2d.beginPath();
      c2d.arc(lx, ly, 2.2, 0, Math.PI * 2);
      c2d.fill();
      c2d.fillStyle = 'rgba(255,210,140,0.12)';
      c2d.beginPath();
      c2d.arc(lx, ly, 7, 0, Math.PI * 2);
      c2d.fill();
    }

    // shelf of small treasures
    c2d.fillStyle = '#5a3f2a';
    c2d.fillRect(292, 96, 128, 5);
    c2d.fillRect(300, 101, 4, 12);
    c2d.fillRect(408, 101, 4, 12);
    const shelfCharms = Object.keys(G.meta.journal.charms || {}).slice(0, 3);
    shelfCharms.forEach((key, i) => {
      c2d.fillStyle = ['#ffd68a', '#9fd8c0', '#e0b08a'][i % 3];
      c2d.beginPath();
      c2d.arc(312 + i * 20, 88, 4.5, 0, Math.PI * 2);
      c2d.fill();
      c2d.fillStyle = 'rgba(20,14,20,0.7)';
      c2d.beginPath();
      c2d.arc(312 + i * 20, 88, 1.5, 0, Math.PI * 2);
      c2d.fill();
    });
    const shelfLetters = Object.keys(G.meta.journal.letters || {}).length;
    if (shelfLetters) {
      c2d.fillStyle = '#e9dcc0';
      c2d.save();
      c2d.translate(378, 88);
      c2d.rotate(-0.08);
      roundRect(c2d, -7, -9, 14, 16, 2);
      c2d.fill();
      c2d.restore();
    }
    const shelfFish = Object.keys(G.meta.journal.fish || {}).length;
    if (shelfFish) {
      c2d.fillStyle = '#b8d8d4';
      c2d.beginPath();
      c2d.ellipse(404, 89, 7, 3.5, 0.2, 0, Math.PI * 2);
      c2d.fill();
      c2d.beginPath();
      c2d.moveTo(411, 89);
      c2d.lineTo(417, 85);
      c2d.lineTo(417, 93);
      c2d.closePath();
      c2d.fill();
    }

    // rug
    const rug = DECOR.rug.find((d) => d.id === G.meta.home.slots.rug) || DECOR.rug[0];
    c2d.fillStyle = rug.color;
    c2d.globalAlpha = 0.75;
    c2d.beginPath();
    c2d.ellipse(245, 190, 88, 27, 0, 0, Math.PI * 2);
    c2d.fill();
    c2d.globalAlpha = 1;
    c2d.strokeStyle = 'rgba(255,225,180,0.22)';
    c2d.lineWidth = 2;
    c2d.beginPath();
    c2d.ellipse(245, 190, 74, 21, 0, 0, Math.PI * 2);
    c2d.stroke();

    // lamp
    const lamp = DECOR.lamp.find((d) => d.id === G.meta.home.slots.lamp) || DECOR.lamp[0];
    c2d.fillStyle = '#4a3428';
    c2d.fillRect(90, 155, 4, 40);
    c2d.fillStyle = '#6b4a30';
    c2d.beginPath();
    c2d.ellipse(92, 195, 14, 4, 0, 0, Math.PI * 2);
    c2d.fill();
    c2d.fillStyle = lamp.color;
    if (lamp.id === 'lamp-firefly') {
      c2d.fillRect(80, 136, 24, 22);
      c2d.fillStyle = 'rgba(159,224,208,0.4)';
      c2d.beginPath();
      c2d.arc(92, 147, 20, 0, Math.PI * 2);
      c2d.fill();
      c2d.fillStyle = '#e8fff5';
      c2d.beginPath();
      c2d.arc(86, 145, 1.4, 0, Math.PI * 2);
      c2d.arc(97, 150, 1.2, 0, Math.PI * 2);
      c2d.fill();
    } else if (lamp.id === 'lamp-sun') {
      c2d.beginPath();
      c2d.arc(92, 146, 11, 0, Math.PI * 2);
      c2d.fill();
      c2d.fillStyle = 'rgba(255,230,170,0.35)';
      c2d.beginPath();
      c2d.arc(92, 146, 26, 0, Math.PI * 2);
      c2d.fill();
    } else {
      c2d.beginPath();
      c2d.moveTo(76, 150);
      c2d.lineTo(108, 150);
      c2d.lineTo(101, 132);
      c2d.lineTo(83, 132);
      c2d.closePath();
      c2d.fill();
      c2d.fillStyle = 'rgba(255,220,150,0.25)';
      c2d.beginPath();
      c2d.arc(92, 148, 28, 0, Math.PI * 2);
      c2d.fill();
    }

    // plant
    const plant = DECOR.plant.find((d) => d.id === G.meta.home.slots.plant) || DECOR.plant[0];
    c2d.fillStyle = '#7a5137';
    c2d.beginPath();
    c2d.moveTo(386, 165);
    c2d.lineTo(410, 165);
    c2d.lineTo(406, 195);
    c2d.lineTo(390, 195);
    c2d.closePath();
    c2d.fill();
    if (plant.id === 'plant-mushroom') {
      c2d.fillStyle = '#c9705e';
      c2d.beginPath();
      c2d.ellipse(398, 160, 15, 9, 0, Math.PI, Math.PI * 2);
      c2d.fill();
      c2d.fillStyle = '#e8d6b0';
      c2d.fillRect(394, 160, 8, 8);
      c2d.fillStyle = 'rgba(255,235,210,0.8)';
      c2d.beginPath();
      c2d.arc(392, 156, 1.4, 0, Math.PI * 2);
      c2d.arc(404, 154, 1.7, 0, Math.PI * 2);
      c2d.fill();
    } else {
      c2d.strokeStyle = plant.color;
      c2d.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.42;
        c2d.beginPath();
        c2d.moveTo(398, 168);
        c2d.quadraticCurveTo(398 + Math.cos(a) * 12, 168 + Math.sin(a) * 12, 398 + Math.cos(a) * 20, 168 + Math.sin(a) * 20);
        c2d.stroke();
      }
      c2d.fillStyle = 'rgba(201,232,168,0.7)';
      c2d.beginPath();
      c2d.arc(398, 145, 3, 0, Math.PI * 2);
      c2d.fill();
    }

    // cushions and companions
    c2d.fillStyle = '#a45c50';
    c2d.beginPath();
    c2d.ellipse(205, 202, 19, 7, 0, 0, Math.PI * 2);
    c2d.ellipse(300, 204, 19, 7, 0, 0, Math.PI * 2);
    c2d.fill();

    const allPets = Object.keys(G.meta.journal.pets || {});
    const chosen = G.meta.home.companion && allPets.includes(G.meta.home.companion)
      ? [G.meta.home.companion]
      : allPets.slice(0, 3);
    const spots = chosen.length === 1 ? [[250, 200]] : [[205, 198], [300, 200], [250, 208]];
    chosen.forEach((kind, i) => {
      const [x, y] = spots[i] || spots[0];
      drawHomePet(c2d, x, y, kind);
      c2d.fillStyle = 'rgba(246,232,208,0.75)';
      c2d.font = '600 9px ui-sans-serif, system-ui, sans-serif';
      c2d.textAlign = 'center';
      c2d.fillText(G.meta.journal.pets[kind], x + 4, y + 17);
    });

    if (!chosen.length) {
      c2d.fillStyle = 'rgba(246,232,208,0.35)';
      c2d.font = '11px "Iowan Old Style", Georgia, serif';
      c2d.textAlign = 'center';
      c2d.fillText('A quiet cushion waits.', 250, 196);
    }

    // hearth glow
    const glow = c2d.createRadialGradient(250, 120, 0, 250, 120, 150);
    glow.addColorStop(0, 'rgba(255,190,110,0.08)');
    glow.addColorStop(1, 'rgba(255,190,110,0)');
    c2d.fillStyle = glow;
    c2d.fillRect(0, 0, 480, 220);
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

  function recordJournal(category, key, value) {
    if (!G.meta) return;
    const j = G.meta.journal;
    if (!j[category]) j[category] = {};
    if (typeof value === 'number') {
      j[category][key] = (j[category][key] || 0) + value;
    } else {
      j[category][key] = value;
    }
    saveMeta();
  }

  function openJournal() {
    if (!journalDialog || G.scene !== 'playing' || G.dialog) return;
    G.dialog = { type: 'journal' };
    G.keys = {};
    G.touch = { up: false, down: false, left: false, right: false };
    journalDialog.classList.remove('hidden');
    renderJournal();
    syncTouchUI();
    try { journalClose.focus({ preventScroll: true }); } catch (err) { journalClose.focus(); }
    sfx.quip();
  }

  function closeJournal() {
    if (journalDialog) journalDialog.classList.add('hidden');
    G.dialog = null;
    syncTouchUI();
  }

  function journalEntry(name, tag, known) {
    return '<div class="journal-entry' + (known ? '' : ' unknown') + '">' +
      '<span class="name">' + name + '</span>' +
      '<span class="tag">' + tag + '</span></div>';
  }

  function settingsHTML() {
    const st = G.meta.settings;
    const row = (label, desc, control) =>
      '<div class="setting-row"><div><div class="setting-label">' + label + '</div>' +
      '<div class="setting-desc">' + desc + '</div></div>' + control + '</div>';
    const toggle = (key, label, desc) => {
      const on = !!st[key];
      return row(label, desc,
        '<button type="button" class="toggle' + (on ? ' on' : '') + '"' +
        ' data-setting="' + key + '" aria-pressed="' + on + '">' + (on ? 'On' : 'Off') + '</button>');
    };

    return '<div class="settings-panel">' +
      row('Music volume', 'Gentle background loop', '<input id="set-music" type="range" min="0" max="100" value="' + Math.round(st.music * 100) + '">') +
      row('Sound effects', 'Picks, brews, bumps, footsteps', '<input id="set-sfx" type="range" min="0" max="100" value="' + Math.round(st.sfx * 100) + '">') +
      toggle('shake', 'Screen shake', 'A little wobble when hit or when walls give way') +
      toggle('reduceMotion', 'Reduce motion', 'Turns off shake and softens some movement') +
      toggle('tapMove', 'Tap to move', 'Tap or click a floor tile to walk there') +
      toggle('bigHud', 'Larger HUD text', 'Bigger hearts, counters, and notes') +
      toggle('highContrast', 'High-contrast accents', 'Brighter borders and labels') +
      '<p class="hint">Settings save immediately.</p>' +
      '</div>';
  }

  function bindSettings() {
    const st = G.meta.settings;
    const music = document.getElementById('set-music');
    const sfx = document.getElementById('set-sfx');
    if (music) {
      music.addEventListener('input', () => {
        st.music = Number(music.value) / 100;
        saveMeta();
        applyAudioSettings();
      });
    }
    if (sfx) {
      sfx.addEventListener('input', () => {
        st.sfx = Number(sfx.value) / 100;
        saveMeta();
        applyAudioSettings();
      });
    }
    document.querySelectorAll('[data-setting]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.setting;
        st[key] = !st[key];
        if (key === 'reduceMotion' && st.reduceMotion) st.shake = false;
        saveMeta();
        applySettings();
        renderJournal();
      });
    });
  }

  function journalStats(pairs) {
    return '<div class="journal-grid">' + pairs.map(([label, value]) =>
      '<div class="journal-stat"><span>' + label + '</span><strong>' + value + '</strong></div>'
    ).join('') + '</div>';
  }

  function almanacCard(title, tag, body, actions) {
    return '<div class="almanac-item"><div class="title"><span>' + title + '</span>' +
      (tag ? '<span class="almanac-tag">' + tag + '</span>' : '') + '</div>' +
      '<div class="body">' + body + '</div>' +
      (actions ? '<div class="almanac-actions">' + actions + '</div>' : '') + '</div>';
  }

  function renderItemsTab() {
    const j = G.meta.journal;
    const oil = Math.round(G.oil * 100) + '%';
    const current = {
      leaf: G.tea,
      herb: G.herbs,
      mushroom: G.mushrooms,
      oil: oil,
      potion: 0,
      haste: 0,
      fish: G.fish || 0,
      seed: G.seeds || 0,
      letter: G.letters || 0
    };
    const knownByDefault = { leaf: true, herb: true, mushroom: true, oil: true, potion: true, haste: true };

    let html = journalStats([
      ['Tea leaves', G.tea],
      ['Bitterleaf', G.herbs],
      ['Mushrooms', G.mushrooms],
      ['Lantern oil', oil],
      ['Buttons', G.buttons],
      ['Fish', G.fish || 0],
      ['Seeds', G.seeds || 0],
      ['Letters', G.letters || 0]
    ]);
    html += '<div class="journal-section"><h3>Satchel &amp; field guide</h3><div class="almanac-list">';

    for (const key of Object.keys(ITEM_INFO)) {
      const info = ITEM_INFO[key];
      const found = (j.items && j.items[key]) || 0;
      const have = current[key];
      const known = knownByDefault[key] || found > 0 || (typeof have === 'number' && have > 0);
      const tag = have ? String(have) : found ? found + ' found' : 'not found yet';
      html += almanacCard(
        known ? info.name : '???',
        tag,
        info.desc + '<br><em>' + info.use + '</em><br><span class="almanac-note">' +
          (known ? info.where : 'Find it somewhere in the hollow.') + '</span>'
      );
    }
    html += '</div></div>';
    return html;
  }

  function renderRecipesTab() {
    const j = G.meta.journal;
    let html = journalStats([
      ['Recipes discovered', Object.keys(j.recipes || {}).filter((k) => BREWS[k]).length],
      ['Mushrooms', G.mushrooms],
      ['Tea', G.tea],
      ['Herbs', G.herbs]
    ]);
    html += '<div class="journal-section"><h3>Campfire combinations</h3>' +
      '<p class="almanac-note">Brew known recipes at a campfire, or try a new blend to discover one.</p>' +
      '<div class="almanac-list">';

    for (const key of Object.keys(BREWS)) {
      const r = BREWS[key];
      const known = isRecipeKnown(key);
      const tag = known ? (r.base ? 'known' : 'discovered') : 'undiscovered';
      const effect = known ? r.effect : 'Effect unknown — experiment at a campfire.';
      html += almanacCard(
        r.name,
        tag,
        '<strong>' + brewCostText(r) + '</strong><br>' + effect
      );
    }
    html += '</div></div>';
    return html;
  }

  function renderCompanionsTab() {
    const j = G.meta.journal;
    const req = G.petRequest;
    let html = journalStats([
      ['Companions met', Object.keys(j.pets || {}).length],
      ['Travelling with', G.pet ? G.pet.name : '—'],
      ['Max hearts', G.maxHearts],
      ['Bond', G.petBond],
      ['Request', req ? (req.done ? 'complete' : req.progress + ' / ' + req.target) : '—']
    ]);
    if (G.pet && req) {
      html += '<div class="journal-section"><h3>' + G.pet.name + '\'s small request</h3>' +
        '<div class="almanac-item"><div class="title"><span>' +
        (req.done ? 'All done' : 'Would love ' + req.label) + '</span>' +
        '<span class="almanac-tag">' + (req.done ? 'complete' : req.progress + ' / ' + req.target) +
        '</span></div><div class="body">' +
        (req.done ? 'They are very pleased with themselves.' : 'A little nudge from a small friend.') +
        '</div></div></div>';
    }
    html += '<div class="journal-section"><h3>Small companions</h3>' +
      '<p class="almanac-note">Each friend carries one gentle ability. Only one travels with you.</p>' +
      '<div class="almanac-list">';

    for (const kind of Object.keys(PET_LABEL)) {
      const met = j.pets && j.pets[kind];
      const ability = PET_ABILITIES[kind];
      const current = G.pet && G.pet.kind === kind;
      html += almanacCard(
        met ? met + ' the ' + PET_LABEL[kind] : '??? the ' + PET_LABEL[kind],
        current ? 'travelling with you' : met ? 'met' : 'undiscovered',
        '<strong>' + ability.name + '</strong> · ' + ability.desc
      );
    }
    html += '</div></div>';
    return html;
  }

  function renderCharmsTab() {
    const j = G.meta.journal;
    let html = journalStats([
      ['Charms found', Object.keys(j.charms || {}).length],
      ['Equipped', G.loadout.length + ' / 2'],
      ['Loadout', equippedCharmLabel() || 'none yet'],
      ['Sunmotes', G.meta.sunmotes]
    ]);
    html += '<div class="journal-section"><h3>Lantern charms</h3>' +
      '<p class="almanac-note">Own as many as you find; equip two at a time.</p>' +
      '<div class="almanac-list">';

    for (const key of Object.keys(CHARM_INFO)) {
      const owned = !!G.charms[key];
      const equipped = G.loadout.indexOf(key) >= 0;
      const tag = equipped ? 'equipped' : owned ? 'owned' : 'not found';
      const action = '<button type="button" data-charm="' + key + '"' +
        (owned ? ' class="' + (equipped ? 'on' : '') + '"' : ' disabled') + '>' +
        (equipped ? 'Remove' : 'Equip') + '</button>';
      html += almanacCard(
        owned ? CHARM_INFO[key].name : '???',
        tag,
        CHARM_INFO[key].desc + (owned ? '' : '<br><span class="almanac-note">Not found yet — chests, Pip’s cart, or the Under-Gardener.</span>'),
        action
      );
    }
    html += '</div></div>';
    return html;
  }

  function toggleCharm(key) {
    if (!G.charms[key]) return;
    const i = G.loadout.indexOf(key);
    if (i >= 0) {
      G.loadout.splice(i, 1);
    } else {
      if (G.loadout.length >= 2) G.loadout.shift();
      G.loadout.push(key);
    }
    sfx.quip();
    renderJournal();
  }

  function renderFishTab() {
    const j = G.meta.journal;
    const foundFish = j.fish || {};
    const kinds = Object.keys(foundFish).filter((k) => FISH_INFO[k]).length;
    let html = journalStats([
      ['Fish in creel', G.fish || 0],
      ['Kinds caught', kinds + ' / ' + FISH_ORDER.length],
      ['Pet bond', G.petBond],
      ['Pond', 'the quiet pond']
    ]);
    html += '<div class="journal-section"><h3>The quiet pond</h3>' +
      '<p class="almanac-note">Catch fish at the pond, then roast them at a campfire. Eat one yourself or share it with your companion.</p>' +
      '<div class="almanac-list">';
    for (const kind of FISH_ORDER) {
      const info = FISH_INFO[kind];
      const count = G.fishBag[kind] || 0;
      const known = count > 0 || !!foundFish[kind];
      html += almanacCard(
        known ? info.name : '???',
        count ? count + ' in creel' : known ? 'caught before' : 'not caught yet',
        (known ? info.desc + '<br><em>' + info.effect + '</em>' : 'Something silver moves under the reeds.') +
        '<br><span class="almanac-note">Roast at a campfire · feed yourself or your pet.</span>'
      );
    }
    html += '</div></div>';
    return html;
  }

  function renderLettersTab() {
    const j = G.meta.journal;
    const found = j.letters || {};
    const count = Object.keys(found).filter((id) => LORE_LETTERS.some((l) => l.id === id)).length;
    let html = journalStats([
      ['Letters found', count + ' / ' + LORE_LETTERS.length],
      ['In satchel', G.letters || 0],
      ['Sunmotes', G.meta.sunmotes],
      ['Pages', 'read by lantern light']
    ]);
    html += '<div class="journal-section"><h3>Letters from before</h3>' +
      '<p class="almanac-note">Old pages turn up in quiet rooms. Each one is kept here.</p>' +
      '<div class="almanac-list">';
    for (const letter of LORE_LETTERS) {
      const known = !!found[letter.id];
      html += '<div class="almanac-item"><div class="title"><span>' +
        (known ? letter.title : '???') + '</span><span class="almanac-tag">' +
        (known ? 'read' : 'not found') + '</span></div><div class="body">' +
        (known ? letter.body : 'A folded page, still waiting in the dark.') +
        '</div></div>';
    }
    html += '</div></div>';
    return html;
  }

  function capturePostcard() {
    if (!G.meta || G.scene === 'title') return;
    try {
      const off = document.createElement('canvas');
      off.width = 480;
      off.height = 320;
      const octx = off.getContext('2d');
      const scale = canvas.width / Math.max(1, viewW);
      let sw = Math.min(canvas.width, canvas.height * 1.5, 720 * scale);
      let sh = sw / 1.5;
      const focusX = (G.player.px * TS + TS / 2 - G.cam.x) * scale;
      const focusY = (G.player.py * TS + TS / 2 - G.cam.y) * scale;
      const sx = clamp(focusX - sw / 2, 0, canvas.width - sw);
      const sy = clamp(focusY - sh / 2, 0, canvas.height - sh);
      octx.drawImage(canvas, sx, sy, sw, sh, 0, 0, 480, 320);

      const shade = octx.createLinearGradient(0, 190, 0, 320);
      shade.addColorStop(0, 'rgba(8,6,12,0)');
      shade.addColorStop(1, 'rgba(8,6,12,0.78)');
      octx.fillStyle = shade;
      octx.fillRect(0, 180, 480, 140);
      octx.strokeStyle = 'rgba(240,220,180,0.35)';
      octx.lineWidth = 3;
      octx.strokeRect(7, 7, 466, 306);

      octx.fillStyle = 'rgba(240,189,125,0.9)';
      octx.font = '600 10px ui-sans-serif, system-ui, sans-serif';
      octx.fillText('LANTERN HOLLOW', 22, 258);
      octx.fillStyle = '#f6e8d0';
      octx.font = '20px "Iowan Old Style", "Palatino Linotype", Georgia, serif';
      const caption = (G.pet ? G.pet.name + ' · ' : '') +
        (G.weather && WEATHER_INFO[G.weather] ? WEATHER_INFO[G.weather].name : theme().name);
      octx.fillText(caption, 22, 286);
      octx.fillStyle = 'rgba(236,222,200,0.65)';
      octx.font = '10px ui-sans-serif, system-ui, sans-serif';
      octx.fillText('Floor ' + G.floor + ' · ' + theme().name, 22, 303);

      const data = off.toDataURL('image/jpeg', 0.62);
      G.meta.postcards.unshift({
        id: Date.now(),
        data,
        caption: 'Floor ' + G.floor + ' · ' + caption,
        floor: G.floor
      });
      while (G.meta.postcards.length > 6) G.meta.postcards.pop();
      saveMeta();
      sfx.shutter();
      toast('Postcard tucked into the almanac.');
      renderJournal();
    } catch (err) {
      toast('The postcard would not hold still.');
    }
  }

  function deletePostcard(id) {
    if (!G.meta) return;
    G.meta.postcards = (G.meta.postcards || []).filter((p) => p.id !== id);
    saveMeta();
    renderJournal();
  }

  function renderPostcardsTab() {
    const cards = G.meta.postcards || [];
    let html = journalStats([
      ['Postcards', cards.length + ' / 6'],
      ['Floor', 'floor ' + G.floor],
      ['Weather', G.weather ? WEATHER_INFO[G.weather].name : '—'],
      ['Companion', G.pet ? G.pet.name : '—']
    ]);
    html += '<div class="journal-section"><h3>Postcards</h3>' +
      '<p class="almanac-note">Capture a little of this walk. Postcards are saved in the browser.</p>' +
      '<div class="postcard-actions"><button type="button" class="btn ghost" id="make-postcard">Capture this view</button></div>';
    if (cards.length) {
      html += '<div class="postcard-gallery">' + cards.map((card) =>
        '<div class="postcard-card"><img alt="Postcard from ' + card.caption + '" src="' + card.data + '">' +
        '<div class="postcard-meta"><span>' + card.caption + '</span>' +
        '<button type="button" data-del-postcard="' + card.id + '">Remove</button></div></div>'
      ).join('') + '</div>';
    } else {
      html += '<p class="almanac-note">No postcards yet. The first one is always a little shy.</p>';
    }
    html += '</div>';
    return html;
  }

  function renderJournal() {
    if (!journalBody || !G.meta) return;
    const j = G.meta.journal;
    const sumNums = (obj) => Object.values(obj || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
    const tab = G.journalTab || 'journal';

    document.querySelectorAll('[data-jtab]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.jtab === tab);
    });

    if (tab === 'settings') {
      journalBody.innerHTML = settingsHTML();
      bindSettings();
      return;
    }
    if (tab === 'items') {
      journalBody.innerHTML = renderItemsTab();
      return;
    }
    if (tab === 'recipes') {
      journalBody.innerHTML = renderRecipesTab();
      return;
    }
    if (tab === 'companions') {
      journalBody.innerHTML = renderCompanionsTab();
      return;
    }
    if (tab === 'charms') {
      journalBody.innerHTML = renderCharmsTab();
      journalBody.querySelectorAll('[data-charm]').forEach((btn) => {
        btn.addEventListener('click', () => toggleCharm(btn.dataset.charm));
      });
      return;
    }
    if (tab === 'letters') {
      journalBody.innerHTML = renderLettersTab();
      return;
    }
    if (tab === 'fish') {
      journalBody.innerHTML = renderFishTab();
      return;
    }
    if (tab === 'postcards') {
      journalBody.innerHTML = renderPostcardsTab();
      const make = document.getElementById('make-postcard');
      if (make) make.addEventListener('click', capturePostcard);
      journalBody.querySelectorAll('[data-del-postcard]').forEach((btn) => {
        btn.addEventListener('click', () => deletePostcard(Number(btn.dataset.delPostcard)));
      });
      return;
    }

    const stats = [
      ['Floors wandered', sumNums(j.floors)],
      ['Grumbles soothed', sumNums(j.grumbles)],
      ['Items found', sumNums(j.items)],
      ['Companions met', Object.keys(j.pets || {}).length],
      ['Charms found', Object.keys(j.charms || {}).length],
      ['Sunmotes', G.meta.sunmotes]
    ];

    let html = journalStats(stats);

    if (tab === 'bestiary') {
      html += '<div class="journal-section"><h3>Grumbles</h3>';
      for (const kind of Object.keys(JOURNAL_GRUMBLES)) {
        const count = (j.grumbles && j.grumbles[kind]) || 0;
        html += journalEntry(count ? JOURNAL_GRUMBLES[kind] : '???', count ? count + ' soothed' : 'undiscovered', count > 0);
      }
      html += '</div><div class="journal-section"><h3>The deeper rooms</h3>';
      html += journalEntry(j.bosses && j.bosses.gardener ? 'The Under-Gardener' : '???',
        j.bosses && j.bosses.gardener ? 'bloomed' : 'undiscovered', !!(j.bosses && j.bosses.gardener));
      html += '</div>';
    } else {
      html += '<div class="journal-section"><h3>At a glance</h3>';
      html += journalEntry(G.pet ? G.pet.name + ' the ' + PET_LABEL[G.pet.kind] : 'No companion',
        G.pet ? PET_ABILITIES[G.pet.kind].name : 'a cushion is waiting', !!G.pet);
      html += journalEntry(G.loadout.length ? equippedCharmLabel() : 'No charms equipped',
        G.loadout.length + ' / 2 slots', G.loadout.length > 0);
      html += journalEntry(G.tea + ' tea · ' + G.herbs + ' herbs · ' + G.mushrooms + ' mushrooms',
        'satchel', true);
      html += '</div><div class="journal-section"><h3>Places</h3>';
      for (const theme of THEMES) {
        const count = (j.floors && j.floors[theme.name]) || 0;
        html += journalEntry(count ? theme.name : '???', count ? count + ' visit' + (count === 1 ? '' : 's') : 'undiscovered', count > 0);
      }
      html += '</div>';
    }

    journalBody.innerHTML = html;
  }

  function openPetDialog() {
    if (!petDialog || !G.floorPet) return;
    G.dialog = { type: 'pet', pet: G.floorPet };
    recordJournal('pets', G.floorPet.kind, G.floorPet.name);
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

    const ability = PET_ABILITIES[next.kind];
    if (petAbility) {
      petAbility.textContent = ability
        ? ability.name + ' · ' + ability.desc
        : '';
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

  function newPetRequest() {
    if (!G.pet) { G.petRequest = null; return; }
    const base = PET_REQUESTS[Math.floor(Math.random() * PET_REQUESTS.length)];
    G.petRequest = { ...base, progress: 0, done: false };
    toast(G.pet.name + ' would love ' + base.label + '.');
  }

  function advancePetRequest(kind, amount) {
    const req = G.petRequest;
    if (!req || req.done || req.kind !== kind) return;
    req.progress += amount || 0;
    if (req.progress < req.target) return;
    req.done = true;
    const r = req.reward;
    if (r.type === 'tea') G.tea += r.amount;
    else if (r.type === 'buttons') G.buttons += r.amount;
    else if (r.type === 'sunmote') awardSunmotes(r.amount);
    else if (r.type === 'oil') G.oil = Math.min(1, G.oil + r.amount);
    const rewardText = r.type === 'sunmote' ? r.amount + ' sunmote'
      : r.type === 'oil' ? 'a little oil'
      : '+' + r.amount + ' ' + r.type;
    toast(G.pet.name + ' is delighted · ' + rewardText);
    sfx.charm();
    burst(G.pet.px * TS + TS / 2, G.pet.py * TS + TS / 2 - 8, '#ffd0c0', 12);
  }

  function randomFishKind() {
    const roll = Math.random();
    if (roll < 0.08) return 'boot';
    if (roll < 0.55) return 'minnow';
    if (roll < 0.78) return 'carp';
    if (roll < 0.94) return 'dace';
    return 'moonfin';
  }

  function openFishingDialog() {
    if (!fishingDialog) return;
    G.dialog = { type: 'fishing' };
    G.fishing = { phase: 'idle', biteAt: 0, windowUntil: 0, lastCatch: null };
    G.fishingUiTimer = 0;
    G.keys = {};
    G.touch = { up: false, down: false, left: false, right: false };
    fishingDialog.classList.remove('hidden');
    updateFishingDialog();
    syncTouchUI();
    try { fishAction.focus({ preventScroll: true }); } catch (err) { fishAction.focus(); }
  }

  function closeFishingDialog() {
    if (fishingDialog) fishingDialog.classList.add('hidden');
    G.dialog = null;
    G.fishing = null;
    syncTouchUI();
  }

  function updateFishingDialog() {
    if (!G.fishing || !fishStatus) return;
    const st = G.fishing;
    if (st.phase === 'waiting' && G.time >= st.biteAt) {
      st.phase = 'bite';
      st.windowUntil = G.time + 1.8;
      sfx.quip();
    } else if (st.phase === 'bite' && G.time > st.windowUntil) {
      st.phase = 'idle';
      if (fishNote) fishNote.textContent = 'The line goes slack. It slips away.';
    }

    if (st.phase === 'idle') {
      fishStatus.textContent = 'The pond is still. Reeds lean over the water.';
      fishAction.textContent = 'Cast the line';
    } else if (st.phase === 'waiting') {
      fishStatus.textContent = 'The line settles. Something is thinking about it.';
      fishAction.textContent = 'Wait for a bite…';
    } else if (st.phase === 'bite') {
      fishStatus.textContent = 'A tug at the line!';
      fishAction.textContent = 'Reel!';
    } else if (st.phase === 'caught') {
      const info = FISH_INFO[st.lastCatch];
      fishStatus.textContent = 'Caught · ' + info.name;
      fishAction.textContent = 'Cast again';
    }
  }

  function fishActionClick() {
    const st = G.fishing;
    if (!st) return;
    if (st.phase === 'idle' || st.phase === 'caught') {
      st.phase = 'waiting';
      st.biteAt = G.time + 2 + Math.random() * 3.5;
      st.lastCatch = null;
      if (fishNote) fishNote.textContent = 'Breathe. Let the pond come to you.';
      sfx.quip();
    } else if (st.phase === 'waiting') {
      if (fishNote) fishNote.textContent = 'Too soon — let it take the bait.';
    } else if (st.phase === 'bite') {
      const kind = randomFishKind();
      G.fish = (G.fish || 0) + 1;
      G.fishBag[kind] = (G.fishBag[kind] || 0) + 1;
      st.lastCatch = kind;
      st.phase = 'caught';
      recordJournal('fish', kind, true);
      toast('Caught · ' + FISH_INFO[kind].name);
      if (fishNote) fishNote.textContent = FISH_INFO[kind].desc;
      sfx.charm();
    }
    updateFishingDialog();
  }

  function openCookDialog() {
    if (G.fish < 1) {
      toast('No fish in the creel yet.');
      return;
    }
    G.cookReturn = !!G.dialog && G.dialog.type === 'fire';
    if (G.cookReturn) closeFireDialog();
    G.dialog = { type: 'cook' };
    G.keys = {};
    G.touch = { up: false, down: false, left: false, right: false };
    if (cookNote) cookNote.textContent = '';
    cookDialog.classList.remove('hidden');
    updateCookDialog();
    syncTouchUI();
    try { cookClose.focus({ preventScroll: true }); } catch (err) { cookClose.focus(); }
  }

  function closeCookDialog() {
    if (cookDialog) cookDialog.classList.add('hidden');
    const back = G.cookReturn;
    G.cookReturn = false;
    G.dialog = null;
    syncTouchUI();
    if (back) openFireDialog();
  }

  function healOne() {
    if (G.hearts < G.maxHearts) {
      G.hearts++;
      return true;
    }
    G.tea++;
    return false;
  }

  function updateCookDialog() {
    if (!cookList) return;
    if (cookStock) cookStock.textContent = 'Fish ' + (G.fish || 0) + ' · Bond ' + G.petBond + (G.pet ? ' · ' + G.pet.name : '');

    const kinds = FISH_ORDER.filter((kind) => (G.fishBag[kind] || 0) > 0);
    if (!kinds.length) {
      cookList.innerHTML = '<div class="cook-row"><div><div class="cook-copy">The creel is empty.</div>' +
        '<div class="cook-note">Catch a fish at the quiet pond.</div></div></div>';
      return;
    }

    cookList.innerHTML = kinds.map((kind) => {
      const info = FISH_INFO[kind];
      return '<div class="cook-row"><div><div class="cook-copy">' + info.name + ' × ' +
        G.fishBag[kind] + '</div><div class="cook-note">' + info.effect + '</div></div>' +
        '<div class="cook-actions">' +
        '<button type="button" data-cook="' + kind + '" data-mode="eat">Eat</button>' +
        '<button type="button" data-cook="' + kind + '" data-mode="pet"' + (G.pet ? '' : ' disabled') +
        '>Feed pet</button></div></div>';
    }).join('');

    cookList.querySelectorAll('[data-cook]').forEach((btn) => {
      btn.addEventListener('click', () => cookFish(btn.dataset.cook, btn.dataset.mode));
    });
  }

  function cookFish(kind, mode) {
    if (!G.fishBag[kind]) return;
    if (mode === 'pet' && !G.pet) return;
    G.fishBag[kind]--;
    G.fish = Math.max(0, G.fish - 1);
    const info = FISH_INFO[kind];

    if (mode === 'pet') {
      G.petBond++;
      let message = G.pet.name + ' munches the ' + info.name.toLowerCase() + ' happily.';
      if (G.petBond % 3 === 0) {
        awardSunmotes(1);
        message += ' They find a sunmote in the grass and bring it to you.';
      }
      if (cookNote) cookNote.textContent = message;
      toast(G.pet.name + ' enjoys a roasted fish.');
      burst(G.pet.px * TS + TS / 2, G.pet.py * TS + TS / 2 - 8, '#ffd0c0', 14);
    } else if (info.self === 'heal') {
      const healed = healOne();
      if (cookNote) cookNote.textContent = healed ? 'The fish is warm and simple. +1 heart.' : 'You are full; you tuck a tea leaf away instead.';
      toast('Roasted ' + info.name.toLowerCase() + ' · +1 heart');
    } else if (info.self === 'carp') {
      healOne();
      G.oil = Math.min(1, G.oil + 0.1);
      if (cookNote) cookNote.textContent = 'The carp is rich and steady. +1 heart, +10% oil.';
      toast('Roasted lantern carp · warmth and a steadier flame');
    } else if (info.self === 'dace') {
      healOne();
      G.tea++;
      if (cookNote) cookNote.textContent = 'The dace tastes faintly of tea. +1 heart, +1 tea.';
      toast('Roasted tea dace · +1 heart, +1 tea');
    } else if (info.self === 'moon') {
      healOne();
      G.moon = 20;
      revealMap();
      if (cookNote) cookNote.textContent = 'The moonfin is pale and cool. +1 heart, and the map glows.';
      toast('Roasted moonfin · the map glows');
    } else {
      G.buttons++;
      if (cookNote) cookNote.textContent = 'It is not a fish. But the button is nice. +1 button.';
      toast('You roast the boot. +1 button');
    }

    sfx.brew();
    updateCookDialog();
  }

  function ensureHomeRoom() {
    if (!G.meta) return;
    if (!G.meta.homeRoom) {
      G.meta.homeRoom = {
        owned: ['rug-hearth', 'lamp-lantern-home', 'plant-fern-home', 'table-low', 'wall-none', 'cushion-patch'],
        slots: {
          rug: 'rug-hearth',
          lamp: 'lamp-lantern-home',
          plant: 'plant-fern-home',
          table: 'table-low',
          wall: 'wall-none',
          cushion: 'cushion-patch'
        }
      };
    }
    const hr = G.meta.homeRoom;
    if (!Array.isArray(hr.owned)) hr.owned = [];
    if (!hr.slots) hr.slots = {};
    for (const slot of Object.keys(HOME_FURNITURE)) {
      const list = HOME_FURNITURE[slot];
      if (!list.some((item) => item.id === hr.slots[slot])) hr.slots[slot] = list[0].id;
      if (!hr.owned.includes(list[0].id)) hr.owned.push(list[0].id);
    }
  }

  function openHomeStore() {
    if (!homeStoreDialog || !G.interior || G.interior.type !== 'home') return;
    G.dialog = { type: 'homeStore' };
    G.keys = {};
    G.touch = { up: false, down: false, left: false, right: false };
    if (homeStoreNote) homeStoreNote.textContent = '';
    homeStoreDialog.classList.remove('hidden');
    updateHomeStore();
    syncTouchUI();
    try { homeStoreClose.focus({ preventScroll: true }); } catch (err) { homeStoreClose.focus(); }
  }

  function closeHomeStore() {
    if (homeStoreDialog) homeStoreDialog.classList.add('hidden');
    G.dialog = null;
    syncTouchUI();
  }

  function updateHomeStore() {
    if (!homeStoreList || !G.meta) return;
    ensureHomeRoom();
    const hr = G.meta.homeRoom;
    if (homeStoreBalance) homeStoreBalance.textContent = G.buttons + ' button' + (G.buttons === 1 ? '' : 's');

    homeStoreList.innerHTML = Object.keys(HOME_FURNITURE).map((slot) => {
      const options = HOME_FURNITURE[slot].map((item) => {
        const owned = hr.owned.includes(item.id);
        const selected = hr.slots[slot] === item.id;
        const disabled = !owned && G.buttons < item.cost;
        return '<button type="button" class="decor-chip' + (selected ? ' selected' : '') + '"' +
          ' data-home-slot="' + slot + '" data-home-item="' + item.id + '"' +
          (disabled ? ' disabled' : '') + '>' +
          (owned ? item.name : item.name + ' · ' + item.cost + ' b') + '</button>';
      }).join('');
      return '<div class="decor-slot"><div class="decor-label">' +
        (HOME_SLOT_LABELS[slot] || slot) + '</div><div class="decor-options">' +
        options + '</div></div>';
    }).join('');

    homeStoreList.querySelectorAll('[data-home-item]').forEach((btn) => {
      btn.addEventListener('click', () => chooseHomeFurniture(btn.dataset.homeSlot, btn.dataset.homeItem));
    });
  }

  function chooseHomeFurniture(slot, id) {
    if (!G.meta) return;
    ensureHomeRoom();
    const item = (HOME_FURNITURE[slot] || []).find((entry) => entry.id === id);
    if (!item) return;
    const hr = G.meta.homeRoom;
    if (!hr.owned.includes(id)) {
      if (G.buttons < item.cost) return;
      G.buttons -= item.cost;
      hr.owned.push(id);
      if (homeStoreNote) homeStoreNote.textContent = item.name + ' bought and delivered to the Hearthroom.';
      sfx.charm();
    } else if (homeStoreNote) {
      homeStoreNote.textContent = item.name + ' placed.';
    }
    hr.slots[slot] = id;
    saveMeta();
    updateHomeStore();
  }

  function useNookFocus() {
    if (!G.interior || G.interior.type !== 'nook') return;
    if (G.interior.used) {
      toast('The reading fire is low and warm. You sit for a moment.');
      return;
    }
    G.interior.used = true;
    G.tea += 2;
    const found = (G.meta && G.meta.journal.letters) || {};
    const letter = LORE_LETTERS.find((entry) => !found[entry.id]);
    if (letter) {
      recordJournal('letters', letter.id, true);
      toast('A page falls from the book · ' + letter.title + ' · +2 tea');
    } else {
      toast('A quiet read by the fire · +2 tea');
    }
    sfx.brew();
    burst(G.nookFocus.x * TS + TS / 2, G.nookFocus.y * TS + TS / 2 - 6, '#ffd89a', 14);
  }

  function openVisitorDialog() {
    const v = G.visitor;
    if (!visitorDialog || !v) return;
    G.dialog = { type: 'visitor', visitor: v };
    G.keys = {};
    G.touch = { up: false, down: false, left: false, right: false };
    visitorKicker.textContent = v.met ? 'a familiar face' : 'a visitor at the fire';
    visitorTitle.textContent = v.name;
    visitorText.textContent = v.met
      ? v.story + ' They settle back beside the fire, content to share the quiet.'
      : v.story;
    visitorGift.textContent = v.met
      ? 'You have already shared what they had to give.'
      : 'They have a small gift for a fellow traveller.';
    visitorYes.textContent = v.met ? 'Sit a while' : 'Accept gift';
    visitorDialog.classList.remove('hidden');
    syncTouchUI();
    try { visitorYes.focus({ preventScroll: true }); } catch (err) { visitorYes.focus(); }
    sfx.quip();
  }

  function closeVisitorDialog() {
    if (visitorDialog) visitorDialog.classList.add('hidden');
    G.dialog = null;
    syncTouchUI();
  }

  function visitorAction() {
    const v = G.visitor;
    if (!v) return;
    if (v.met) { closeVisitorDialog(); return; }
    v.met = true;
    recordJournal('visitors', v.kind, true);

    if (v.gift === 'tea') {
      G.tea += v.amount || 2;
    } else if (v.gift === 'seed') {
      G.seeds += v.amount || 1;
    } else if (v.gift === 'buttons') {
      G.buttons += v.amount || 4;
    } else if (v.gift === 'herbs') {
      G.herbs += v.amount || 2;
    } else if (v.gift === 'sunmote') {
      awardSunmotes(v.amount || 1);
    } else if (v.gift === 'recipe') {
      const unknowns = Object.keys(BREWS).filter((k) => BREWS[k].experimental && !isRecipeKnown(k));
      if (unknowns.length) {
        const key = unknowns[Math.floor(Math.random() * unknowns.length)];
        recordJournal('recipes', key, true);
        v.giftText = 'The ghost traces a recipe in the ash: ' + BREWS[key].name + '.';
      } else {
        G.tea += 2;
        v.giftText = 'The ghost smiles and leaves two tea leaves on the hearth.';
      }
    }

    toast(v.giftText);
    sfx.charm();
    visitorGift.textContent = v.giftText + ' You share the fire for a while.';
    visitorYes.textContent = 'Sit a while';
    sfx.pickup();
  }

  function openGardenDialog() {
    if (!gardenDialog || !G.garden) return;
    G.dialog = { type: 'garden' };
    G.keys = {};
    G.touch = { up: false, down: false, left: false, right: false };
    if (!G.garden.gifted) {
      G.garden.gifted = true;
      G.seeds += 2;
      if (gardenNote) gardenNote.textContent = 'A paper packet was tucked under the bed: +2 tea seeds.';
    }
    gardenDialog.classList.remove('hidden');
    updateGardenDialog();
    syncTouchUI();
    try { gardenClose.focus({ preventScroll: true }); } catch (err) { gardenClose.focus(); }
  }

  function closeGardenDialog() {
    if (gardenDialog) gardenDialog.classList.add('hidden');
    G.dialog = null;
    syncTouchUI();
  }

  function updateGardenDialog() {
    if (!gardenPlots || !G.garden) return;
    if (gardenStock) gardenStock.textContent = 'Seeds ' + G.seeds + ' · Herbs ' + G.herbs;

    gardenPlots.innerHTML = G.garden.plots.map((plot, i) => {
      let copy;
      let action;
      if (!plot) {
        copy = 'A soft, empty row';
        action = '<button type="button" data-plot="' + i + '"' + (G.seeds < 1 ? ' disabled' : '') + '>Plant · 1 seed</button>';
      } else if (G.time < plot.readyAt) {
        copy = 'Something green is thinking about it';
        action = '<button type="button" disabled>Growing · ' + Math.ceil(plot.readyAt - G.time) + 's</button>';
      } else {
        copy = 'Ready to harvest';
        action = '<button type="button" data-plot="' + i + '">Harvest</button>';
      }
      return '<div class="garden-plot"><div><div class="plot-copy">Plot ' + (i + 1) + '</div>' +
        '<div class="plot-note">' + copy + '</div></div>' + action + '</div>';
    }).join('');

    gardenPlots.querySelectorAll('[data-plot]').forEach((btn) => {
      const i = Number(btn.dataset.plot);
      const plot = G.garden.plots[i];
      btn.addEventListener('click', () => {
        if (!plot) {
          if (G.seeds < 1) return;
          G.seeds--;
          G.garden.plots[i] = { readyAt: G.time + 45 };
          if (gardenNote) gardenNote.textContent = 'Planted. Give it a little wandering time.';
          sfx.pickup();
        } else if (G.time >= plot.readyAt) {
          G.garden.plots[i] = null;
          G.herbs += 2;
          G.mushrooms += 1;
          if (Math.random() < 0.35) G.seeds += 1;
          if (gardenNote) gardenNote.textContent = 'Harvested · +2 bitterleaf, +1 mushroom' +
            (G.seeds ? ' and a seed for next time.' : '.');
          toast('Tea garden harvest · +2 herbs, +1 mushroom');
          burst(G.setPiece.focus.x * TS + TS / 2, G.setPiece.focus.y * TS + TS / 2 - 6, '#c9e8a8', 16);
          sfx.brew();
        }
        updateGardenDialog();
      });
    });
  }

  function closeActiveDialog() {
    if (!G.dialog) return;
    if (G.dialog.type === 'fire') closeFireDialog();
    else if (G.dialog.type === 'shop') closeShopDialog();
    else if (G.dialog.type === 'favor') closeFavorDialog();
    else if (G.dialog.type === 'meta') closeMetaDialog();
    else if (G.dialog.type === 'journal') closeJournal();
    else if (G.dialog.type === 'garden') closeGardenDialog();
    else if (G.dialog.type === 'visitor') closeVisitorDialog();
    else if (G.dialog.type === 'fishing') closeFishingDialog();
    else if (G.dialog.type === 'cook') closeCookDialog();
    else if (G.dialog.type === 'homeStore') closeHomeStore();
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
      grantCharm(charm);
      toast('Charm found · ' + CHARM_INFO[charm].name +
        (G.loadout.includes(charm) ? ' (equipped)' : ' — equip it in the almanac'));
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

  function isRecipeKnown(key) {
    const r = BREWS[key];
    if (!r) return false;
    if (r.base) return true;
    return !!(G.meta && G.meta.journal.recipes && G.meta.journal.recipes[key]);
  }

  function canBrew(key) {
    const r = BREWS[key];
    if (!r || !isRecipeKnown(key)) return false;
    if (key === 'hearty' && G.hearts >= G.maxHearts) return false;
    if (key === 'honey' && G.maxHearts >= 6) return false;
    return G.tea >= r.tea && G.herbs >= r.herbs &&
      G.mushrooms >= r.mushrooms && G.oil >= r.oil;
  }

  function brewCostText(r) {
    const parts = [];
    if (r.tea) parts.push(r.tea + ' tea');
    if (r.herbs) parts.push(r.herbs + ' herb' + (r.herbs > 1 ? 's' : ''));
    if (r.mushrooms) parts.push(r.mushrooms + ' mushroom' + (r.mushrooms > 1 ? 's' : ''));
    if (r.oil) parts.push(Math.round(r.oil * 100) + '% oil');
    return parts.join(' · ');
  }

  function updateFireDialog() {
    if (!fireStock) return;
    fireStock.textContent =
      'Tea ' + G.tea + ' · Herbs ' + G.herbs + ' · Mushrooms ' + G.mushrooms +
      ' · Oil ' + Math.round(G.oil * 100) + '%';

    for (const btn of brewButtons) {
      const key = btn.dataset.brew;
      const r = BREWS[key];
      if (!r) continue;
      const known = isRecipeKnown(key);
      btn.classList.toggle('hidden', !known);
      if (!known) continue;

      const full = (key === 'hearty' && G.hearts >= G.maxHearts) ||
        (key === 'honey' && G.maxHearts >= 6);
      const ok = canBrew(key);
      btn.disabled = !ok;
      btn.classList.toggle('short', !ok && !full);
      const cost = document.getElementById('cost-' + key);
      if (cost) cost.textContent = full ? 'At full hearts' : brewCostText(r);
    }

    if (experimentBtn) {
      const unknowns = Object.keys(BREWS).filter((k) => BREWS[k].experimental && !isRecipeKnown(k));
      const ready = G.tea >= 1 && G.herbs >= 1 && G.mushrooms >= 1;
      experimentBtn.disabled = !ready;
      experimentBtn.textContent = unknowns.length
        ? 'Try a new blend · 1 tea · 1 herb · 1 mushroom'
        : 'Try a new blend · all recipes known';
    }
    if (fireCook) {
      fireCook.disabled = (G.fish || 0) < 1;
      fireCook.textContent = (G.fish || 0) > 0
        ? 'Cook a fish · ' + G.fish + ' in the creel'
        : 'Cook a fish · none in the creel';
    }
  }

  function applyBrewEffect(key) {
    if (key === 'hearty') {
      G.hearts = Math.min(G.maxHearts, G.hearts + 2);
      brewNote.textContent = 'Hearty tea. Warmth spreads through your boots.';
    } else if (key === 'swift') {
      G.haste = Math.max(G.haste, 20);
      brewNote.textContent = 'Swift tea. The air feels lighter.';
    } else if (key === 'bright') {
      G.bright = 60;
      brewNote.textContent = 'Bright tea. The lantern burns clear and wide.';
    } else if (key === 'honey') {
      G.maxHearts = Math.min(6, G.maxHearts + 1);
      G.hearts = Math.min(G.maxHearts, G.hearts + 1);
      brewNote.textContent = 'Honey tea. Your heart has a little more room in it.';
    } else if (key === 'moon') {
      G.moon = 30;
      revealMap();
      brewNote.textContent = 'Moonlight tea. The map glows like a window at night.';
    } else if (key === 'firefly') {
      G.firefly = 25;
      brewNote.textContent = 'Firefly tea. A constellation follows you home.';
    } else if (key === 'hush') {
      G.hush = 20;
      brewNote.textContent = 'Hush tea. The grumbles settle down for a nap.';
    }
  }

  function brew(key) {
    if (!G.dialog || G.dialog.type !== 'fire' || !canBrew(key)) return;
    const r = BREWS[key];
    G.tea -= r.tea;
    G.herbs -= r.herbs;
    G.mushrooms -= r.mushrooms;
    if (r.oil) G.oil = Math.max(0, G.oil - r.oil);

    applyBrewEffect(key);
    recordJournal('recipes', key, true);
    burst(G.fire.x * TS + TS / 2, G.fire.y * TS + TS / 2 - 6, '#ffd89a', 14);
    sfx.brew();
    toast('Brewed · ' + r.name);
    updateFireDialog();
  }

  function experimentBrew() {
    if (!G.dialog || G.dialog.type !== 'fire') return;
    if (G.tea < 1 || G.herbs < 1 || G.mushrooms < 1) return;
    G.tea -= 1;
    G.herbs -= 1;
    G.mushrooms -= 1;

    const unknowns = Object.keys(BREWS).filter((k) => BREWS[k].experimental && !isRecipeKnown(k));
    if (unknowns.length) {
      const key = unknowns[Math.floor(Math.random() * unknowns.length)];
      applyBrewEffect(key);
      recordJournal('recipes', key, true);
      brewNote.textContent = 'A new blend! ' + BREWS[key].name + ' · ' + BREWS[key].effect;
      toast('Discovered · ' + BREWS[key].name);
      sfx.charm();
    } else {
      if (G.hearts < G.maxHearts) G.hearts++;
      else G.oil = Math.min(1, G.oil + 0.2);
      brewNote.textContent = 'An odd brew — harmless, a little warm, and somehow comforting.';
      toast('An odd brew · a small comfort');
      sfx.brew();
    }
    burst(G.fire.x * TS + TS / 2, G.fire.y * TS + TS / 2 - 6, '#ffe9b8', 14);
    updateFireDialog();
  }

  function removePetAbility(kind) {
    if (kind === 'bear' && G.maxHearts > 1) {
      G.maxHearts--;
      G.hearts = Math.min(G.hearts, G.maxHearts);
    }
  }

  function addPetAbility(kind) {
    if (kind === 'bear' && G.maxHearts < 6) {
      G.maxHearts++;
      G.hearts = Math.min(G.maxHearts, G.hearts + 1);
    }
    if (kind === 'fox' && G.secret) {
      G.secret.revealed = true;
      revealAround(G.secret.wall.x, G.secret.wall.y, 2);
    }
  }

  function confirmPetSwap() {
    if (!G.dialog || !G.floorPet) return;
    const next = G.dialog.pet;
    const p = G.player;
    const had = G.pet;

    if (had) removePetAbility(had.kind);
    addPetAbility(next.kind);

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
    newPetRequest();
    closePetDialog();
  }

  function syncTouchUI() {
    if (G.dialog) G.tapPath = [];
    if (!touchEl) return;
    const show = isTouch && G.scene === 'playing' && !G.dialog;
    touchEl.classList.toggle('show', show);
    touchEl.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  function touchLabel() {
    const p = G.player;
    if (!p) return 'USE';
    if (G.interior) {
      if (G.homeStore && Math.abs(p.tx - G.homeStore.x) + Math.abs(p.ty - G.homeStore.y) <= 1) return 'STORE';
      if (G.nookFocus && Math.abs(p.tx - G.nookFocus.x) + Math.abs(p.ty - G.nookFocus.y) <= 1) return 'READ';
      return 'LEAVE';
    }
    if (G.sun && p.tx === G.sun.x && p.ty === G.sun.y) return 'BASK';
    if (G.stairs && p.tx === G.stairs.x && p.ty === G.stairs.y) return 'DOWN';
    if (G.floorPet && Math.abs(p.tx - G.floorPet.x) + Math.abs(p.ty - G.floorPet.y) <= 1) {
      return G.pet ? 'SWAP' : 'MEET';
    }
    if (G.chests.some((c) => Math.abs(p.tx - c.x) + Math.abs(p.ty - c.y) <= 1)) return 'OPEN';
    if (G.setPiece && G.setPiece.focus && !G.setPiece.focus.used &&
        Math.abs(p.tx - G.setPiece.focus.x) + Math.abs(p.ty - G.setPiece.focus.y) <= 1) {
      const type = G.setPiece.focus.type;
      return type === 'desk' ? 'READ' : type === 'teapot' ? 'POUR' : type === 'gardenBed' ? 'GARDEN' : type === 'pond' ? 'FISH' : 'GATHER';
    }
    if (G.boss && !G.boss.done &&
        Math.abs(p.tx - G.boss.x) + Math.abs(p.ty - G.boss.y) <= 1) return 'OFFER';
    if (G.visitor && Math.abs(p.tx - G.visitor.x) + Math.abs(p.ty - G.visitor.y) <= 1) return 'VISIT';
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
      if (G.dialog.type === 'garden' && G.garden) {
        G.gardenUiTimer -= dt;
        if (G.gardenUiTimer <= 0) {
          updateGardenDialog();
          G.gardenUiTimer = 0.8;
        }
      }
      if (G.dialog.type === 'fishing') {
        G.fishingUiTimer -= dt;
        if (G.fishingUiTimer <= 0) {
          updateFishingDialog();
          G.fishingUiTimer = 0.2;
        }
      }
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

    if (G.moon > 0) {
      G.moon = Math.max(0, G.moon - dt);
      if (G.moon === 0) toast('The moonlight tea settles.');
    }
    if (G.firefly > 0) {
      G.firefly = Math.max(0, G.firefly - dt);
      if (G.firefly === 0) toast('The fireflies drift home.');
    }
    if (G.hush > 0) {
      G.hush = Math.max(0, G.hush - dt);
      if (G.hush === 0) toast('The campfire hush lifts.');
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
      if (dir) {
        G.tapPath = [];
        if (G.hold <= 0) {
          tryMove(dir[0], dir[1]);
          G.hold = stepCooldown();
        }
      } else if (G.tapPath.length) {
        const next = G.tapPath[0];
        const dx = next.x - p.tx;
        const dy = next.y - p.ty;
        if (Math.abs(dx) + Math.abs(dy) === 1) {
          tryMove(dx, dy);
          if (p.moving > 0) G.tapPath.shift();
          else if (G.bumpLock <= 0) G.tapPath.shift();
        } else {
          G.tapPath = [];
        }
      }
    }

    updatePet(dt);

    G.squirrelTimer -= dt;
    if (G.squirrelTimer <= 0 && (G.pet || G.firefly > 0)) {
      if (G.pet && G.pet.kind === 'squirrel') autoCollectNearby(2.5);
      if (G.firefly > 0) autoCollectNearby(3.8);
      G.squirrelTimer = 0.38;
    }

    updateEnemies(dt);
    reveal();
    updateCamera(dt);
    pollGamepad();
  }

  function pollGamepad() {
    if (!navigator.getGamepads) return;
    let pad = null;
    try {
      const pads = navigator.getGamepads();
      for (const candidate of pads) {
        if (candidate && candidate.connected) { pad = candidate; break; }
      }
    } catch (err) {
      return;
    }
    if (!pad) {
      G.padPrev = {};
      return;
    }

    const pressed = (i) => !!(pad.buttons[i] && pad.buttons[i].pressed);
    const ax = pad.axes[0] || 0;
    const ay = pad.axes[1] || 0;
    let dx = 0;
    let dy = 0;
    if (pressed(14) || ax < -0.55) dx = -1;
    else if (pressed(15) || ax > 0.55) dx = 1;
    else if (pressed(12) || ay < -0.55) dy = -1;
    else if (pressed(13) || ay > 0.55) dy = 1;

    if (dx || dy) {
      G.tapPath = [];
      tryMove(dx, dy);
    }

    const a = pressed(0);
    const b = pressed(1);
    if (a && !G.padPrev.a) interact();
    if (b && !G.padPrev.b) drinkTea();
    G.padPrev.a = a;
    G.padPrev.b = b;
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
    const edt = (G.hush > 0 ? dt * 0.32 : dt) * (hasCharm('hush') ? 0.72 : 1);

    for (const foe of G.enemies) {
      foe.flash = Math.max(0, foe.flash - edt * 3.2);

      if (foe.moving > 0) {
        foe.moving -= edt;
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
          foe.alertT -= edt;
          if (foe.alertT <= 0) {
            foe.alertT = 0;
            lungeAtPlayer(foe);
          }
        } else {
          foe.wait -= edt;
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
    if (G.meta && G.meta.settings.reduceMotion) n = Math.max(2, Math.floor(n * 0.45));
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

    const st = (G.meta && G.meta.settings) || {};
    const shakeOn = st.shake !== false && !st.reduceMotion;
    const shakeX = shakeOn && G.shake > 0.1 ? (Math.random() - 0.5) * G.shake : 0;
    const shakeY = shakeOn && G.shake > 0.1 ? (Math.random() - 0.5) * G.shake : 0;
    const camX = G.cam.x + shakeX;
    const camY = G.cam.y + shakeY;

    ctx.save();
    ctx.translate(-camX, -camY);
    drawTiles(camX, camY, th);
    drawFloorMottling(camX, camY, th);
    drawWallShadows(camX, camY);
    drawSetPiece(th);
    drawProps(camX, camY, th);
    drawPortal();
    drawInterior();
    drawChests();
    drawFavorBoard();
    drawMerchant();
    drawVisitor();
    drawFloorPet();
    drawEnemies();
    drawBoss();
    drawFollowerPet();
    drawPlayer();
    drawParticles();
    ctx.restore();

    drawGlows(camX, camY, th);
    drawDarkness(camX, camY);
    drawWeather();
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

    if (hasCharm('seeker')) {
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
    } else if (it.type === 'letter') {
      ctx.save();
      ctx.translate(cx, cy - 2 + bob);
      ctx.fillStyle = '#e9dcc0';
      ctx.save();
      ctx.rotate(-0.08);
      roundRect(ctx, -8, -10, 16, 20, 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,85,55,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5, -5);
      ctx.lineTo(5, -5);
      ctx.moveTo(-5, -1);
      ctx.lineTo(3, -1);
      ctx.moveTo(-5, 3);
      ctx.lineTo(4, 3);
      ctx.stroke();
      ctx.fillStyle = '#b34f43';
      ctx.beginPath();
      ctx.arc(0, -10, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
    } else if (it.type === 'seed') {
      ctx.save();
      ctx.translate(cx, cy - 2 + bob);
      ctx.fillStyle = '#8a6a4a';
      roundRect(ctx, -7, -6, 14, 14, 4);
      ctx.fill();
      ctx.fillStyle = '#b99365';
      roundRect(ctx, -7, -8, 14, 4, 2);
      ctx.fill();
      ctx.fillStyle = '#6b8f4e';
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.4, 3.6, 0.3, 0, Math.PI * 2);
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

  function drawSign(cx, cy, label, sub, color) {
    ctx.font = '700 8px ' + FONT_UI;
    const w = Math.max(34, ctx.measureText(label).width + 16);
    ctx.fillStyle = 'rgba(14,10,14,0.85)';
    roundRect(ctx, cx - w / 2, cy - 11, w, 17, 6);
    ctx.fill();
    ctx.strokeStyle = color || 'rgba(240,189,125,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = color || 'rgba(246,232,208,0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy - 2.5);
    if (sub) {
      ctx.font = '600 6.5px ' + FONT_UI;
      ctx.fillStyle = 'rgba(246,232,208,0.55)';
      ctx.fillText(sub, cx, cy + 11);
    }
  }

  function drawDoorway(cx, cy, label, sub, color) {
    const glow = ctx.createRadialGradient(cx, cy - 6, 0, cx, cy - 6, 34);
    glow.addColorStop(0, 'rgba(255,200,130,0.22)');
    glow.addColorStop(1, 'rgba(255,200,130,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3a281d';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 17);
    ctx.lineTo(cx - 14, cy - 10);
    ctx.quadraticCurveTo(cx, cy - 30, cx + 14, cy - 10);
    ctx.lineTo(cx + 14, cy + 17);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5c3e2a';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + 15);
    ctx.lineTo(cx - 10, cy - 8);
    ctx.quadraticCurveTo(cx, cy - 24, cx + 10, cy - 8);
    ctx.lineTo(cx + 10, cy + 15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,205,130,0.24)';
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + 13);
    ctx.lineTo(cx - 7, cy - 6);
    ctx.quadraticCurveTo(cx, cy - 19, cx + 7, cy - 6);
    ctx.lineTo(cx + 7, cy + 13);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f0c878';
    ctx.beginPath();
    ctx.arc(cx + 5, cy + 2, 1.4, 0, Math.PI * 2);
    ctx.fill();

    drawSign(cx, cy - 40, label, sub, color);
  }

  function drawPortal() {
    if (G.interior || !G.portal || !seen(G.portal.x, G.portal.y)) return;
    const cx = G.portal.x * TS + TS / 2;
    const cy = G.portal.y * TS + TS / 2;
    const home = G.portal.kind === 'home';
    drawDoorway(cx, cy, 'ENTER', home ? 'HEARTHROOM' : 'READING NOOK', home ? 'rgba(240,189,125,0.65)' : 'rgba(170,215,200,0.65)');
    const hint = ctx.createRadialGradient(cx, cy + 8, 0, cx, cy + 8, 26);
    hint.addColorStop(0, 'rgba(255,205,140,0.08)');
    hint.addColorStop(1, 'rgba(255,205,140,0)');
    ctx.fillStyle = hint;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 14, 24, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function homeFurniture(slot) {
    ensureHomeRoom();
    const id = G.meta.homeRoom.slots[slot];
    return (HOME_FURNITURE[slot] || []).find((item) => item.id === id) || (HOME_FURNITURE[slot] || [])[0];
  }

  function drawInterior() {
    if (!G.interior) return;
    const it = G.interior;
    const room = it.room;
    const cx = room.cx * TS + TS / 2;
    const cy = room.cy * TS + TS / 2;
    const wallY = (room.y - 1) * TS + TS / 2;

    const warm = ctx.createRadialGradient(cx, cy, 0, cx, cy, room.w * TS * 0.55);
    warm.addColorStop(0, 'rgba(255,205,140,0.07)');
    warm.addColorStop(1, 'rgba(255,205,140,0)');
    ctx.fillStyle = warm;
    ctx.fillRect(room.x * TS, room.y * TS, room.w * TS, room.h * TS);

    // exit door
    const doorCx = it.door.x * TS + TS / 2;
    const doorCy = it.door.y * TS + TS / 2;
    drawDoorway(doorCx, doorCy, 'EXIT', 'TO THE HOLLOW', 'rgba(240,189,125,0.6)');

    if (it.type === 'nook') {
      // bookshelf
      const bx = it.nook.x * TS + TS / 2;
      const by = it.nook.y * TS + TS / 2;
      ctx.fillStyle = '#4f3524';
      roundRect(ctx, bx - 19, by - 24, 38, 44, 4);
      ctx.fill();
      ctx.fillStyle = '#6b4a30';
      roundRect(ctx, bx - 16, by - 21, 32, 38, 3);
      ctx.fill();
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = ['#a45c50', '#5c7a58', '#c9a45c', '#7a5c8a'][(row + i) % 4];
          ctx.fillRect(bx - 13 + i * 7, by - 17 + row * 11, 4, 8);
        }
      }
      drawSign(bx, by - 34, 'READ', 'BY THE FIRE', 'rgba(170,215,200,0.65)');

      // armchair and fire
      ctx.fillStyle = '#7a4f3a';
      roundRect(ctx, cx - 24, cy + 6, 48, 24, 8);
      ctx.fill();
      ctx.fillStyle = '#a45c50';
      roundRect(ctx, cx - 18, cy + 2, 36, 18, 7);
      ctx.fill();
      ctx.fillStyle = '#ffb05f';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 24, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,170,80,0.18)';
      ctx.beginPath();
      ctx.arc(cx, cy + 24, 34, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // home furniture
    const rug = homeFurniture('rug');
    const lamp = homeFurniture('lamp');
    const plant = homeFurniture('plant');
    const table = homeFurniture('table');
    const wall = homeFurniture('wall');
    const cushion = homeFurniture('cushion');

    // wall art
    if (wall && wall.id !== 'wall-none') {
      ctx.fillStyle = '#5a3f2a';
      roundRect(ctx, cx - 24, wallY - 12, 48, 25, 3);
      ctx.fill();
      ctx.fillStyle = wall.color;
      roundRect(ctx, cx - 20, wallY - 9, 40, 19, 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,240,210,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // rug
    ctx.fillStyle = rug.color;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.ellipse(cx, (room.y + room.h - 2.7) * TS, 92, 31, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,230,190,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // lamp
    const lx = (room.x + 2.1) * TS;
    const ly = (room.y + room.h - 3.7) * TS;
    ctx.fillStyle = '#4a3428';
    ctx.fillRect(lx - 2, ly, 4, 25);
    ctx.fillStyle = lamp.color;
    ctx.beginPath();
    ctx.moveTo(lx - 12, ly - 2);
    ctx.lineTo(lx + 12, ly - 2);
    ctx.lineTo(lx + 7, ly - 15);
    ctx.lineTo(lx - 7, ly - 15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,220,150,0.18)';
    ctx.beginPath();
    ctx.arc(lx, ly - 3, 24, 0, Math.PI * 2);
    ctx.fill();

    // plant
    const px = (room.x + room.w - 2.1) * TS;
    const py = (room.y + room.h - 3.7) * TS;
    ctx.fillStyle = '#7a5137';
    ctx.beginPath();
    ctx.moveTo(px - 10, py + 6);
    ctx.lineTo(px + 10, py + 6);
    ctx.lineTo(px + 7, py + 22);
    ctx.lineTo(px - 7, py + 22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = plant.color;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.4;
      ctx.beginPath();
      ctx.moveTo(px, py + 6);
      ctx.quadraticCurveTo(px + Math.cos(a) * 12, py + Math.sin(a) * 12, px + Math.cos(a) * 20, py + Math.sin(a) * 20);
      ctx.stroke();
    }

    // table
    const tx = room.cx * TS;
    const ty = (room.y + room.h - 3.1) * TS;
    ctx.fillStyle = table.color;
    roundRect(ctx, tx - 22, ty - 4, 44, 10, 4);
    ctx.fill();
    ctx.fillStyle = '#3f6f6a';
    ctx.beginPath();
    ctx.ellipse(tx, ty - 8, 6, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8dcc0';
    ctx.beginPath();
    ctx.ellipse(tx + 11, ty - 7, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // cushion
    ctx.fillStyle = cushion.color;
    ctx.beginPath();
    ctx.ellipse((room.x + 4.4) * TS, (room.y + room.h - 3.0) * TS, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,230,190,0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // store counter
    const sx = it.store.x * TS + TS / 2;
    const sy = it.store.y * TS + TS / 2;
    ctx.fillStyle = '#6d4a32';
    roundRect(ctx, sx - 22, sy - 4, 44, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#8a6142';
    roundRect(ctx, sx - 24, sy - 10, 48, 8, 3);
    ctx.fill();
    ctx.fillStyle = '#e8d27a';
    ctx.beginPath();
    ctx.arc(sx, sy - 13, 4.5, 0, Math.PI * 2);
    ctx.fill();
    drawSign(sx, sy - 32, 'STORE', 'HEARTH & HOME', 'rgba(240,189,125,0.65)');
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
      grantCharm(key);
      toast('Charm found · ' + CHARM_INFO[key].name + ' — ' + CHARM_INFO[key].desc +
        (G.loadout.includes(key) ? ' (equipped)' : ' (equip it in the almanac)'));
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
    } else if (focus.type === 'gardenBed') {
      ctx.fillStyle = '#5a3f2a';
      roundRect(ctx, cx - 20, cy - 8, 40, 22, 5);
      ctx.fill();
      ctx.fillStyle = '#6d4f33';
      roundRect(ctx, cx - 17, cy - 6, 34, 18, 4);
      ctx.fill();
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 4; i++) {
          const sx = cx - 12 + i * 8;
          const sy = cy - 3 + row * 5;
          ctx.fillStyle = row === 1 ? '#8fae63' : '#6f8f5a';
          ctx.beginPath();
          ctx.ellipse(sx, sy, 2.6, 1.5, 0.4, 0, Math.PI * 2);
          ctx.ellipse(sx + 3, sy - 1, 2.2, 1.3, -0.3, 0, Math.PI * 2);
          ctx.fill();
          if (row === 0) {
            ctx.fillStyle = '#e8d27a';
            ctx.beginPath();
            ctx.arc(sx + 1.5, sy - 3, 1.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.fillStyle = '#d9c08a';
      ctx.fillRect(cx + 16, cy - 16, 2, 12);
      ctx.fillStyle = '#f0dfc0';
      roundRect(ctx, cx + 12, cy - 22, 14, 7, 2);
      ctx.fill();
    } else if (focus.type === 'pond') {
      const water = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
      water.addColorStop(0, 'rgba(120,180,175,0.62)');
      water.addColorStop(1, 'rgba(50,100,105,0.5)');
      ctx.fillStyle = water;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 21, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(190,235,225,0.3)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = '#6f9a58';
      ctx.beginPath();
      ctx.ellipse(cx - 6, cy - 3, 6, 3.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d9b38a';
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 3, 1.3, 0, Math.PI * 2);
      ctx.fill();
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
    } else if (sp.type === 'pond') {
      const pond = ctx.createRadialGradient(cx, cy, 4, cx, cy, w * 0.34);
      pond.addColorStop(0, 'rgba(90,160,160,0.52)');
      pond.addColorStop(0.7, 'rgba(55,115,120,0.42)');
      pond.addColorStop(1, 'rgba(35,80,88,0.16)');
      ctx.fillStyle = pond;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2, w * 0.3, h * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(170,225,215,0.26)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const rr = 10 + ((G.time * 9 + i * 22) % 48);
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, rr, rr * 0.48, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200,240,230,' + (0.14 - i * 0.02).toFixed(3) + ')';
        ctx.stroke();
      }
      for (const [ox, oy] of [[-38, -14], [30, 18], [12, -30], [-20, 26]]) {
        ctx.fillStyle = '#6f9a58';
        ctx.beginPath();
        ctx.ellipse(cx + ox, cy + oy, 9, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d9b38a';
        ctx.beginPath();
        ctx.arc(cx + ox, cy + oy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 5; i++) {
        const rx = cx - w * 0.34 + i * w * 0.17;
        const ry = cy + h * 0.28;
        ctx.strokeStyle = 'rgba(150,180,110,0.55)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(rx, ry + 12);
        ctx.quadraticCurveTo(rx + 5, ry - 4, rx + 2, ry - 18);
        ctx.stroke();
        ctx.fillStyle = '#c9a45c';
        ctx.beginPath();
        ctx.ellipse(rx + 2, ry - 18, 2, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (sp.type === 'garden') {
      ctx.fillStyle = 'rgba(110,150,105,0.16)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2, w * 0.3, h * 0.23, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,230,170,0.2)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const vy = y0 + h * (0.3 + i * 0.22);
        ctx.strokeStyle = 'rgba(120,150,95,0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x0 + w * 0.18, vy);
        ctx.bezierCurveTo(x0 + w * 0.42, vy - 10, x0 + w * 0.6, vy + 10, x0 + w * 0.82, vy - 4);
        ctx.stroke();
        for (let k = 0; k < 3; k++) {
          ctx.fillStyle = k === 1 ? '#c9e8a8' : '#8fae63';
          ctx.beginPath();
          ctx.ellipse(x0 + w * (0.3 + k * 0.18), vy - 4, 4, 2.5, 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      drawFocus(sp.focus);
      drawCandle(x0 + 18, y0 + h - 18);
      drawCandle(x0 + w - 18, y0 + h - 18);
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
    if (f.type === 'gardenBed') { openGardenDialog(); return; }
    if (f.type === 'pond') { openFishingDialog(); return; }
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
    recordJournal('bosses', 'gardener', true);
    G.buttons += 3;
    awardSunmotes(2);
    G.maxHearts = Math.min(6, G.maxHearts + 1);
    G.hearts = G.maxHearts;

    const unowned = Object.keys(CHARM_INFO).filter((k) => !G.charms[k]);
    let reward;
    if (unowned.length) {
      const key = unowned[Math.floor(Math.random() * unowned.length)];
      grantCharm(key);
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

  function drawVisitor() {
    const v = G.visitor;
    if (!v || !seen(v.x, v.y)) return;
    const cx = v.x * TS + TS / 2;
    const cy = v.y * TS + TS / 2;
    const bob = Math.sin(G.time * 1.8 + v.phase) * 1.1;

    drawShadow(cx, cy + 12, 15, 6);

    ctx.save();
    ctx.translate(cx, cy + bob);

    // cloak
    ctx.fillStyle = '#3f4d52';
    ctx.beginPath();
    ctx.moveTo(-14, 14);
    ctx.quadraticCurveTo(-12, -10, 0, -15);
    ctx.quadraticCurveTo(12, -10, 14, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,235,205,0.08)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // head
    ctx.fillStyle = '#d9b48f';
    ctx.beginPath();
    ctx.arc(0, -18, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // species accents
    if (v.kind === 'moth') {
      ctx.fillStyle = '#c9b38a';
      ctx.beginPath();
      ctx.moveTo(-6, -22); ctx.lineTo(-14, -17); ctx.lineTo(-6, -13); ctx.closePath();
      ctx.moveTo(6, -22); ctx.lineTo(14, -17); ctx.lineTo(6, -13); ctx.closePath();
      ctx.fill();
    } else if (v.kind === 'mole' || v.kind === 'frog') {
      ctx.fillStyle = '#8f6a4f';
      ctx.beginPath();
      ctx.arc(-5, -25, 3, 0, Math.PI * 2);
      ctx.arc(5, -25, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (v.kind === 'ghost') {
      ctx.fillStyle = 'rgba(180,220,190,0.35)';
      ctx.beginPath();
      ctx.arc(0, -20, 12, Math.PI, Math.PI * 2);
      ctx.fill();
    } else if (v.kind === 'bard') {
      ctx.fillStyle = '#c9705e';
      ctx.beginPath();
      ctx.moveTo(-6, -25); ctx.lineTo(0, -36); ctx.lineTo(6, -25); ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = '#d9c08a';
      ctx.beginPath();
      ctx.ellipse(0, -26, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // eyes
    ctx.fillStyle = '#2b2028';
    ctx.beginPath();
    ctx.arc(-2.8, -18, 1.1, 0, Math.PI * 2);
    ctx.arc(2.8, -18, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // little lantern
    ctx.strokeStyle = '#c9a45c';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(13, -4);
    ctx.lineTo(13, 10);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,210,120,0.9)';
    roundRect(ctx, 9, 2, 8, 8, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,200,110,0.16)';
    ctx.beginPath();
    ctx.arc(13, 6, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (!v.met) {
      ctx.fillStyle = 'rgba(255,240,190,0.8)';
      ctx.beginPath();
      ctx.arc(cx + 14, cy - 24 + Math.sin(G.time * 2 + v.phase) * 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
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

    const skin = LANTERN_SKINS[G.meta && G.meta.lantern] || LANTERN_SKINS.brass;
    ctx.fillStyle = skin.frame;
    roundRect(ctx, -18, -1, 7.5, 9, 2);
    ctx.fill();
    ctx.fillStyle = skin.glass;
    roundRect(ctx, -16.5, 0.5, 4.5, 6, 1.6);
    ctx.fill();

    const glow = ctx.createRadialGradient(-14, 3, 0, -14, 3, 24);
    glow.addColorStop(0, 'rgba(' + skin.glow + ',0.55)');
    glow.addColorStop(1, 'rgba(' + skin.glow + ',0)');
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
    const skin = LANTERN_SKINS[G.meta && G.meta.lantern] || LANTERN_SKINS.brass;
    addGlow(p.px * TS + TS / 2 - camX, p.py * TS + TS / 2 - camY - 6, 92, 'rgba(' + skin.glow + ',0.16)');
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
    if (G.interior) {
      const room = G.interior.room;
      cutLight(room.cx * TS - camX, room.cy * TS - camY, room.w * TS * 0.52, false);
    }
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

  function drawWeather() {
    if (!G.weather) return;
    const t = G.time;
    if (G.weather === 'rain') {
      ctx.strokeStyle = 'rgba(175,205,225,0.18)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 70; i++) {
        const seed = hash2(i, 3, G.seed & 0xffff);
        const speed = 240 + seed * 180;
        const x = (seed * viewW + t * 28) % viewW;
        const y = ((hash2(i, 9, G.seed & 0xffff) * viewH) + t * speed) % (viewH + 40) - 20;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 3, y + 11);
        ctx.stroke();
      }
    } else if (G.weather === 'snow') {
      for (let i = 0; i < 55; i++) {
        const seed = hash2(i, 5, G.seed & 0xffff);
        const x = (seed * viewW + Math.sin(t * 0.5 + i) * 14 + viewW) % viewW;
        const y = (hash2(i, 11, G.seed & 0xffff) * viewH + t * (12 + seed * 18)) % viewH;
        ctx.fillStyle = 'rgba(235,242,255,' + (0.18 + seed * 0.22).toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(x, y, 1 + seed * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (G.weather === 'fireflies') {
      for (let i = 0; i < 24; i++) {
        const seed = hash2(i, 7, G.seed & 0xffff);
        const x = (seed * viewW + Math.sin(t * 0.35 + i) * 30 + viewW) % viewW;
        const y = (hash2(i, 13, G.seed & 0xffff) * viewH + Math.cos(t * 0.3 + i) * 22 + viewH) % viewH;
        const a = 0.25 + Math.sin(t * 1.6 + i) * 0.2;
        ctx.fillStyle = 'rgba(220,245,160,' + Math.max(0.06, a).toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(220,245,160,0.08)';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (G.weather === 'leaves') {
      for (let i = 0; i < 26; i++) {
        const seed = hash2(i, 17, G.seed & 0xffff);
        const x = (seed * viewW + Math.sin(t * 0.4 + i) * 34 + viewW) % viewW;
        const y = (hash2(i, 19, G.seed & 0xffff) * viewH + t * (10 + seed * 14)) % viewH;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t * 0.6 + i);
        ctx.fillStyle = i % 3 === 0 ? 'rgba(190,120,80,0.25)' : 'rgba(205,160,90,0.22)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 3.4, 1.7, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (G.weather === 'mist') {
      for (let i = 0; i < 5; i++) {
        const y = viewH * (0.2 + i * 0.16) + Math.sin(t * 0.2 + i) * 12;
        ctx.fillStyle = 'rgba(178,195,195,0.035)';
        ctx.beginPath();
        ctx.ellipse(viewW * (0.25 + i * 0.13), y, viewW * 0.34, 28, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawHUD(th) {
    ctx.save();
    ctx.textBaseline = 'middle';

    const phone = viewW < 620;
    const big = !!(G.meta && G.meta.settings.bigHud);
    const hc = !!(G.meta && G.meta.settings.highContrast);
    const hx = (phone ? 20 : 28) + safe.l;
    const hy = (phone ? 27 : 30) + safe.t;
    const hs = (phone ? 8 : 9) * (big ? 1.15 : 1);
    const step = (phone ? 21 : 23) * (big ? 1.1 : 1);
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
    ctx.fillStyle = hc ? 'rgba(255,250,235,1)' : 'rgba(242,228,205,0.85)';
    ctx.font = '600 ' + (big ? 15 : 13) + 'px ' + FONT_UI;
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
    ctx.fillStyle = hc ? 'rgba(255,250,235,0.98)' : 'rgba(242,228,205,0.8)';
    ctx.font = '600 ' + (big ? 14 : 12) + 'px ' + FONT_UI;
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
    ctx.fillStyle = hc ? 'rgba(255,250,235,0.98)' : 'rgba(242,228,205,0.8)';
    ctx.font = '600 ' + (big ? 14 : 12) + 'px ' + FONT_UI;
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

    const extraBuffs = [];
    if (G.moon > 0) extraBuffs.push(['moon · ' + Math.ceil(G.moon) + 's', '#c9d8ff']);
    if (G.firefly > 0) extraBuffs.push(['fireflies · ' + Math.ceil(G.firefly) + 's', '#d8f0b0']);
    if (G.hush > 0) extraBuffs.push(['hush · ' + Math.ceil(G.hush) + 's', '#e8c9e8']);
    for (const [label, color] of extraBuffs) {
      ctx.fillStyle = 'rgba(10,8,14,0.5)';
      roundRect(ctx, ox - 2, buffY - 9, phone ? 92 : 100, 18, 9);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,235,205,0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = '600 10px ' + FONT_UI;
      ctx.textAlign = 'left';
      ctx.fillText(label, ox + 8, buffY);
      buffY += 22;
    }

    const ownedCharms = G.loadout;
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
        } else if (key === 'seeker') {
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
        } else if (key === 'swift') {
          ctx.strokeStyle = '#9fe0d0';
          ctx.lineWidth = 1.4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(bx + 4, by + 14);
          ctx.quadraticCurveTo(bx + 10, by + 15, bx + 16, by + 6);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(bx + 5, by + 10);
          ctx.quadraticCurveTo(bx + 10, by + 11, bx + 14, by + 5);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#e8c9e8';
          ctx.beginPath();
          ctx.arc(bx + 10, by + 10, 5.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1d141d';
          ctx.beginPath();
          ctx.arc(bx + 12.5, by + 8.5, 4.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    if (phone) {
      ctx.textAlign = 'right';
      ctx.font = '600 ' + (big ? 10.5 : 9.5) + 'px ' + FONT_UI;
      ctx.letterSpacing = '2px';
      ctx.fillStyle = hc ? 'rgba(255,246,225,0.95)' : 'rgba(240,226,200,0.55)';
      ctx.fillText(G.interior ? G.interior.name.toUpperCase() : 'FLOOR ' + G.floor, viewW - 18 - safe.r, 26 + safe.t);
      ctx.letterSpacing = '0px';
      if (G.weather && !G.interior) {
        ctx.font = '600 8px ' + FONT_UI;
        ctx.fillStyle = 'rgba(220,230,225,0.42)';
        ctx.fillText(WEATHER_INFO[G.weather].name.toUpperCase(), viewW - 18 - safe.r, 40 + safe.t);
      }
    } else {
      ctx.textAlign = 'center';
      ctx.font = '600 ' + (big ? 12.5 : 11) + 'px ' + FONT_UI;
      ctx.letterSpacing = '3px';
      ctx.fillStyle = hc ? 'rgba(255,246,225,0.95)' : 'rgba(240,226,200,0.62)';
      ctx.fillText(G.interior ? G.interior.name.toUpperCase() : 'FLOOR ' + G.floor + ' · ' + th.name.toUpperCase(), viewW / 2, 27 + safe.t);
      ctx.letterSpacing = '0px';
      if (G.weather && !G.interior) {
        ctx.font = '600 9px ' + FONT_UI;
        ctx.fillStyle = 'rgba(220,230,225,0.38)';
        ctx.fillText(WEATHER_INFO[G.weather].name.toUpperCase(), viewW / 2, 42 + safe.t);
      }
    }

    drawMinimap();
    const prompt = isTouch ? null : promptText();
    drawPrompt(prompt);
    drawMessages((prompt ? 46 : 0) + (isTouch ? 150 : 0) + safe.b);
    ctx.restore();
  }

  function drawMinimap() {
    if (G.interior) return;
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

    const dot = (tx, ty, color, force) => {
      if (!force && !G.explored[ty * W + tx]) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + tx * cell + cell / 2, y + ty * cell + cell / 2, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    if (G.fire) dot(G.fire.x, G.fire.y, 'rgba(255,170,90,0.95)');
    if (G.stairs) dot(G.stairs.x, G.stairs.y, 'rgba(255,215,140,0.95)');
    if (G.sun) dot(G.sun.x, G.sun.y, 'rgba(255,240,190,0.95)');
    if (G.floorPet) dot(G.floorPet.x, G.floorPet.y, 'rgba(255,170,180,0.95)');
    for (const c of G.chests) {
      dot(c.x, c.y, 'rgba(255,224,140,0.95)', G.pet && G.pet.kind === 'cat');
    }
    if (G.setPiece && G.setPiece.focus) dot(G.setPiece.focus.x, G.setPiece.focus.y, 'rgba(212,185,255,0.95)');
    if (G.boss) dot(G.boss.x, G.boss.y, 'rgba(168,220,150,0.95)');
    if (G.favorBoard) dot(G.favorBoard.x, G.favorBoard.y, 'rgba(236,225,195,0.95)');
    if (G.merchant) dot(G.merchant.x, G.merchant.y, 'rgba(255,195,120,0.95)');
    if (G.portal) dot(G.portal.x, G.portal.y, 'rgba(245,205,150,0.95)');
    if (G.secret && G.secret.revealed) {
      dot(G.secret.wall.x, G.secret.wall.y, 'rgba(205,185,255,0.95)');
    }

    if (hasCharm('seeker')) {
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

    const big = !!(G.meta && G.meta.settings.bigHud);
    ctx.font = '600 ' + (big ? 13 : 12) + 'px ' + FONT_UI;
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
    const big = !!(G.meta && G.meta.settings.bigHud);
    ctx.font = (viewW < 620 ? (big ? 15 : 14) : (big ? 16 : 15)) + 'px ' + FONT_SERIF;
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
    if (k === 'j') {
      if (G.dialog && G.dialog.type === 'journal') closeJournal();
      else if (!G.dialog && G.scene === 'playing') openJournal();
      return;
    }

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
      G.tapPath = [];
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
  if (experimentBtn) experimentBtn.addEventListener('click', experimentBrew);
  if (fishAction) fishAction.addEventListener('click', fishActionClick);
  if (fishClose) fishClose.addEventListener('click', closeFishingDialog);
  if (fishingDialog) {
    fishingDialog.addEventListener('click', (e) => {
      if (e.target === fishingDialog) closeFishingDialog();
    });
  }
  if (cookClose) cookClose.addEventListener('click', closeCookDialog);
  if (cookDialog) {
    cookDialog.addEventListener('click', (e) => {
      if (e.target === cookDialog) closeCookDialog();
    });
  }
  if (fireCook) fireCook.addEventListener('click', openCookDialog);
  if (homeStoreClose) homeStoreClose.addEventListener('click', closeHomeStore);
  if (homeStoreDialog) {
    homeStoreDialog.addEventListener('click', (e) => {
      if (e.target === homeStoreDialog) closeHomeStore();
    });
  }
  if (visitorYes) visitorYes.addEventListener('click', visitorAction);
  if (visitorClose) visitorClose.addEventListener('click', closeVisitorDialog);
  if (visitorDialog) {
    visitorDialog.addEventListener('click', (e) => {
      if (e.target === visitorDialog) closeVisitorDialog();
    });
  }
  if (gardenClose) gardenClose.addEventListener('click', closeGardenDialog);
  if (gardenDialog) {
    gardenDialog.addEventListener('click', (e) => {
      if (e.target === gardenDialog) closeGardenDialog();
    });
  }

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
  document.querySelectorAll('[data-meta-tab]').forEach((btn) => {
    btn.addEventListener('click', () => showMetaTab(btn.dataset.metaTab));
  });
  if (metaClose) metaClose.addEventListener('click', closeMetaDialog);
  if (metaDialog) {
    metaDialog.addEventListener('click', (e) => {
      if (e.target === metaDialog) closeMetaDialog();
    });
  }

  if (journalBtn) journalBtn.addEventListener('click', openJournal);
  if (journalClose) journalClose.addEventListener('click', closeJournal);
  if (journalDialog) {
    journalDialog.addEventListener('click', (e) => {
      if (e.target === journalDialog) closeJournal();
    });
  }
  document.querySelectorAll('[data-jtab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      G.journalTab = btn.dataset.jtab;
      renderJournal();
    });
  });

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

  canvas.addEventListener('pointerdown', (e) => {
    const st = G.meta && G.meta.settings;
    if (!st || !st.tapMove) return;
    if (G.scene !== 'playing' || G.dialog || G.fade > 0) return;
    const rect = canvas.getBoundingClientRect();
    const tx = Math.floor((e.clientX - rect.left + G.cam.x) / TS);
    const ty = Math.floor((e.clientY - rect.top + G.cam.y) / TS);
    let gx = tx;
    let gy = ty;
    if (!walkable(gx, gy)) {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (walkable(tx + dx, ty + dy)) { gx = tx + dx; gy = ty + dy; break; }
      }
    }
    if (!walkable(gx, gy)) return;
    const path = findPath(G.player.tx, G.player.ty, gx, gy);
    if (!path.length) return;
    G.tapPath = path;
    G.keys = {};
    G.touch = { up: false, down: false, left: false, right: false };
    G.hold = 0;
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
        G.tapPath = [];
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
  applySettings();
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
