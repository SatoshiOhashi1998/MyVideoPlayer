import { useNavigate } from 'react-router-dom'

export default function MiniPlayerControls({
  media,
  onPlayPause,
}) {
  const navigate = useNavigate()

  const handleWatch = () => {
    navigate(
      `/watch?v=${encodeURIComponent(media.id)}&type=${encodeURIComponent(media.type)}`,
    )
  }

  return (
    <div className="mini-player-controls">
      <button onClick={onPlayPause}>
        ▶ / ❚❚
      </button>

      <button onClick={handleWatch}>
        ↗ WatchPage
      </button>
    </div>
  )
}