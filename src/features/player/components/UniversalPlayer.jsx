import { usePlaybackStore } from '../../../stores/playbackStore.js'
import { MEDIA_TYPES } from '../../../domain/mediaTypes.js'
import PlayerShell from './PlayerShell.jsx'
import HtmlMediaPlayer from './HtmlMediaPlayer.jsx'
import YouTubePlayer from './YouTubePlayer.jsx'
import './player.css'

export default function UniversalPlayer() {
  const currentMedia = usePlaybackStore((state) => state.currentMedia)

  if (!currentMedia) return null

  const type = currentMedia.type || MEDIA_TYPES.VIDEO
  const player = type === MEDIA_TYPES.YOUTUBE ? (
    <YouTubePlayer media={currentMedia} />
  ) : (
    <HtmlMediaPlayer media={currentMedia} />
  )

  return <PlayerShell>{player}</PlayerShell>
}
