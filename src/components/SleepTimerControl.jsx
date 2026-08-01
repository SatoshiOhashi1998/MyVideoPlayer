// src/components/SleepTimerControl.jsx
import { useState } from 'react';
import { useVideoStore } from '../store/useVideoStore';
import './SleepTimerControl.css';

export default function SleepTimerControl() {
  const startTimer = useVideoStore((state) => state.startTimer);
  const clearTimer = useVideoStore((state) => state.clearTimer);
  const timerSeconds = useVideoStore((state) => state.timerSeconds);

  const [customMinutes, setCustomMinutes] = useState('');

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}分${seconds}秒`;
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const minutes = parseInt(customMinutes, 10);
    if (!isNaN(minutes) && minutes > 0) {
      startTimer(minutes * 60);
      setCustomMinutes('');
    }
  };

  return (
    <div className="sleep-timer-container">
      {timerSeconds !== null ? (
        <div className="timer-active">
          <span>💤 タイマー残り: {formatTime(timerSeconds)}</span>
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
              onChange={(e) => setCustomMinutes(e.target.value)}
            />
            <button type="submit">設定</button>
          </form>
        </div>
      )}
    </div>
  );
}