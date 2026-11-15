# Layerwave

## Product

- Build a YouTube-only listening mixer for phones, tablets, and desktops.
- Use React, TypeScript, shadcn/ui, and audiocn.
- Support add/remove, independent volume/mute, master volume, global playback, and playback status/position.
- Start with an empty mix. Persist user-added layers and mixer settings; do not preload music.
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
- After a successful merge, delete the merged branch locally and on the remote.

## Verification

- Before claiming a task is done, apply `.agents/skills/principle-prove-it-works/SKILL.md` to the actual changed artifact. Report exact checks and any unverified behavior.
- For mixer, persistence, playback, or PWA changes, use `.agents/skills/verify-layerwave/SKILL.md` and its feature map. `npm run verify:ui` builds and drives the real app; it does not prove live YouTube playback.
- Use `$create-verification-skill` to add verification for a new surface and `$maintain-verification-skill` to audit the existing skill and map. Keep skill changes grounded in observed behavior.
- Distinguish local changes and checks from commits, pushes, PRs, GitHub CI, merges, and deployments. Report only the delivery state observed.

## Cloudflare

- Use the pinned local Wrangler via npm scripts and the checked-in `wrangler.jsonc`.
- Read relevant installed skills in `.agents/skills/` before Cloudflare work, particularly `wrangler` and `workers-best-practices`.
- Consult current official documentation and the installed Wrangler schema for configuration changes.
- Deploy static assets only; no backend or account database is required.
- Keep credentials, OAuth state, environment secrets, and local Wrangler state out of Git.
- Cloudflare MCP is configured per developer; follow `docs/cloudflare-setup.md` on a new machine.
