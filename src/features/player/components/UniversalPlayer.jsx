import { useLocation } from 'react-router-dom'
import { usePlaybackStore } from '../../../stores/playbackStore.js'
import { MEDIA_TYPES } from '../../../domain/mediaTypes.js'
import PlayerShell from './PlayerShell.jsx'
import HtmlMediaPlayer from './HtmlMediaPlayer.jsx'
import YouTubePlayer from './YouTubePlayer.jsx'
import './player.css'

export default function UniversalPlayer() {
  const currentMedia = usePlaybackStore((state) => state.currentMedia)
  const location = useLocation()

  if (!currentMedia) return null

  const mode = location.pathname.startsWith('/watch')
    ? 'watch'
    : 'mini'

  const type = currentMedia.type || MEDIA_TYPES.VIDEO

  const player =
    type === MEDIA_TYPES.YOUTUBE ? (
      <YouTubePlayer
        media={currentMedia}
        mode={mode}
      />
    ) : (
      <HtmlMediaPlayer
        media={currentMedia}
        mode={mode}
      />
    )

  return (
    <PlayerShell mode={mode}>
      {player}
    </PlayerShell>
  )
}