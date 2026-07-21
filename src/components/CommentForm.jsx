export default function CommentForm({ newComment, setNewComment, editingId, onSave, onCancel }) {
  return (
    <div className="comment-input-area">
      <textarea 
        value={newComment} 
        onChange={(e) => setNewComment(e.target.value)}
        placeholder={editingId ? "コメントを編集..." : "コメントを追加..."}
      />
      <div>
        <button onClick={onSave}>
          {editingId ? "更新" : "投稿"}
        </button>
        {editingId && <button onClick={onCancel} style={{marginLeft: '10px'}}>キャンセル</button>}
      </div>
    </div>
  );
}