// src/hooks/usePlayer.js
import { useState, useEffect, useRef } from 'react';
import { useVideoStore } from '../store/useVideoStore';
import { useQueueStore } from '../store/useQueueStore';
import { useNavigate } from 'react-router-dom';
import { formatTime, parseTimeToSeconds } from '../utils/timeUtils';

export function usePlayer(storagePrefix) {
  const navigate = useNavigate();
  const mediaRef = useRef(null);
  const prevVideoIdRef = useRef(null);

  const currentVideo = useVideoStore((state) => state.currentVideo);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);
  const timerSeconds = useVideoStore((state) => state.timerSeconds);
  const playNext = useQueueStore((state) => state.playNext);

  const [isLoop, setIsLoop] = useState(false);
  const [isSectionLoop, setIsSectionLoop] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [startInput, setStartInput] = useState("00:00:00");
  const [endInput, setEndInput] = useState("00:00:00");

  // スリープタイマーで一時停止
  useEffect(() => {
    if (timerSeconds === 0 && mediaRef.current) mediaRef.current.pause();
  }, [timerSeconds]);

  // 再生位置の保存
  useEffect(() => {
    const media = mediaRef.current;
    if (!media || !currentVideo) return;
    const handleTimeUpdate = () => {
      if (media.currentTime > 2) {
        localStorage.setItem(`${storagePrefix}_${currentVideo.id}`, media.currentTime);
      }
    };
    media.addEventListener('timeupdate', handleTimeUpdate);
    return () => media.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentVideo, storagePrefix]);

  // ロード時の初期化と再生位置復元
  useEffect(() => {
    const media = mediaRef.current;
    if (media && currentVideo) {
      if (prevVideoIdRef.current === currentVideo.id) return;
      prevVideoIdRef.current = currentVideo.id;

      media.load();
      media.play().catch(err => console.log("自動再生が制限されました", err));
      setStartTime(0);
      setStartInput("00:00:00");

      const handleLoadedMetadata = () => {
        const duration = media.duration || 0;
        setEndTime(duration);
        setEndInput(formatTime(duration));

        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.get('t')) {
          const savedTime = localStorage.getItem(`${storagePrefix}_${currentVideo.id}`);
          if (savedTime && Number(savedTime) < duration - 2) {
            media.currentTime = Number(savedTime);
          }
        }
      };
      media.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => media.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [currentVideo, storagePrefix]);

  // 区間リピートの監視
  useEffect(() => {
    const media = mediaRef.current;
    if (!media || !isSectionLoop || endTime <= startTime) return;
    const handleTimeUpdate = () => {
      if (media.currentTime >= endTime) media.currentTime = startTime;
    };
    media.addEventListener('timeupdate', handleTimeUpdate);
    return () => media.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isSectionLoop, startTime, endTime]);

  // 外部からのシーク（コメントクリック等）
  useEffect(() => {
    const handleSeek = (e) => { if (mediaRef.current) mediaRef.current.currentTime = e.detail; };
    window.addEventListener('seekTo', handleSeek);
    return () => window.removeEventListener('seekTo', handleSeek);
  }, []);

  const handleEnded = () => {
    if (isLoop) {
      mediaRef.current.currentTime = 0;
      mediaRef.current.play();
    } else if (!isSectionLoop) {
      playNext(setCurrentVideo, navigate);
    }
  };

  const skip = (seconds) => { if (mediaRef.current) mediaRef.current.currentTime += seconds; };
  const changeVolume = (amount) => {
    if (mediaRef.current) {
      const newVolume = Math.min(Math.max(mediaRef.current.volume + amount, 0), 1);
      mediaRef.current.volume = Number(newVolume.toFixed(2));
    }
  };

  const handleStartBlur = () => {
    const seconds = parseTimeToSeconds(startInput);
    setStartTime(seconds);
    setStartInput(formatTime(seconds));
    if (mediaRef.current && (mediaRef.current.currentTime < seconds || (endTime > 0 && mediaRef.current.currentTime > endTime))) {
      mediaRef.current.currentTime = seconds;
    }
  };

  const handleEndBlur = () => {
    const seconds = parseTimeToSeconds(endInput);
    setEndTime(seconds);
    setEndInput(formatTime(seconds));
    if (mediaRef.current && (mediaRef.current.currentTime > seconds || mediaRef.current.currentTime < startTime)) {
      mediaRef.current.currentTime = startTime;
    }
  };

  return {
    mediaRef,
    isLoop, setIsLoop: () => setIsLoop(!isLoop),
    isSectionLoop, 
    setIsSectionLoop: () => {
      const nextState = !isSectionLoop;
      setIsSectionLoop(nextState);
      // ONにした瞬間、メディアが読み込まれていれば終了時間を全体の長さにセットする
      if (nextState && mediaRef.current) {
        const duration = mediaRef.current.duration || 0;
        setEndTime(duration);
        setEndInput(formatTime(duration));
      }
    },
    startInput, setStartInput, handleStartBlur,
    endInput, setEndInput, handleEndBlur,
    handleEnded, skip, changeVolume
  };
}