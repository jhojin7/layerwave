# Poteto verification skills

Vendored from [cursor/plugins, pstack](https://github.com/cursor/plugins/tree/bf0c7cd80abdbf7fe47b634978a7d1b4071f71a7/pstack) at commit `bf0c7cd80abdbf7fe47b634978a7d1b4071f71a7`:

- `create-verification-skill`
- `maintain-verification-skill`
- `principle-prove-it-works`

Each directory retains the upstream MIT license. The create skill also includes its upstream feature-map examples.

Codex adaptations: generated/discovered skill paths use `.agents/skills/` instead of `.cursor/skills/`; invocation text uses `$skill-name`; Cursor's `disable-model-invocation` frontmatter is removed. The create and maintain skills preserve explicit invocation through `agents/openai.yaml`. The proof principle and repo-specific `verify-layerwave` skill can be selected automatically. Publishing, merging, and deploying still require the authorization provided by the current task; importing a workflow does not grant it.

`verify-layerwave` is this repository's generated implementation, not an upstream Poteto file. Its Playwright checks exercise the real built UI and preserve evidence under ignored `work/verification/`. Formal-verification generators and their TLA+ toolchain are not installed; this setup makes no formal-proof claim.
