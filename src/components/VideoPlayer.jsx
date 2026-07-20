// src/components/VideoPlayer.jsx
import { useRef, useState, useEffect } from 'react';
import { useVideoStore } from '../store/useVideoStore';
import './VideoPlayer.css';

export default function VideoPlayer() {
  const currentVideo = useVideoStore((state) => state.currentVideo);
  const videoRef = useRef(null);

  const [isLoop, setIsLoop] = useState(false);
  const [isSectionLoop, setIsSectionLoop] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  // 1. 動画が切り替わったときに自動再生
  useEffect(() => {
    if (videoRef.current && currentVideo) {
      videoRef.current.load();
      videoRef.current.play().catch((err) => console.log("自動再生が制限されました", err));
    }
  }, [currentVideo]);

  // 2. 区間リピートの監視
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

  // 3. 外部からのシーク命令
  useEffect(() => {
    const handleSeek = (e) => {
      if (videoRef.current) videoRef.current.currentTime = e.detail;
    };
    window.addEventListener('seekTo', handleSeek);
    return () => window.removeEventListener('seekTo', handleSeek);
  }, []);

  // 4. データ未選択時の表示
  if (!currentVideo) {
    return <div className="video-player-container">動画を選択してください</div>;
  }

  // --- 操作用関数 ---
  const skip = (seconds) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const toggleLoop = () => {
    if (videoRef.current) {
      videoRef.current.loop = !videoRef.current.loop;
      setIsLoop(videoRef.current.loop);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="video-player-container">
      <h3>再生中: {currentVideo.filetitle}</h3>

      <video
        ref={videoRef}
        width="100%"
        controls
        src={`http://localhost:5000/static${currentVideo.dirpath}/${currentVideo.filename}`}
      />

      <div className="video-controls">
        <button onClick={() => skip(-10)}>10秒戻る</button>
        <button onClick={() => skip(10)}>10秒進む</button>
        <button onClick={toggleLoop} className={isLoop ? 'active' : ''}>
          ループ: {isLoop ? 'ON' : 'OFF'}
        </button>
        <button onClick={() => setIsSectionLoop(!isSectionLoop)} className={isSectionLoop ? 'active' : ''}>
          区間リピート: {isSectionLoop ? 'ON' : 'OFF'}
        </button>
        <button onClick={toggleFullscreen}>全画面</button>
      </div>

      {isSectionLoop && (
        <div className="section-loop-inputs">
          <label>開始(秒): <input type="number" onChange={(e) => setStartTime(Number(e.target.value))} /></label>
          <label>終了(秒): <input type="number" onChange={(e) => setEndTime(Number(e.target.value))} /></label>
        </div>
      )}
    </div>
  );
}