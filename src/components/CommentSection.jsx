// src/components/CommentSection.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CommentSection({ videoId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = () => {
    axios.get(`http://localhost:5000/api/videos/${videoId}/comments`)
      .then(res => setComments(res.data))
      .catch(err => console.error(err));
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
    <div>
      <h3>コメント</h3>
      <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} />
      <button onClick={handlePost}>投稿</button>
      <ul>
        {comments.map(c => <li key={c.id}>{c.content}</li>)}
      </ul>
    </div>
  );
}