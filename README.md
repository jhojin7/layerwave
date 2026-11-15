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

Run the same checks as the pull request workflow:

```sh
npm test
npm run build
npm run deploy:check
```

`deploy:check` uses the pinned local Wrangler to validate the static asset bundle without deploying. The PWA caches the app shell and bundled fonts; YouTube playback requires internet.

## Deployment

Push to `main` to run tests, build, and deploy to Cloudflare through [GitHub Actions](https://github.com/jhojin7/layerwave/actions/workflows/ci.yml). Pull requests run checks only.

Manual deployment:

```sh
npm run deploy
```
