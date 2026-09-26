import { useEffect, useRef, useState } from 'react'
import { usePlaybackStore } from '../../../stores/playbackStore.js'
import { MEDIA_TYPES } from '../../../domain/mediaTypes.js'
import { API_CONFIG, joinUrl } from '../../../services/api/config.js'
import { createHtmlMediaAdapter } from '../adapters/HtmlMediaAdapter.js'
import { usePlayerController } from '../hooks/usePlayerController.js'
import PlaybackControls from './PlaybackControls.jsx'
import SectionLoopControl from './SectionLoopControl.jsx'
import SleepTimerControl from './SleepTimerControl.jsx'

export default function HtmlMediaPlayer({ media }) {
  const mediaRef = useRef(null)
  const adapterRef = useRef(null)
  const [ready, setReady] = useState(false)
  const setCurrentMedia = usePlaybackStore((state) => state.setCurrentMedia)
  const isAudio = media.type === MEDIA_TYPES.AUDIO
  const storagePrefix = isAudio ? 'resume_time_audio' : 'resume_time'

  useEffect(() => {
    setCurrentMedia(media)
  }, [media, setCurrentMedia])

  useEffect(() => {
    const element = mediaRef.current
    if (!element) return undefined

    adapterRef.current = createHtmlMediaAdapter(element)
    setReady(false)

    element.load()
    element.play().catch(() => {
      // Browser autoplay restrictions are expected.
    })

    return () => {
      element.pause()
      adapterRef.current = null
      setReady(false)
    }
  }, [media.id, media.type])

  const controller = usePlayerController({
    adapterRef,
    ready,
    currentMedia: media,
    storagePrefix,
    enablePersistence: true,
  })

  const handleLoadedMetadata = () => setReady(true)

  const toggleFullscreen = () => {
    mediaRef.current?.requestFullscreen?.().catch?.((error) => {
      console.error('全画面表示に失敗しました:', error)
    })
  }

  const mediaUrl = joinUrl(
    API_CONFIG.videoBase,
    `${isAudio ? 'api/musics' : 'api/videos'}/${encodeURIComponent(media.id)}/stream`,
  )

  const MediaElement = isAudio ? 'audio' : 'video'

  return (
    <>
      <h3>{isAudio ? '音声再生中' : '再生中'}: {media.filetitle}</h3>

      <div className={isAudio ? 'audio-visual-box' : 'video-visual-box'}>
        {isAudio && <div className="audio-icon-pulse">🎵</div>}
        <MediaElement
          ref={mediaRef}
          controls
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={controller.handleEnded}
          src={mediaUrl}
        />
      </div>

      <PlaybackControls
        isLoop={controller.isLoop}
        toggleLoop={controller.toggleLoop}
        isSectionLoop={controller.isSectionLoop}
        toggleSectionLoop={controller.toggleSectionLoop}
        onRewind={() => controller.skip(-10)}
        onForward={() => controller.skip(10)}
        onVolumeDown={() => controller.changeVolume(-0.1)}
        onVolumeUp={() => controller.changeVolume(0.1)}
        onFullscreen={toggleFullscreen}
        showFullscreen={!isAudio}
      />

      <SleepTimerControl />

      <SectionLoopControl
        visible={controller.isSectionLoop}
        startInput={controller.startInput}
        setStartInput={controller.setStartInput}
        handleStartBlur={controller.handleStartBlur}
        endInput={controller.endInput}
        setEndInput={controller.setEndInput}
        handleEndBlur={controller.handleEndBlur}
      />
    </>
  )
}
