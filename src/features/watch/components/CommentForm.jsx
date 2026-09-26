export default function CommentForm({ newComment, setNewComment, editingId, onSave, onCancel, disabled }) {
  return (
    <div className="comment-input-area">
      <textarea
        value={newComment}
        onChange={(event) => setNewComment(event.target.value)}
        placeholder={editingId ? 'コメントを編集...' : 'コメントを追加...'}
        disabled={disabled}
      />
      <div className="comment-form-actions">
        <button onClick={onSave} disabled={disabled}>
          {editingId ? '更新' : '投稿'}
        </button>
        {editingId && (
          <button onClick={onCancel} disabled={disabled} className="secondary-button">
            キャンセル
          </button>
        )}
      </div>
    </div>
  )
}
