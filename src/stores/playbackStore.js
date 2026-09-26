import { create } from 'zustand'

export const usePlaybackStore = create((set) => ({
  currentMedia: null,
  seekRequest: null,

  setCurrentMedia: (media) => set({ currentMedia: media }),

  requestSeek: (seconds) =>
    set((state) => ({
      seekRequest: {
        seconds: Number(seconds),
        token: (state.seekRequest?.token || 0) + 1,
      },
    })),
}))
