import { parseCommentContent } from '../utils/commentParser';

export default function CommentList({
  comments,
  currentMediaType,
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
        {comments.map(c => (
          <div
            key={c.id}
            className="comment-item"
          >
            <div className="comment-content">

              <div
                className="comment-text"
                dangerouslySetInnerHTML={
                  parseCommentContent(c.content)
                }
              />

              <div className="comment-meta">
                <small className="comment-type">
                  {c.media_type}
                </small>

                <small className="comment-date">
                  {c.created_at}
                </small>
              </div>

            </div>

            <div className="comment-actions">
              <button onClick={() => onEdit(c)}>
                編集
              </button>

              <button onClick={() => onDelete(c.id)}>
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
