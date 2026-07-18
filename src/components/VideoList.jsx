import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useVideoStore } from '../store/useVideoStore';

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const setCurrentVideo = useVideoStore(state => state.setCurrentVideo);

  useEffect(() => {
    axios.get('http://localhost:5000/api/videos')
      .then(res => setVideos(res.data.items))
      .catch(err => console.error("VideoList fetch error:", err));
  }, []);

  return (
    <ul>
      {videos.map(v => (
        <li key={v.id}>
          <Link to={`/watch/${v.id}`} onClick={() => setCurrentVideo(v)}>
            {v.filetitle}
          </Link>
        </li>
      ))}
    </ul>
  );
}