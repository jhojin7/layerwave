# Add and remove layers

Users can add YouTube sources, reject unsuitable or duplicate inputs, and remove layers, including the last one.

## Sub-features

- `layers-input`: invalid and duplicate sources show useful messages without adding layers.
- `layers-add`: a valid source adds a layer and clears the input.
- `layers-remove`: removal saves the resulting mix and returns focus to the input.
- `layers-empty`: removing all layers shows the empty state and disables global playback, including after reload.
- `layers-limit`: a thirteenth unique source shows `You can add up to 12 layers.` without adding a layer.

## How to get to it (user POV)

- Fill `YouTube link`, then choose `Add layer` or press Enter.
- Choose a layer's `Remove <title>` button.

## Driving it with Playwright

Preconditions: doctor passes with an empty mix and a disposable browser context.

- Run `npm run verify:ui -- --grep 'layers:'`. It submits an invalid host with the button and expects `Paste a YouTube video link or an 11-character video ID.`; adding `abcdefghijk` and submitting it again expects the duplicate message and leaves one layer.
- The same test submits `https://www.youtube.com/watch?v=lmnopqrstuv` with Enter, observes two strips and `Layer added. Press Play when it is ready.`, reads the saved source, then removes the last card and observes one saved layer and input focus, then reloads and confirms that layer remains.
- Run `npm run verify:ui -- --grep 'empty mix:'`. It first checks the fresh `No layers yet` state, adds two sources through the form, then removes both and observes `No layers yet`, disabled `Play all` and `Pause all`, and the same empty state after reload.
- For `layers-limit`, start empty, add twelve distinct valid-format IDs through the form, then try a thirteenth. Observe twelve cards and the limit message. This extended path is manual; it is not exercised by the smoke suite.

## Gotchas

- `abcdefghijk` proves acceptance of a valid-format source only; it is deliberately not a playable-video claim.
- A title can change after YouTube metadata arrives. Scope removal to its card rather than a guessed title.
- Metadata or playback failure must not be reported as successful media playback.
