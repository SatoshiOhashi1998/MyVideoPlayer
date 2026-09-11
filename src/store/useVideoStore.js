// src/store/useVideoStore.js
import { create } from 'zustand';

export const useVideoStore = create((set, get) => ({
  currentVideo: null,
  timerSeconds: null,
  timerEndTime: null,
  timerId: null,

  setCurrentVideo: (video) => {
    set({ currentVideo: video });
  },

  startTimer: (seconds) => {
    get().clearTimer();

    const endTime = Date.now() + seconds * 1000;

    set({
      timerSeconds: seconds,
      timerEndTime: endTime
    });

    const timerId = setInterval(() => {
      const currentEndTime = get().timerEndTime;

      if (!currentEndTime) {
        return;
      }

      const remainingSeconds = Math.ceil(
        (currentEndTime - Date.now()) / 1000
      );

      if (remainingSeconds <= 0) {
        clearInterval(get().timerId);

        set({
          timerId: null,
          timerSeconds: 0
        });

        return;
      }

      set({
        timerSeconds: remainingSeconds
      });
    }, 1000);

    set({ timerId });
  },

  clearTimer: () => {
    const { timerId } = get();

    if (timerId) {
      clearInterval(timerId);
    }

    set({
      timerId: null,
      timerSeconds: null,
      timerEndTime: null
    });
  },
}));
