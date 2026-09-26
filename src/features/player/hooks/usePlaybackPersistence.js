import { useEffect } from 'react'

export function usePlaybackPersistence({
  adapterRef,
  ready,
  mediaId,
  storagePrefix,
  skipRestore = false,
}) {
  useEffect(() => {
    const adapter = adapterRef.current
    if (!adapter || !ready || !mediaId || !storagePrefix) return undefined

    const key = `${storagePrefix}_${mediaId}`
    const handleTimeUpdate = () => {
      if (adapter.getCurrentTime() > 2) {
        localStorage.setItem(key, String(adapter.getCurrentTime()))
      }
    }

    const savedTime = localStorage.getItem(key)
    if (!skipRestore && savedTime) {
      const seconds = Number(savedTime)
      const duration = adapter.getDuration()
      if (Number.isFinite(seconds) && seconds > 0 && seconds < duration - 2) {
        adapter.seek(seconds)
      }
    }

    const intervalId = window.setInterval(handleTimeUpdate, 1000)
    return () => window.clearInterval(intervalId)
  }, [adapterRef, ready, mediaId, storagePrefix, skipRestore])
}
