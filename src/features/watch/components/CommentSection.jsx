import CommentForm from './CommentForm.jsx'
import CommentList from './CommentList.jsx'

export default function CommentSection({ controller, onTimestampClick }) {
  return (
    <section>
      <CommentForm
        newComment={controller.newComment}
        setNewComment={controller.setNewComment}
        editingId={controller.editingId}
        onSave={controller.saveComment}
        onCancel={controller.cancelEdit}
        disabled={controller.loading}
      />

      {controller.error && <p className="watch-error">{controller.error}</p>}

      <CommentList
        comments={controller.comments}
        onEdit={controller.startEdit}
        onDelete={controller.deleteComment}
        onTimestampClick={onTimestampClick}
        disabled={controller.loading}
      />
    </section>
  )
}
