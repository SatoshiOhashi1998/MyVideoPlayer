import { Link } from 'react-router-dom'
import { getMediaRoute } from '../../../domain/media.js'

export default function MediaCard({ media, added, onSelect, onAddQueue }) {
  return (
    <article className="media-card">
      <Link
        to={getMediaRoute(media)}
        className="media-link"
        onClick={() => onSelect(media)}
      >
        <div className="thumbnail-placeholder">
          {media.thumbnail ? (
            <img src={media.thumbnail} alt={media.filetitle} />
          ) : (
            <span>{media.type === 'audio' ? '音声' : 'サムネイル'}</span>
          )}
        </div>
        <div className="media-info">
          <h3>{media.filetitle}</h3>
          <p className="dir-text">{media.dirpath || ''}</p>
        </div>
      </Link>

      <button
        className={`add-queue-btn ${added ? 'added' : ''}`}
        onClick={(event) => onAddQueue(event, media)}
      >
        {added ? '追加しました！' : 'キューに追加'}
      </button>
    </article>
  )
}
