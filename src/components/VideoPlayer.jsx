// src/components/VideoPlayer.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoStore } from '../store/useVideoStore';
import { useQueueStore } from '../store/useQueueStore';
import { usePlayer } from '../hooks/usePlayer';
import SleepTimerControl from './SleepTimerControl';

export default function VideoPlayer() {
  const navigate = useNavigate();
  const currentVideo = useVideoStore((state) => state.currentVideo);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);
  
  const queue = useQueueStore((state) => state.queue);
  const removeFromQueue = useQueueStore((state) => state.removeFromQueue);
  const reorderQueue = useQueueStore((state) => state.reorderQueue);

  const [draggedIndex, setDraggedIndex] = useState(null);

  const {
    mediaRef: videoRef,
    isLoop,
    setIsLoop,
    isSectionLoop,
    setIsSectionLoop,
    startInput,
    setStartInput,
    handleStartBlur,
    endInput,
    setEndInput,
    handleEndBlur,
    handleEnded,
    skip,
    changeVolume
  } = usePlayer('resume_time');

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    reorderQueue(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  const handleQueueItemClick = (video, index) => {
    removeFromQueue(index);
    setCurrentVideo(video);
    navigate(`/watch?v=${video.id}`);
  };

  if (!currentVideo) {
    return <div className="video-player-container">動画を選択してください</div>;
  }

  const toggleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="player-wrapper">
      <div className="video-player-container">
        <h3>再生中: {currentVideo.filetitle}</h3>

        <video
          ref={videoRef}
          controls
          onEnded={handleEnded}
          src={`${import.meta.env.VITE_VIDEO_SERVER_URL}${currentVideo.dirpath}/${currentVideo.filename}`}
        />

        <div className="video-controls">
          <button onClick={() => skip(-10)}>10秒戻る</button>
          <button onClick={() => skip(10)}>10秒進む</button>
          <button onClick={() => changeVolume(0.1)}>音量 +10%</button>
          <button onClick={() => changeVolume(-0.1)}>音量 -10%</button>
          <button onClick={setIsLoop} className={isLoop ? 'active' : ''}>
            ループ: {isLoop ? 'ON' : 'OFF'}
          </button>
          <button onClick={setIsSectionLoop} className={isSectionLoop ? 'active' : ''}>
            区間リピート: {isSectionLoop ? 'ON' : 'OFF'}
          </button>
          <button onClick={toggleFullscreen}>全画面</button>
        </div>

        <SleepTimerControl />

        {isSectionLoop && (
          <div className="section-loop-inputs">
            <label>
              開始: 
              <input 
                type="text" 
                value={startInput} 
                onChange={(e) => setStartInput(e.target.value)}
                onBlur={handleStartBlur}
                placeholder="00:00:00"
              />
            </label>
            <label>
              終了: 
              <input 
                type="text" 
                value={endInput} 
                onChange={(e) => setEndInput(e.target.value)}
                onBlur={handleEndBlur}
                placeholder="00:00:00"
              />
            </label>
          </div>
        )}
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