import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoStore } from '../store/useVideoStore';
import { useQueueStore } from '../store/useQueueStore';
import { formatTime, parseTimeToSeconds } from '../utils/timeUtils';
import './VideoPlayer.css';

export default function VideoPlayer() {
  const navigate = useNavigate();
  const currentVideo = useVideoStore((state) => state.currentVideo);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);
  const queue = useQueueStore((state) => state.queue);
  const removeFromQueue = useQueueStore((state) => state.removeFromQueue);
  const reorderQueue = useQueueStore((state) => state.reorderQueue);
  const playNext = useQueueStore((state) => state.playNext);
  
  const videoRef = useRef(null);

  const [isLoop, setIsLoop] = useState(false);
  const [isSectionLoop, setIsSectionLoop] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const [startInput, setStartInput] = useState("00:00:00");
  const [endInput, setEndInput] = useState("00:00:00");

  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && currentVideo) {
      video.load();
      video.play().catch((err) => console.log("自動再生が制限されました", err));
      
      setStartTime(0);
      setStartInput("00:00:00");

      const handleLoadedMetadata = () => {
        const duration = video.duration || 0;
        setEndTime(duration);
        setEndInput(formatTime(duration));
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [currentVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isSectionLoop || endTime <= startTime) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isSectionLoop, startTime, endTime]);

  const handleVideoEnded = () => {
    if (isLoop) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    } else if (!isSectionLoop) {
      playNext(setCurrentVideo, navigate);
    }
  };

  useEffect(() => {
    const handleSeek = (e) => {
      if (videoRef.current) videoRef.current.currentTime = e.detail;
    };
    window.addEventListener('seekTo', handleSeek);
    return () => window.removeEventListener('seekTo', handleSeek);
  }, []);

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

  if (!currentVideo) {
    return <div className="video-player-container">動画を選択してください</div>;
  }

  const skip = (seconds) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const changeVolume = (amount) => {
    if (videoRef.current) {
      const newVolume = Math.min(Math.max(videoRef.current.volume + amount, 0), 1);
      videoRef.current.volume = Number(newVolume.toFixed(2));
    }
  };

  const toggleLoop = () => setIsLoop(!isLoop);
  const toggleSectionLoop = () => setIsSectionLoop(!isSectionLoop);

  const toggleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleQueueItemClick = (video, index) => {
    removeFromQueue(index);
    setCurrentVideo(video);
    navigate(`/watch?v=${video.id}`);
  };

  const handleStartBlur = () => {
    const seconds = parseTimeToSeconds(startInput);
    setStartTime(seconds);
    setStartInput(formatTime(seconds));

    if (videoRef.current) {
      if (videoRef.current.currentTime < seconds || (endTime > 0 && videoRef.current.currentTime > endTime)) {
        videoRef.current.currentTime = seconds;
      }
    }
  };

  const handleEndBlur = () => {
    const seconds = parseTimeToSeconds(endInput);
    setEndTime(seconds);
    setEndInput(formatTime(seconds));

    if (videoRef.current) {
      if (videoRef.current.currentTime > seconds || videoRef.current.currentTime < startTime) {
        videoRef.current.currentTime = startTime;
      }
    }
  };

  return (
    <div className="player-wrapper">
      <div className="video-player-container">
        <h3>再生中: {currentVideo.filetitle}</h3>

        <video
          ref={videoRef}
          width="100%"
          controls
          onEnded={handleVideoEnded}
          src={`${import.meta.env.VITE_VIDEO_SERVER_URL}${currentVideo.dirpath}/${currentVideo.filename}`}
        />

        <div className="video-controls">
          <button onClick={() => skip(-10)}>10秒戻る</button>
          <button onClick={() => skip(10)}>10秒進む</button>
          <button onClick={() => changeVolume(0.1)}>音量 +10%</button>
          <button onClick={() => changeVolume(-0.1)}>音量 -10%</button>
          <button onClick={toggleLoop} className={isLoop ? 'active' : ''}>
            ループ: {isLoop ? 'ON' : 'OFF'}
          </button>
          <button onClick={toggleSectionLoop} className={isSectionLoop ? 'active' : ''}>
            区間リピート: {isSectionLoop ? 'ON' : 'OFF'}
          </button>
          <button onClick={toggleFullscreen}>全画面</button>
        </div>

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