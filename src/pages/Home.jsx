// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { useVideoStore } from '../store/useVideoStore';
import { useQueueStore } from '../store/useQueueStore';
import './Home.css';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const currentVideo = useVideoStore((state) => state.currentVideo);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);
  const addToQueue = useQueueStore((state) => state.addToQueue);

  // ★ 追加: クリックされた動画のIDを一時保存するステート
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    axios.get(import.meta.env.VITE_API_VIDEO_BASE_URL + import.meta.env.VITE_ALL_VIDEO_DATA)
      .then((response) => {
        setVideos(response.data.items);
      })
      .catch((error) => console.error('Error fetching videos:', error));
  }, []);

  const filteredVideos = videos.filter((video) =>
    video.filetitle.toLowerCase().includes(query.toLowerCase())
  );

  const handleAddQueue = (e, video) => {
    e.preventDefault();
    addToQueue(video);

    // ★ 追加: クリックした動画のIDをセットし、1.5秒後に元に戻す
    setAddedId(video.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1500);
  };

  return (
    <div className="home-container">
      <h1>{query ? `"${query}" の検索結果` : '動画ライブラリ'}</h1>
      
      <div className="video-grid">
        {filteredVideos.map((video) => {
          const isAdded = addedId === video.id;

          return (
            <div key={video.id} className="video-card">
              <Link
                to={`/watch?v=${video.id}`}
                className="video-link"
                onClick={() => {
                  if (currentVideo?.id !== video.id) {
                    setCurrentVideo(video);
                  }
                }}
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
                className={`add-queue-btn ${isAdded ? 'added' : ''}`}
                onClick={(e) => handleAddQueue(e, video)}
              >
                {isAdded ? '追加しました！' : 'キューに追加'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}