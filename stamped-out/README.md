# SBFENT: Stamped Out — eight-fighter review build

Private playable test: https://sbfent-stamped-out-test.purpleflute8.chatgpt.site

The current build lets the player choose Flex A Lot, the Bootlegger, Foxy, Clara, Goldie, Onyx, DJ Blackout, or Quiet Money against any of those eight CPU opponents, including mirror matches. One rooftop is playable. Character selection is contained in the menu and disappears during combat. Existing SBFENT pages are unchanged.

## Eight distinct styles

| Fighter | Combat identity | Counterplay | Signature |
| --- | --- | --- | --- |
| Flex A Lot | Fast pressure boxing; landed P → P → K confirms | Short punches and committed kicks | Stamped Out: body blows, launch, crown-stamp slam |
| The Bootlegger | Long kicks; close K → P confirm | Slower movement and long recovery | Counterfeit Combo: clone crossfire and flying kick |
| Foxy | Quick retreat; kick contact creates distance; landed K → K | Low damage, limited retreat in a corner | Foxy Rush: alternating kick passes and heel drop |
| Clara | High jump, faster air movement, landed P → K | Landing recovery; airborne spacing can cause misses | Scarlet Spin: launch, aerial corkscrew and downward kick |
| Goldie | Heavy punches, 23-damage throws; P → GRAB confirm | Slow approach, short reach, throws remain escapable | Gold Standard: overhead lift and powerbomb |
| Onyx | Timed guard into an 18-damage counter | Counter expires, misses have longer recovery, throws beat guard | Onyx Reversal: defensive slip and counter barrage |
| DJ Blackout | Ground K launches traveling sound waves | Waves can be blocked/jumped; long recovery and light close damage | Bass Drop: rising bass and a final shockwave |
| Quiet Money | Strong guard, deliberate 16-damage straight | Slow attacks and movement; throws beat guard | Silent Investment: guarded approach, body blows and heavy straight |

Match slot and character identity are separate, so each character keeps their moves, artwork, throws, timing, and special on either side. `roster.mjs` contains eight implemented profiles and eight future design targets. Foxy and Clara use the supplied main-outfit references and eight illustrated poses each. Animation transforms these poses; it is not fully frame-drawn animation. `expansion-data.mjs` defines isolated alpha regions and hulls for the new atlas.

Punch damage against 100 HP: Flex 12 (previously 8), Bootlegger 9 (6), Foxy 8 (6), Clara 10 (7). Punch reach and timing retain each character’s style. Flex’s landed P → P → K now deals 35 total damage. Guard still reduces strikes to chip damage.

## Combat and practice

Best of three, sixty-second rounds, easy/medium/hard CPU, Stamp Meter, blocked chip damage, hit-stop, counters, recovery punishes, knockdowns, slow-motion K.O.s, character intro/win cards, and match records. Recent taps buffer for 160 ms; only unblocked contact allows a character's specified cancel route. A clean hit interrupts the opponent and clears queued input. Chains have bounded cancels; whiffs and blocked attacks recover normally. Grounded knockdown prevents repeated strikes and grabs.

Supers have a 2.25-second cut-in. Unblocked in-range contact starts a four-hit sequence lasting about three seconds, with a paused clock and synchronized damage/animation. Guard reduces the special to chip damage and prevents the connected sequence. CPU power-up cut-ins allow the player to buffer block.

GRAB is ground-only, beats guard, and misses airborne targets. Hold a direction to choose the throw. The defender may tap GRAB within 0.3 seconds to escape. CPU tech probability follows difficulty. Slams damage once and give wake-up throw immunity. Foxy uses a kick-assisted toss; Clara uses an aerial turning toss.

Training starts with a full meter and has standing, blocking, jumping, or regular-jab dummies, character-specific coaching, stats, and a pause-menu reset. Training matches do not change saved W/L or best-combo records. Records and controls are stored on this device; storage failures are tolerated. Story and cloud saving are not implemented.

## Phone, audio, and Home Screen

Landscape touch controls: directional pad plus punch, kick, block, grab, and special. Standard/large button options and left/right attack hand. Captured movement pointers can slide between buttons. Keyboard: arrows/WASD, J punch, K kick, L block, I/G grab, U special, Escape pause. Holding jump does not repeat after landing.

All six supplied instrumentals are included as mobile AAC copies; originals are unchanged. One lazy audio element avoids overlapping tracks. MODEST plays on return to menu; HUSTLE / FOUR FLAT / MONEY MACHINE rotate across matches; ONE NIGHT STAND plays in training; all six, including EXQUISTE, are manually selectable. Music ducks around power-ups and K.O.s without altering the saved volume, and pauses with the game/background tab. Layered synthesized combat sounds begin after a gesture.

A relative-scope web manifest, 192/512px icons, Apple touch icon/meta tags, install instructions, and v8 service worker support Home Screen installation and cached core gameplay after a successful first load. Music streams on demand and partial audio responses are not cached. Reduced-motion mode suppresses camera movement, moving trails, and energy animation.

## Validation and remaining scope

Run `node --test stamped-out/*.test.mjs` from the repository root. 59 checks cover the sixty-four character pairings, both slots' moves/supers/throws, guard, chains, buffers, interrupts, escape windows, AI, records, soundtrack state, offline asset paths, and mocked menu/selection/combat flows. Offline Canvas inspection covers the new poses and cinematic frames. Browser QA was unavailable in this environment; actual phone input, audio mix, performance, installation, and offline operation still require device testing.

The remaining four starting fighters, four boss unlocks, story as Flex, seven additional arenas, and alternate outfits remain future production stages after review of each set.

Artwork: generated with the built-in image tool, using the supplied Foxy/Clara references and the existing fighter atlas. Final project asset: `assets/foxy-clara.webp`. Prompt: a transparent 4×4 atlas of sixteen full-body, right-facing felt-puppet arcade sprites; Foxy in the first two rows and Clara in the last two rows; each with ready, step, punch, high kick, guard, hurt, jump, and power poses; preserve reference faces, camo/cream outfit for Foxy and purple/camo/red-ponytail outfit for Clara, with no props, background, UI, or labels. Alpha bounds/masks prevent adjacent atlas poses bleeding into gameplay.


## Goldie / Onyx review set

Goldie deals 14 per punch and 23 per throw, but has a slower walk, shorter strikes, and committed recovery. Her P → GRAB confirm still exposes the normal throw-escape window. Gold Standard deals 34 over four linked hits. Onyx deals 10 per normal punch. A fresh block pressed within 0.14 seconds before a punch/kick lands prevents chip and grants a 0.5-second opportunity for an 18-damage counter punch. The perfect-guard window cannot rearm for 0.45 seconds, so rapid block taps cannot keep it continuously active. Holding guard alone does not refresh it. Special attacks cannot be perfect-guarded; grabs beat guard. Missing the counter leaves 0.48 seconds of recovery after the active portion. Her Onyx Reversal super deals 29 over four hits. The normal counter and meter-powered cinematic are separate actions.

Training's Practice jabs dummy punches regularly when in range. Select Onyx and time BLOCK → P to rehearse the mechanic. HUD feedback shows PERFECT GUARD and COUNTER READY. Existing four-fighter punch damage remains approved at 12 / 9 / 8 / 10.

New project asset: `assets/goldie-onyx.webp`, generated with the built-in image tool from the supplied Goldie/Onyx outfit references and established game atlas. Prompt: transparent four-column, four-row atlas; eight full-body right-facing felt-puppet arcade poses per character (ready, step, punch, high kick, guard, hurt, jump, signature); Goldie in the first two rows with blonde curls and black SBFENT beanie, Onyx in the last two with black waves and no hat; both preserve their black/gold outfits and sneakers; separate alpha regions, no background, props, cigarettes, UI, labels, or extra people. `duo-data.mjs` holds alpha bounds, clipping spans, and hulls.


## DJ Blackout / Quiet Money review set

DJ's grounded K launches one traveling sound wave, dealing 9 once on contact. It travels at 650 arena units per second for at most 440 units. Blocking causes chip; jumping the wave or staying beyond range avoids contact. Air K remains a normal close kick. Opposing waves can clash; joint sequences and round changes clear waves. Damage, collisions, and lifetime are owned by the combat model. Grounded K has committed recovery, allowing close-range punishment. The touch button reads WAVE when grounded as DJ. Bass Drop is a distinct four-hit 29-damage super.

Quiet Money's punch deals 16, with slower startup/recovery than Flex. Guard reduces incoming damage to 6% rounded up, compared with the usual 12%, and reduces guard pushback. Throws bypass this benefit. Silent Investment deals 31 over four cinematic hits. His regular defense does not grant Onyx's timed-counter mechanic.

New asset: `assets/dj-quiet.webp`, generated with the built-in image tool from the supplied character references and existing game style. Final prompt: preserve the sixteen right-facing DJ/Quiet poses on a square transparent canvas, with eight full-body poses per fighter and enough gutter/padding to keep every hat, hand and shoe inside its cell; blue OFF cap/headphones/navy-and-gold outfit for DJ, yellow HUSH cap/gold sunglasses/green-and-gold outfit for Quiet; ready, step, punch, kick, guard, hurt, jump and power poses; no backdrop, props, UI, captions or borders. `sound-data.mjs` isolates the sixteen alpha regions.
