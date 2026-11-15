# Layerwave verification map

Start from the repository root with the owned production preview and a fresh browser context. `npm run verify:ui` handles build, launch, doctor, isolation, evidence, and cleanup. The browser context starts empty. Journeys add their own layers through the form; no localStorage writes or mocked YouTube responses prepare them.

## Features

- [Layers](layers.md): invalid and duplicate input, add, remove, empty state, and persistence. Automated on desktop and phone Chromium.
- [Balance](balance.md): independent layer volume, mute, master volume, and reload persistence. Automated control-state checks on both projects; audible output requires the playback journey.
- [Playback](playback.md): individual and global playback, real status, position, and errors. Requires a live online browser and playable YouTube sources; not covered by the automated smoke suite.
- [Offline shell](offline-shell.md): service-worker-controlled offline reload, saved mix, and same-origin cache entries. Automated on both projects; physical PWA installation and update prompts require the additional manual paths.

## Evidence and limits

Each automated journey records named actions and assertions in a trace, plus a screenshot, ARIA snapshot, and saved mix under the run's printed `work/verification/` directory. Report each entry point actually exercised. A skipped or unreachable playback or install path is not verified through another path. Phone emulation is not a physical-device result.
