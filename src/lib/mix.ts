import { parseYouTubeId } from './youtube.ts'

export type Channel = { id: string; videoId: string; title: string; gainDb: number; muted: boolean }
export type Mix = { channels: Channel[]; masterDb: number }

export const emptyMix = (): Mix => ({ channels: [], masterDb: -2 })

/** Validate persisted data before it reaches the player controls. */
export function restoreMix(value: unknown): Mix {
  if (!value || typeof value !== 'object') return emptyMix()
  const saved = value as Partial<Mix>
  if (!Array.isArray(saved.channels) || typeof saved.masterDb !== 'number' || !Number.isFinite(saved.masterDb)) return emptyMix()
  const ids = new Set<string>()
  const channels = saved.channels.filter((ch): ch is Channel => {
    if (!ch || typeof ch.id !== 'string' || !ch.id || ids.has(ch.id) ||
      typeof ch.videoId !== 'string' || parseYouTubeId(ch.videoId) !== ch.videoId ||
      typeof ch.title !== 'string' || typeof ch.gainDb !== 'number' || !Number.isFinite(ch.gainDb) ||
      ch.gainDb < -60 || ch.gainDb > 0 || typeof ch.muted !== 'boolean') return false
    ids.add(ch.id)
    return true
  }).slice(0, 12)
  return { channels, masterDb: Math.min(0, Math.max(-60, saved.masterDb)) }
}

/** Only the old seed IDs are removed; user-added copies have their own IDs. */
export function migrateLegacyMix(value: unknown): Mix {
  const mix = restoreMix(value)
  return { ...mix, channels: mix.channels.filter((ch) => ch.id !== 'lofi' && ch.id !== 'alpha') }
}
