import { useNavigate } from 'react-router-dom'

export default function MiniPlayer({ media, children }) {
  const navigate = useNavigate()

  const handleWatch = () => {
    navigate(
      `/watch?v=${encodeURIComponent(media.id)}&type=${encodeURIComponent(media.type)}`,
    )
  }

  return (
    <div className="mini-player">
      <div className="mini-player-content">
        {children}
      </div>

      <div className="mini-player-footer">
        <span className="mini-player-title">
          {media.filetitle}
        </span>

        <button onClick={handleWatch}>
          ↗ WatchPage
        </button>
      </div>
    </div>
  )
}