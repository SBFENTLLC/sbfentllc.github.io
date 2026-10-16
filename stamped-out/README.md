# SBFENT: Stamped Out — Flex story chapter one review build

Private playable test: https://sbfent-stamped-out-test.purpleflute8.chatgpt.site

The current build lets the player choose Flex A Lot, the Bootlegger, Foxy, Clara, Goldie, Onyx, DJ Blackout, Quiet Money, Neon Nova, Big Stamp, Violet V, or Redline against any of those twelve CPU opponents, including mirror matches. The rooftop and story-unlockable Carolina Block Party are playable. Character selection is contained in the menu and disappears during combat. Existing SBFENT pages are unchanged.

## Flex story: Take Back the Stamp

Chapter one forces Flex as the player and disables training behavior even when the training checkbox is selected. Beat Bootlegger and Redline on the rooftop, then Big Pressure at Carolina Block Party. Each encounter is a best-of-three match. Difficulty follows the menu setting. Defeats retry the same encounter; match wins save immediately to this browser/device. Clearing the chapter unlocks Big Pressure for either match slot and the new arena for arcade/training. Replay retains unlocks and saves its current encounter. Storage failure is reported on the result screen; no cloud or cross-device save is claimed.

Big Pressure has slow heavy punches, a 24-damage escapable grab, and a 19-damage shoulder charge. The charge winds up for 0.62 seconds and glows gold while it can absorb one light strike. It still takes that damage; a second strike, a heavy strike, or a grab interrupts it. Block/jump and punish its 0.72-second recovery. Pressure Break is a 3.6-second double-slam sequence dealing 38 total damage.

## Twelve distinct styles

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
| Neon Nova | Direction + P dash-punch; P → K | Light hits, no invincibility, committed dash recovery | Neon Blitz: crossing dash strikes and rising palm |
| Big Stamp | 26-damage throws and closer post-throw pressure | Slowest walk, slow grabs, normal throw-escape window | Crown Crusher: carried spinning powerbomb |
| Violet V | Low K sweeps standing guard into knockdown | Down + block or jump beats sweep; long recovery | Purple Reign: low sweep, rising spiral, heel drop |
| Redline | Advancing P → P → P confirms | Blocking stops the chain; misses leave recovery | Overdrive: rushing punches and leaping uppercut |

Match slot and character identity are separate, so each character keeps their moves, artwork, throws, timing, and special on either side. `roster.mjs` contains twelve starting profiles, the implemented Big Pressure boss, and three future boss profiles. Foxy and Clara use the supplied main-outfit references and eight illustrated poses each. Animation transforms these poses; it is not fully frame-drawn animation. `expansion-data.mjs` defines isolated alpha regions and hulls for the new atlas.

Punch damage against 100 HP: Flex 12 (previously 8), Bootlegger 9 (6), Foxy 8 (6), Clara 10 (7). Punch reach and timing retain each character’s style. Flex’s landed P → P → K now deals 35 total damage. Guard still reduces strikes to chip damage.

## Combat and practice

Best of three, sixty-second rounds, easy/medium/hard CPU, Stamp Meter, blocked chip damage, hit-stop, counters, recovery punishes, knockdowns, slow-motion K.O.s, character intro/win cards, and match records. Recent taps buffer for 160 ms; only unblocked contact allows a character's specified cancel route. A clean hit interrupts the opponent and clears queued input. Chains have bounded cancels; whiffs and blocked attacks recover normally. Grounded knockdown prevents repeated strikes and grabs.

Supers have a 2.25-second cut-in. Unblocked in-range contact starts a four-hit sequence lasting about three seconds, with a paused clock and synchronized damage/animation. Guard reduces the special to chip damage and prevents the connected sequence. CPU power-up cut-ins allow the player to buffer block.

GRAB is ground-only, beats guard, and misses airborne targets. Hold a direction to choose the throw. The defender may tap GRAB within 0.3 seconds to escape. CPU tech probability follows difficulty. Slams damage once and give wake-up throw immunity. Foxy uses a kick-assisted toss; Clara uses an aerial turning toss.

Training starts with a full meter and has standing, blocking, jumping, or regular-jab dummies, character-specific coaching, stats, and a pause-menu reset. Training matches do not change saved W/L or best-combo records. Records and controls are stored on this device; storage failures are tolerated. Story and cloud saving are not implemented.

## Phone, audio, and Home Screen

Landscape touch controls: directional pad plus punch, kick, block, grab, and special. Standard/large button options and left/right attack hand. Captured movement pointers can slide between buttons. Keyboard: arrows/WASD, J punch, K kick, L block, I/G grab, U special, Escape pause. Holding jump does not repeat after landing.

All six supplied instrumentals are included as mobile AAC copies; originals are unchanged. One lazy audio element avoids overlapping tracks. MODEST plays on return to menu; HUSTLE / FOUR FLAT / MONEY MACHINE rotate across matches; ONE NIGHT STAND plays in training; all six, including EXQUISTE, are manually selectable. Music ducks around power-ups and K.O.s without altering the saved volume, and pauses with the game/background tab. Layered synthesized combat sounds begin after a gesture.

A relative-scope web manifest, 192/512px icons, Apple touch icon/meta tags, install instructions, and v9 service worker support Home Screen installation and cached core gameplay after a successful first load. Music streams on demand and partial audio responses are not cached. Reduced-motion mode suppresses camera movement, moving trails, and energy animation.

## Validation and remaining scope

Run `node --test stamped-out/*.test.mjs` from the repository root. 73 checks cover all 169 implemented character pairings, both slots' moves/supers/throws, guard, chains, buffers, interrupts, escape windows, AI, records, soundtrack state, offline asset paths, and mocked menu/selection/combat flows. Offline Canvas inspection covers the new poses and cinematic frames. Browser QA was unavailable in this environment; actual phone input, audio mix, performance, installation, and offline operation still require device testing.

The twelve starting fighters and chapter one are implemented. Three more boss chapters, six more arenas, and alternate outfits remain future production stages after review of each set.

Artwork: generated with the built-in image tool, using the supplied Foxy/Clara references and the existing fighter atlas. Final project asset: `assets/foxy-clara.webp`. Prompt: a transparent 4×4 atlas of sixteen full-body, right-facing felt-puppet arcade sprites; Foxy in the first two rows and Clara in the last two rows; each with ready, step, punch, high kick, guard, hurt, jump, and power poses; preserve reference faces, camo/cream outfit for Foxy and purple/camo/red-ponytail outfit for Clara, with no props, background, UI, or labels. Alpha bounds/masks prevent adjacent atlas poses bleeding into gameplay.


## Goldie / Onyx review set

Goldie deals 14 per punch and 23 per throw, but has a slower walk, shorter strikes, and committed recovery. Her P → GRAB confirm still exposes the normal throw-escape window. Gold Standard deals 34 over four linked hits. Onyx deals 10 per normal punch. A fresh block pressed within 0.14 seconds before a punch/kick lands prevents chip and grants a 0.5-second opportunity for an 18-damage counter punch. The perfect-guard window cannot rearm for 0.45 seconds, so rapid block taps cannot keep it continuously active. Holding guard alone does not refresh it. Special attacks cannot be perfect-guarded; grabs beat guard. Missing the counter leaves 0.48 seconds of recovery after the active portion. Her Onyx Reversal super deals 29 over four hits. The normal counter and meter-powered cinematic are separate actions.

Training's Practice jabs dummy punches regularly when in range. Select Onyx and time BLOCK → P to rehearse the mechanic. HUD feedback shows PERFECT GUARD and COUNTER READY. Existing four-fighter punch damage remains approved at 12 / 9 / 8 / 10.

New project asset: `assets/goldie-onyx.webp`, generated with the built-in image tool from the supplied Goldie/Onyx outfit references and established game atlas. Prompt: transparent four-column, four-row atlas; eight full-body right-facing felt-puppet arcade poses per character (ready, step, punch, high kick, guard, hurt, jump, signature); Goldie in the first two rows with blonde curls and black SBFENT beanie, Onyx in the last two with black waves and no hat; both preserve their black/gold outfits and sneakers; separate alpha regions, no background, props, cigarettes, UI, labels, or extra people. `duo-data.mjs` holds alpha bounds, clipping spans, and hulls.


## DJ Blackout / Quiet Money review set

DJ's grounded K launches one traveling sound wave, dealing 9 once on contact. It travels at 650 arena units per second for at most 440 units. Blocking causes chip; jumping the wave or staying beyond range avoids contact. Air K remains a normal close kick. Opposing waves can clash; joint sequences and round changes clear waves. Damage, collisions, and lifetime are owned by the combat model. Grounded K has committed recovery, allowing close-range punishment. The touch button reads WAVE when grounded as DJ. Bass Drop is a distinct four-hit 29-damage super.

Quiet Money's punch deals 16, with slower startup/recovery than Flex. Guard reduces incoming damage to 6% rounded up, compared with the usual 12%, and reduces guard pushback. Throws bypass this benefit. Silent Investment deals 31 over four cinematic hits. His regular defense does not grant Onyx's timed-counter mechanic.

New asset: `assets/dj-quiet.webp`, generated with the built-in image tool from the supplied character references and existing game style. Final prompt: preserve the sixteen right-facing DJ/Quiet poses on a square transparent canvas, with eight full-body poses per fighter and enough gutter/padding to keep every hat, hand and shoe inside its cell; blue OFF cap/headphones/navy-and-gold outfit for DJ, yellow HUSH cap/gold sunglasses/green-and-gold outfit for Quiet; ready, step, punch, kick, guard, hurt, jump and power poses; no backdrop, props, UI, captions or borders. `sound-data.mjs` isolates the sixteen alpha regions.


## Final four starting fighters

Nova's directional ground P travels up to 104 units over a brief dash, with a 0.95-second dash cooldown and extra recovery. It stops at the opponent instead of crossing through them, has no invincibility, and can be interrupted. Plain P remains a normal punch. Big Stamp's grab deals 26, with slower startup/recovery and full throw-escape counterplay. A completed regular throw leaves a 205-unit separation instead of the usual 255 and grants normal wake-up throw immunity.

Violet's grounded K is a low sweep: standing block loses, down + block reduces it to chip, and jumping above the low strike avoids it. An unblocked sweep knocks down briefly and grants throw immunity, preventing a free grab loop. The training dummy now has Standing block and Low guard choices. Redline's ground punches advance a short distance, keep the target close, and confirm into a maximum three punches; blocked/whiffed attacks cannot cancel.

Their supers deal 25 / 36 / 28 / 31 respectively, using separate four-hit choreography. The art renderer registers each paired atlas once and retains clipped alpha paths through match resets. Twelve menu cards are hidden with the rest of the menu during a fight.

New built-in image generation assets: `assets/nova-stamp.webp` and `assets/violet-red.webp`. Prompts: two transparent square 4×4 sprite atlases, eight right-facing full-body felt-puppet arcade poses per original fighter (ready, step, punch, kick, block, hurt, jump, signature), matching established illustration style and SBFENT wide-bottom denim construction. Nova: lime-tipped black coils, lime/purple/blue denim and hoops. Big Stamp: stocky flat-top/beard, blue/purple denim and crown chain. Violet V: purple braided buns, purple lightning denim and low sweeping kick. Redline: red-tipped twists, orange/blue/purple denim and uppercut signature. Preserve identity/outfit over poses; no cropped limbs, overlaps, background, UI, labels, props or extra people. Paired alpha metadata is in `nova-stamp-data.mjs` and `violet-red-data.mjs`.

## Chapter-one generated art

Created with the built-in image generation tool, converted to WebP while preserving the boss atlas alpha. Saved project assets:

- `assets/big-pressure.webp` (eight poses; `boss-data.mjs` contains isolated masks and hulls).
- `assets/blockparty.webp` (Carolina Block Party stage).

Boss prompt: “Use case: stylized-concept. Asset: production fighting-game sprite atlas, transparent RGBA. Create original SBFENT boss BIG PRESSURE, huge imposing dark-brown-skinned heavyweight man, bald with thick square beard, gold chain, sleeveless purple denim vest with lime crown emblem, black tank, wide blue-purple cargo denim pants, gold/lime sneakers, taped fists. Match chunky illustrated arcade sprites with bold clean outlines and textured cel shading. Exactly EIGHT separate full-body sprites in a FOUR-column TWO-row grid, all facing right, same character and consistent size. Top row ready guard, walking step, full extended punch, powerful shoulder charge leaning right. Bottom row arms blocking, recoiling hurt, airborne knees bent, both fists overhead power slam. Every sprite fully visible head to both shoes, generous transparent gutters 35 pixels, no touching or overlap, no labels, no shadows, no extra effects. Wide landscape atlas. Reference image is only style guidance, not identity.” Style reference: the existing Nova/Stamp atlas.

Stage prompt: “Use case: stylized-concept. Asset type: wide 16:9 illustrated background for SBFENT 2D side-view fighting game. Carolina Block Party at dusk in an original Southern US city neighborhood. Purple and lime neon stage lighting, gold crown decorations, brick storefronts, street party DJ speakers in distant background, parked custom cars, strings of glowing lights, small celebratory crowd behind barriers, rich textured arcade cel-painted art. Camera level straight side view, flat clear asphalt fighting floor across bottom 38 percent, no objects or people on this fighting floor, horizon near 60 percent image height. Background detail should be readable but lower contrast than foreground fighters. No fighters, no HUD, no letters or watermarks. Warm dusk sky, vivid purple gold lime brand colors. Production game background.”
