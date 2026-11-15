# Layerwave

## Product

- Build a YouTube-only listening mixer for phones, tablets, and desktops.
- Use React, TypeScript, shadcn/ui, and audiocn.
- Support add/remove, independent volume/mute, master volume, global playback, and playback status/position.
- Make the app installable as a PWA. Cache only the app shell; YouTube media requires internet.
- Use the official YouTube IFrame Player API. Do not extract, proxy, download, or rehost YouTube media.
- Show actual player state and errors. Do not synthesize waveforms or audio meter readings from unavailable cross-origin audio.
- Keep the mixer audio-focused: no visible video players or explanatory footer.
- Do not promise background or locked-screen playback on mobile.

## Branches and deployment

- `main` contains the approved PWA and deploys to `layerwave` through GitHub Actions.
- Pull requests to `main` run tests, the production build, and a Wrangler dry run without deploying.
- Make all changes in a new worktree.
- Work in atomic commits, with each commit covering one coherent change.
- Follow [Conventional Commits](https://www.conventionalcommits.org/) for all commit messages.
- Always squash merge.

## Cloudflare

- Use the pinned local Wrangler via npm scripts and the checked-in `wrangler.jsonc`.
- Read relevant installed skills in `.agents/skills/` before Cloudflare work, particularly `wrangler` and `workers-best-practices`.
- Consult current official documentation and the installed Wrangler schema for configuration changes.
- Deploy static assets only; no backend or account database is required.
- Keep credentials, OAuth state, environment secrets, and local Wrangler state out of Git.
- Cloudflare MCP is configured per developer; follow `docs/cloudflare-setup.md` on a new machine.
