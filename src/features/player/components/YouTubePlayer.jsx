import { useEffect, useRef, useState } from 'react'
import { usePlaybackStore } from '../../../stores/playbackStore.js'
import { createYouTubeAdapter, loadYouTubeIframeApi } from '../adapters/YouTubeAdapter.js'
import { usePlayerController } from '../hooks/usePlayerController.js'
import PlaybackControls from './PlaybackControls.jsx'
import SectionLoopControl from './SectionLoopControl.jsx'
import SleepTimerControl from './SleepTimerControl.jsx'
import DownloadModal from '../../download/components/DownloadModal.jsx'
import { useScreenWakeLock } from '../hooks/useScreenWakeLock.js'

export default function YouTubePlayer({ media }) {
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const adapterRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const setCurrentMedia = usePlaybackStore((state) => state.setCurrentMedia)
  const controller = usePlayerController({
    adapterRef,
    ready,
    currentMedia: media,
    enablePersistence: false,
  })
  useScreenWakeLock(isPlaying)
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)

  useEffect(() => {
    setCurrentMedia(media)
  }, [media, setCurrentMedia])

  useEffect(() => {
    let disposed = false

    setReady(false)
    adapterRef.current = null

    loadYouTubeIframeApi()
      .then((YT) => {
        if (disposed || !containerRef.current) return

        playerRef.current?.destroy?.()

        playerRef.current = new YT.Player(containerRef.current, {
          videoId: media.id,
          playerVars: {
            autoplay: 0,
          },
          events: {
            onReady: (event) => {
              if (disposed) return
              adapterRef.current = createYouTubeAdapter(event.target)
              setReady(true)
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                setIsPlaying(true)
              } else {
                setIsPlaying(false)
              }

              if (event.data === YT.PlayerState.ENDED) {
                controller.handleEnded()
              }
            },
          },
        })
      })
      .catch((error) => {
        console.error('YouTubeプレイヤーの初期化に失敗しました:', error)
      })

    return () => {
      disposed = true
      playerRef.current?.destroy?.()
      playerRef.current = null
      adapterRef.current = null
      setReady(false)
    }
  }, [media.id, controller.handleEnded])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.querySelector('.youtube-player-container-wrapper')?.requestFullscreen()
      } catch (error) {
        console.error('全画面表示に失敗しました:', error)
      }
    } else {
      await document.exitFullscreen()
    }
  }

  return (
    <>
      <div className="youtube-player-title-row">
        <h3>YouTube再生中: {media.filetitle}</h3>
        <button onClick={() => setIsDownloadOpen(true)}>📥 ダウンロード</button>
      </div>

      <div className="youtube-player-container">
        <div ref={containerRef} />
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
        showFullscreen
      />

      <SectionLoopControl
        visible={controller.isSectionLoop}
        startInput={controller.startInput}
        setStartInput={controller.setStartInput}
        handleStartBlur={controller.handleStartBlur}
        endInput={controller.endInput}
        setEndInput={controller.setEndInput}
        handleEndBlur={controller.handleEndBlur}
      />

      <SleepTimerControl />

      <DownloadModal
        videoId={media.id}
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />
    </>
  )
}
