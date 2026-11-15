import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('../../..', import.meta.url))
const port = Number(process.env.LAYERWAVE_VERIFY_PORT ?? 4173)
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('LAYERWAVE_VERIFY_PORT must be an integer from 1024 to 65535.')
const run = process.env.LAYERWAVE_VERIFY_RUN ??= `${new Date().toISOString().replaceAll(':', '-')}-${process.pid}`
const evidence = join(root, 'work/verification', run)
if (process.env.TEST_WORKER_INDEX === undefined) console.log(`Verification evidence: ${evidence}`)

export default defineConfig({
  testDir: './tests',
  outputDir: `${evidence}/artifacts`,
  reporter: [['list'], ['json', { outputFile: `${evidence}/results.json` }]],
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on',
    screenshot: 'on',
    serviceWorkers: 'allow',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${port} --strictPort`,
    cwd: root,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
  },
})
