import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlaybackStore } from '../../../stores/playbackStore.js'
import { useQueueStore } from '../../../stores/queueStore.js'
import { getMediaRoute } from '../../../domain/media.js'

export default function QueuePanel() {
  const navigate = useNavigate()
  const queue = useQueueStore((state) => state.queue)
  const removeFromQueue = useQueueStore((state) => state.removeFromQueue)
  const reorderQueue = useQueueStore((state) => state.reorderQueue)
  const setCurrentMedia = usePlaybackStore((state) => state.setCurrentMedia)
  const [draggedIndex, setDraggedIndex] = useState(null)

  if (queue.length === 0) return null

  const handleDragStart = (event, index) => {
    setDraggedIndex(index)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (event, targetIndex) => {
    event.preventDefault()
    const sourceIndex = Number(event.dataTransfer.getData('text/plain'))
    const actualSource = draggedIndex ?? sourceIndex

    if (!Number.isInteger(actualSource) || actualSource === targetIndex) {
      setDraggedIndex(null)
      return
    }

    reorderQueue(actualSource, targetIndex)
    setDraggedIndex(null)
  }

  const handleSelect = (media, index) => {
    removeFromQueue(index)
    setCurrentMedia(media)
    navigate(getMediaRoute(media))
  }

  return (
    <aside className="queue-panel">
      <h3>再生キュー ({queue.length})</h3>
      <ul>
        {queue.map((media, index) => (
          <li
            key={`${media.type || 'video'}-${media.id || index}`}
            draggable
            onDragStart={(event) => handleDragStart(event, index)}
            onDragOver={handleDragOver}
            onDrop={(event) => handleDrop(event, index)}
          >
            <button className="queue-item-title" onClick={() => handleSelect(media, index)}>
              {media.filetitle}
            </button>
            <button
              className="queue-remove-button"
              aria-label={`${media.filetitle}をキューから削除`}
              onClick={() => removeFromQueue(index)}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
