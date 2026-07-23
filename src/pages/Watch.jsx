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

  const fetchComments = useCallback(async () => {
    if (!targetId) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_VIDEO_BASE_URL}${import.meta.env.VITE_ALL_VIDEO_DATA}/${targetId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("コメント取得失敗:", err);
    }
  }, [targetId]);

  useEffect(() => {
    if (!videoId) return;

    if (!currentVideo || String(currentVideo.id) !== String(videoId)) {
      axios.get(`${import.meta.env.VITE_API_VIDEO_BASE_URL}${import.meta.env.VITE_ALL_VIDEO_DATA}/${videoId}/info`)
        .then(res => setCurrentVideo(res.data))
        .catch(err => console.error("動画情報の取得に失敗:", err));
    }
  }, [videoId, currentVideo, setCurrentVideo]);

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
        await axios.put(`${import.meta.env.VITE_API_VIDEO_BASE_URL}${import.meta.env.VITE_ALL_VIDEO_DATA}/${editingId}/comments`, { content: newComment });
        setEditingId(null);
      } else {
        await axios.post(`${import.meta.env.VITE_API_VIDEO_BASE_URL}${import.meta.env.VITE_ALL_VIDEO_DATA}/${targetId}/comments`, { content: newComment });
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
      await axios.delete(`${import.meta.env.VITE_API_VIDEO_BASE_URL}${import.meta.env.VITE_ALL_VIDEO_DATA}/${commentId}/comments`);
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