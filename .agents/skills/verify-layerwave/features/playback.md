# Play and pause YouTube layers

Users play and pause individual or ready layers together, observe actual player state and position, and see useful errors when playback cannot proceed.

## Sub-features

- `playback-layer`: a layer's Play and Pause buttons reflect real YouTube state.
- `playback-global`: Play all and Pause all control ready players; the playing count follows player events.
- `playback-position`: elapsed time advances during real playback.
- `playback-error`: unavailable, blocked, or failed players show their actual error.

## How to get to it (user POV)

- Choose `Play <title>` or `Pause <title>` inside a ready layer.
- Choose `Play all` or `Pause all` under Master controls.
- For a failing source, read the layer's `Playback issue` status and error text. The `YouTube` link offers the original source in a new tab.

## Driving it with Playwright

Preconditions: an owned online preview, fresh context, real YouTube IFrame API access, and at least two currently playable sources. Start empty and add two currently playable sources through `YouTube link` and `Add layer`; record their IDs. Use the browser-use skill or an available browser tool for this interactive pass; preserve its screenshots and action log in the current run's evidence directory.

- Wait for `Loading…` to become `Ready to play` or an actual error. Record which occurred and the source IDs. A ready timeout is blocked coverage, not a pass.
- Scope to `[data-slot="channel-strip"]` with the relevant heading. Choose `getByRole('button', { name: /^Play / })`. Require visible `Playing`, a `Pause` button, a rising playing count, and increasing elapsed time across two observations.
- Choose the layer's `Pause`; require visible `Paused` and a stable position across two observations.
- Choose `Play all`; require each ready layer to report actual `Playing`. Choose `Pause all`; require each to report `Paused` and the master count to return to zero.
- While playing, change one layer volume, mute and unmute it, and change the master. Record audible observations separately from control-state observations. Headless Chromium does not establish audible output on a user's speakers.
- Try a source known to be unavailable or disallow embedding. Record the real displayed error; never fabricate a player callback or treat the error as successful playback. If the error cannot be reproduced, mark that path unverified.

## Gotchas

- Browser autoplay rules, source availability, regional restrictions, and YouTube error 153 can block local playback. Capture the exact message and attempted URL; do not bypass the restriction or proxy media.
- The automated smoke suite does not click Play and does not verify this feature.
- Physical mobile playback needs a real-device pass. Do not infer or promise background or locked-screen playback.
