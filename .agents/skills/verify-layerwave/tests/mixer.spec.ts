import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const mixKey = 'layerwave.mix.v2'
const cards = (page: Page) => page.locator('[data-slot="channel-strip"]')
const savedMix = (page: Page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null')?.state.mix ?? null, mixKey)
const sources = ['abcdefghijk', 'lmnopqrstuv']

async function addLayers(page: Page) {
  for (const [index, source] of sources.entries()) {
    await page.getByRole('textbox', { name: 'YouTube link', exact: true }).fill(source)
    await page.getByRole('button', { name: 'Add layer', exact: true }).click()
    await expect(cards(page)).toHaveCount(index + 1)
  }
}

test.beforeEach(async ({ page, request, baseURL }) => {
  await test.step('Doctor: own production build and usable mixer', async () => {
    const response = await request.get('/')
    expect(response.status()).toBe(200)
    expect(await response.text()).toBe(await readFile('dist/index.html', 'utf8'))
    await page.goto('/')
    expect(new URL(page.url()).origin).toBe(baseURL)
    await expect(page.getByRole('heading', { name: 'Your mix', exact: true })).toBeVisible()
    await expect(cards(page)).toHaveCount(0)
    await expect(page.getByRole('textbox', { name: 'YouTube link', exact: true })).toBeEditable()
  })
})

test('layers: reject invalid and duplicate sources, add and remove a layer', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'YouTube link', exact: true })
  const status = page.locator('#add-status')
  await test.step('Reject an invalid source without changing the mix', async () => {
    await input.fill('https://example.com/watch?v=abcdefghijk')
    await page.getByRole('button', { name: 'Add layer', exact: true }).click()
    await expect(status).toHaveText('Paste a YouTube video link or an 11-character video ID.')
    await expect(cards(page)).toHaveCount(0)
  })
  await test.step('Reject a source already in the mix', async () => {
    await input.fill(sources[0])
    await page.getByRole('button', { name: 'Add layer', exact: true }).click()
    await expect(cards(page)).toHaveCount(1)
    await input.fill(sources[0])
    await page.getByRole('button', { name: 'Add layer', exact: true }).click()
    await expect(status).toHaveText('That video is already in your mix.')
    await expect(cards(page)).toHaveCount(1)
  })
  await test.step('Add through the form and verify persistence', async () => {
    await input.fill(`https://www.youtube.com/watch?v=${sources[1]}`)
    await input.press('Enter')
    await expect(cards(page)).toHaveCount(2)
    await expect(status).toHaveText('Layer added. Press Play when it is ready.')
    await expect(input).toHaveValue('')
    await expect.poll(async () => (await savedMix(page)).channels.map((c: { videoId: string }) => c.videoId)).toContain(sources[1])
  })
  await test.step('Remove the new layer and verify the saved mix', async () => {
    await cards(page).last().getByRole('button', { name: /^Remove / }).click()
    await expect(cards(page)).toHaveCount(1)
    await expect.poll(async () => (await savedMix(page)).channels.length).toBe(1)
    await expect(input).toBeFocused()
    await page.reload()
    await expect(cards(page)).toHaveCount(1)
  })
})

test('balance: independent volume, mute and master settings survive reload', async ({ page }) => {
  await test.step('Add two sources through the form', async () => { await addLayers(page) })
  const first = cards(page).first()
  const firstVolume = first.getByRole('slider')
  const master = page.getByRole('slider', { name: 'Master volume', exact: true })
  const original = await savedMix(page)
  const originalLayerText = await firstVolume.getAttribute('aria-valuetext')
  const originalMasterText = await master.getAttribute('aria-valuetext')
  await test.step('Change one layer with the keyboard', async () => {
    await firstVolume.focus()
    await firstVolume.press('ArrowLeft')
    await expect(firstVolume).not.toHaveAttribute('aria-valuetext', originalLayerText!)
    await expect.poll(async () => (await savedMix(page)).channels[0].gainDb).toBeLessThan(original.channels[0].gainDb)
    expect((await savedMix(page)).channels[1].gainDb).toBe(original.channels[1].gainDb)
  })
  await test.step('Mute the layer and lower the master', async () => {
    await first.getByRole('button', { name: /^Mute / }).click()
    await expect(first.getByRole('button', { name: /^Mute / })).toHaveAttribute('aria-pressed', 'true')
    await master.focus()
    await master.press('ArrowLeft')
    await expect(master).not.toHaveAttribute('aria-valuetext', originalMasterText!)
    await expect.poll(async () => (await savedMix(page)).masterDb).toBeLessThan(original.masterDb)
    expect((await savedMix(page)).channels[1]).toEqual(original.channels[1])
  })
  const changed = await savedMix(page)
  const changedLayerText = await firstVolume.getAttribute('aria-valuetext')
  const changedMasterText = await master.getAttribute('aria-valuetext')
  await test.step('Reload and observe the same settings', async () => {
    await page.reload()
    await expect(cards(page)).toHaveCount(2)
    await expect(first.getByRole('button', { name: /^Mute / })).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => savedMix(page)).toEqual(changed)
    await expect(firstVolume).toHaveAttribute('aria-valuetext', changedLayerText!)
    await expect(master).toHaveAttribute('aria-valuetext', changedMasterText!)
  })
})

test('empty mix: removing all layers persists the empty state', async ({ page }) => {
  await expect(page.getByText('No layers yet', { exact: true })).toBeVisible()
  await test.step('Add two sources through the form', async () => { await addLayers(page) })
  await test.step('Remove each layer through its own button', async () => {
    await cards(page).first().getByRole('button', { name: /^Remove / }).click()
    await cards(page).first().getByRole('button', { name: /^Remove / }).click()
    await expect(cards(page)).toHaveCount(0)
    await expect(page.getByText('No layers yet', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Play all', exact: true })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Pause all', exact: true })).toBeDisabled()
    await expect.poll(async () => (await savedMix(page)).channels).toEqual([])
  })
  await test.step('Reload and confirm the empty state remains', async () => {
    await page.reload()
    await expect(cards(page)).toHaveCount(0)
    await expect(page.getByText('No layers yet', { exact: true })).toBeVisible()
  })
})

test('offline shell: reload the installed service worker without a network', async ({ page, context }) => {
  await test.step('Add two sources through the form', async () => { await addLayers(page) })
  await test.step('Wait for app-shell caching and take control', async () => {
    await page.evaluate(async () => { await navigator.serviceWorker.ready })
    await page.reload()
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  })
  const original = await savedMix(page)
  try {
    await test.step('Go offline and reload the real app shell', async () => {
      await context.setOffline(true)
      await page.reload()
      await expect(page.getByRole('heading', { name: 'Your mix', exact: true })).toBeVisible()
      await expect(page.getByRole('status').filter({ hasText: 'You’re offline.' })).toBeVisible()
      await expect(cards(page)).toHaveCount(2)
      expect(await savedMix(page)).toEqual(original)
      const urls = await page.evaluate(async () => {
        const entries = await Promise.all((await caches.keys()).map(async (key) => (await (await caches.open(key)).keys()).map((entry) => entry.url)))
        return entries.flat()
      })
      expect(urls.length).toBeGreaterThan(0)
      expect(urls.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true)
    })
  } finally {
    await context.setOffline(false)
  }
})

test.afterEach(async ({ page }, testInfo) => {
  await testInfo.attach('final-ui', { body: await page.locator('body').ariaSnapshot(), contentType: 'text/plain' })
  await testInfo.attach('saved-mix', { body: JSON.stringify(await savedMix(page), null, 2), contentType: 'application/json' })
})
