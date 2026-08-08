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
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);

  const targetId = currentVideo ? currentVideo.id : videoId;

  useEffect(() => {
    document.title = currentVideo ? `${currentVideo.filetitle} - My Video App` : 'My Video App';
  }, [currentVideo]);

  // 統合されたAPIからコメントを取得（mediaTypeをクエリパラメータで渡す）
  const fetchComments = useCallback(async () => {
    if (!targetId) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_VIDEO_BASE_URL}api/comments/${targetId}`, {
        params: { type: mediaType }
      });
      setComments(res.data);
    } catch (err) {
      console.error("コメント取得失敗:", err);
    }
  }, [targetId, mediaType]);

  useEffect(() => {
    if (!videoId) return;

    if (!currentVideo || String(currentVideo.id) !== String(videoId) || currentVideo.type !== mediaType) {
      let endpoint = '';
      
      if (mediaType === 'audio') {
        endpoint = `${import.meta.env.VITE_API_AUDIO_BASE_URL}${import.meta.env.VITE_ALL_AUDIO_DATA}/${videoId}/info`;
      } else if (mediaType === 'youtube') {
        endpoint = `${import.meta.env.VITE_API_YOUTUBE_BASE_URL || import.meta.env.VITE_API_VIDEO_BASE_URL}api/youtube/${videoId}/info`;
      } else {
        endpoint = `${import.meta.env.VITE_API_VIDEO_BASE_URL}${import.meta.env.VITE_ALL_VIDEO_DATA}/${videoId}/info`;
      }

      axios.get(endpoint)
        .then(res => {
          setCurrentVideo({ ...res.data, type: mediaType });
        })
        .catch(err => console.error(`${mediaType} メディア情報の取得に失敗:`, err));
    }
  }, [videoId, mediaType, currentVideo, setCurrentVideo]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (startTime) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('seekTo', { detail: Number(startTime) }));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [videoId, startTime]);

  const handleSave = async () => {
    if (!newComment.trim() || !targetId) return;

    try {
      if (editingId) {
        // 編集時は /api/comments/<id> を叩く
        await axios.put(`${import.meta.env.VITE_API_VIDEO_BASE_URL}api/comments/${editingId}`, { content: newComment });
        setEditingId(null);
      } else {
        // 新規投稿時は /api/items/<id>/comments に mediaType も含めてPOST
        await axios.post(`${import.meta.env.VITE_API_VIDEO_BASE_URL}api/comments/${targetId}`, { 
          content: newComment,
          media_type: mediaType 
        });
      }
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error(editingId ? "更新失敗:" : "投稿失敗:", err);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setNewComment(c.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewComment('');
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      // 削除時は /api/comments/<id> を叩く
      await axios.delete(`${import.meta.env.VITE_API_VIDEO_BASE_URL}api/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      console.error("削除失敗:", err);
    }
  };

  const handleContentClick = (e) => {
    if (e.target.classList.contains('timestamp')) {
      const seconds = e.target.getAttribute('data-seconds');
      window.dispatchEvent(new CustomEvent('seekTo', { detail: Number(seconds) }));
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
      <CommentList 
        comments={comments}
        onEdit={startEdit}
        onDelete={handleDelete}
        onContentClick={handleContentClick}
      />
    </div>
  );
}