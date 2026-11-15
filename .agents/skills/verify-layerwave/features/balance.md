# Balance and save a mix

Users adjust each layer, mute independently, and change the master while preserving their mix across reloads.

## Sub-features

- `balance-layer`: one layer's volume changes without changing the other layer.
- `balance-mute`: the layer's mute button exposes its pressed state.
- `balance-master`: master changes preserve the other layer's settings.
- `balance-persist`: changed values survive reload and remain visible in the controls.

## How to get to it (user POV)

- Use the slider named `<title> volume` in a layer or `Master volume` above the mixer.
- Choose `Mute <title>` in a layer; the same button toggles both ways.
- Reload the page to reopen the saved mix.

## Driving it with Playwright

Preconditions: doctor passes with an empty mix in a fresh context. The journey adds `abcdefghijk` and `lmnopqrstuv` through the form before changing their controls.

- Run `npm run verify:ui -- --grep 'balance:'`.
- Focus the first card's slider and press ArrowLeft. Its saved gain decreases, while the second layer remains unchanged.
- Choose the first card's `Mute` button. Observe the same button with `aria-pressed="true"`.
- Focus the `Master volume` slider and press ArrowLeft. Its saved value decreases; the second layer remains unchanged.
- Reload and observe the mute state and saved values. The slider's `aria-valuetext` exposes its dB value. Inspect the trace and saved-mix attachment alongside the screenshot.

## Gotchas

- The fader's numeric `aria-valuenow` is its normalized position, not dB; use `aria-valuetext` for the displayed unit.
- This checks controls and persistence. It does not prove audible volume changes or YouTube player API calls. Use the playback map for those.
- The smoke journey uses keyboard input. Pointer dragging, touch dragging, and unmuting are additional manual paths when a change affects those interactions.
