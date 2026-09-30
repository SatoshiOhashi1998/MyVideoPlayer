import { useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePlaybackStore } from '../../../stores/playbackStore.js'
import UniversalPlayer from './UniversalPlayer.jsx'
import QueuePanel from './QueuePanel.jsx'
import './player.css'

export default function PlayerDisplay() {
  const location = useLocation()
  const navigate = useNavigate()

  const currentMedia = usePlaybackStore((state) => state.currentMedia)

  const controllerRef = useRef(null)

  const isWatchPage = location.pathname === '/watch'

  const handleControllerReady = useCallback((controller) => {
    controllerRef.current = controller
  }, [])

  const handleTogglePlay = (event) => {
    event.stopPropagation()
    controllerRef.current?.togglePlay()
  }

  const handleOpenWatch = (event) => {
    event.stopPropagation()

    if (!currentMedia) return

    navigate(
      `/watch?v=${encodeURIComponent(currentMedia.id)}&type=${encodeURIComponent(currentMedia.type)}`
    )
  }

  if (!currentMedia) return null

  return (
    <div
      className={
        isWatchPage
          ? 'player-display player-display--watch'
          : 'player-display player-display--mini'
      }
    >
      <section className="player-main">
        <UniversalPlayer
          onControllerReady={handleControllerReady}
        />
      </section>

      {!isWatchPage && (
        <div className="mini-player-controls">
          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label="再生 / 一時停止"
          >
            ▶ / ⏸
          </button>

          <button
            type="button"
            onClick={handleOpenWatch}
            aria-label="動画ページを開く"
          >
            ↗
          </button>
        </div>
      )}

      {isWatchPage && <QueuePanel />}
    </div>
  )
}