# Lantern Hollow — Feature Plan (4–14)

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done & tested

Work in sections. Each section ends with a playable build, tests, a commit, and a
GitHub Pages deploy. Keep the existing movement feel, mobile layout, and permission
to decline.

## 4. Campfire brewing  `[x]`

- [x] Add **herb** item type; collect into `G.herbs` (HUD count, pickup toast, art)
- [x] Campfire opens a dialog: **Rest**, three recipes, **Done**
- [x] Recipes
  - Hearty tea — 2 tea + 1 herb → +2 hearts
  - Swift tea — 1 tea + 1 herb → 20s speed boost
  - Bright tea — 1 tea + 2 herbs + 0.12 oil → 60s wider lantern light
- [x] Disabled states with live stock counts; stays open after brewing
- [x] `G.bright` timer, light-radius multiplier, HUD pill
- [x] Pause game while the fire/brew dialog is open; Escape/backdrop closes
- [x] Mobile: dialog fits, touch controls hidden while open

## 5. Lantern charms  `[x]`

- [x] Three charms, one slot each, auto-equipped:
  - **Wide glow** — +15% lantern radius
  - **Warm light** — 25% chance a soothe counts double
  - **Seeker light** — sparkles on nearby items + item dots on the minimap
- [x] One chest per floor; opens with Space from an adjacent tile
- [x] Chest grants a random unowned charm; if all owned, gives tea + oil
- [x] Chest art, glow, minimap dot, open sound/particles
- [x] Charm HUD pips; persist across floors, reset on a new run

## 6. Handcrafted set-piece rooms  `[x]`

- [x] One authored room per floor chosen from: tea library, mushroom grove, moon bath,
      tea party, gardener's greenhouse
- [x] Room-specific props and lighting; no new tile types required
- [x] Small mechanical hook per room (loot, herbs, rest spot, lore)
- [x] Does not break reachability or pet/stair placement

## 7. Gentle mini-boss  `[x]`

- [x] The Under-Gardener appears in the greenhouse room on floor 3
- [x] Calm it through a three-step tea-offering pattern (costs tea leaves)
- [x] Mood UI, dialogue lines, no damage-based fight
- [x] Reward: a charm, sunmotes, and a unique line in the journal
- [x] Defeated state persists for the run

## 8. Traveling merchant  `[x]`

- [x] Pip the mole appears on floors 2 and 4 with a cart
- [x] **Buttons** currency from soothed grumbles and chests; HUD counter
- [x] Shop stock: tea, oil, herb, charm (if unowned), pet treat, map fragment
- [x] Buy dialog with sold-out states and limited stock
- [x] Merchant art + minimap marker

## 9. Little favors  `[x]`

- [x] Request board in the start room
- [x] One favor per run from: soothe N grumbles, collect N herbs, open a chest,
      meet a companion, descend N floors
- [x] Progress tracking, claim button, reward in buttons/tea/sunmotes
- [x] Board art, prompt, minimap marker

## 10. Secret rooms & map fragments  `[x]`

- [x] One cracked-wall secret alcove per floor with a chest inside
- [x] Bump the cracked wall to open it; dust + sound + toast
- [x] Map fragment reveals the alcove/cracked wall on the minimap
- [x] Secret chest contains a charm/tea/sunmotes
- [x] Ensure secret room is optional and never blocks progression

## 11. Sunmote progression  `[x]`

- [x] Persistent meta save in localStorage (sunmotes + unlocks + journal + home)
- [x] Award sunmotes at the Sunroom and from the mini-boss
- [x] Unlocks: start with tea, start with a random charm, +1 starting heart,
      cosmetic pet collar colors
- [x] Sunroom meta screen from the title/ending; buy unlocks; show balance
- [x] Never affects an in-progress run except at run start

## 12. Journal & bestiary  `[x]`

- [x] Pause/journal overlay with tabs: Journal, Bestiary, Recipes, Settings
- [x] Tracks pets met, grumbles soothed, items found, floors visited, charms found
- [x] Persists discoveries in meta save (separate from run state)
- [x] Keyboard `J` + a small touch book button; game pauses while open
- [x] Entries reveal silhouettes until discovered

## 13. Home base decorating  `[x]`

- [x] Sunroom home scene with 3 fixed furniture slots (rug, lamp, plant/cushion)
- [x] Decor unlocks from chests/shop/achievements; choose one item per slot
- [x] Benched/collected pets lounge in the scene
- [x] Layout persists in meta save; no gameplay effect
- [x] Accessible from the Sunroom meta screen (not during a run)

## 14. Ambient audio, settings, accessibility  `[x]`

- [x] Ambient layers: fire crackle, water drips, soft wind, pet chirps
- [x] Settings: music volume, SFX volume, screen-shake toggle, reduce motion
- [x] Input: tap-to-move toggle on touch, gamepad support (d-pad/stick + A/B)
- [x] Larger HUD text toggle; high-contrast accent option
- [x] Settings persist in meta save
- [x] Verify iPhone layout and keyboard/gamepad paths

## Cross-cutting acceptance

- [x] All 1,200 generated floors still pass reachability (including herbs, chests,
      secret rooms, pets, stairs)
- [x] No console errors on desktop or iPhone-sized emulation
- [x] Mobile dialogs fit; touch controls hide while a dialog is open
- [x] Music/SFX/mute still work
- [x] README updated; live Pages build verified

# Phase 2 — More cozy systems

## 15. Almanac & inventory  `[x]`

- [x] Pause menu tabs: Items, Recipes, Companions, Charms (plus existing Journal/Bestiary/Settings)
- [x] Satchel counts for tea, herbs, mushrooms, oil, buttons, fish, letters
- [x] Item descriptions, uses, where found
- [x] Recipe cards show ingredients, effects, discovered state
- [x] Companion cards show ability name/description before adoption
- [x] Charm cards show all effects and a 2-charm loadout

## 16. Expanded recipes & experimentation  `[x]`

- [x] New recipes with cool effects: honey tea, moonlight tea, firefly tea, hush tea
- [x] `G.mushrooms` ingredient inventory; fire stock line shows it
- [x] "Try a new blend" experiment button discovers an unknown recipe
- [x] Buff timers and HUD pills for new effects

## 17. Companion abilities  `[x]`

- [x] Fox: senses the cracked wall on each floor
- [x] Squirrel: gathers nearby floor items
- [x] Cat: chests show on the minimap
- [x] Dog: faster steps
- [x] Bear: +1 max heart while travelling
- [x] Ability name + description shown in the adoption/swap dialog

## 18. Companion requests  `[ ]`

- [ ] One request at a time; target item + reward
- [ ] Prompt/notification and journal visibility
- [ ] Rewards: tea, buttons, decor, or sunmotes

## 19. Tea garden  `[ ]`

- [ ] Garden plots in a set-piece room
- [ ] Plant seeds, return later, harvest herbs/flowers
- [ ] Seed item and garden state persist for the run

## 20. Campfire visitors  `[ ]`

- [ ] Rotating visitor near the fire with a tiny story/request
- [ ] Gift or recipe hint reward
- [ ] Visitor art, prompt, dialog

## 21. Charm loadout  `[x]`

- [x] More charms (swift/hush)
- [x] Own vs equipped state; exactly two active
- [x] Almanac equip/unequip UI and HUD pips

## 22. Lantern customization  `[ ]`

- [ ] Lantern frame/color options bought with sunmotes
- [ ] Light tint and player lantern art change
- [ ] Persist in meta save

## 23. Weather & seasons  `[ ]`

- [ ] Per-floor weather: rain, fireflies, leaves, snow
- [ ] Matching ambient particles/audio
- [ ] Small flavor effect

## 24. Lore letters  `[ ]`

- [ ] Collectible letters from past lantern-keepers
- [ ] Almanac Letters tab with read/unread state

## 25. Homey Sunroom expansion  `[ ]`

- [ ] More decor slots/items and a lived-in scene
- [ ] Display shelves for treasures, fish, letters
- [ ] Pet interactions in the Sunroom

## 26. Quiet pond & cooking  `[ ]`

- [ ] Fishable pond set piece
- [ ] Timing minigame, multiple fish kinds
- [ ] Cook fish at the fire; feed self or pet for effects

## 27. Postcards  `[ ]`

- [ ] Compose a postcard with current floor/pet
- [ ] Save to a gallery; view in the almanac/home
