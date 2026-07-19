// src/pages/Watch.jsx
import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { VideoContext } from '../contexts/VideoContext';
import './Watch.css';

export default function Watch() {
  const { videoId } = useParams();
  const { setCurrentVideoId } = useContext(VideoContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 1. URLが変わるたびにContextを更新し、コメントを取得
  useEffect(() => {
    setCurrentVideoId(videoId);
    fetchComments();
  }, [videoId]);

  const fetchComments = () => {
    axios.get(`http://localhost:5000/api/videos/${videoId}/comments`)
      .then(res => setComments(res.data))
      .catch(err => console.error(err));
  };

  const handlePost = () => {
    if (!newComment.trim()) return;
    axios.post(`http://localhost:5000/api/videos/${videoId}/comments`, { content: newComment })
      .then(() => {
        setNewComment('');
        fetchComments();
      });
  };

  // 2. タイムスタンプ/URL変換処理
const createMarkup = (text) => {
    let html = text;

    // 1. [タイトル](URL) をリンクに変換
    html = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:blue; text-decoration:underline;">$1</a>'
    );

    // 2. まだリンクになっていない普通のURLをリンクに変換
    html = html.replace(
      /(?<!href=")(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:blue;">$1</a>'
    );
    
    // 3. タイムスタンプをspanタグ化
    html = html.replace(/(\d{1,2}:)?\d{1,2}:\d{2}/g, (match) => {
      const parts = match.split(':').map(Number);
      const seconds = parts.length === 3 
        ? parts[0] * 3600 + parts[1] * 60 + parts[2] 
        : parts[0] * 60 + parts[1];
      return `<span class="timestamp" data-seconds="${seconds}" style="color:blue; cursor:pointer; text-decoration:underline;">${match}</span>`;
    });
    
    return { __html: html };
  };

  // 3. 動画再生位置ジャンプ（親のVideoPlayerの挙動に合わせてください）
  const handleContentClick = (e) => {
    if (e.target.classList.contains('timestamp')) {
      const seconds = e.target.getAttribute('data-seconds');
      // ここで VideoPlayer に秒数を伝える必要があります
      // 必要であれば VideoContext に seekTo プロパティを追加してください
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
            placeholder="コメントを追加..."
          />
          <button onClick={handlePost}>投稿</button>
        </div>

        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-text" dangerouslySetInnerHTML={createMarkup(c.content)} />
              <small className="comment-date">{c.created_at}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}