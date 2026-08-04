import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoStore } from '../store/useVideoStore';
import { useQueueStore } from '../store/useQueueStore';
import DownloadModal from './DownloadModal';
import SleepTimerControl from './SleepTimerControl';
import './YouTubePlayer.css'

export default function YouTubePlayer() {
  const navigate = useNavigate();
  const currentVideo = useVideoStore((state) => state.currentVideo);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);
  const timerSeconds = useVideoStore((state) => state.timerSeconds);
  const queue = useQueueStore((state) => state.queue);
  const removeFromQueue = useQueueStore((state) => state.removeFromQueue);
  const reorderQueue = useQueueStore((state) => state.reorderQueue);

  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const isLoopRef = useRef(isLoop);

  // isLoop の状態を ref に同期させ、リロードを防ぐ
  useEffect(() => {
    isLoopRef.current = isLoop;
  }, [isLoop]);
  
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const containerRef = useRef(null);

  // 1. YouTube IFrame API の初期化とイベント設定
  useEffect(() => {
    if (!currentVideo || currentVideo.type !== 'youtube') return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      window.YT.ready(() => {
        if (playerRef.current) {
          playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player(playerContainerRef.current, {
          videoId: currentVideo.id,
          playerVars: {
            autoplay: 0,
          },
          events: {
            onStateChange: (event) => {
              // 動画終了 (YT.PlayerState.ENDED === 0) 時に ref を参照してループ判定
              if (event.data === 0 && isLoopRef.current) {
                playerRef.current.seekTo(0, true);
                playerRef.current.playVideo();
              }
            }
          }
        });
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
  }, [currentVideo?.id]);

  // 2. スリープタイマー連動
  useEffect(() => {
    if (timerSeconds === 0 && playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      playerRef.current.pauseVideo();
    }
  }, [timerSeconds]);

  // 3. 外部からのシーク操作（コメントクリック等）
  useEffect(() => {
    const handleSeek = (e) => {
      if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(e.detail, true);
      }
    };
    window.addEventListener('seekTo', handleSeek);
    return () => window.removeEventListener('seekTo', handleSeek);
  }, []);

  if (!currentVideo || currentVideo.type !== 'youtube') return null;

  // コントロール用ハンドラー
  const handleRewind = () => {
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      const current = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(current - 10, 0), true);
    }
  };

  const handleForward = () => {
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      const current = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(current + 10, true);
    }
  };

  const handleVolumeDown = () => {
    if (playerRef.current && typeof playerRef.current.getVolume === 'function') {
      const currentVol = playerRef.current.getVolume();
      playerRef.current.setVolume(Math.max(currentVol - 10, 0));
    }
  };

  const handleVolumeUp = () => {
    if (playerRef.current && typeof playerRef.current.getVolume === 'function') {
      const currentVol = playerRef.current.getVolume();
      playerRef.current.setVolume(Math.min(currentVol + 10, 100));
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  // ドラッグ＆ドロップ・キュー操作
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
      <div ref={containerRef} className="youtube-player-container-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>YouTube再生中: {currentVideo.filetitle}</h3>
          
          <button 
            onClick={() => setIsDownloadOpen(true)}
            style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #444', background: '#2c2c2c', color: '#e0e0e0', cursor: 'pointer', fontWeight: 500 }}
          >
            📥 ダウンロード
          </button>
        </div>

        <div className="youtube-player-container">
          <div ref={playerContainerRef} />
        </div>

        {/* コントロールボタン群 */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 0', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={handleRewind} style={{ padding: '6px 12px', cursor: 'pointer' }}>⏪ 10秒</button>
          <button onClick={handleForward} style={{ padding: '6px 12px', cursor: 'pointer' }}>10秒 ⏩</button>
          <button onClick={handleVolumeDown} style={{ padding: '6px 12px', cursor: 'pointer' }}>🔉 音量-10%</button>
          <button onClick={handleVolumeUp} style={{ padding: '6px 12px', cursor: 'pointer' }}>🔊 音量+10%</button>
          <button 
            onClick={() => setIsLoop(!isLoop)} 
            style={{ 
              padding: '6px 12px', 
              cursor: 'pointer', 
              background: isLoop ? '#198754' : '#2c2c2c', 
              color: '#fff',
              border: '1px solid #444'
            }}
          >
            {isLoop ? '🔁 ループON' : '🔁 ループOFF'}
          </button>
          <button onClick={handleToggleFullscreen} style={{ padding: '6px 12px', cursor: 'pointer' }}>⛶ 全画面</button>
        </div>

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