// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { useVideoStore } from '../store/useVideoStore';
import { useQueueStore } from '../store/useQueueStore';
import './Home.css';

export default function Home() {
  const [items, setItems] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const searchType = searchParams.get('type') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 45;

  const currentVideo = useVideoStore((state) => state.currentVideo);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);
  const addToQueue = useQueueStore((state) => state.addToQueue);

  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const [videoRes, musicRes] = await Promise.all([
          axios.get(import.meta.env.VITE_API_VIDEO_BASE_URL + import.meta.env.VITE_ALL_VIDEO_DATA),
          axios.get(import.meta.env.VITE_API_AUDIO_BASE_URL + import.meta.env.VITE_ALL_AUDIO_DATA)
        ]);

        const videos = videoRes.data.items || [];
        const musics = musicRes.data.items || [];

        setItems([...videos, ...musics]);
      } catch (error) {
        console.error('データ取得エラー:', error);
      }
    };

    fetchMedia();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesQuery = item.filetitle.toLowerCase().includes(query.toLowerCase());
    
    if (searchType === 'video') {
      return matchesQuery && item.type !== 'audio';
    }
    if (searchType === 'audio') {
      return matchesQuery && item.type === 'audio';
    }
    return matchesQuery;
  });

  const totalPages = Math.ceil(filteredItems.length / limit) || 1;
  const startIndex = (page - 1) * limit;
  const currentItems = filteredItems.slice(startIndex, startIndex + limit);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', newPage);
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddQueue = (e, item) => {
    e.preventDefault();
    addToQueue(item);

    setAddedId(item.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1500);
  };

  return (
    <div className="home-container">
      <h1>{query ? `"${query}" の検索結果` : 'メディアライブラリ'}</h1>
      
      <div className="video-grid">
        {currentItems.map((item) => {
          const isAdded = addedId === item.id;

          return (
            <div key={`${item.type}-${item.id}`} className="video-card">
              <Link
                to={`/watch?v=${item.id}`}
                className="video-link"
                onClick={() => {
                  if (currentVideo?.id !== item.id) {
                    setCurrentVideo(item);
                  }
                }}
              >
                <div className="thumbnail-placeholder">
                  <span>{item.type === 'audio' ? '音声' : 'サムネイル'}</span>
                </div>
                <div className="video-info">
                  <h3>{item.filetitle}</h3>
                  <p className="dir-text">{item.dirpath}</p>
                </div>
              </Link>
              
              <button 
                className={`add-queue-btn ${isAdded ? 'added' : ''}`}
                onClick={(e) => handleAddQueue(e, item)}
              >
                {isAdded ? '追加しました！' : 'キューに追加'}
              </button>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={page <= 1} 
            onClick={() => handlePageChange(page - 1)}
          >
            前へ
          </button>
          <span>{page} / {totalPages}</span>
          <button 
            disabled={page >= totalPages} 
            onClick={() => handlePageChange(page + 1)}
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}