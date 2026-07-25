// src/components/UniversalPlayer.jsx
import { useSearchParams } from 'react-router-dom';
import { useVideoStore } from '../store/useVideoStore';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import YouTubePlayer from './YouTubePlayer';

export default function UniversalPlayer() {
  const [searchParams] = useSearchParams();
  const currentVideo = useVideoStore((state) => state.currentVideo);

  if (!currentVideo) return null;

  // URLのクエリパラメータ `type` を最優先し、なければストアの `type`、それもなければ 'video'
  const mediaType = searchParams.get('type') || currentVideo.type || 'video';

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