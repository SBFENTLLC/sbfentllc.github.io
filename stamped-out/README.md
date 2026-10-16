# SBFENT: Stamped Out — combat review build

Private playable test: https://sbfent-stamped-out-test.purpleflute8.chatgpt.site

This prototype has two fighters and one rooftop. Existing SBFENT pages are unchanged. The full roster, story chapters, boss unlocks, alternate outfits, seven additional stages, remain future work after combat review.

## Combat update

Flex A Lot is a pressure boxer: faster movement and punches, shorter reach, slower committed kicks. His Stamped Out super connects body blows, an aerial launch, and a crown-stamp slam. The Bootlegger is a trickster kickboxer: longer kicks, slower movement, longer recovery, and a four-hit Counterfeit Combo with clone crossfire and a flying-kick finish. Move definitions are in `roster.mjs`; the other fourteen entries are explicit design targets, not implemented fighters.

Each super has a 2.25-second screen cut-in followed, on unblocked contact, by a three-second choreographed sequence linking both fighters with a power-up pose, attack name, diagonal transition panels, energy animation, and a paused combat clock. Standard attacks have trails, contact sparks, damage labels, brief hit-stop, recoil flashes, and afterimages. Knockouts show a fall before the results overlay. Reduced-motion mode suppresses camera shake, lightning, and moving trails.

## Soundtrack

All six user-supplied instrumentals are included as mobile AAC copies; original uploads are unchanged. One audio element loads only the selected track. Playback begins on a user gesture. Music pauses when the game is paused or the tab loses visibility. Track selection, mute, and volume persist locally.

Auto placement in this two-fighter build: MODEST on return to menu; HUSTLE / FOUR FLAT / MONEY MACHINE rotate across matches; ONE NIGHT STAND in training. All six including EXQUISTE are manually selectable. Future placement targets: FOUR FLAT for the motor yard, MONEY MACHINE for the vault, EXQUISTE for the penthouse, with the remaining tracks shared between menu, street fights, and training.

## Controls and validation

Phone: landscape, directional pad, punch, kick, block, special. Keyboard: arrows/WASD, J/K/L/U, Escape. Training starts with a full meter for trying a super immediately.

Run `node --test stamped-out/*.test.mjs` from the repository root: 37 checks pass, including combat differences, four-hit specials, hit-confirmed chains, input buffering, guard timing, interruptions, throws, records, soundtrack ducking, and a mocked full UI flow. JavaScript syntax checks pass. Browser/device QA remains outstanding; the UI smoke test does not replace it.

Generated fighter/stage artwork is included under assets. The implementation uses no external runtime libraries or asset services.

## Grabs, throws, K.O.s, and Home Screen app

GRAB (I or G) works only at close range and against grounded targets. Hold left/right to choose direction. Throws beat blocks, whiffs have recovery, and the defender can tap GRAB during a 0.3-second window to escape. The CPU can attempt throws and tech with difficulty-based probability. A completed slam deals damage once and grants brief wake-up throw immunity. Both fighters receive new grapple/finishing poses. The engine owns all contact and damage; animation follows the same sequence clock. A super can be blocked for chip damage rather than triggering the connected cinematic. The defender may buffer block during the opponent's power-up cut-in.

Knockout fall and particles run at 32% speed initially, with a camera push-in and delayed results. Reduced-motion settings suppress camera movement.

A relative-scope web manifest, 192/512px icons, Apple touch icon/meta tags, install instructions, and a versioned service worker support Home Screen installation and cached core gameplay after a successful first load. Music stays streamed on demand; no partial audio responses are cached. Actual iPhone installation, browser input, and offline use require device testing.

Validation after this update: 37 passing checks plus offline canvas inspection of sequence and presentation frames.


## Combat polish pass

Recent taps buffer for 160 ms through recovery. Flex can confirm P → P → K; Bootlegger can confirm a close kick into a punch. Follow-up startup is shortened only after unblocked contact; a chain has at most two cancels. Whiffs and blocked strikes must recover normally. A clean hit interrupts an opponent’s attack and clears their queued input. The HUD distinguishes counter hits from recovery punishes. Combo counting resets on an unlinked attack or interruption. Guard is sampled for both fighters before contact. Grounded knockdown prevents repeated strikes and grabs, and holding jump no longer causes automatic hops after landing.

Wind-up lean, recoil, recovery poses, idle breathing, character intro cards, win quotes and victory poses add personality. New layered synthesized impact/guard/power-up/KO sounds run after a gesture; soundtrack ducking lowers music around a super or knockout and restores the chosen level without changing saved preferences. The animations still transform a finite set of illustrated poses rather than using fully frame-drawn animations.

Phone settings offer standard/large controls and either attack hand. Captured movement pointers can slide between directional buttons. The training dummy can stand, block, or jump; coaching, match stats, and a pause-menu position reset support practice. Completed non-training matches save W/L and best combo on this device. Storage errors are tolerated. This record is not story progress or a cloud save.

The service worker cache advances to v4. On-device feel, actual iPhone Home Screen/offline behavior, audio mix, and performance still require a phone playtest; no browser QA was available in this managed environment. Full roster, story, boss unlocks, additional arenas, and alternate costumes remain the next production stages.
