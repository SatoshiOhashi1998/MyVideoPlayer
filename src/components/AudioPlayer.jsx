// src/components/AudioPlayer.jsx
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoStore } from '../store/useVideoStore';
import { useQueueStore } from '../store/useQueueStore';
import { formatTime, parseTimeToSeconds } from '../utils/timeUtils';
import './AudioPlayer.css';

export default function AudioPlayer() {
  const navigate = useNavigate();
  const currentVideo = useVideoStore((state) => state.currentVideo);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);
  const queue = useQueueStore((state) => state.queue);
  const removeFromQueue = useQueueStore((state) => state.removeFromQueue);
  const reorderQueue = useQueueStore((state) => state.reorderQueue);
  const playNext = useQueueStore((state) => state.playNext);
  
  const audioRef = useRef(null);
  const prevVideoIdRef = useRef(null);

  const [isLoop, setIsLoop] = useState(false);
  const [isSectionLoop, setIsSectionLoop] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const [startInput, setStartInput] = useState("00:00:00");
  const [endInput, setEndInput] = useState("00:00:00");
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentVideo) return;

    const handleTimeUpdate = () => {
      if (audio.currentTime > 2) {
        localStorage.setItem(`resume_time_audio_${currentVideo.id}`, audio.currentTime);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentVideo]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentVideo) {
      if (prevVideoIdRef.current === currentVideo.id) return;
      prevVideoIdRef.current = currentVideo.id;

      audio.load();
      audio.play().catch((err) => console.log("音声の自動再生が制限されました", err));
      
      setStartTime(0);
      setStartInput("00:00:00");

      const handleLoadedMetadata = () => {
        const duration = audio.duration || 0;
        setEndTime(duration);
        setEndInput(formatTime(duration));

        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.get('t')) {
          const savedTime = localStorage.getItem(`resume_time_audio_${currentVideo.id}`);
          if (savedTime && Number(savedTime) < duration - 2) {
            audio.currentTime = Number(savedTime);
          }
        }
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [currentVideo]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isSectionLoop || endTime <= startTime) return;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= endTime) {
        audio.currentTime = startTime;
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isSectionLoop, startTime, endTime]);

  const handleAudioEnded = () => {
    if (isLoop) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (!isSectionLoop) {
      playNext(setCurrentVideo, navigate);
    }
  };

  useEffect(() => {
    const handleSeek = (e) => {
      if (audioRef.current) audioRef.current.currentTime = e.detail;
    };
    window.addEventListener('seekTo', handleSeek);
    return () => window.removeEventListener('seekTo', handleSeek);
  }, []);

  if (!currentVideo) {
    return <div className="audio-player-container">音声を選択してください</div>;
  }

  const skip = (seconds) => {
    if (audioRef.current) audioRef.current.currentTime += seconds;
  };

  const changeVolume = (amount) => {
    if (audioRef.current) {
      const newVolume = Math.min(Math.max(audioRef.current.volume + amount, 0), 1);
      audioRef.current.volume = Number(newVolume.toFixed(2));
    }
  };

  return (
    <div className="player-wrapper">
      <div className="audio-player-container">
        <h3>音声再生中: {currentVideo.filetitle}</h3>

        <audio
          ref={audioRef}
          width="100%"
          controls
          onEnded={handleAudioEnded}
          src={`${import.meta.env.VITE_AUDIO_SERVER_URL || import.meta.env.VITE_VIDEO_SERVER_URL}${currentVideo.dirpath}/${currentVideo.filename}`}
        />

        <div className="audio-controls">
          <button onClick={() => skip(-10)}>10秒戻る</button>
          <button onClick={() => skip(10)}>10秒進む</button>
          <button onClick={() => changeVolume(0.1)}>音量 +10%</button>
          <button onClick={() => changeVolume(-0.1)}>音量 -10%</button>
          <button onClick={() => setIsLoop(!isLoop)} className={isLoop ? 'active' : ''}>
            ループ: {isLoop ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="queue-container">
          <h3>再生キュー ({queue.length})</h3>
          <ul>
            {queue.map((video, index) => (
              <li key={video.id || index}>
                <span onClick={() => { setCurrentVideo(video); navigate(`/watch?v=${video.id}`); }}>
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