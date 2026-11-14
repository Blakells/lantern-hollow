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

## 18. Companion requests  `[x]`

- [x] One request at a time; target item + reward
- [x] Prompt/notification and journal visibility
- [x] Rewards: tea, buttons, decor, or sunmotes

## 19. Tea garden  `[x]`

- [x] Garden plots in a set-piece room
- [x] Plant seeds, return later, harvest herbs/flowers
- [x] Seed item and garden state persist for the run

## 20. Campfire visitors  `[x]`

- [x] Rotating visitor near the fire with a tiny story/request
- [x] Gift or recipe hint reward
- [x] Visitor art, prompt, dialog

## 21. Charm loadout  `[x]`

- [x] More charms (swift/hush)
- [x] Own vs equipped state; exactly two active
- [x] Almanac equip/unequip UI and HUD pips

## 22. Lantern customization  `[x]`

- [x] Lantern frame/color options bought with sunmotes
- [x] Light tint and player lantern art change
- [x] Persist in meta save

## 23. Weather & seasons  `[x]`

- [x] Per-floor weather: rain, fireflies, leaves, snow
- [x] Matching ambient particles/audio
- [x] Small flavor effect

## 24. Lore letters  `[x]`

- [x] Collectible letters from past lantern-keepers
- [x] Almanac Letters tab with read/unread state

## 25. Homey Sunroom expansion  `[x]`

- [x] More decor slots/items and a lived-in scene
- [x] Display shelves for treasures, fish, letters
- [x] Pet interactions in the Sunroom

## 26. Quiet pond & cooking  `[x]`

- [x] Fishable pond set piece
- [x] Timing minigame, multiple fish kinds
- [x] Cook fish at the fire; feed self or pet for effects

## 27. Postcards  `[x]`

- [x] Compose a postcard with current floor/pet
- [x] Save to a gallery; view in the almanac/home

## 28. Doorway rooms  `[x]`

- [x] One ENTER doorway per floor with a sign above it
- [x] Walking in loads a completely different interior (Hearthroom on odd floors, Reading Nook on even)
- [x] EXIT door with a sign above it returns to the exact dungeon state and spot
- [x] Works with pets, opened chests, and floor state preserved

## 29. Hearthroom home & button furniture  `[x]`

- [x] Home counter/store inside the Hearthroom
- [x] Six furniture slots: rug, lamp, plant, table, wall art, cushion
- [x] Buy furniture with buttons; owned and selected pieces persist in meta
- [x] Reading Nook fireside read gives tea and a chance at a lore letter
- [x] Mobile doorway/interior/store layouts fit

## Phase 2 acceptance

- [x] Almanac, items, recipes, companions, charms, letters, fish, postcards, settings
- [x] Expanded recipes and discovery
- [x] Pet abilities, requests, garden, visitors
- [x] Lantern skins, weather, home expansion, pond/cooking, postcards
- [x] 1,200-floor generation tests pass
- [x] Desktop + iPhone-sized dialog checks, no console errors
- [x] Live hosted build verified

# Phase 3 — the big cozy expansion

## 30. Autosave & manual saves  `[x]`

- [x] Auto-save the current run (floor, inventory, opened chests, pet, interior state)
- [x] Continue button on the title screen
- [x] Three manual save slots + autosave slot
- [x] Save/Load/Delete UI in the Almanac
- [x] Resume restores exact floor, player position, HUD, pet, and interior

## 31. Mixing bench  `[x]`

- [x] Two/three ingredient bench at campfires
- [x] Visible combinations, discovered recipes, funny failed brews
- [x] Existing + new recipes integrated with the Almanac

## 32. New doorway destinations  `[x]`

- [x] Apothecary: trade herbs/fish for seeds and charms
- [x] Observatory: star puzzle reveals the floor map
- [x] Kitchen: cook shared meals
- [x] Lost & Found: return objects to visitors
- [x] Bathhouse: second bath and pet grooming

## 33. Companion bond & tricks  `[x]`

- [x] Bond levels and a visible bond meter
- [x] Tricks: sit, fetch, sniff, nap, find gift
- [x] Tricks shown in the Almanac and usable in the world

## 34. Hearthroom expansion  `[x]`

- [x] Second room (kitchen/bedroom)
- [x] Wallpaper and floor styles
- [x] Fireplace upgrade
- [x] Pet bed and display shelves
- [x] Invite visitors to the Hearthroom

## 35. Mailbox & postcard delivery  `[x]`

- [x] Mailbox in the Hearthroom
- [x] Deliver postcards/letters to future runs
- [x] Correspondence album

## 36. Collection album  `[x]`

- [x] Pressed flowers, mushrooms, fish, stones, trinkets
- [x] Collection cards in the Almanac
- [x] Display selected treasures on the Hearthroom shelf

## 37. Kitchen & shared meals  `[x]`

- [x] Cook meals from fish, mushrooms, herbs, and honey
- [x] Eat for buffs or share with pet/visitors for bond and rewards

## 38. Tea garden expansion  `[ ]`

- [ ] Crossbreed herbs into new seeds
- [ ] Window boxes in the Hearthroom
- [ ] Seasonal seeds and persistent garden state

## 39. Recurring visitors & guestbook  `[x]`

- [x] Visitors remember you across runs
- [x] Friendship levels, gifts, and guestbook entries
- [x] Invite friends to the Hearthroom

## 40. Lantern-lit puzzles  `[ ]`

- [ ] Mirror light-beam puzzle
- [ ] Mushroom bell sequence puzzle
- [ ] No-fail rewards: secrets, lore, furniture blueprints

## 41. Music box & ambience mixer  `[ ]`

- [ ] Music box object in the Hearthroom
- [ ] Unlock and choose tracks
- [ ] Mix rain/fire/firefly ambience

## 42. Photo/postcard studio  `[ ]`

- [ ] Pose pet, choose frame/sticker
- [ ] Compose and save postcards
- [ ] Download/share image

## 43. Lost-and-found stories  `[x]`

- [x] Lost objects spawn with owner stories
- [x] Return them to visitors/pets for rewards and Almanac entries
