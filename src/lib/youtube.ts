export function parseYouTubeId(input: string): string | null {
  const text = input.trim()
  const valid = (id: string | null | undefined) => id && /^[\w-]{11}$/.test(id) ? id : null
  if (valid(text)) return text
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)
    if (!['https:', 'http:'].includes(url.protocol)) return null
    const host = url.hostname.toLowerCase()
    const segments = url.pathname.split('/').filter(Boolean)
    if (['youtu.be', 'www.youtu.be'].includes(host)) return valid(segments[0])
    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com'].includes(host)) return null
    if (url.pathname === '/watch') return valid(url.searchParams.get('v'))
    if (['shorts', 'live', 'embed'].includes(segments[0])) return valid(segments[1])
  } catch { /* Invalid pasted link. */ }
  return null
}

export function outputVolume(channelDb: number, masterDb: number, muted: boolean) {
  if (muted || channelDb <= -60 || masterDb <= -60) return 0
  return Math.min(100, Math.max(0, Math.round(100 * 10 ** ((channelDb + masterDb) / 20))))
}

let apiPromise: Promise<typeof YT> | undefined
export function loadYouTubeApi(): Promise<typeof YT> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const timeout = window.setTimeout(() => {
      script.remove()
      apiPromise = undefined
      reject(new Error('YouTube could not load. Check your connection and reload.'))
    }, 20000)
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout)
      resolve(window.YT)
    }
    script.src = 'https://www.youtube.com/iframe_api'
    script.onerror = () => {
      window.clearTimeout(timeout)
      apiPromise = undefined
      script.remove()
      reject(new Error('YouTube could not load. Check your connection and reload.'))
    }
    document.head.append(script)
  })
  return apiPromise
}

declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady?: () => void
  }
}
