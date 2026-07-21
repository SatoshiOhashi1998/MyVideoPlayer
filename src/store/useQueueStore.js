import { create } from 'zustand';

export const useQueueStore = create((set) => ({
  queue: [], // 動画オブジェクトの配列
  
  // キューに追加
  addToQueue: (video) => set((state) => ({ 
    queue: [...state.queue, video] 
  })),
  
  // 指定したインデックスを削除
  removeFromQueue: (index) => set((state) => ({
    queue: state.queue.filter((_, i) => i !== index)
  })),

  // ドラッグ＆ドロップでの並び替え
  reorderQueue: (fromIndex, toIndex) => set((state) => {
    const newQueue = [...state.queue];
    const [movedItem] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedItem);
    return { queue: newQueue };
  }),
  
  // キューをクリア
  clearQueue: () => set({ queue: [] }),

  // 次の動画を再生
  playNext: (setCurrentVideo, navigate) => set((state) => {
    if (state.queue.length === 0) return state;
    
    const nextVideo = state.queue[0];
    const newQueue = state.queue.slice(1);
    
    if (navigate) {
      navigate(`/watch?v=${nextVideo.id}`);
    }
    
    setCurrentVideo(nextVideo);
    return { queue: newQueue };
  }),
}));