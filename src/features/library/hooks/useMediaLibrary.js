import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { mediaApi } from '../../../services/api/mediaApi.js'
import { youtubeApi } from '../../../services/api/youtubeApi.js'
import { MEDIA_TYPES } from '../../../domain/mediaTypes.js'
import { useYouTubeSearchStore } from '../../../stores/youtubeSearchStore.js'

const LIMIT = 45

export function useMediaLibrary() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const searchType = searchParams.get('search_type') || 'default'
  const page = Math.max(Number.parseInt(searchParams.get('page') || '1', 10) || 1, 1)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const cachedQuery = useYouTubeSearchStore((state) => state.query)
  const cachedItems = useYouTubeSearchStore((state) => state.items)
  const setSearchResults = useYouTubeSearchStore(
    (state) => state.setSearchResults,
)

  useEffect(() => {
    let cancelled = false

    const fetchMedia = async () => {
      setLoading(true)
      setError(null)

      try {
        if (searchType === MEDIA_TYPES.YOUTUBE) {
          if (!query) {
            if (!cancelled) setItems([])
            return
          }

          if (cachedQuery === query) {
            if (!cancelled) setItems(cachedItems)
            return
          }

  const youtubeItems = await youtubeApi.search(query)

  if (!cancelled) {
    setSearchResults(query, youtubeItems)
    setItems(youtubeItems)
  }

  return
}

        const [videos, audios] = await Promise.all([
          mediaApi.getVideos(),
          mediaApi.getAudios(),
        ])

        if (!cancelled) setItems([...videos, ...audios])
      } catch (fetchError) {
        console.error('データ取得エラー:', fetchError)
        if (!cancelled) {
          setError('メディアデータの取得に失敗しました。')
          setItems([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMedia()
    return () => {
      cancelled = true
    }
  }, [query, searchType])

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.toLowerCase()

    return items.filter((item) => {
      const matchesQuery = (item.filetitle || '').toLowerCase().includes(normalizedQuery)
      if (!matchesQuery) return false
      if (searchType === MEDIA_TYPES.VIDEO) return item.type === MEDIA_TYPES.VIDEO
      if (searchType === MEDIA_TYPES.AUDIO) return item.type === MEDIA_TYPES.AUDIO
      if (searchType === MEDIA_TYPES.YOUTUBE) return item.type === MEDIA_TYPES.YOUTUBE
      return true
    })
  }, [items, query, searchType])

  const totalPages = Math.ceil(filteredItems.length / LIMIT) || 1
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * LIMIT
  const currentItems = filteredItems.slice(startIndex, startIndex + LIMIT)

  const handlePageChange = (nextPage) => {
    const params = new URLSearchParams(searchParams)
    if (nextPage === 1) params.delete('page')
    else params.set('page', String(nextPage))
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    query,
    searchType,
    page: currentPage,
    items: currentItems,
    totalPages,
    loading,
    error,
    handlePageChange,
  }
}
