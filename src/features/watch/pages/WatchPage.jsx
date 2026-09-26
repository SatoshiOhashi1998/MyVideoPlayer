import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePlaybackStore } from '../../../stores/playbackStore.js'
import { normalizeMediaType } from '../../../domain/mediaTypes.js'
import { useWatchMedia } from '../hooks/useWatchMedia.js'
import { useComments } from '../hooks/useComments.js'
import CommentSection from '../components/CommentSection.jsx'
import './WatchPage.css'

export default function WatchPage() {
  const [searchParams] = useSearchParams()
  const mediaId = searchParams.get('v')
  const mediaType = normalizeMediaType(searchParams.get('type') || 'video')
  const startTime = searchParams.get('t')
  const requestSeek = usePlaybackStore((state) => state.requestSeek)

  const { currentMedia, loading: mediaLoading, error: mediaError } = useWatchMedia(mediaId, mediaType)
  const comments = useComments(mediaId || currentMedia?.id, mediaType)

  useEffect(() => {
    document.title = currentMedia ? `${currentMedia.filetitle} - My Video App` : 'My Video App'
  }, [currentMedia])

  useEffect(() => {
    if (startTime === null) return
    const seconds = Number(startTime)
    if (!Number.isFinite(seconds)) return
    requestSeek(seconds)
  }, [mediaId, requestSeek, startTime])

  if (mediaLoading && !currentMedia) {
    return <div className="watch-container"><p>メディアを読み込み中...</p></div>
  }

  if (mediaError) {
    return <div className="watch-container"><p className="watch-error">{mediaError}</p></div>
  }

  return (
    <div className="watch-container">
      <CommentSection
        controller={comments}
        onTimestampClick={(seconds) => requestSeek(seconds)}
      />
    </div>
  )
}
