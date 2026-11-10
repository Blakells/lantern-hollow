# Lantern Hollow

A small, cozy dungeon crawler that runs in the browser. No build step, no dependencies,
no assets — just Canvas 2D, a little procedural generation, and a lantern.

**Live:** <https://blakells.github.io/lantern-hollow/> · **Source:** <https://github.com/Blakells/lantern-hollow>

![Lantern Hollow](preview.png)

On an iPhone it gets a pad and two action buttons:

![Lantern Hollow on iPhone](preview-phone.png)

And each floor has a small companion waiting on a cushion:

![A fox companion](preview-pets.png)

## Play

- **Desktop:** open `index.html` (double-click it, or `open index.html` on macOS).
- **iPhone:** open the hosted URL in Safari, tap **Light the lantern**, then
  Share → **Add to Home Screen**. The lantern icon opens it full-screen.

Optional: `index.html?seed=53#play` starts immediately on a fixed seed.

There is no account and no login. The link is the whole thing.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Walk | `WASD` / arrow keys | the pad, bottom left |
| Rest / descend / meet | `Space` | the big gold button |
| Sip tea | `E` | **TEA** |
| Mute | `M` | — |
| Start | `Enter` | **Light the lantern** |

On a phone the big button changes label as you stand near a fire (`REST`), on stairs
(`DOWN`), next to a companion (`MEET` / `SWAP`), or on the Sunroom dais (`BASK`).

## The loop

You take a lantern down five floors of the under-garden. The stairs are somewhere in
the dark, the lantern oil is always running low, and the local grumbles are having a day.

- **Walk** into a grumble to soothe it. Each bonk softens it; the last one makes it sigh,
  leave you a tea leaf, and wander off. Nothing in this dungeon needs killing.
- **Tea leaves** are your healing. Press `E` for +1 heart.
- **Red potions** restore two hearts — but only when you are hurt. At full life they wait on
  the floor for later.
- **Windflowers** double your walking speed for 15 seconds. A small timer appears under
  the tea count while it lasts.
- **Mushrooms** give +1 heart on pickup (up to four).
- **Oil flasks** keep the lantern bright. The light shrinks as the oil burns down.
- **Campfires** refill your oil and hearts. Press `Space` beside one.
- **Stairs** take you down a floor. On the fifth floor, look for the Sunroom instead.
- **Companions:** every floor has one small animal waiting on a cushion — a fox, squirrel,
  cat, dog, or bear cub. Stand beside them and press `Space` to meet them. You can only keep
  one; if you already have a companion, the swap needs your approval in a little dialog.
- At zero hearts you simply wake up back at the fire with two hearts. There is no game over.

The locals have moods:

- **Grumbles** puff up with a `!`, shake, and lunge two tiles. Step aside, or bump them
  mid-puff for a double soothe.
- **Mopes** sleep under a little `z` until you get close, then bolt for the far corner.
- **Fusses** patrol in straight lines and turn at walls.
- A soothed grumble sometimes leaves a red potion or a windflower behind.

Companions follow you between floors, remembering the path you took. They're cosmetic for
now — a warm little presence rather than a stat buff.

## Put it online

This build is already published at <https://blakells.github.io/lantern-hollow/>. To move
or duplicate it: everything is static — a handful of small files plus icons. Any static
host works, and all of them give you HTTPS, which is required for the audio and the Home
Screen install.

### Fastest: Netlify Drop

1. Go to <https://app.netlify.com/drop>.
2. Drag the whole `cozy-dungeon` folder onto the page.
3. Netlify gives you a URL like `https://lantern-hollow-abc123.netlify.app`.
4. Make a free account to keep it and rename the site.

No command line. The URL is public but unguessable; there is no login.

### GitHub Pages

From inside `cozy-dungeon` with the GitHub CLI logged in:

```sh
git init -b main
git add .
git commit -m "Lantern Hollow"
gh repo create lantern-hollow --public --source=. --remote=origin --push

gh api -X POST repos/:owner/lantern-hollow/pages --input - <<'JSON'
{"source":{"branch":"main","path":"/"}}
JSON
```

The site appears at `https://<your-github-user>.github.io/lantern-hollow/`.
Free GitHub Pages sites are public. Private-repo Pages needs a paid GitHub plan and
the published site is still public.

### Cloudflare Pages

Dashboard → Workers & Pages → Create → Pages → **Upload assets**, or:

```sh
npx wrangler pages deploy . --project-name lantern-hollow
```

### A link that requires her email

If "log in" should mean an actual gate, put the site behind **Cloudflare Access**
(Zero Trust). It is free for small teams, sends a one-time code to an email address you
allow, and needs the site on a custom domain you have added to Cloudflare.

- Cloudflare Access → Applications → Add an application → Self-hosted.
- Policy: allow → emails → her address (and yours).
- Then only that address gets in.

Netlify's password protection is a paid feature. A password box written in JavaScript
is cosmetic and not real security.

### iPhone notes

- Tap **Light the lantern** once before playing; iOS only starts audio from a tap.
- **Add to Home Screen** uses `apple-touch-icon.png` and the manifest, and opens
  without Safari's toolbars.
- If Safari reloads the page while she is switching apps, the run restarts — there is
  no save file yet.
- The layout adapts to portrait and landscape, and respects the notch and home indicator.

## Under the hood

- `world.js` — seeded rooms-and-corridors generation, BFS reachability, item and
  grumble placement. Pure functions, testable in Node.
- `game.js` — game loop, grid movement with tweening, bump-to-soothe combat, lantern
  lighting, particles, HUD, minimap, touch controls, WebAudio blips, companion follower
  and approval dialog.
- Companions are generated one per floor in `world.js`; a breadcrumb trail of the player's
  steps keeps the follower from cutting through walls. Swapping is a DOM dialog that pauses
  the run until you explicitly approve it.
- Rendering is smoother now: up to 2.5× device pixel ratio, soft radial shadows, seamless
  mottled floors, ambient occlusion at wall edges, and rounded masonry instead of hard tiles.
- `style.css` / `index.html` — the title and ending cards, the touch pad, safe-area
  insets, and the web-app metadata.
- `manifest.webmanifest` + `icon*.png` — installable Home Screen app.
- Lighting is a second canvas: fill it dark, punch soft holes with
  `destination-out`, composite it over the scene.
- Music is a generative F-major loop (Fmaj7 · Cmaj7 · Dm7 · Bbmaj7) built from WebAudio
  oscillators, a soft pad, a pentatonic melody, and a feedback delay. No audio files.
- Five floor themes (Root Cellars → Sunroom) are just palettes; generation is shared.

Roughly 3,600 lines total, no libraries.

### Tests

```
node test-world.js
```

Checks 1,200 generated floors: borders sealed, every goal/item/enemy/companion reachable,
one oil flask and one red potion minimum, correct goal per floor.

## Honest limits

This is a **vertical slice**, not a finished game:

- Art is procedural geometry, not illustration. Sound effects and music are synthesized
  WebAudio, not recorded audio.
- No save file, no meta-progression, no upgrades or shop. Refresh restarts the run.
- Companions are cosmetic; they do not grant buffs or fight.
- No login, accounts, or cloud saves. A hosted link is the only access control.
- Touch and keyboard; no controller.
- Balance is first-pass; the fifth floor is a difficulty bump but not a wall.
- Tested in an iPhone-sized browser emulator, not yet on physical iOS hardware.

The fun part — the loop, the lighting, the tone — is here. The expensive part —
content, art, sound, and polish — is what turns it into something you'd sell.

### Easy places to tune

- `world.js` → `wanted` room count, enemy `count`, item weights, floor size.
- `game.js` → `THEMES` (palette + floor names), oil drain `dt * 0.0045`,
  lantern radius `2.1 + oil * 2.5`, movement `dt / 0.14`.
- `style.css` → type, colors, touch-button sizes, and the title/ending cards.
