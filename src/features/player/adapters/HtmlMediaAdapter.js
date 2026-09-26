export function createHtmlMediaAdapter(element) {
  if (!element) return null

  return {
    play: () => element.play(),
    pause: () => element.pause(),
    seek: (seconds) => {
      element.currentTime = Math.max(Number(seconds) || 0, 0)
    },
    getCurrentTime: () => element.currentTime || 0,
    getDuration: () => element.duration || 0,
    getVolume: () => element.volume ?? 1,
    setVolume: (value) => {
      element.volume = Math.min(Math.max(Number(value) || 0, 0), 1)
    },
    requestFullscreen: () => element.requestFullscreen?.(),
  }
}
