---
name: verify-layerwave
description: Verify Layerwave mixer and PWA behavior in an isolated browser, preserve action traces and results, and report actual YouTube playback separately. Use after mixer, persistence, playback, or app-shell changes.
---

# Verify Layerwave

Read [features/README.md](features/README.md), then the feature files relevant to the change.
This skill implements Poteto's create-verification workflow for this repo. Upstream provenance and Codex adaptations are in [../poteto-verification.md](../poteto-verification.md).

## Launch

Use Node.js 24 from `.node-version`. From the repository root:

```sh
npm ci
npx --no-install playwright install chromium
npm test
npm run verify:ui
```

`verify:ui` builds the actual PWA, starts `npm run preview` on `127.0.0.1:4173`, and drives it through Playwright. No credentials, backend, seed script, or account is needed. Each journey gets a fresh nonpersistent browser context with an empty mix. Journeys that need layers add two valid-format sources through the form. No YouTube responses or player objects are mocked.

The preview must be this run's process: `reuseExistingServer: false` and `--strictPort` reject an occupied port. Run on another port with `LAYERWAVE_VERIFY_PORT=4174 npm run verify:ui`. Do not run simultaneous builds against one checkout's `dist/`; use separate worktrees for concurrent verification.

The desktop project uses Chromium at 1280×720. The phone project uses Pixel 7 emulation. Neither proves Safari, a physical phone, installation UI, or locked-screen playback.

For the manual playback and installation paths, start an owned interactive preview with `npm run build && npm run preview -- --port 4174 --strictPort` and keep its terminal session. Confirm the `Local: http://127.0.0.1:4174/` log, compare `/` to `dist/index.html`, and check the empty mixer before driving it. Keep browser evidence under a new `work/verification/` directory. Stop that exact terminal session when finished.

## Doctor

Every journey first compares the served `/` response to this checkout's `dist/index.html`, checks the expected origin and mixer heading, and requires the `Your mix` heading, an editable `YouTube link` textbox, and zero initial layers. Playwright confirms the owned preview is ready before these checks. A healthy HTTP response alone is insufficient.

After a surprising failure, inspect the trace and rerun the affected test from a fresh context; this repeats doctor. Do not attach to a user's existing browser or make a failing check pass by changing saved state internally.

## Drive

The harness is [tests/mixer.spec.ts](tests/mixer.spec.ts), configured by [playwright.config.ts](playwright.config.ts). It uses visible user controls and keyboard actions; `localStorage` reads only corroborate persistence after those actions.

```sh
npm run verify:ui -- --grep 'layers:'
npm run verify:ui -- --grep 'balance:'
npm run verify:ui -- --grep 'empty mix:'
npm run verify:ui -- --grep 'offline shell:'
npm run verify:ui -- --project desktop-chromium --headed
```

The playback map gives the additional live YouTube journey. A control-state pass does not establish that a player became ready, played media, advanced position, or changed audible volume. Report those checks separately. Do not replace real player state with a fake timer, event, waveform, or meter.

## Evidence

Each run prints a unique `work/verification/<timestamp>-<pid>/` path, ignored by Git. It contains `results.json` and per-journey screenshots, action traces, final ARIA snapshots, and the saved mix. Both successful and failed journeys retain evidence; never infer a pass from an older run's files.

Open the exact trace path listed in that run's `results.json`:

```sh
npx --no-install playwright show-trace /absolute/path/to/trace.zip
```

Report commands, exit codes, feature IDs, browser project, and artifact paths. Separate observed outcomes from skipped, blocked, or manual checks. Include relevant before/after evidence. State whether changes are local, committed, pushed, opened as a PR, merged, or deployed only when observed. YAML parsing does not prove GitHub accepted an issue form; a local build does not prove CI or deployment.

## Cleanup

Playwright closes each owned browser context and its preview process on normal completion or test failure. It does not delete the evidence directory. Verify the run's artifacts still exist and the preview port is released. If an interrupted run strands a process, identify the PID owned by that run before terminating it; never kill by process name. Do not clear a user's browser storage or remove evidence during cleanup.

Use `$maintain-verification-skill` to audit this skill and its feature map after product changes. The maintenance skill owns only this directory; report product regressions without silently fixing or weakening them.
