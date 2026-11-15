# Layerwave

A YouTube audio mixer built with React, shadcn/ui, and audiocn.

[Open Layerwave](https://layerwave.jhojin7.workers.dev)

## Development

Node.js 24.

```sh
npm ci
npm run dev
```

The UI uses [shadcn preset `b3Zg8kxGTo`](https://ui.shadcn.com/create?preset=b3Zg8kxGTo&item=preview): Radix Vega, neutral surfaces, cyan accents, JetBrains Mono text, and Geist headings. Mixer layout, channel strips, faders, and mute toggles come from [audiocn](https://www.audiocn.dev/docs/components).

New mixes start empty. A Zustand store persists user-added layers, layer volumes, mute settings, and master volume in local storage. Playback status and position come from YouTube and are not persisted. Existing saved mixes migrate automatically, removing the old seeded layers while preserving user-added tracks.

Run the same checks as the pull request workflow:

```sh
npm test
npm run build
npm run deploy:check
```

`deploy:check` uses the pinned local Wrangler to validate the static asset bundle without deploying. The PWA caches the app shell and bundled fonts; YouTube playback requires internet.

## Verification

```sh
npm test
npx --no-install playwright install chromium
npm run verify:ui
```

The browser checks build the PWA and exercise layers, volume and mute settings, saved mixes, and offline reload in desktop and phone Chromium. Each run prints its evidence directory under `work/verification/` and stops its preview and browsers afterward. Live YouTube playback, physical-device installation, and update prompts need the additional checks in [the verification skill](.agents/skills/verify-layerwave/SKILL.md).

The repo includes Poteto's `$create-verification-skill`, `$maintain-verification-skill`, and proof principle, adapted for Codex. See [provenance and setup](.agents/skills/poteto-verification.md).

## Deployment

Push to `main` to run tests, build, and deploy to Cloudflare through [GitHub Actions](https://github.com/jhojin7/layerwave/actions/workflows/ci.yml). Pull requests run checks only.

Manual deployment:

```sh
npm run deploy
```
