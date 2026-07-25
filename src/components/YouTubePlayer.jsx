// src/components/YouTubePlayer.jsx
import { useNavigate } from 'react-router-dom';
import { useVideoStore } from '../store/useVideoStore';
import { useQueueStore } from '../store/useQueueStore';

export default function YouTubePlayer() {
  const navigate = useNavigate();
  const currentVideo = useVideoStore((state) => state.currentVideo);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);
  const queue = useQueueStore((state) => state.queue);
  const removeFromQueue = useQueueStore((state) => state.removeFromQueue);
  const reorderQueue = useQueueStore((state) => state.reorderQueue);

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
    navigate(`/watch?v=${video.id}`);
  };

  return (
    <div className="player-wrapper">
      <div className="youtube-player-container-wrapper">
        <h3>YouTube再生中: {currentVideo.filetitle}</h3>

        <div className="youtube-player-container">
          <iframe
            src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`}
            title={currentVideo.filetitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
    </div>
  );
}