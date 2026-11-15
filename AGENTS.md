# Layerwave

## Product

- Build a YouTube-only listening mixer for phones, tablets, and desktops.
- Rebuild with React, TypeScript, shadcn/ui, and audiocn as a proof of concept.
- Support add/remove, independent volume/mute, master volume, global playback, and playback status/position.
- Make the app installable as a PWA. Cache only the app shell; YouTube media requires internet.
- Use the official YouTube IFrame Player API. Do not extract, proxy, download, or rehost YouTube media.
- Show actual player state and errors. Do not synthesize waveforms or audio meter readings from unavailable cross-origin audio.
- Keep the mixer audio-focused: no visible video players and no explanatory footer. The user delegated playback implementation after clarifying the original HTML also creates hidden YouTube players.
- Do not promise background or locked-screen playback on mobile.

## Branches and deployment

- `main` contains the approved PWA and deploys to `layerwave` through GitHub Actions.
- Pull requests to `main` run tests, the production build, and a Wrangler dry run without deploying.
- Preserve the original demo at `public/legacy/index.html`, served at `/legacy/`.
- Keep ongoing work on feature branches/worktrees. `npm run deploy:preview` targets the separate `layerwave-poc` Worker.

## Cloudflare

- Use the pinned local Wrangler via npm scripts and the checked-in `wrangler.jsonc`.
- Read relevant installed skills in `.agents/skills/` before Cloudflare work, particularly `wrangler` and `workers-best-practices`.
- Consult current official documentation and the installed Wrangler schema for configuration changes.
- Deploy static assets only for the PoC; no backend or account database is required.
- Keep credentials, OAuth state, environment secrets, and local Wrangler state out of Git.
- Cloudflare MCP is configured per developer; follow `docs/cloudflare-setup.md` on a new machine.

## Validation

- Run relevant type checks and the production build for the rebuild.
- Verify responsive layout and playback behavior in a browser; distinguish checks performed from device behavior not tested.
- A successful deployment or HTTP response alone does not verify YouTube playback.
