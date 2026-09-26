export function createYouTubeAdapter(player) {
  if (!player) return null

  return {
    play: () => player.playVideo(),
    pause: () => player.pauseVideo(),
    seek: (seconds) => player.seekTo(Math.max(Number(seconds) || 0, 0), true),
    getCurrentTime: () => player.getCurrentTime?.() || 0,
    getDuration: () => player.getDuration?.() || 0,
    getVolume: () => (player.getVolume?.() ?? 100) / 100,
    setVolume: (value) => {
      const normalized = Math.min(Math.max(Number(value) || 0, 0), 1)
      player.setVolume(normalized * 100)
    },
  }
}

export function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (window.__youtubeApiPromise) return window.__youtubeApiPromise

  window.__youtubeApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    )

    const previousCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.()
      resolve(window.YT)
    }

    if (existingScript) return

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () => reject(new Error('YouTube IFrame APIの読み込みに失敗しました'))
    document.head.appendChild(script)
  })

  return window.__youtubeApiPromise
}
