import { parseYouTubeId } from './youtube'

export type Channel = { id: string; videoId: string; title: string; gainDb: number; muted: boolean }
export type Mix = { channels: Channel[]; masterDb: number }
const key = 'layerwave.mix.v1'
const defaults: Mix = { masterDb: -2, channels: [
  { id: 'lofi', videoId: 'O_97HkFMhFk', title: 'Lofi house vol.1 — Lofi Girl', gainDb: -3, muted: false },
  { id: 'alpha', videoId: '-dT6bN3hZFQ', title: 'Alpha binaural audio', gainDb: -8, muted: false },
] }

export function loadMix(): Mix {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaults
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object') return defaults
    const saved = value as Partial<Mix>
    if (!Array.isArray(saved.channels) || typeof saved.masterDb !== 'number' || !Number.isFinite(saved.masterDb)) return defaults
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
  } catch { return defaults }
}

export function saveMix(mix: Mix): boolean {
  try { localStorage.setItem(key, JSON.stringify(mix)); return true } catch { return false }
}
