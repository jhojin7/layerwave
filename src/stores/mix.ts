import { createStore } from 'zustand/vanilla'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { emptyMix, migrateLegacyMix, restoreMix, type Channel, type Mix } from '../lib/mix.ts'

const storageKey = 'layerwave.mix.v2'
const legacyKey = 'layerwave.mix.v1'

type SyncStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

type MixState = {
  mix: Mix
  addChannel: (channel: Channel) => 'added' | 'duplicate' | 'full'
  updateChannel: (id: string, patch: Partial<Pick<Channel, 'title' | 'gainDb' | 'muted'>>) => void
  removeChannel: (id: string) => void
  setMasterDb: (db: number) => void
}

/** Storage restrictions must not prevent a listening session. */
function safeStorage(storage: SyncStorage): StateStorage {
  return {
    getItem: (key) => { try { return storage.getItem(key) } catch { return null } },
    setItem: (key, value) => { try { storage.setItem(key, value) } catch { /* Keep the in-memory mix. */ } },
    removeItem: (key) => { try { storage.removeItem(key) } catch { /* Storage may be disabled. */ } },
  }
}

export function createMixStore(storage: SyncStorage) {
  const safe = safeStorage(storage)
  let initial = emptyMix()
  try {
    const raw = storage.getItem(legacyKey)
    if (raw) initial = migrateLegacyMix(JSON.parse(raw))
  } catch { /* Start empty when storage is unavailable or corrupt. */ }

  return createStore<MixState>()(persist((set, get) => ({
    mix: initial,
    addChannel: (channel) => {
      const { mix } = get()
      if (mix.channels.some((item) => item.videoId === channel.videoId)) return 'duplicate'
      if (mix.channels.length >= 12) return 'full'
      set({ mix: { ...mix, channels: [...mix.channels, channel] } })
      return 'added'
    },
    updateChannel: (id, patch) => set(({ mix }) => ({ mix: {
      ...mix, channels: mix.channels.map((channel) => channel.id === id ? { ...channel, ...patch } : channel),
    } })),
    removeChannel: (id) => set(({ mix }) => ({ mix: {
      ...mix, channels: mix.channels.filter((channel) => channel.id !== id),
    } })),
    setMasterDb: (masterDb) => set(({ mix }) => ({ mix: { ...mix, masterDb } })),
  }), {
    name: storageKey,
    storage: createJSONStorage(() => safe),
    partialize: ({ mix }) => ({ mix }),
    merge: (saved, current) => ({
      ...current,
      mix: restoreMix(saved && typeof saved === 'object' && 'mix' in saved ? saved.mix : current.mix),
    }),
  }))
}

export const mixStore = createMixStore({
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
  removeItem: (key) => window.localStorage.removeItem(key),
})
