import { usePlaybackStore } from '../../../stores/playbackStore.js'
import { MEDIA_TYPES } from '../../../domain/mediaTypes.js'
import HtmlMediaPlayer from './HtmlMediaPlayer.jsx'
import YouTubePlayer from './YouTubePlayer.jsx'

export default function UniversalPlayer({ onControllerReady }) {
  const currentMedia = usePlaybackStore((state) => state.currentMedia)

  if (!currentMedia) return null

  const type = currentMedia.type || MEDIA_TYPES.VIDEO

  if (type === MEDIA_TYPES.YOUTUBE) {
    return (
      <YouTubePlayer
        media={currentMedia}
        onControllerReady={onControllerReady}
      />
    )
  }

  return (
    <HtmlMediaPlayer
      media={currentMedia}
      onControllerReady={onControllerReady}
    />
  )
}