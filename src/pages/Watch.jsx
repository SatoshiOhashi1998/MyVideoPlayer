import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Watch.css'; // スタイル用

export default function Watch() {
  const { videoId } = useParams();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = () => {
    axios.get(`http://localhost:5000/api/videos/${videoId}/comments`)
      .then(res => setComments(res.data));
  };

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const handlePost = () => {
    if (!newComment.trim()) return;
    axios.post(`http://localhost:5000/api/videos/${videoId}/comments`, { content: newComment })
      .then(() => {
        setNewComment('');
        fetchComments();
      });
  };

  return (
    <div className="watch-container">
      <div className="comments-section">
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
              <p className="comment-text">{c.content}</p>
              <small className="comment-date">{c.created_at}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}