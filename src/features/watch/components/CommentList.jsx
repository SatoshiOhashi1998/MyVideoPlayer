import { parseCommentContent } from '../../../utils/commentParser.js'

export default function CommentList({ comments, onEdit, onDelete, onTimestampClick, disabled }) {
  return (
    <div className="comments-section">
      <h3>{comments.length} 件のコメント</h3>

      <div className="comments-list">
        {comments.map((comment) => (
          <article key={comment.id} className="comment-item">
            <div className="comment-content">
              <div className="comment-text">
                {parseCommentContent(comment.content).map((token, index) => {
                  if (token.type === 'link') {
                    return (
                      <a
                        key={`${comment.id}-link-${index}`}
                        href={token.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="comment-link"
                      >
                        {token.value}
                      </a>
                    )
                  }

                  if (token.type === 'timestamp') {
                    return (
                      <button
                        key={`${comment.id}-timestamp-${index}`}
                        type="button"
                        className="timestamp"
                        onClick={() => onTimestampClick(token.seconds)}
                      >
                        {token.value}
                      </button>
                    )
                  }

                  return <span key={`${comment.id}-text-${index}`}>{token.value}</span>
                })}
              </div>

              <div className="comment-meta">
                <small className="comment-type">{comment.media_type}</small>
                <small className="comment-date">{comment.created_at}</small>
              </div>
            </div>

            <div className="comment-actions">
              <button onClick={() => onEdit(comment)} disabled={disabled}>編集</button>
              <button onClick={() => onDelete(comment.id)} disabled={disabled}>削除</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
