// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { useVideoStore } from '../store/useVideoStore';
import { useQueueStore } from '../store/useQueueStore'; // 追加
import './Home.css';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);
  const addToQueue = useQueueStore((state) => state.addToQueue); // 追加

  useEffect(() => {
    axios.get('http://localhost:5000/api/videos')
      .then((response) => {
        setVideos(response.data.items);
      })
      .catch((error) => console.error('Error fetching videos:', error));
  }, []);

  const filteredVideos = videos.filter((video) =>
    video.filetitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="home-container">
      <h1>{query ? `"${query}" の検索結果` : '動画ライブラリ'}</h1>
      
      <div className="video-grid">
        {filteredVideos.map((video) => (
          <div key={video.id} className="video-card">
            <Link
              to={`/watch?v=${video.id}`}
              className="video-link"
              onClick={() => setCurrentVideo(video)}
            >
              <div className="thumbnail-placeholder">
                <span>サムネイル</span>
              </div>
              <div className="video-info">
                <h3>{video.filetitle}</h3>
                <p className="dir-text">{video.dirpath}</p>
              </div>
            </Link>
            
            <button 
              className="add-queue-btn"
              onClick={(e) => {
                e.preventDefault();
                addToQueue(video);
              }}
            >
              キューに追加
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}