// src/components/YouTubePlayer.jsx
import { useVideoStore } from '../store/useVideoStore';

export default function YouTubePlayer() {
  const currentVideo = useVideoStore((state) => state.currentVideo);

  if (!currentVideo || currentVideo.type !== 'youtube') return null;

  return (
    <div className="youtube-player-container" style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}>
      <iframe
        src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`}
        title={currentVideo.filetitle}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}