import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { ExternalLink, Pause, Play, Trash2, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Fader } from '@/components/ui/fader'
import { loadYouTubeApi, outputVolume } from '@/lib/youtube'
import type { Channel as ChannelData } from '@/lib/mix'

export type PlayerStatus = { ready: boolean; playing: boolean }
type Props = {
  channel: ChannelData; masterDb: number; index: number
  update: (patch: Partial<ChannelData>) => void; remove: () => void
  register: (id: string, player: YT.Player | null) => void
  report: (id: string, status: PlayerStatus) => void
}
const states: Record<number, string> = { '-1': 'Ready to play', 0: 'Ended', 1: 'Playing', 2: 'Paused', 3: 'Buffering', 5: 'Ready to play' }
const errors: Record<number, string> = {
  2: 'This video link is invalid.', 5: 'YouTube could not play this video.',
  100: 'This video is unavailable or private.',
  101: 'The owner has disabled playback outside YouTube.',
  150: 'The owner has disabled playback outside YouTube.',
  153: 'YouTube could not verify this player. Open the hosted app in your browser.',
}
function time(seconds: number) {
  const n = Math.max(0, Math.floor(seconds || 0))
  return n >= 3600 ? `${Math.floor(n / 3600)}:${String(Math.floor(n / 60) % 60).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}` : `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`
}

export function Channel({ channel, masterDb, index, update, remove, register, report }: Props) {
  const mount = useRef<HTMLDivElement>(null)
  const player = useRef<YT.Player | null>(null)
  const [ready, setReady] = useState(false)
  const [state, setState] = useState(-1)
  const [error, setError] = useState('')
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const sync = useEffectEvent((target: YT.Player) => {
    const volume = outputVolume(channel.gainDb, masterDb, channel.muted)
    if (volume === 0) {
      target.setVolume(0)
      target.mute()
    } else {
      target.unMute()
      target.setVolume(volume)
    }
  })
  const onReady = useEffectEvent((target: YT.Player) => {
    sync(target)
    target.getIframe().title = `${channel.title} — YouTube player`
    setReady(true)
    register(channel.id, target)
    report(channel.id, { ready: true, playing: false })
  })
  const onState = useEffectEvent((value: number) => {
    setState(value)
    setError('')
    report(channel.id, { ready: true, playing: value === 1 })
  })
  const onError = useEffectEvent((message: string) => {
    setError(message)
    report(channel.id, { ready: false, playing: false })
  })
  const onBlocked = useEffectEvent(() => {
    setError('Your browser blocked playback. Try Play again.')
    report(channel.id, { ready: true, playing: false })
  })

  useEffect(() => {
    let cancelled = false
    const container = mount.current!
    loadYouTubeApi().then((api) => {
      if (cancelled) return
      const node = document.createElement('div')
      container.append(node)
      player.current = new api.Player(node, {
        width: '100%', height: 220, videoId: channel.videoId,
        playerVars: { origin: location.origin, playsinline: 1, autoplay: 0, controls: 1, loop: 1, playlist: channel.videoId },
        events: {
          onReady: (e) => { if (!cancelled) onReady(e.target) },
          onStateChange: (e) => { if (!cancelled) onState(e.data) },
          onError: (e) => { if (!cancelled) onError(errors[e.data] || `YouTube error ${e.data}. Try another video.`) },
          onAutoplayBlocked: () => { if (!cancelled) onBlocked() },
        },
      })
    }).catch((e: Error) => { if (!cancelled) onError(e.message) })
    return () => {
      cancelled = true
      register(channel.id, null)
      player.current?.destroy()
      player.current = null
      container.replaceChildren()
    }
  }, [channel.id, channel.videoId, register])

  useEffect(() => { if (ready && player.current) sync(player.current) }, [channel.gainDb, channel.muted, masterDb, ready])
  useEffect(() => {
    if (!ready) return
    const timer = window.setInterval(() => {
      if (!player.current) return
      setPosition(player.current.getCurrentTime() || 0)
      setDuration(player.current.getDuration() || 0)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [ready])

  return <Card className="channel border-border bg-card shadow-none">
    <CardContent className="space-y-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="mb-1 text-xs font-medium tracking-widest text-muted-foreground">LAYER {String(index + 1).padStart(2, '0')}</p><h2 className="text-lg font-semibold">{channel.title}</h2></div>
        <Button variant="ghost" size="icon" aria-label={`Remove ${channel.title}`} onClick={remove}><Trash2 aria-hidden="true" className="size-4" /></Button>
      </div>
      <div ref={mount} hidden aria-hidden="true" />
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className={state === 1 ? 'text-primary' : 'text-muted-foreground'}>{error ? 'Playback needs attention' : ready ? states[state] || 'Ready' : 'Loading YouTube…'}</span>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">{time(position)} / {duration ? time(duration) : '—'}</span>
      </div>
      {error && <p className="text-sm text-destructive" role="status">{error}</p>}
      <div>
        <div className="mb-2 flex justify-between text-sm"><span>Layer volume</span><span className="text-muted-foreground">{channel.gainDb <= -60 ? 0 : Math.round(100 * 10 ** (channel.gainDb / 20))}%</span></div>
        <Fader className="volume-fader" aria-label={`${channel.title} volume`} orientation="horizontal" min={-60} max={0} value={channel.gainDb} onValueChange={(gainDb) => update({ gainDb })} />
      </div>
      <div className="control-row">
        <Button variant="secondary" disabled={!ready} onClick={() => state === 1 ? player.current?.pauseVideo() : player.current?.playVideo()}>{state === 1 ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}{state === 1 ? 'Pause' : 'Play'}</Button>
        <Button variant={channel.muted ? 'default' : 'outline'} aria-pressed={channel.muted} onClick={() => update({ muted: !channel.muted })}>{channel.muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}{channel.muted ? 'Muted' : 'Mute'}</Button>
        <a className="ml-auto inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:underline" href={`https://www.youtube.com/watch?v=${channel.videoId}`} target="_blank" rel="noreferrer">YouTube <ExternalLink aria-hidden="true" className="size-3" /></a>
      </div>
    </CardContent>
  </Card>
}
