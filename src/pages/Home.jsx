// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { useVideoStore } from '../store/useVideoStore';
import './Home.css';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);

  useEffect(() => {
    // Flaskから動画一覧を取得
    axios.get('http://localhost:5000/api/videos')
      .then((response) => {
        setVideos(response.data.items);
        console.log(response.data.items);
      })
      .catch((error) => console.error('Error fetching videos:', error));
  }, []);

  // 検索クエリに基づいてリストをフィルタリング
  const filteredVideos = videos.filter((video) =>
    video.filetitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="home-container">
      <h1>{query ? `"${query}" の検索結果` : '動画ライブラリ'}</h1>
      
      <div className="video-grid">
        {filteredVideos.map((video) => (
          <Link
            key={video.id}
            to={`/watch?v=${video.id}`}
            className="video-card"
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
        ))}
      </div>
    </div>
  );
}