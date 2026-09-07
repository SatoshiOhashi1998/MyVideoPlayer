// src/components/CommentList.jsx

import { parseCommentContent } from '../utils/commentParser';

export default function CommentList({
  comments,
  onEdit,
  onDelete,
  onContentClick
}) {
  return (
    <div
      className="comments-section"
      onClick={onContentClick}
    >
      <h3>{comments.length} 件のコメント</h3>

      <div className="comments-list">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="comment-item"
          >
            <div className="comment-content">

              <div className="comment-text">
                {parseCommentContent(comment.content).map((token, index) => {

                  if (token.type === 'link') {
                    return (
                      <a
                        key={index}
                        href={token.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="comment-link"
                      >
                        {token.value}
                      </a>
                    );
                  }

                  if (token.type === 'timestamp') {
                    return (
                      <span
                        key={index}
                        className="timestamp"
                        data-seconds={token.seconds}
                      >
                        {token.value}
                      </span>
                    );
                  }

                  return (
                    <span key={index}>
                      {token.value}
                    </span>
                  );
                })}
              </div>

              <div className="comment-meta">
                <small className="comment-type">
                  {comment.media_type}
                </small>

                <small className="comment-date">
                  {comment.created_at}
                </small>
              </div>

            </div>

            <div className="comment-actions">
              <button onClick={() => onEdit(comment)}>
                編集
              </button>

              <button onClick={() => onDelete(comment.id)}>
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}