import { useState } from 'react'
import SectionLoopControl from './SectionLoopControl.jsx'
import SleepTimerControl from './SleepTimerControl.jsx'

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
  sectionLoop,
}) {
  const [showSectionLoop, setShowSectionLoop] = useState(false)
  const [showSleepTimer, setShowSleepTimer] = useState(false)

  const handleSectionLoopToggle = () => {
    const nextState = !isSectionLoop

    toggleSectionLoop()
    setShowSectionLoop(nextState)
  }

  return (
    <div className="playback-controls">
      <div className="playback-control-bar">
        <button onClick={onRewind}>
          ⏪ 10秒
        </button>

        <button onClick={onForward}>
          10秒 ⏩
        </button>

        <button onClick={onVolumeDown}>
          🔉 音量-10%
        </button>

        <button onClick={onVolumeUp}>
          🔊 音量+10%
        </button>

        <button
          className={isLoop ? 'active' : ''}
          onClick={toggleLoop}
        >
          🔁 {isLoop ? 'ループON' : 'ループOFF'}
        </button>

        <button
          className={isSectionLoop ? 'active' : ''}
          onClick={handleSectionLoopToggle}
        >
          🔂 {isSectionLoop ? '区間ループON' : '区間ループOFF'}
        </button>

        <button
          className={showSleepTimer ? 'active' : ''}
          onClick={() => setShowSleepTimer((value) => !value)}
        >
          💤 スリープタイマー
        </button>

        {showFullscreen && (
          <button onClick={onFullscreen}>
            ⛶ 全画面
          </button>
        )}
      </div>

      {showSectionLoop && (
        <div className="player-control-panel section-loop-panel">
          <SectionLoopControl
            visible
            startInput={sectionLoop.startInput}
            setStartInput={sectionLoop.setStartInput}
            handleStartBlur={sectionLoop.handleStartBlur}
            endInput={sectionLoop.endInput}
            setEndInput={sectionLoop.setEndInput}
            handleEndBlur={sectionLoop.handleEndBlur}
          />
        </div>
      )}

      {showSleepTimer && (
        <div className="player-control-panel sleep-timer-panel">
          <SleepTimerControl />
        </div>
      )}
    </div>
  )
}