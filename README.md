# Layerwave

A YouTube audio mixer built with React, shadcn/ui, and audiocn.

[Open Layerwave](https://layerwave.jhojin7.workers.dev)

## Development

Node.js 24.

```sh
npm ci
npm run dev
```

## Deployment

Push to `main` to run tests, build, and deploy to Cloudflare through [GitHub Actions](https://github.com/jhojin7/layerwave/actions/workflows/ci.yml). Pull requests run checks only.

Manual deployment:

```sh
npm run deploy
```
