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

  const handleUpdate = (id, currentContent) => {
    const content = prompt("内容を編集してください", currentContent);
    if (!content || content === currentContent) return;
    axios.put(`http://localhost:5000/api/videos/${id}/comments`, { content })
      .then(fetchComments);
  };

  const handleDelete = (id) => {
    if (!window.confirm("本当に削除しますか？")) return;
    axios.delete(`http://localhost:5000/api/videos/${id}/comments`)
      .then(fetchComments);
  };

  return (
    <div>
      <h3>コメント</h3>
      <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} />
      <button onClick={handlePost}>投稿</button>
      <ul>
        {comments.map(c => (
          <li key={c.id}>
            {c.content}
            <button onClick={() => handleUpdate(c.id, c.content)}>編集</button>
            <button onClick={() => handleDelete(c.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}