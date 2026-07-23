// src/components/UniversalPlayer.jsx
import { useVideoStore } from '../store/useVideoStore';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';

export default function UniversalPlayer() {
  const currentVideo = useVideoStore((state) => state.currentVideo);

  if (!currentVideo) return null;

  // データに type プロパティがある想定（例: 'audio' または 'video'）
  // 指定がない場合はデフォルトで動画として扱います
  const mediaType = currentVideo.type || 'video';

  switch (mediaType) {
    case 'audio':
      return <AudioPlayer />;
    case 'video':
    default:
      return <VideoPlayer />;
  }
}