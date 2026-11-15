import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { AudioLines, Pause, Play, Plus, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Fader } from '@/components/ui/fader'
import { Channel, type PlayerStatus } from '@/components/channel'
import { loadMix, saveMix, type Channel as ChannelData } from '@/lib/mix'
import { parseYouTubeId } from '@/lib/youtube'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function App() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  const [mix, setMix] = useState(loadMix)
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState('')
  const [statuses, setStatuses] = useState<Record<string, PlayerStatus>>({})
  const [online, setOnline] = useState(navigator.onLine)
  const players = useRef(new Map<string, YT.Player>())
  const input = useRef<HTMLInputElement>(null)
  const register = useCallback((id: string, player: YT.Player | null) => {
    if (player) players.current.set(id, player)
    else players.current.delete(id)
  }, [])
  const report = useCallback((id: string, status: PlayerStatus) => setStatuses((s) => ({ ...s, [id]: status })), [])
  useEffect(() => { saveMix(mix) }, [mix])
  useEffect(() => {
    const change = () => setOnline(navigator.onLine)
    window.addEventListener('online', change); window.addEventListener('offline', change)
    return () => { window.removeEventListener('online', change); window.removeEventListener('offline', change) }
  }, [])

  const update = (id: string, patch: Partial<ChannelData>) => setMix((m) => ({ ...m, channels: m.channels.map((c) => c.id === id ? { ...c, ...patch } : c) }))
  const active = mix.channels.filter((c) => statuses[c.id]?.playing).length
  const ready = mix.channels.filter((c) => statuses[c.id]?.ready).length
  async function add(event: FormEvent) {
    event.preventDefault()
    const videoId = parseYouTubeId(url)
    if (!videoId) { setMessage('Paste a YouTube video link or an 11-character video ID.'); return }
    if (mix.channels.some((c) => c.videoId === videoId)) { setMessage('That video is already in your mix.'); return }
    if (mix.channels.length >= 12) { setMessage('This proof of concept supports up to 12 layers.'); return }
    const id = crypto.randomUUID()
    setMix((m) => ({ ...m, channels: [...m.channels, { id, videoId, title: `YouTube · ${videoId}`, gainDb: -6, muted: false }] }))
    setUrl(''); setMessage('Layer added. Press Play when it is ready.'); input.current?.focus()
    // Metadata is optional. Playback never depends on this request.
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`, { signal: AbortSignal.timeout(8000) })
      if (!response.ok) return
      const data: unknown = await response.json()
      if (data && typeof data === 'object' && 'title' in data && typeof data.title === 'string') update(id, { title: data.title })
    } catch { /* Keep the video ID as a usable source label. */ }
  }

  return <div className="app-shell">
    <a className="skip-link" href="#mix">Skip to mixer</a>
    <header className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
      <a href="/" className="flex items-center gap-3 text-xl font-semibold tracking-tight"><AudioLines aria-hidden="true" className="size-7 text-primary" />layerwave<span className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">PoC</span></a>
      {needRefresh ? <Button variant="secondary" onClick={() => updateServiceWorker(true)}>Update app</Button> : <span className="text-xs text-muted-foreground">Your sounds, in balance.</span>}
    </header>
    <main>
      <div className="mb-8"><p className="mb-3 text-xs uppercase tracking-[0.2em] text-primary">A little rhythm. A little atmosphere.</p><h1 id="mix" tabIndex={-1} className="mb-3 text-4xl font-medium tracking-tight sm:text-5xl">Make room for your mix.</h1><p className="max-w-xl text-base leading-relaxed text-muted-foreground">Layer YouTube music and ambient sounds. Find the balance that feels right.</p></div>
      {!online && <p role="status" className="mb-5 rounded-xl border border-border bg-card p-4">You’re offline. Your mix is saved here; connect to play YouTube videos.</p>}
      <section aria-label="Master controls" className="mb-7 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="flex items-center gap-2 font-semibold"><Volume2 aria-hidden="true" className="size-4 text-primary" />Master volume</h2><p className="mt-1 text-sm text-muted-foreground">{active} playing · {mix.channels.length} layers</p></div>
          <div className="control-row"><Button disabled={!ready} onClick={() => { players.current.forEach((p, id) => { if (statuses[id]?.ready) p.playVideo() }) }}><Play aria-hidden="true" />Play all</Button><Button variant="secondary" disabled={!ready} onClick={() => players.current.forEach((p) => p.pauseVideo())}><Pause aria-hidden="true" />Pause all</Button></div>
        </div>
        <Fader className="volume-fader" aria-label="Master volume" orientation="horizontal" min={-60} max={0} value={mix.masterDb} onValueChange={(masterDb) => setMix((m) => ({ ...m, masterDb }))} />
      </section>
      <form onSubmit={add} className="mb-7">
        <label className="mb-2 block text-sm font-medium" htmlFor="youtube-url">Add a YouTube layer</label>
        <div className="flex flex-wrap gap-3"><Input ref={input} id="youtube-url" className="h-12 min-w-0 flex-1 basis-60 bg-card" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a YouTube link or video ID" autoComplete="off" spellCheck={false} required aria-describedby="add-status" /><Button type="submit" className="h-12" variant="secondary"><Plus aria-hidden="true" />Add layer</Button></div>
        <p id="add-status" role="status" className="mt-2 min-h-5 text-sm text-muted-foreground">{message}</p>
      </form>
      <div className="mixer-grid">{mix.channels.map((channel, index) => <Channel key={channel.id} channel={channel} index={index} masterDb={mix.masterDb} register={register} report={report} update={(patch) => update(channel.id, patch)} remove={() => { players.current.get(channel.id)?.pauseVideo(); setMix((m) => ({ ...m, channels: m.channels.filter((c) => c.id !== channel.id) })); input.current?.focus() }} />)}</div>
      {!mix.channels.length && <div className="rounded-2xl border border-dashed border-border p-10 text-center"><AudioLines aria-hidden="true" className="mx-auto mb-4 size-8 text-primary" /><h2 className="mb-2 text-xl">A blank canvas for your ears.</h2><p className="text-muted-foreground">Add your first YouTube link above.</p></div>}
    </main>
  </div>
}
