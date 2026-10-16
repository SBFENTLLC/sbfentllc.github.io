# SBFENT: Stamped Out — Flex story eight-arena + ten alternate outfits review build

Private playable test: https://sbfent-stamped-out-test.purpleflute8.chatgpt.site

The current build has twelve starting fighters, four unlockable bosses, eight arenas, and Flex’s four-chapter story. SBFENT Rooftop, SBFENT Studio, The Vault, and Bootleg Workshop are available immediately. Carolina Block Party, Neon Underground, Flex Motor Yard, and Crown Penthouse retain their story unlock requirements. Flex, Bootlegger, Foxy, Clara, Goldie, Onyx, DJ Blackout, Quiet Money, Neon Nova, and Big Stamp have selectable SBFENT tracksuit alternates. The character menu disappears during combat. Existing SBFENT pages are unchanged.

## Flex story: Take Back the Stamp

Chapter one forces Flex as the player and disables training behavior even when the training checkbox is selected. Beat Bootlegger and Redline on the rooftop, then Big Pressure at Carolina Block Party. Each encounter is a best-of-three match. Difficulty follows the menu setting. Defeats retry the same encounter; match wins save immediately to this browser/device. Clearing the chapter unlocks Big Pressure for either match slot and the new arena for arcade/training. Replay retains unlocks and saves its current encounter. Storage failure is reported on the result screen; no cloud or cross-device save is claimed.

Big Pressure has slow heavy punches, a 24-damage escapable grab, and a 19-damage shoulder charge. The charge winds up for 0.62 seconds and glows gold while it can absorb one light strike. It still takes that damage; a second strike, a heavy strike, or a grab interrupts it. Block/jump and punish its 0.72-second recovery. Pressure Break is a 3.6-second double-slam sequence dealing 38 total damage.

## Chapter two: Signal Lost

Clear chapter one to enable chapter two in the story chapter selector. Flex faces DJ Blackout at Carolina Block Party, Onyx on the rooftop, then Lady Static at Neon Underground. Clear all three best-of-three matches to unlock Lady Static in either arcade/training slot and Neon Underground in the arena selector. Both chapter cursors save independently; replaying a chapter keeps all earned rewards. Existing version-one saves migrate in place, including an unfinished chapter-one replay. No account or cloud save is claimed.

Lady Static's ground K plants a stationary trap 130 units ahead. A visible ring fills for 0.65 seconds before arming. It deals 11 once, expires after 3.5 seconds, and only one trap per owner can exist. Jump above its low trigger height, block for chip, or hit its owner to clear it. Setup can be interrupted before placement. Her air K is a close knee strike; her light 8-damage punch and long setup recovery reward close pressure. Static Storm is a 3.5-second, four-beat electric cage and lightning slam dealing 32 total. It has the same block/range/meter rules as the other supers.

## Chapter three: Heavy Freight

Clear chapter two, select Heavy Freight, and face Big Stamp at Carolina Block Party, Quiet Money at Neon Underground, then Iron Haul at Flex Motor Yard. Completing all three best-of-three matches unlocks Iron Haul and Flex Motor Yard for arcade/training. Save format three migrates both prior formats, preserving earlier unlocks and unfinished replay cursors. Chapter selection and unlocks remain sequential.

Iron Haul's ground K braces after a 0.25-second setup. It grants a 1.8-second opportunity for P: a 22-damage heavy straight with 0.45-second startup and 0.70-second recovery. One light strike can be absorbed during startup while still dealing damage; a second light strike, a heavy hit, a grab, or a post-startup hit breaks it. Ordinary P has no armor. Moving, jumping, getting hit, or entering a joint sequence cancels brace. Full Load is a 3.45-second four-beat freight carry and shoulder smash dealing 35 total.

## Final chapter: The Real Crown

Clear Heavy Freight to select The Real Crown. Flex faces Neon Nova at Flex Motor Yard, Goldie at Neon Underground, then The False King at Crown Penthouse. Clearing the finale unlocks The False King for both arcade/training slots and Crown Penthouse in the arena selector. The result and chapter screens conclude Flex's counterfeit-crown story. All prior unlocks persist, and replaying any chapter keeps the full roster and arenas. Save format four migrates versions one through three in place, including unfinished replays.

The False King's ground K visibly cycles RUSH → REACH → POWER. Switching takes a vulnerable 0.35-second wind-up plus 0.10-second active and 0.30-second recovery, causing no damage; a hit before the swap interrupts it. Names and color-coded floor markers identify the stance. RUSH moves at 255 and punches for 10 with 0.10-second startup/155 reach; REACH moves at 200 and punches for 13 with 0.24-second startup/190 reach; POWER moves at 175 and punches for 20 with 0.38-second startup/150 reach and 0.65-second recovery. Power has no armor; blocking, interrupting, throws and recovery punishes are valid counters. Air K remains an 11-damage kick. Round reset restores Rush. False Coronation is a 3.6-second four-hit stolen-technique sequence for 36 damage.

Story CPU pressure now rises gradually across the twelve encounters: decision pace starts at 0.85 and ends at 1.235 (arcade/training remain 1). The selected Easy/Medium/Hard rules, all damage, and the approved punch contact tuning remain unchanged. Later opponents decide more quickly rather than receiving hidden damage or health bonuses. Human phone testing must still judge whether the ramp feels fair.

Finale art asset paths and exact prompts: [ART-FINALE.md](ART-FINALE.md).

## Arenas and alternate outfits

The arena selector contains all eight locations. `arenas.mjs` is the shared registry for names, art, and availability: four starting arenas plus four story-unlock arenas. All use the same flat fight space, gameplay bounds, and camera. Studio, Vault, and Workshop are selectable in arcade and training without changing story progression.

Prematch outfit selectors independently dress the player and opponent, including mirror matches. Flex's purple tracksuit and Bootlegger's blue tracksuit derive from the supplied SBFENT clothing references. Both preserve their original puppet identity, hats, face/mask, body proportions, and style. Each has eight new normal poses plus four matching grappling poses, so cinematic throws/supers retain the selected clothing. Foxy also has a lime hooded tracksuit with purple/blue panels, and Clara has an orange/purple/blue tracksuit. Their existing eight-pose kick, aerial, throw, and super choreography uses the selected clothing. Each preserves the original hair, face, hat/accessories and proportions. Other fighters show Original outfit with the alternate option disabled and labeled coming later.

Preferences save per character and side on this device. Loading the expanded four-character outfit settings preserves earlier Flex/Bootlegger choices. Story uses the player's saved Flex outfit and the opponent's saved outfit for supported opponents. Round resets, clones, power-up portraits, victory poses, and joint sequences preserve appearance. Outfits are cosmetic: model replay checks show identical damage, timing, movement, guard, and outcomes for original/alternate matches. The approved punch contact tuning is unchanged.

New asset paths and exact built-in image-generation prompts: [ART-OUTFITS-ARENAS.md](ART-OUTFITS-ARENAS.md) and [ART-FOXY-CLARA-OUTFITS.md](ART-FOXY-CLARA-OUTFITS.md).

## Music and fighter voices

Each arcade, training, story, and rematch calls the soundtrack's match-start path: unlock, resume, select a song, and reset its playback position. Manual track choice, volume, and mute remain respected. If the browser blocks playback, the next movement/attack gesture or music button retries without muting it. Music loops within each match; one player avoids overlapping songs.

Only knockouts use spoken audio: one short ‘K.O.’ announcer call per knockout round, including the final match knockout. Fighter intro, special, win dialogue, and vocal grunts are removed. Impact effects and soundtrack remain. A delayed red health-bar trail makes lost damage easier to read, low health changes the bar color, and landed attacks show HIT CONFIRMED. Punch/kick sprites now pull back during startup, extend through contact, and ease back during recovery; reduced-motion mode skips the added pose movement. The K.O. announcer checkbox controls speech separately from impacts and music. It uses the device's built-in speech voice, with no paid voice clips or paid runtime service. Timeout results do not speak; repeated result events cannot repeat the call. Pause/menu exit cancel speech. Visual intro/win catchphrases and the K.O. caption remain. Actual phone playback and audio mix still require listening tests.

Chapter-three art paths and exact generation prompts: [ART-CHAPTER3.md](ART-CHAPTER3.md).

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

Match slot and character identity are separate, so each character keeps their moves, artwork, throws, timing, and special on either side. `roster.mjs` contains twelve starting profiles, implemented Big Pressure, Lady Static, Iron Haul, and The False King bosses. Foxy and Clara use the supplied main-outfit references and eight illustrated poses each. Animation transforms these poses; it is not fully frame-drawn animation. `expansion-data.mjs` defines isolated alpha regions and hulls for the new atlas.

Punch damage against 100 HP: Flex 12 (previously 8), Bootlegger 9 (6), Foxy 8 (6), Clara 10 (7). Punch reach and timing retain each character’s style. Flex’s landed P → P → K now deals 35 total damage. Guard still reduces strikes to chip damage.

## Punch contact tuning

Punch reach now better matches the illustrated contact: Flex reaches 155 units (previously 118), matching his kick reach. Other normal punches range from 138 to 175 depending on the fighter. Onyx's timed counter reaches 170; Iron Haul's loaded straight reaches 180. Damage, startup, recovery, and cancel limits are unchanged. Redline still advances up to 26 units and Nova retains her directional dash, so their effective reach includes movement.

Punches now check contact throughout their defined active window until the first valid hit or block, rather than checking only on its first frame. A target moving into a live swing can be caught; entering during recovery cannot cause a late hit. Each swing still deals damage only once, guard still chips, and blocked/whiffed punches cannot confirm into combos.

## Combat and practice

Best of three, sixty-second rounds, easy/medium/hard CPU, Stamp Meter, blocked chip damage, hit-stop, counters, recovery punishes, knockdowns, slow-motion K.O.s, character intro/win cards, and match records. Recent taps buffer for 160 ms; only unblocked contact allows a character's specified cancel route. A clean hit interrupts the opponent and clears queued input. Chains have bounded cancels; whiffs and blocked attacks recover normally. Grounded knockdown prevents repeated strikes and grabs.

Supers have a 2.25-second cut-in. Unblocked in-range contact starts a four-hit sequence lasting about three seconds, with a paused clock and synchronized damage/animation. Guard reduces the special to chip damage and prevents the connected sequence. CPU power-up cut-ins allow the player to buffer block.

GRAB is ground-only, beats guard, and misses airborne targets. Hold a direction to choose the throw. The defender may tap GRAB within 0.3 seconds to escape. CPU tech probability follows difficulty. Slams damage once and give wake-up throw immunity. Foxy uses a kick-assisted toss; Clara uses an aerial turning toss.

Training starts with a full meter and has standing, blocking, jumping, or regular-jab dummies, character-specific coaching, stats, and a pause-menu reset. Training matches do not change saved W/L or best-combo records. Records and controls are stored on this device; storage failures are tolerated. Story and cloud saving are not implemented.

## Phone, audio, and Home Screen

Landscape touch controls: directional pad plus punch, kick, block, grab, and special. Standard/large button options and left/right attack hand. Captured movement pointers can slide between buttons. Keyboard: arrows/WASD, J punch, K kick, L block, I/G grab, U special, Escape pause. Holding jump does not repeat after landing.

All six supplied instrumentals are included as mobile AAC copies; originals are unchanged. One lazy audio element avoids overlapping tracks. MODEST plays on return to menu; HUSTLE / FOUR FLAT / MONEY MACHINE / EXQUISTE rotate across matches; ONE NIGHT STAND plays in training; all six, including EXQUISTE, are manually selectable. Music ducks around power-ups and K.O.s without altering the saved volume, and pauses with the game/background tab. Layered synthesized combat sounds begin after a gesture.

A relative-scope web manifest, 192/512px icons, Apple touch icon/meta tags, install instructions, and v9 service worker support Home Screen installation and cached core gameplay after a successful first load. Music streams on demand and partial audio responses are not cached. Reduced-motion mode suppresses camera movement, moving trails, and energy animation.

## Validation and remaining scope

Run `node --test stamped-out/*.test.mjs` from the repository root. 131 checks cover all 256 implemented character pairings, both slots' moves/supers/throws, guard, chains, buffers, interrupts, escape windows, AI, records, soundtrack state, offline asset paths, and mocked menu/selection/combat flows. Offline Canvas inspection covers the new poses and cinematic frames. Browser QA was unavailable in this environment; actual phone input, audio mix, performance, installation, and offline operation still require device testing.

All twelve starting fighters, four unlockable bosses, and four story chapters are implemented. All eight planned arenas are implemented. Additional character outfit sets remain future production stages. This completes the current story route, not final device QA or production polish.

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

## Chapter-two generated art

Built-in image generation produced `assets/lady-static.webp` (eight alpha-isolated poses, `static-data.mjs`) and `assets/underground.webp` (Neon Underground). Atlas masks and hulls were measured from the actual alpha; conversion to WebP retains it.

Atlas prompt: “Use case: stylized-concept. Asset: transparent RGBA production arcade fighting-game sprite atlas. Reference only for illustration style and proportions, NOT identity. Create original SBFENT boss LADY STATIC: dark-brown-skinned athletic woman, angular icy-cyan asymmetrical bob haircut, silver hoop earrings, purple cropped windbreaker with lime and cyan panels, black sports top, baggy cyan-purple cargo trousers with lime crown emblem, cyan/lime high-top sneakers, fingerless gloves. Confident electric trap specialist. Exactly EIGHT full-body separate sprites in FOUR columns and TWO rows, all facing RIGHT: top row ready stance, walking step, extended straight punch, low crouched palm planting an invisible trap. Bottom row crossed-arm guard, recoiling hurt, airborne knees tucked, both arms spread commanding lightning (no lightning drawn). Bold black outlines, rich clean textured cel shading matching chunky illustrated arcade sprites. Every sprite complete head to both shoes with 35px empty transparent gutters; sprites must not overlap or touch canvas edges. No labels, no floor shadows, no effects. Wide landscape atlas.” Reference: existing Violet/Redline atlas.

Final atlas refinement: “Edit target is the Lady Static eight-pose sprite sheet just generated. Remove the entire cloudy colored background to actual transparent alpha, including between arms, legs, hair and body. Keep all eight illustrated characters exactly intact, same design, positions, scale and poses. No backdrop, no glow, no floor shadow, no fog; genuine RGBA transparency. This is a production sprite atlas, not a presentation image. Preserve all shoes and fingers.”

Stage prompt: “Use case: stylized-concept. Asset: wide 16:9 production background for original SBFENT 2D fighting game. NEON UNDERGROUND, a secret broadcast club inside a repurposed underground train depot, angular steel columns, distant DJ platform, giant cyan signal screens with abstract crown shapes, purple strip lights and lime accent lighting, distant crowd behind railings, stacked speakers. Textured hand-painted cel arcade background, moody but vivid. Straight level side-view fighting camera, lower 38 percent is entirely clear flat concrete fighting floor with subtle cyan reflections, no railings or props crossing this foreground floor. All environment detail above the floor horizon at roughly 60 percent image height. No fighters, no HUD, no letters or watermarks. Composition supports large fighter sprites in foreground.”

Goldie adds a blue/purple crown-stripe tracksuit and Onyx a blue/purple side-stripe tracksuit, both from the supplied clothing references. Each retains her original face, hair, jewelry, fighting style and timing. Outfit preferences remain independent per side and preserve earlier choices. See `ART-GOLDIE-ONYX-OUTFITS.md` for generation notes.

DJ Blackout adds a purple/orange-sleeve cargo tracksuit; Quiet Money adds a purple/blue jacket and lime cargo trousers. Both preserve their hats, accessories and original mechanics. See `ART-DJ-QUIET-OUTFITS.md` for the built-in generation prompt.

Neon Nova adds an asymmetrical purple/blue jacket with orange cargo trousers. Big Stamp adds the purple/blue/lime panel tracksuit. Each has eight matching poses preserving original identity and mechanics; earlier outfit choices remain saved. See `ART-NOVA-STAMP-OUTFITS.md` for the built-in generation prompt.
