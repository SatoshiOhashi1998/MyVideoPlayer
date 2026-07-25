// src/components/DownloadModal.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './DownloadModal.css';

export default function DownloadModal({ videoId, isOpen, onClose }) {
  const [saveDirs, setSaveDirs] = useState([]);
  const [selectedDir, setSelectedDir] = useState('');
  const [downloadType, setDownloadType] = useState('video'); // 'video' or 'audio'
  const [quality, setQuality] = useState('1080'); // デフォルト1080p
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 保存先ディレクトリの一覧をバックエンドから取得 (GET)
  useEffect(() => {
    if (isOpen) {
      axios.get(`${import.meta.env.VITE_API_VIDEO_BASE_URL}/downloadVideo`)
        .then(res => {
          setSaveDirs(res.data || []);
          if (res.data && res.data.length > 0) {
            setSelectedDir(res.data[0]); // 初期値を設定
          }
        })
        .catch(err => console.error("保存先ディレクトリの取得に失敗:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!selectedDir) {
      setMessage('保存先を選択してください');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_VIDEO_BASE_URL}/downloadVideo`, {
        video_id: videoId,
        save_dir: selectedDir,
        save_quality: quality,
        start_time: startTime || null,
        end_time: endTime || null,
        download_type: downloadType,
      });

      setMessage(res.data.response || 'ダウンロードが完了しました！');
    } catch (err) {
      console.error("ダウンロードエラー:", err);
      setMessage('ダウンロードに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>動画をダウンロード</h2>
        
        <form onSubmit={handleDownload}>
          {/* ダウンロードタイプ選択 (動画 or 音声) */}
          <div className="form-group">
            <label>形式:</label>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  name="downloadType" 
                  value="video" 
                  checked={downloadType === 'video'} 
                  onChange={() => setDownloadType('video')} 
                /> 
                動画 (mp4)
              </label>
              <label>
                <input 
                  type="radio" 
                  name="downloadType" 
                  value="audio" 
                  checked={downloadType === 'audio'} 
                  onChange={() => setDownloadType('audio')} 
                /> 
                音声のみ (mp3)
              </label>
            </div>
          </div>

          {/* 画質選択 (動画の場合のみ有効) */}
          {downloadType === 'video' && (
            <div className="form-group">
              <label htmlFor="quality">画質:</label>
              <select 
                id="quality" 
                value={quality} 
                onChange={(e) => setQuality(e.target.value)}
              >
                <option value="1080">1080p</option>
                <option value="720">720p</option>
                <option value="480">480p</option>
                <option value="360">360p</option>
                <option value="240">240p</option>
                <option value="144">144p</option>
              </select>
            </div>
          )}

          {/* 保存先ディレクトリ選択 */}
          <div className="form-group">
            <label htmlFor="saveDir">保存先:</label>
            <select 
              id="saveDir" 
              value={selectedDir} 
              onChange={(e) => setSelectedDir(e.target.value)}
            >
              {saveDirs.map((dir, index) => (
                <option key={index} value={dir}>{dir}</option>
              ))}
            </select>
          </div>

          {/* トリミング時間 (任意) */}
          <div className="form-group-row">
            <div>
              <label>開始時間 (例: 00:01:30 または 90):</label>
              <input 
                type="text" 
                placeholder="--:--" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
              />
            </div>
            <div>
              <label>終了時間:</label>
              <input 
                type="text" 
                placeholder="--:--" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)} 
              />
            </div>
          </div>

          {message && <p className="modal-message">{message}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>キャンセル</button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'ダウンロード中...' : 'ダウンロード開始'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}