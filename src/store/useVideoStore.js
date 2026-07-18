import { create } from 'zustand';

export const useVideoStore = create((set) => ({
  currentVideo: null,
  setCurrentVideo: (video) => set({ currentVideo: video }),
}));