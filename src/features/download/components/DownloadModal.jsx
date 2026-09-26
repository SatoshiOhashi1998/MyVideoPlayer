import { useEffect, useState } from 'react'
import { youtubeApi } from '../../../services/api/youtubeApi.js'
import './download.css'

const VIDEO_QUALITIES = [
  { value: '1080', label: '1080p (最高画質)' },
  { value: '720', label: '720p (HD)' },
  { value: '480', label: '480p' },
  { value: '360', label: '360p' },
  { value: '240', label: '240p' },
  { value: '144', label: '144p' },
]

const AUDIO_QUALITIES = [
  { value: '320', label: '320 kbps (最高音質)' },
  { value: '192', label: '192 kbps (標準・高音質)' },
  { value: '128', label: '128 kbps (軽量)' },
]

export default function DownloadModal({ videoId, isOpen, onClose }) {
  const [saveDirs, setSaveDirs] = useState([])
  const [selectedDir, setSelectedDir] = useState('')
  const [downloadType, setDownloadType] = useState('video')
  const [quality, setQuality] = useState('1080')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isOpen) return undefined

    let cancelled = false
    setMessage('')

    youtubeApi
      .getDownloadDirectories()
      .then((directories) => {
        if (cancelled) return
        setSaveDirs(directories)
        if (directories.length > 0) setSelectedDir(directories[0])
      })
      .catch((error) => {
        console.error('保存先ディレクトリの取得に失敗:', error)
        if (!cancelled) setMessage('保存先ディレクトリの取得に失敗しました。')
      })

    return () => {
      cancelled = true
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleTypeChange = (type) => {
    setDownloadType(type)
    setQuality(type === 'audio' ? '192' : '1080')
  }

  const handleDownload = async (event) => {
    event.preventDefault()

    if (!selectedDir) {
      setMessage('保存先を選択してください')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const data = await youtubeApi.download({
        videoId,
        saveDir: selectedDir,
        quality,
        startTime,
        endTime,
        downloadType,
      })
      setMessage(data?.response || 'ダウンロードが完了しました！')
    } catch (error) {
      console.error('ダウンロードエラー:', error)
      setMessage('ダウンロードに失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  const qualityOptions = downloadType === 'video' ? VIDEO_QUALITIES : AUDIO_QUALITIES

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="download-modal-title">
        <h2 id="download-modal-title">動画をダウンロード</h2>

        <form onSubmit={handleDownload}>
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

          <div className="form-group">
            <label htmlFor="quality">{downloadType === 'video' ? '画質:' : '音質:'}</label>
            <select id="quality" value={quality} onChange={(event) => setQuality(event.target.value)}>
              {qualityOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="saveDir">保存先:</label>
            <select id="saveDir" value={selectedDir} onChange={(event) => setSelectedDir(event.target.value)}>
              {saveDirs.map((directory) => (
                <option key={directory} value={directory}>{directory}</option>
              ))}
            </select>
          </div>

          <div className="form-group-row">
            <div>
              <label htmlFor="startTime">開始時間 (例: 00:01:30):</label>
              <input id="startTime" type="text" placeholder="--:--:--" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
            </div>
            <div>
              <label htmlFor="endTime">終了時間:</label>
              <input id="endTime" type="text" placeholder="--:--:--" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
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
  )
}
