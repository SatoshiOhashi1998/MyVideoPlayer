// src/pages/Watch.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useVideoStore } from '../store/useVideoStore'; // ストアをインポート
import './Watch.css';

export default function Watch() {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('v');
  const startTime = searchParams.get('t'); // 時間指定パラメータを取得
  
  // ストアから現在の動画データと更新関数を取得
  const currentVideo = useVideoStore((state) => state.currentVideo);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 1. URLが変わるたびに動画情報取得とコメント取得を実行
  useEffect(() => {
    if (!videoId) return;

    // タイトル更新用関数
    const updateTitle = (title) => {
      document.title = title ? `${title} - My Video App` : 'My Video App';
    };

    // 初期シーク処理を定義
    const handleInitialSeek = () => {
      if (startTime) {
        // プレイヤーの読み込みを待つために少し遅延させてイベント発火
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('seekTo', { detail: Number(startTime) }));
        }, 500);
      }
    };

    // ストアに既にデータがあり、かつIDが一致していれば取得をスキップ
    if (currentVideo && currentVideo.id === videoId) {
      console.log("ストアのデータを使用します");
      updateTitle(currentVideo.filetitle);
      fetchComments();
      handleInitialSeek();
      return;
    }

    // ストアにデータがない、または別の動画であればAPIから取得
    console.log("APIからデータを取得します");
    axios.get(`http://localhost:5000/api/videos/${videoId}/info`)
      .then(res => {
        setCurrentVideo(res.data);
        updateTitle(res.data.filetitle);
        fetchComments();
        handleInitialSeek();
      })
      .catch(err => console.error("動画情報の取得に失敗:", err));

    // コンポーネントがアンマウントされた時にタイトルを戻す
    return () => { document.title = 'My Video App'; };
  }, [videoId, currentVideo, setCurrentVideo, startTime]);

  const fetchComments = () => {
    if (!videoId) return;
    axios.get(`http://localhost:5000/api/videos/${videoId}/comments`)
      .then(res => setComments(res.data))
      .catch(err => console.error(err));
  };

  const handlePost = () => {
    if (!newComment.trim() || !videoId) return;
    axios.post(`http://localhost:5000/api/videos/${videoId}/comments`, { content: newComment })
      .then(() => {
        setNewComment('');
        fetchComments();
      });
  };

  // 2. タイムスタンプ/URL変換処理
  const createMarkup = (text) => {
    let html = text;
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:blue; text-decoration:underline;">$1</a>');
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