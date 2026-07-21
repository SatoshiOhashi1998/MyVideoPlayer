import { parseCommentContent } from '../utils/commentParser';

export default function CommentList({ comments, onEdit, onDelete, onContentClick }) {
  return (
    <div className="comments-section" onClick={onContentClick}>
      <h3>{comments.length} 件のコメント</h3>
      <div className="comments-list">
        {comments.map(c => (
          <div key={c.id} className="comment-item">
            <div className="comment-content">
              <div className="comment-text" dangerouslySetInnerHTML={parseCommentContent(c.content)} />
              <small className="comment-date">{c.created_at}</small>
            </div>
            <div className="comment-actions">
              <button onClick={() => onEdit(c)}>編集</button>
              <button onClick={() => onDelete(c.id)}>削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}