# SBFENT: Stamped Out — combat review build

Private playable test: https://sbfent-stamped-out-test.purpleflute8.chatgpt.site

This prototype has two playable fighters and one rooftop. Existing SBFENT pages are unchanged. The full roster, story chapters, boss unlocks, alternate outfits, seven additional stages, and throws remain future work after combat review.

## Combat update

Flex A Lot is a pressure boxer: faster movement and punches, shorter reach, slower committed kicks. His Stamped Out super deals one crown-shockwave hit. The Bootlegger is a trickster kickboxer: longer kicks, slower movement, longer recovery, and a three-hit Counterfeit Combo. Move definitions are in `roster.mjs`; the other fourteen entries are explicit design targets, not implemented fighters.

Each super has a 2.25-second screen cut-in with a power-up pose, attack name, diagonal transition panels, energy animation, and a paused combat clock. Standard attacks have trails, contact sparks, damage labels, brief hit-stop, recoil flashes, and afterimages. Knockouts show a fall before the results overlay. Reduced-motion mode suppresses camera shake, lightning, and moving trails.

## Soundtrack

All six user-supplied instrumentals are included as mobile AAC copies; original uploads are unchanged. One audio element loads only the selected track. Playback begins on a user gesture. Music pauses when the game is paused or the tab loses visibility. Track selection, mute, and volume persist locally.

Auto placement in this two-fighter build: MODEST on return to menu; HUSTLE / FOUR FLAT / MONEY MACHINE rotate across matches; ONE NIGHT STAND in training. All six including EXQUISTE are manually selectable. Future placement targets: FOUR FLAT for the motor yard, MONEY MACHINE for the vault, EXQUISTE for the penthouse, with the remaining tracks shared between menu, street fights, and training.

## Controls and validation

Phone: landscape, directional pad, punch, kick, block, special. Keyboard: arrows/WASD, J/K/L/U, Escape. Training starts with a full meter for trying a super immediately.

Run `node --test stamped-out/*.test.mjs` from the repository root: 17 checks pass, including combat differences, triple-hit special, cinematic duration, soundtrack state, and a mocked full UI flow. JavaScript syntax checks pass. Browser/device QA remains outstanding; the UI smoke test does not replace it.

Generated fighter/stage artwork is included under assets. The implementation uses no external runtime libraries or asset services.
