import { useEffect, useRef } from 'react'
import { useSleepTimerStore } from '../../../stores/sleepTimerStore.js'

export function useSleepTimerFade({
  adapterRef,
  ready,
  timerStartTime,
  timerEndTime,
  timerSeconds,
}) {
  const fadeVolumeRef = useRef(null)
  const completedRef = useRef(false)

  const clearTimer = useSleepTimerStore((state) => state.clearTimer)

  useEffect(() => {
    if (timerSeconds === null) {
      fadeVolumeRef.current = null
      completedRef.current = false
    }
  }, [timerSeconds])

  useEffect(() => {
    const adapter = adapterRef.current

    if (
      !adapter ||
      !ready ||
      timerStartTime === null ||
      timerEndTime === null
    ) {
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
        if (completedRef.current) return

        completedRef.current = true

        adapter.pause()

        if (fadeVolumeRef.current !== null) {
          adapter.setVolume(fadeVolumeRef.current)
        }

        clearTimer()
        return
      }

      if (remainingMs > fadeDuration) return

      if (fadeVolumeRef.current === null) {
        fadeVolumeRef.current = adapter.getVolume()
      }

      const progress = remainingMs / fadeDuration
      const targetVolume = fadeVolumeRef.current * progress

      adapter.setVolume(
        Math.min(adapter.getVolume(), targetVolume),
      )
    }

    updateVolume()

    const intervalId = window.setInterval(updateVolume, 100)

    return () => window.clearInterval(intervalId)
  }, [
    adapterRef,
    ready,
    timerStartTime,
    timerEndTime,
    clearTimer,
  ])
}