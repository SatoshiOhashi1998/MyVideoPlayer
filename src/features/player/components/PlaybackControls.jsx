export default function PlaybackControls({
  isLoop,
  toggleLoop,
  isSectionLoop,
  toggleSectionLoop,
  onRewind,
  onForward,
  onVolumeDown,
  onVolumeUp,
  onFullscreen,
  showFullscreen = false,
}) {
  return (
    <div className="playback-controls">
      <button onClick={onRewind}>⏪ 10秒</button>
      <button onClick={onForward}>10秒 ⏩</button>
      <button onClick={onVolumeDown}>🔉 音量-10%</button>
      <button onClick={onVolumeUp}>🔊 音量+10%</button>
      <button className={isLoop ? 'active' : ''} onClick={toggleLoop}>
        🔁 {isLoop ? 'ループON' : 'ループOFF'}
      </button>
      <button className={isSectionLoop ? 'active' : ''} onClick={toggleSectionLoop}>
        🔁 {isSectionLoop ? '区間ループON' : '区間ループOFF'}
      </button>
      {showFullscreen && <button onClick={onFullscreen}>⛶ 全画面</button>}
    </div>
  )
}
