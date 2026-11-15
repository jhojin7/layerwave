# Layerwave

A YouTube-only mixer for layering music and ambient audio.

`main` contains the React proof of concept with shadcn/ui and audiocn controls. The original HTML is preserved at `public/legacy/index.html` and served at `/legacy/`.

## Run and deploy

```sh
npm ci
npm run dev
npm run build
npm test
npm run deploy:preview
```

Deployment requires an authenticated Wrangler session (`npx wrangler login`). No credentials belong in this repository.

Live app: https://layerwave.jhojin7.workers.dev

Original demo: https://layerwave.jhojin7.workers.dev/legacy/

Live rebuild preview: https://layerwave-poc.jhojin7.workers.dev

The preview targets a separate Worker, `layerwave-poc`. Use `deploy:preview` while developing.

## CI/CD

[GitHub Actions](https://github.com/jhojin7/layerwave/actions/workflows/ci.yml) runs on pushes to `main`, pull requests targeting `main`, and manual dispatch.

All runs install from the lockfile, run tests, type-check and build the PWA, and validate the Wrangler bundle. Successful pushes/manual runs on `main` deploy that build to the `layerwave` Worker and verify the hosted HTML matches the build. Pull requests never deploy. Production deploys run serially.

Node.js 24 is selected in `.node-version`. Deployment requires the repository Actions secrets `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. Use an account-scoped API token with Workers Scripts edit permission; local Wrangler OAuth credentials are not used in CI.

Cloudflare's official agent skills are installed in `.agents/skills/`. See [Cloudflare setup](docs/cloudflare-setup.md) for MCP configuration and authentication on a new machine.

## Proof of concept

The mixer supports YouTube links and IDs, add/remove, individual play/pause, volume and mute, master volume, global play/pause, source titles, and playback state and position. Settings persist in browser storage. There are no visible video players or footer.

Playback uses hidden YouTube IFrame API players, as the original HTML did. These remain separate players, with channel and master gains combined into each player's volume. The UI does not extract raw audio or display simulated audio meters. Videos that prohibit embedding show a playback error; hiding a player does not bypass that restriction.

The original lo-fi source `1nZh1ILveC4` rejected embedded playback during verification. The rebuild defaults to Lofi Girl's [Lofi house vol.1](https://www.youtube.com/watch?v=O_97HkFMhFk), alongside the original alpha audio.

The PWA includes icons, a standalone manifest, app-shell caching, and an update action when a new version is available. YouTube media is not cached.

## Validation

Type-checking, production build, and URL/gain tests pass. Browser checks verified simultaneous playback of both default sources with advancing timestamps, master volume and mute controls, no visible players, no footer, and no horizontal overflow at 390px and 768px. These checks use desktop Chrome with viewport emulation; physical phone/tablet playback still needs validation.

YouTube streams remain separate embedded players. PWA installation does not make YouTube audio available offline or guarantee background playback on mobile.
