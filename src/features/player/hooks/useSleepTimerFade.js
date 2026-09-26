import { useEffect, useRef } from 'react'

export function useSleepTimerFade({ adapterRef, ready, timerStartTime, timerEndTime, timerSeconds }) {
  const fadeVolumeRef = useRef(null)

  useEffect(() => {
    if (timerSeconds === null) {
      fadeVolumeRef.current = null
    }
  }, [timerSeconds])

  useEffect(() => {
    const adapter = adapterRef.current

    if (!adapter || !ready || timerStartTime === null || timerEndTime === null) {
      return undefined
    }

    const fadeDuration = Math.min(
      5 * 60 * 1000,
      timerEndTime - timerStartTime,
    )

    if (fadeDuration <= 0) return undefined

    const updateVolume = () => {
      const remainingMs = timerEndTime - Date.now()

      if (remainingMs <= 0) {
        adapter.setVolume(0)
        return
      }

      if (remainingMs > fadeDuration) return

      if (fadeVolumeRef.current === null) {
        fadeVolumeRef.current = adapter.getVolume()
      }

      const progress = remainingMs / fadeDuration
      const targetVolume = fadeVolumeRef.current * progress
      adapter.setVolume(Math.min(adapter.getVolume(), targetVolume))
    }

    updateVolume()
    const intervalId = window.setInterval(updateVolume, 100)
    return () => window.clearInterval(intervalId)
  }, [adapterRef, ready, timerStartTime, timerEndTime])
}
