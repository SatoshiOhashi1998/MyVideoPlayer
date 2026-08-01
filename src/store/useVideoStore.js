// src/store/useVideoStore.js
import { create } from 'zustand';

export const useVideoStore = create((set, get) => ({
  currentVideo: null,
  timerSeconds: null, // 残り秒数
  timerId: null,      // setIntervalのID

  setCurrentVideo: (video) => {
    get().clearTimer(); // 動画切り替え時にタイマーをリセット
    set({ currentVideo: video });
  },

  // タイマーを開始する（秒数を受け取る）
  startTimer: (seconds) => {
    get().clearTimer();
    
    set({ timerSeconds: seconds });

    const timerId = setInterval(() => {
      const current = get().timerSeconds;
      if (current <= 1) {
        // 時間切れ：タイマーをクリアするだけで、currentVideo は null にしない
        get().clearTimer();
        
        // タイマーが終了したことを各プレイヤーに伝えるために timerSeconds を 0 にする
        set({ timerSeconds: 0 }); 
      } else {
        set({ timerSeconds: current - 1 });
      }
    }, 1000);
    
    set({ timerId });
  },

  // タイマーを停止・クリアする
  clearTimer: () => {
    const { timerId } = get();
    if (timerId) clearInterval(timerId);
    set({ timerId: null, timerSeconds: null });
  },
}));