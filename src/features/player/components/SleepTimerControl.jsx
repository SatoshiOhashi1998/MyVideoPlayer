import { useState } from 'react'
import { useSleepTimerStore } from '../../../stores/sleepTimerStore.js'
import './SleepTimerControl.css'

const formatRemaining = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}分${seconds}秒`
}

export default function SleepTimerControl() {
  const startTimer = useSleepTimerStore((state) => state.startTimer)
  const clearTimer = useSleepTimerStore((state) => state.clearTimer)
  const timerSeconds = useSleepTimerStore((state) => state.timerSeconds)
  const [customMinutes, setCustomMinutes] = useState('')

  const handleCustomSubmit = (event) => {
    event.preventDefault()
    const minutes = Number.parseInt(customMinutes, 10)

    if (Number.isInteger(minutes) && minutes > 0) {
      startTimer(minutes * 60)
      setCustomMinutes('')
    }
  }

  return (
    <div className="sleep-timer-container">
      {timerSeconds !== null ? (
        <div className="timer-active">
          <span>💤 タイマー残り: {formatRemaining(timerSeconds)}</span>
          <button onClick={clearTimer}>解除</button>
        </div>
      ) : (
        <div className="timer-buttons">
          <span>スリープタイマー:</span>
          <button onClick={() => startTimer(15 * 60)}>15分</button>
          <button onClick={() => startTimer(30 * 60)}>30分</button>
          <button onClick={() => startTimer(60 * 60)}>60分</button>
          <form onSubmit={handleCustomSubmit} className="timer-custom-form">
            <input
              type="number"
              min="1"
              placeholder="分"
              value={customMinutes}
              onChange={(event) => setCustomMinutes(event.target.value)}
            />
            <button type="submit">設定</button>
          </form>
        </div>
      )}
    </div>
  )
}
