import { useEffect, useRef, useState } from 'react'
import { formatTime, parseTimeToSeconds } from '../../../utils/timeUtils.js'

export function useSectionLoop(adapterRef, ready) {
  const [isSectionLoop, setIsSectionLoop] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [startInput, setStartInput] = useState('00:00:00')
  const [endInput, setEndInput] = useState('00:00:00')

  const loopRef = useRef(false)
  const startRef = useRef(0)
  const endRef = useRef(0)

  useEffect(() => {
    loopRef.current = isSectionLoop
  }, [isSectionLoop])

  useEffect(() => {
    startRef.current = startTime
  }, [startTime])

  useEffect(() => {
    endRef.current = endTime
  }, [endTime])

  useEffect(() => {
    if (!ready) return
    const duration = adapterRef.current?.getDuration() || 0
    setStartTime(0)
    setStartInput('00:00:00')
    setEndTime(duration)
    setEndInput(formatTime(duration))
  }, [adapterRef, ready])

  useEffect(() => {
    if (!ready || !isSectionLoop) return undefined

    const intervalId = window.setInterval(() => {
      const adapter = adapterRef.current
      if (!adapter) return

      if (endRef.current > startRef.current && adapter.getCurrentTime() >= endRef.current) {
        adapter.seek(startRef.current)
      }
    }, 200)

    return () => window.clearInterval(intervalId)
  }, [adapterRef, ready, isSectionLoop])

  const toggleSectionLoop = () => {
    const nextState = !isSectionLoop
    setIsSectionLoop(nextState)

    if (nextState) {
      const duration = adapterRef.current?.getDuration() || 0
      setEndTime(duration)
      setEndInput(formatTime(duration))
      endRef.current = duration
    }
  }

  const handleStartBlur = () => {
    const seconds = parseTimeToSeconds(startInput)
    setStartTime(seconds)
    setStartInput(formatTime(seconds))
    startRef.current = seconds

    const adapter = adapterRef.current
    if (
      adapter &&
      (adapter.getCurrentTime() < seconds ||
        (endRef.current > 0 && adapter.getCurrentTime() > endRef.current))
    ) {
      adapter.seek(seconds)
    }
  }

  const handleEndBlur = () => {
    const seconds = parseTimeToSeconds(endInput)
    setEndTime(seconds)
    setEndInput(formatTime(seconds))
    endRef.current = seconds

    const adapter = adapterRef.current
    if (adapter && (adapter.getCurrentTime() > seconds || adapter.getCurrentTime() < startRef.current)) {
      adapter.seek(startRef.current)
    }
  }

  return {
    isSectionLoop,
    toggleSectionLoop,
    startInput,
    setStartInput,
    handleStartBlur,
    endInput,
    setEndInput,
    handleEndBlur,
    startTime,
    endTime,
  }
}
