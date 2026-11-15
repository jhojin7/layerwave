# Layerwave

A YouTube-only mixer for layering music and ambient audio.

The initial release serves the original single-file demo unchanged from `public/index.html` on Cloudflare Workers Static Assets. It is a baseline prototype; playback and mobile behavior still need validation.

## Run and deploy

```sh
npm ci
npm run dev
npm run deploy
```

Deployment requires an authenticated Wrangler session (`npx wrangler login`). No credentials belong in this repository.

## Rebuild direction

Build a phone- and tablet-friendly PWA with React, shadcn/ui, and audiocn. Keep YouTube as the only media source. Support adding and removing videos, independent volume and mute, master volume, global playback, and visible playback status and position. Preserve the original demo while developing the rebuild in a separate worktree and branch.

YouTube streams remain separate embedded players. PWA installation does not make YouTube audio available offline or guarantee background playback on mobile.
