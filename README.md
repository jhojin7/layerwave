# Layerwave

A YouTube-only mixer for layering music and ambient audio.

`main` serves the original single-file demo unchanged. The `rebuild/pwa` branch contains the React proof of concept with shadcn/ui and audiocn controls. The original HTML is preserved at `public/legacy/index.html` on this branch.

## Run and deploy

```sh
npm ci
npm run dev
npm run build
npm test
npm run deploy:preview
```

Deployment requires an authenticated Wrangler session (`npx wrangler login`). No credentials belong in this repository.

Live original demo: https://layerwave.jhojin7.workers.dev

Live rebuild preview: https://layerwave-poc.jhojin7.workers.dev

The rebuild preview targets a separate Worker, `layerwave-poc`. `npm run deploy` targets the original `layerwave` Worker and replaces the baseline; use `deploy:preview` while developing.

Cloudflare's official agent skills are installed in `.agents/skills/`. See [Cloudflare setup](docs/cloudflare-setup.md) for MCP configuration and authentication on a new machine.

## Proof of concept

The mixer supports YouTube links and IDs, add/remove, individual play/pause, volume and mute, master volume, global play/pause, source titles, and playback state and position. Settings persist in browser storage. There are no visible video players or footer.

Playback uses hidden YouTube IFrame API players, as the original HTML did. These remain separate players, with channel and master gains combined into each player's volume. The UI does not extract raw audio or display simulated audio meters. Videos that prohibit embedding show a playback error; hiding a player does not bypass that restriction.

The original lo-fi source `1nZh1ILveC4` rejected embedded playback during verification. The rebuild defaults to Lofi Girl's [Lofi house vol.1](https://www.youtube.com/watch?v=O_97HkFMhFk), alongside the original alpha audio.

The PWA includes icons, a standalone manifest, app-shell caching, and an update action when a new version is available. YouTube media is not cached.

## Validation

Type-checking, production build, and URL/gain tests pass. Browser checks verified simultaneous playback of both default sources with advancing timestamps, master volume and mute controls, no visible players, no footer, and no horizontal overflow at 390px and 768px. These checks use desktop Chrome with viewport emulation; physical phone/tablet playback still needs validation.

YouTube streams remain separate embedded players. PWA installation does not make YouTube audio available offline or guarantee background playback on mobile.
