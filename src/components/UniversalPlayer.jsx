// src/components/UniversalPlayer.jsx
import { useVideoStore } from '../store/useVideoStore';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import YouTubePlayer from './YouTubePlayer';

export default function UniversalPlayer() {
  const currentVideo = useVideoStore((state) => state.currentVideo);

  // 再生中の動画がない場合は何も表示しない
  if (!currentVideo) return null;

  // 再生データに紐づく type のみで判定する
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