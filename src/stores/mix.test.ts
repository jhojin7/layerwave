import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createMixStore } from './mix.ts'
import type { Channel } from '../lib/mix.ts'

function memoryStorage(entries: Record<string, string> = {}) {
  const data = new Map(Object.entries(entries))
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) },
    removeItem: (key: string) => { data.delete(key) },
  }
}

const channel: Channel = { id: 'user-layer', videoId: '1nZh1ILveC4', title: 'My layer', gainDb: -6, muted: false }

test('fresh or corrupt storage starts with no music', () => {
  for (const storage of [memoryStorage(), memoryStorage({ 'layerwave.mix.v1': '{bad json' }), memoryStorage({ 'layerwave.mix.v2': '{bad json' })]) {
    assert.deepEqual(createMixStore(storage).getState().mix, { channels: [], masterDb: -2 })
  }
})

test('layers, independent volume, mute, and master volume survive a new store instance', () => {
  const storage = memoryStorage()
  const store = createMixStore(storage)
  assert.equal(store.getState().addChannel(channel), 'added')
  store.getState().updateChannel(channel.id, { gainDb: -12.5, muted: true })
  store.getState().setMasterDb(-9)
  assert.deepEqual(createMixStore(storage).getState().mix, {
    channels: [{ ...channel, gainDb: -12.5, muted: true }], masterDb: -9,
  })
  const persisted = JSON.parse(storage.getItem('layerwave.mix.v2')!)
  assert.deepEqual(Object.keys(persisted.state), ['mix'])
})

test('removing the final layer stays empty after reload', () => {
  const storage = memoryStorage()
  const store = createMixStore(storage)
  store.getState().addChannel(channel)
  store.getState().removeChannel(channel.id)
  assert.deepEqual(createMixStore(storage).getState().mix.channels, [])
})

test('legacy migration removes seeded IDs and preserves user-added tracks and settings', () => {
  const userCopy = { ...channel, videoId: 'O_97HkFMhFk' }
  const storage = memoryStorage({ 'layerwave.mix.v1': JSON.stringify({
    channels: [{ ...channel, id: 'lofi' }, { ...channel, id: 'alpha' }, userCopy], masterDb: -7,
  }) })
  const store = createMixStore(storage)
  assert.deepEqual(store.getState().mix, { channels: [userCopy], masterDb: -7 })
  store.getState().removeChannel(userCopy.id)
  assert.deepEqual(createMixStore(storage).getState().mix, { channels: [], masterDb: -7 })
})

test('invalid persisted records are filtered and master volume is bounded', () => {
  const storage = memoryStorage({ 'layerwave.mix.v2': JSON.stringify({ state: { mix: {
    channels: [channel, channel, { ...channel, id: 'invalid', gainDb: 100 }], masterDb: 12,
  } }, version: 0 }) })
  assert.deepEqual(createMixStore(storage).getState().mix, { channels: [channel], masterDb: 0 })
})

test('storage errors leave the in-memory mix usable', () => {
  const unavailable = () => { throw new Error('Storage unavailable') }
  const store = createMixStore({ getItem: unavailable, setItem: unavailable, removeItem: unavailable })
  store.getState().addChannel(channel)
  store.getState().setMasterDb(-20)
  assert.deepEqual(store.getState().mix, { channels: [channel], masterDb: -20 })
})

test('duplicate videos and the layer limit are enforced by the store', () => {
  const store = createMixStore(memoryStorage())
  assert.equal(store.getState().addChannel(channel), 'added')
  assert.equal(store.getState().addChannel({ ...channel, id: 'duplicate' }), 'duplicate')
  for (let i = 1; i < 12; i++) {
    assert.equal(store.getState().addChannel({ ...channel, id: String(i), videoId: String(i).padStart(11, '0') }), 'added')
  }
  assert.equal(store.getState().addChannel({ ...channel, id: 'overflow', videoId: '01234567890' }), 'full')
  assert.equal(store.getState().mix.channels.length, 12)
})
