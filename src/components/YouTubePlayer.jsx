// src/components/YouTubePlayer.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoStore } from '../store/useVideoStore';
import { useQueueStore } from '../store/useQueueStore';
import DownloadModal from './DownloadModal';
import SleepTimerControl from './SleepTimerControl'; // ★ 追加

export default function YouTubePlayer() {
  const navigate = useNavigate();
  const currentVideo = useVideoStore((state) => state.currentVideo);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);
  const queue = useQueueStore((state) => state.queue);
  const removeFromQueue = useQueueStore((state) => state.removeFromQueue);
  const reorderQueue = useQueueStore((state) => state.reorderQueue);

  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  if (!currentVideo || currentVideo.type !== 'youtube') return null;

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const draggedIndex = Number(e.dataTransfer.getData('text/plain'));
    if (isNaN(draggedIndex) || draggedIndex === targetIndex) return;
    reorderQueue(draggedIndex, targetIndex);
  };

  const handleQueueItemClick = (video, index) => {
    removeFromQueue(index);
    setCurrentVideo(video);
    const mediaType = video.type || 'video';
    navigate(`/watch?v=${video.id}&type=${mediaType}`);
  };

  return (
    <div className="player-wrapper">
      <div className="youtube-player-container-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>YouTube再生中: {currentVideo.filetitle}</h3>
          
          <button 
            onClick={() => setIsDownloadOpen(true)}
            style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontWeight: 500 }}
          >
            📥 ダウンロード
          </button>
        </div>

        <div className="youtube-player-container">
          <iframe
            src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`}
            title={currentVideo.filetitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* ★ スリープタイマーコントロールを追加 */}
        <div style={{ marginTop: '12px' }}>
          <SleepTimerControl />
        </div>
      </div>

      {queue.length > 0 && (
        <div className="queue-container">
          <h3>再生キュー ({queue.length})</h3>
          <ul>
            {queue.map((video, index) => (
              <li 
                key={video.id || index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <span onClick={() => handleQueueItemClick(video, index)}>
                  {video.filetitle}
                </span>
                <button onClick={() => removeFromQueue(index)}>削除</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DownloadModal 
        videoId={currentVideo.id} 
        isOpen={isDownloadOpen} 
        onClose={() => setIsDownloadOpen(false)} 
      />
    </div>
  );
}