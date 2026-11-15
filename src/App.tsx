import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { AudioLines, Pause, Play, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Fader, FaderLabel, FaderValue, FaderTrack, FaderRange, FaderThumb } from '@/components/ui/fader'
import { Mixer, MixerHeader, MixerTitle, MixerChannels, MixerMaster, MixerEmpty } from '@/components/ui/mixer'
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
    if (mix.channels.length >= 12) { setMessage('You can add up to 12 layers.'); return }
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
    <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
      <a href="/" className="flex items-center gap-2 font-heading text-xl font-semibold tracking-tight"><AudioLines aria-hidden="true" className="size-6" />layerwave</a>
      {needRefresh && <Button variant="secondary" onClick={() => updateServiceWorker(true)}>Update app</Button>}
    </header>
    <main>
      <div className="mb-8">
        <h1 id="mix" tabIndex={-1} className="mb-2 text-3xl font-semibold tracking-tight">Your mix</h1>
        <p className="text-sm text-muted-foreground">Layer YouTube music and ambient sounds.</p>
      </div>
      {!online && <p role="status" className="mb-5 rounded-xl border bg-card p-4 text-sm">You’re offline. Connect to play YouTube videos.</p>}
      <form onSubmit={add} className="mb-6">
        <label className="mb-2 block text-sm font-medium" htmlFor="youtube-url">YouTube link</label>
        <div className="flex flex-wrap gap-2">
          <Input ref={input} id="youtube-url" className="h-11 min-w-0 flex-1 basis-60 bg-card" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a link or video ID" autoComplete="off" autoCapitalize="none" spellCheck={false} required aria-describedby="add-status" />
          <Button type="submit" className="h-11"><Plus aria-hidden="true" />Add layer</Button>
        </div>
        <p id="add-status" role="status" className="mt-2 min-h-5 text-xs text-muted-foreground">{message}</p>
      </form>
      <Mixer className="listening-mixer">
        <MixerHeader className="flex-wrap justify-between gap-3">
          <MixerTitle className="text-lg font-semibold">Layers <span className="ml-1 font-mono text-sm font-normal text-muted-foreground">{mix.channels.length}</span></MixerTitle>
          <span className="text-xs text-muted-foreground">{active} playing</span>
        </MixerHeader>
        <MixerMaster className="rounded-xl border bg-card p-5">
          <div className="mb-4 control-row justify-between">
            <h2 className="text-base font-semibold">Master</h2>
            <div className="control-row">
              <Button disabled={!ready} onClick={() => { players.current.forEach((p, id) => { if (statuses[id]?.ready) p.playVideo() }) }}><Play aria-hidden="true" />Play all</Button>
              <Button variant="outline" disabled={!ready} onClick={() => players.current.forEach((p) => p.pauseVideo())}><Pause aria-hidden="true" />Pause all</Button>
            </div>
          </div>
          <Fader className="volume-fader" aria-label="Master volume" orientation="horizontal" min={-60} max={0} resetValue={-2} value={mix.masterDb} onValueChange={(masterDb) => setMix((m) => ({ ...m, masterDb }))}>
            <div className="mb-1 flex items-center justify-between gap-3"><FaderLabel>Master volume</FaderLabel><FaderValue /></div>
            <FaderTrack><FaderRange /><FaderThumb /></FaderTrack>
          </Fader>
        </MixerMaster>
        <MixerChannels scrollable={false} className="mixer-grid">{mix.channels.map((channel, index) => <Channel key={channel.id} channel={channel} index={index} masterDb={mix.masterDb} register={register} report={report} update={(patch) => update(channel.id, patch)} remove={() => { players.current.get(channel.id)?.pauseVideo(); setMix((m) => ({ ...m, channels: m.channels.filter((c) => c.id !== channel.id) })); setStatuses((s) => { const next = { ...s }; delete next[channel.id]; return next }); input.current?.focus() }} />)}</MixerChannels>
        <MixerEmpty className="min-h-40 flex-col gap-2"><p className="font-heading text-base font-medium text-foreground">No layers yet</p><p>Add a YouTube link to start your mix.</p></MixerEmpty>
      </Mixer>
    </main>
  </div>
}
