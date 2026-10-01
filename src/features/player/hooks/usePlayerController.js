import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePlaybackStore } from '../../../stores/playbackStore.js'
import { useQueueStore } from '../../../stores/queueStore.js'
import { useSleepTimerStore } from '../../../stores/sleepTimerStore.js'
import { MEDIA_TYPES, normalizeMediaType } from '../../../domain/mediaTypes.js'
import { usePlaybackPersistence } from './usePlaybackPersistence.js'
import { useSectionLoop } from './useSectionLoop.js'
import { useSleepTimerFade } from './useSleepTimerFade.js'

export function usePlayerController({
  adapterRef,
  ready,
  currentMedia,
  storagePrefix = null,
  enablePersistence = false,
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentMediaId = currentMedia?.id ?? null

  const setCurrentMedia = usePlaybackStore((state) => state.setCurrentMedia)
  const seekRequest = usePlaybackStore((state) => state.seekRequest)
  const dequeueNext = useQueueStore((state) => state.dequeueNext)
  const timerSeconds = useSleepTimerStore((state) => state.timerSeconds)
  const timerStartTime = useSleepTimerStore((state) => state.timerStartTime)
  const timerEndTime = useSleepTimerStore((state) => state.timerEndTime)

  const [isLoop, setIsLoop] = useState(false)
  const isLoopRef = useRef(false)
  const sectionLoopRef = useRef({ enabled: false, start: 0, end: 0 })
  const lastSeekTokenRef = useRef(null)

  const togglePlay = useCallback(() => {
    if (!ready || !adapterRef.current) return

    if (adapterRef.current.isPlaying()) {
      adapterRef.current.pause()
    } else {
      adapterRef.current.play()
    }
  }, [ready])

  useEffect(() => {
    isLoopRef.current = isLoop
  }, [isLoop])

  const sectionLoop = useSectionLoop(adapterRef, ready)

  useEffect(() => {
    sectionLoopRef.current = {
      enabled: sectionLoop.isSectionLoop,
      start: sectionLoop.startTime,
      end: sectionLoop.endTime,
    }
  }, [sectionLoop.endTime, sectionLoop.isSectionLoop, sectionLoop.startTime])
  const skipRestore = Boolean(searchParams.get('t'))

  usePlaybackPersistence({
    adapterRef,
    ready,
    mediaId: currentMediaId,
    storagePrefix: enablePersistence ? storagePrefix : null,
    skipRestore,
  })

  useSleepTimerFade({
    adapterRef,
    ready,
    timerStartTime,
    timerEndTime,
    timerSeconds,
  })

  useEffect(() => {
    if (timerSeconds === 0 && adapterRef.current) {
      adapterRef.current.pause()
    }
  }, [adapterRef, timerSeconds])

  useEffect(() => {
    const request = seekRequest
    if (!request || !ready || request.token === lastSeekTokenRef.current) return

    const seconds = Number(request.seconds)
    if (Number.isFinite(seconds)) {
      adapterRef.current?.seek(seconds)
      lastSeekTokenRef.current = request.token
    }
  }, [adapterRef, ready, seekRequest])

  useEffect(() => {
    lastSeekTokenRef.current = null
  }, [currentMediaId])

  const handleEnded = useCallback(async () => {
    const adapter = adapterRef.current
    if (!adapter) return

    if (isLoopRef.current) {
      adapter.seek(0)
      try {
        await adapter.play()
      } catch {
        // Browser autoplay restrictions are intentionally ignored.
      }
      return
    }

    const section = sectionLoopRef.current
    if (section.enabled && section.end > section.start) {
      adapter.seek(section.start)
      try {
        await adapter.play()
      } catch {
        // Browser autoplay restrictions are intentionally ignored.
      }
      return
    }

    const nextMedia = dequeueNext()
    if (!nextMedia) return

    setCurrentMedia(nextMedia)
    const mediaType = normalizeMediaType(nextMedia.type || MEDIA_TYPES.VIDEO)
    navigate(`/watch?v=${encodeURIComponent(nextMedia.id)}&type=${encodeURIComponent(mediaType)}`)
  }, [adapterRef, dequeueNext, navigate, setCurrentMedia])

  const toggleLoop = () => setIsLoop((value) => !value)

  const skip = (seconds) => {
    const adapter = adapterRef.current
    if (!adapter) return
    adapter.seek(adapter.getCurrentTime() + seconds)
  }

  const changeVolume = (amount) => {
    const adapter = adapterRef.current
    if (!adapter) return
    adapter.setVolume(Math.min(Math.max(adapter.getVolume() + amount, 0), 1))
  }

  return {
    isLoop,
    toggleLoop,
    ...sectionLoop,
    handleEnded,
    skip,
    changeVolume,
    togglePlay,
  }
}
