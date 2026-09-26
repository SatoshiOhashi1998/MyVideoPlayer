import { useEffect, useState } from 'react'
import { mediaApi } from '../../../services/api/mediaApi.js'
import { youtubeApi } from '../../../services/api/youtubeApi.js'
import { usePlaybackStore } from '../../../stores/playbackStore.js'
import { MEDIA_TYPES, normalizeMediaType } from '../../../domain/mediaTypes.js'

export function useWatchMedia(mediaId, mediaType) {
  const currentMedia = usePlaybackStore((state) => state.currentMedia)
  const setCurrentMedia = usePlaybackStore((state) => state.setCurrentMedia)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const normalizedType = normalizeMediaType(mediaType)

  useEffect(() => {
    if (!mediaId) return undefined

    const alreadyLoaded =
      currentMedia &&
      String(currentMedia.id) === String(mediaId) &&
      currentMedia.type === normalizedType

    if (alreadyLoaded) return undefined

    let cancelled = false

    const fetchMedia = async () => {
      setLoading(true)
      setError(null)

      try {
        let media
        if (normalizedType === MEDIA_TYPES.AUDIO) {
          media = await mediaApi.getAudioInfo(mediaId)
        } else if (normalizedType === MEDIA_TYPES.YOUTUBE) {
          media = await youtubeApi.getVideoInfo(mediaId)
        } else {
          media = await mediaApi.getVideoInfo(mediaId)
        }

        if (!cancelled) setCurrentMedia(media)
      } catch (fetchError) {
        console.error(`${normalizedType} メディア情報の取得に失敗:`, fetchError)
        if (!cancelled) setError('メディア情報の取得に失敗しました。')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMedia()
    return () => {
      cancelled = true
    }
  }, [currentMedia, mediaId, normalizedType, setCurrentMedia])

  return { currentMedia, loading, error }
}
