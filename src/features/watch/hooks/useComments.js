import { useCallback, useEffect, useMemo, useState } from 'react'
import { commentApi } from '../../../services/api/commentApi.js'

export function useComments(mediaId, mediaType) {
  const [comments, setComments] = useState([])
  const [otherComments, setOtherComments] = useState([])
  const [otherCommentsVisible, setOtherCommentsVisible] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchComments = useCallback(async () => {
    if (!mediaId) return

    try {
      const data = await commentApi.list(mediaId, mediaType)
      setComments(data)
    } catch (fetchError) {
      console.error('コメント取得失敗:', fetchError)
      setError('コメントの取得に失敗しました。')
    }
  }, [mediaId, mediaType])

  const fetchOtherComments = useCallback(async () => {
    if (!mediaId) return

    try {
      const data = await commentApi.listOthers(mediaId, mediaType)
      setOtherComments(data)
    } catch (fetchError) {
      console.error('その他のコメント取得失敗:', fetchError)
      setError('その他のコメントの取得に失敗しました。')
    }
  }, [mediaId, mediaType])

  useEffect(() => {
    setComments([])
    setOtherComments([])
    setOtherCommentsVisible(false)
    setError(null)
    fetchComments()
  }, [fetchComments])

  const displayedComments = useMemo(() => {
    if (!otherCommentsVisible) return comments

    return [...comments, ...otherComments].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    )
  }, [comments, otherComments, otherCommentsVisible])

  const toggleOtherComments = async () => {
    if (otherCommentsVisible) {
      setOtherCommentsVisible(false)
      return
    }

    await fetchOtherComments()
    setOtherCommentsVisible(true)
  }

  const saveComment = async () => {
    const content = newComment.trim()
    if (!content || !mediaId) return

    setLoading(true)
    setError(null)

    try {
      if (editingId) {
        await commentApi.update(editingId, content)
        setEditingId(null)
      } else {
        await commentApi.create(mediaId, content, mediaType)
      }

      setNewComment('')
      await fetchComments()
      if (otherCommentsVisible) await fetchOtherComments()
    } catch (saveError) {
      console.error(editingId ? '更新失敗:' : '投稿失敗:', saveError)
      setError(editingId ? 'コメントの更新に失敗しました。' : 'コメントの投稿に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (comment) => {
    setEditingId(comment.id)
    setNewComment(comment.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setNewComment('')
  }

  const deleteComment = async (commentId) => {
    if (!window.confirm('本当に削除しますか？')) return

    setLoading(true)
    setError(null)

    try {
      await commentApi.remove(commentId)
      await fetchComments()
      if (otherCommentsVisible) await fetchOtherComments()
    } catch (deleteError) {
      console.error('削除失敗:', deleteError)
      setError('コメントの削除に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  return {
    comments: displayedComments,
    newComment,
    setNewComment,
    editingId,
    otherCommentsVisible,
    loading,
    error,
    saveComment,
    startEdit,
    cancelEdit,
    deleteComment,
    toggleOtherComments,
  }
}
