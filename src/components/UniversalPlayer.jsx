// src/components/UniversalPlayer.jsx
import { useVideoStore } from '../store/useVideoStore';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import YouTubePlayer from './YouTubePlayer';

export default function UniversalPlayer() {
  const currentVideo = useVideoStore((state) => state.currentVideo);

  if (!currentVideo) return null;

  const mediaType = currentVideo.type || 'video';

  switch (mediaType) {
    case 'audio':
      return <AudioPlayer />;
    case 'youtube':
      return <YouTubePlayer />;
    case 'video':
    default:
      return <VideoPlayer />;
  }
}