# Cloudflare agent setup

Source: https://developers.cloudflare.com/agent-setup/prompt.md

The official setup was applied on 2026-11-15, with skills installed at project scope because this repository should carry its development instructions.

## Repository configuration

- `.agents/skills/`: all 22 Cloudflare skills installed for Codex.
- `skills-lock.json`: upstream skill source and integrity records.
- `wrangler.jsonc`: `layerwave`, Workers Static Assets, compatibility date `2026-11-15`.
- `package-lock.json`: pinned local Wrangler dependency.

To refresh project-local skills:

```sh
npx -y skills add cloudflare/skills --skill '*' --agent codex --yes
```

## Per-developer authentication

These commands configure the Codex MCP server in the developer's `~/.codex/config.toml` and authorize it using the browser. Credentials remain outside the repository.

```sh
codex mcp add cloudflare --url https://mcp.cloudflare.com/mcp
codex mcp login cloudflare
```

`codex mcp add` can initiate OAuth automatically. If it completes successfully, another login is unnecessary. Restart Codex to load the new MCP server. Installed skills are available in a fresh turn/session.

Wrangler authentication is separate:

```sh
npm ci
npx wrangler login
npm run deploy
```

The optional beta `cf` CLI was not installed. This project already has a Wrangler configuration and uses Wrangler for deployment.

## Initial deployment

- Public repository: https://github.com/jhojin7/layerwave
- Original demo: https://layerwave.jhojin7.workers.dev
- Baseline commit: `eaca569`
- Initial deployment version: `774f1f41-f3ff-4b37-889a-c7a61201ba0c`

The deployed HTML was fetched over HTTPS and compared byte-for-byte with `public/index.html`. This confirms publication of the supplied file, not YouTube playback compatibility.
