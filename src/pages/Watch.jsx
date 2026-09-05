// src/pages/Watch.jsx
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useVideoStore } from '../store/useVideoStore';
import CommentForm from '../components/CommentForm';
import CommentList from '../components/CommentList';
import './Watch.css';

export default function Watch() {
  const [searchParams] = useSearchParams();

  const videoId = searchParams.get('v');
  const mediaType = searchParams.get('type') || 'video';
  const startTime = searchParams.get('t');

  const currentVideo = useVideoStore((state) => state.currentVideo);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);

  const [comments, setComments] = useState([]);
  const [otherComments, setOtherComments] = useState([]);
  const [otherCommentsVisible, setOtherCommentsVisible] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);

  const targetId = currentVideo ? currentVideo.id : videoId;

  useEffect(() => {
    document.title = currentVideo
      ? `${currentVideo.filetitle} - My Video App`
      : 'My Video App';
  }, [currentVideo]);

  // 現在のtypeのコメントを取得
  const fetchComments = useCallback(async () => {
    if (!targetId) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_VIDEO_BASE_URL}api/comments/${targetId}`,
        {
          params: {
            type: mediaType
          }
        }
      );

      setComments(res.data);
    } catch (err) {
      console.error("コメント取得失敗:", err);
    }
  }, [targetId, mediaType]);

  // 現在のtype以外のコメントを取得
  const fetchOtherComments = useCallback(async () => {
    if (!targetId) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_VIDEO_BASE_URL}api/comments/${targetId}/others`,
        {
          params: {
            exclude_type: mediaType
          }
        }
      );

      setOtherComments(res.data);
    } catch (err) {
      console.error("その他のコメント取得失敗:", err);
    }
  }, [targetId, mediaType]);

  // その他のコメント表示・非表示
  const handleToggleOtherComments = async () => {
    if (otherCommentsVisible) {
      setOtherCommentsVisible(false);
      return;
    }

    await fetchOtherComments();
    setOtherCommentsVisible(true);
  };

  // メディア情報取得
  useEffect(() => {
    if (!videoId) return;

    if (
      !currentVideo ||
      String(currentVideo.id) !== String(videoId) ||
      currentVideo.type !== mediaType
    ) {
      let endpoint = '';

      if (mediaType === 'audio') {
        endpoint =
          `${import.meta.env.VITE_API_AUDIO_BASE_URL}` +
          `${import.meta.env.VITE_ALL_AUDIO_DATA}/${videoId}/info`;
      } else if (mediaType === 'youtube') {
        endpoint =
          `${import.meta.env.VITE_API_YOUTUBE_BASE_URL || import.meta.env.VITE_API_VIDEO_BASE_URL}` +
          `api/youtube/${videoId}/info`;
      } else {
        endpoint =
          `${import.meta.env.VITE_API_VIDEO_BASE_URL}` +
          `${import.meta.env.VITE_ALL_VIDEO_DATA}/${videoId}/info`;
      }

      axios.get(endpoint)
        .then(res => {
          setCurrentVideo({
            ...res.data,
            type: mediaType
          });
        })
        .catch(err => {
          console.error(
            `${mediaType} メディア情報の取得に失敗:`,
            err
          );
        });
    }
  }, [
    videoId,
    mediaType,
    currentVideo,
    setCurrentVideo
  ]);

  // typeや動画が変わったら現在のコメントを再取得
  useEffect(() => {
    setOtherComments([]);
    setOtherCommentsVisible(false);
    fetchComments();
  }, [fetchComments]);

  // その他のコメントを含めた表示用コメント
  const displayedComments = otherCommentsVisible
    ? [...comments, ...otherComments]
        .sort(
          (a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        )
    : comments;

  // 開始位置
  useEffect(() => {
    if (startTime) {
      const timer = setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('seekTo', {
            detail: Number(startTime)
          })
        );
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [videoId, startTime]);

  // コメント投稿・更新
  const handleSave = async () => {
    if (!newComment.trim() || !targetId) return;

    try {
      if (editingId) {
        // 編集時はコメント自身のmedia_typeを維持する
        await axios.put(
          `${import.meta.env.VITE_API_VIDEO_BASE_URL}api/comments/${editingId}`,
          {
            content: newComment
          }
        );

        setEditingId(null);
      } else {
        // 新規投稿
        await axios.post(
          `${import.meta.env.VITE_API_VIDEO_BASE_URL}api/comments/${targetId}`,
          {
            content: newComment,
            media_type: mediaType
          }
        );
      }

      setNewComment('');

      // 現在のtypeのコメントを更新
      await fetchComments();

      // その他のコメントを表示中なら、
      // そちらも最新状態に更新する
      if (otherCommentsVisible) {
        await fetchOtherComments();
      }

    } catch (err) {
      console.error(
        editingId ? "更新失敗:" : "投稿失敗:",
        err
      );
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setNewComment(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewComment('');
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_VIDEO_BASE_URL}api/comments/${commentId}`
      );

      await fetchComments();

      if (otherCommentsVisible) {
        await fetchOtherComments();
      }

    } catch (err) {
      console.error("削除失敗:", err);
    }
  };

  const handleContentClick = (e) => {
    if (e.target.classList.contains('timestamp')) {
      const seconds = e.target.getAttribute('data-seconds');

      window.dispatchEvent(
        new CustomEvent('seekTo', {
          detail: Number(seconds)
        })
      );
    }
  };

  return (
    <div className="watch-container">

      <CommentForm
        newComment={newComment}
        setNewComment={setNewComment}
        editingId={editingId}
        onSave={handleSave}
        onCancel={cancelEdit}
      />

      <div className="comment-toggle-area">
        <button
          type="button"
          onClick={handleToggleOtherComments}
        >
          {otherCommentsVisible
            ? "その他のコメントを隠す"
            : "その他のコメントを表示"}
        </button>
      </div>

      <CommentList
        comments={displayedComments}
        currentMediaType={mediaType}
        onEdit={startEdit}
        onDelete={handleDelete}
        onContentClick={handleContentClick}
      />

    </div>
  );
}
