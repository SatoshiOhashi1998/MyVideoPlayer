import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useVideoStore } from '../store/useVideoStore';
import VideoPlayer from '../components/VideoPlayer';

export default function Watch() {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('v');
  const { setCurrentVideo } = useVideoStore();

  useEffect(() => {
    if (videoId) {
      // FlaskのAPIから動画情報を取得
      fetch(`http://localhost:5000/api/videos/${videoId}/info`)
        .then((res) => res.json())
        .then((data) => {
          setCurrentVideo(data);
        })
        .catch((err) => console.error("動画情報の取得に失敗しました:", err));
    }
  }, [videoId, setCurrentVideo]);

  return (
    <div style={{ padding: '20px' }}>
      <VideoPlayer />
    </div>
  );
}