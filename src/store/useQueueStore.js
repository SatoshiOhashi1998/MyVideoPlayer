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
  
  // キューをクリア
  clearQueue: () => set({ queue: [] }),

  // 次の動画を再生 (setCurrentVideo と navigate を受け取る)
  playNext: (setCurrentVideo, navigate) => set((state) => {
    if (state.queue.length === 0) return state;
    
    const nextVideo = state.queue[0];
    const newQueue = state.queue.slice(1);
    
    // URLを更新して遷移
    if (navigate) {
      navigate(`/watch?v=${nextVideo.id}`);
    }
    
    setCurrentVideo(nextVideo); // ストアの外から渡された更新関数を実行
    return { queue: newQueue };
  }),
}));