// src/pages/Watch.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useVideoStore } from '../store/useVideoStore';
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

  // 1. タイトル更新専用
  useEffect(() => {
    document.title = currentVideo ? `${currentVideo.filetitle} - My Video App` : 'My Video App';
  }, [currentVideo]);

  // 2. コメント取得専用: currentVideo が変わるたびに最新のコメントを取得
  useEffect(() => {
    if (currentVideo) {
      fetchComments();
    }
  }, [currentVideo]);

  // 3. 動画情報取得用: URLの videoId が変わった時だけ実行
  useEffect(() => {
    if (!videoId) return;

    // 現在の動画と同じなら何もしない
    if (currentVideo && String(currentVideo.id) === String(videoId)) {
      return;
    }

    axios.get(`http://localhost:5000/api/videos/${videoId}/info`)
      .then(res => {
        setCurrentVideo(res.data);
      })
      .catch(err => console.error("動画情報の取得に失敗:", err));
  }, [videoId, setCurrentVideo]);

  // 4. 初期シーク用: URLのパラメータが変わった時だけ実行
  useEffect(() => {
    if (startTime) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('seekTo', { detail: Number(startTime) }));
      }, 500);
    }
  }, [videoId, startTime]);

  const fetchComments = () => {
    const targetId = currentVideo ? currentVideo.id : videoId;
    if (!targetId) return;
    
    axios.get(`http://localhost:5000/api/videos/${targetId}/comments`)
      .then(res => setComments(res.data))
      .catch(err => console.error(err));
  };

  const handleSave = () => {
    const targetId = currentVideo ? currentVideo.id : videoId;
    if (!newComment.trim() || !targetId) return;

    if (editingId) {
      axios.put(`http://localhost:5000/api/videos/${editingId}/comments`, { content: newComment })
        .then(() => {
          setEditingId(null);
          setNewComment('');
          fetchComments();
        })
        .catch(err => console.error("更新失敗:", err));
    } else {
      axios.post(`http://localhost:5000/api/videos/${targetId}/comments`, { content: newComment })
        .then(() => {
          setNewComment('');
          fetchComments();
        })
        .catch(err => console.error("投稿失敗:", err));
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

  const handleDelete = (commentId) => {
    if (!window.confirm("本当に削除しますか？")) return;
    axios.delete(`http://localhost:5000/api/videos/${commentId}/comments`)
      .then(() => fetchComments())
      .catch(err => console.error("削除失敗:", err));
  };

  const createMarkup = (text) => {
    let html = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:blue; text-decoration:underline;">$1</a>');
    html = html.replace(/(?<!href=")(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:blue;">$1</a>');
    
    html = html.replace(/(\d{1,2}:)?\d{1,2}:\d{2}/g, (match) => {
      const parts = match.split(':').map(Number);
      const seconds = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
      return `<span class="timestamp" data-seconds="${seconds}" style="color:blue; cursor:pointer; text-decoration:underline;">${match}</span>`;
    });
    return { __html: html };
  };

  const handleContentClick = (e) => {
    if (e.target.classList.contains('timestamp')) {
      const seconds = e.target.getAttribute('data-seconds');
      window.dispatchEvent(new CustomEvent('seekTo', { detail: Number(seconds) }));
    }
  };

  return (
    <div className="watch-container">
      <div className="comments-section" onClick={handleContentClick}>
        <h3>{comments.length} 件のコメント</h3>
        
        <div className="comment-input-area">
          <textarea 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={editingId ? "コメントを編集..." : "コメントを追加..."}
          />
          <div>
            <button onClick={handleSave}>
              {editingId ? "更新" : "投稿"}
            </button>
            {editingId && <button onClick={cancelEdit} style={{marginLeft: '10px'}}>キャンセル</button>}
          </div>
        </div>

        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-content">
                <div className="comment-text" dangerouslySetInnerHTML={createMarkup(c.content)} />
                <small className="comment-date">{c.created_at}</small>
              </div>
              <div className="comment-actions">
                <button onClick={() => startEdit(c)}>編集</button>
                <button onClick={() => handleDelete(c.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}