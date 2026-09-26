import { useState } from 'react'
import { usePlaybackStore } from '../../../stores/playbackStore.js'
import { useQueueStore } from '../../../stores/queueStore.js'
import { useMediaLibrary } from '../hooks/useMediaLibrary.js'
import MediaGrid from '../components/MediaGrid.jsx'
import Pagination from '../components/Pagination.jsx'
import './HomePage.css'

export default function HomePage() {
  const {
    query,
    items,
    page,
    totalPages,
    loading,
    error,
    handlePageChange,
  } = useMediaLibrary()
  const currentMedia = usePlaybackStore((state) => state.currentMedia)
  const setCurrentMedia = usePlaybackStore((state) => state.setCurrentMedia)
  const addToQueue = useQueueStore((state) => state.addToQueue)
  const [addedId, setAddedId] = useState(null)

  const handleAddQueue = (event, media) => {
    event.preventDefault()
    event.stopPropagation()
    addToQueue(media)
    setAddedId(media.id)
    window.setTimeout(() => setAddedId(null), 1500)
  }

  return (
    <div className="home-container">
      <h1>{query ? `"${query}" の検索結果` : 'メディアライブラリ'}</h1>

      {loading && <p className="home-status">読み込み中...</p>}
      {error && <p className="home-status error">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="home-status">表示するメディアがありません。</p>
      )}

      <MediaGrid
        items={items}
        addedId={addedId}
        onSelect={(media) => {
          if (currentMedia?.id !== media.id || currentMedia?.type !== media.type) {
            setCurrentMedia(media)
          }
        }}
        onAddQueue={handleAddQueue}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  )
}
