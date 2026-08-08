// src/components/DownloadModal.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './DownloadModal.css';

// 画質・音質の選択肢リスト
const videoQualities = [
  { value: '1080', label: '1080p (最高画質)' },
  { value: '720', label: '720p (HD)' },
  { value: '480', label: '480p' },
  { value: '360', label: '360p' },
  { value: '240', label: '240p' },
  { value: '144', label: '144p' },
];

const audioQualities = [
  { value: '320', label: '320 kbps (最高音質)' },
  { value: '192', label: '192 kbps (標準・高音質)' },
  { value: '128', label: '128 kbps (軽量)' },
];

export default function DownloadModal({ videoId, isOpen, onClose }) {
  const [saveDirs, setSaveDirs] = useState([]);
  const [selectedDir, setSelectedDir] = useState('');
  const [downloadType, setDownloadType] = useState('video'); // 'video' or 'audio'
  const [quality, setQuality] = useState('1080'); // 動画の場合は1080pスタート
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 保存先ディレクトリの一覧をバックエンドから取得 (GET)
  useEffect(() => {
    if (isOpen) {
      axios.get(`${import.meta.env.VITE_API_VIDEO_BASE_URL}/api/youtube/download`)
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

  // 形式（動画/音声）を切り替えたときの処理
  const handleTypeChange = (type) => {
    setDownloadType(type);
    if (type === 'audio') {
      setQuality('192'); // 音声のデフォルトは192kbps
    } else {
      setQuality('1080'); // 動画のデフォルトは1080p
    }
  };

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
                  onChange={() => handleTypeChange('video')} 
                /> 
                動画 (mp4)
              </label>
              <label>
                <input 
                  type="radio" 
                  name="downloadType" 
                  value="audio" 
                  checked={downloadType === 'audio'} 
                  onChange={() => handleTypeChange('audio')} 
                /> 
                音声のみ (mp3)
              </label>
            </div>
          </div>

          {/* 画質 または 音質の選択 */}
          <div className="form-group">
            <label htmlFor="quality">{downloadType === 'video' ? '画質:' : '音質:'}</label>
            <select 
              id="quality" 
              value={quality} 
              onChange={(e) => setQuality(e.target.value)}
            >
              {(downloadType === 'video' ? videoQualities : audioQualities).map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

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
              <label>開始時間 (例: 00:01:30):</label>
              <input 
                type="text" 
                placeholder="--:--:--" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
              />
            </div>
            <div>
              <label>終了時間:</label>
              <input 
                type="text" 
                placeholder="--:--:--" 
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