import { create } from 'zustand'

export const useQueueStore = create((set) => ({
  queue: [],

  addToQueue: (media) =>
    set((state) => ({
      queue: [...state.queue, media],
    })),

  removeFromQueue: (index) =>
    set((state) => ({
      queue: state.queue.filter((_, itemIndex) => itemIndex !== index),
    })),

  reorderQueue: (fromIndex, toIndex) =>
    set((state) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.queue.length ||
        toIndex >= state.queue.length ||
        fromIndex === toIndex
      ) {
        return state
      }

      const nextQueue = [...state.queue]
      const [movedItem] = nextQueue.splice(fromIndex, 1)
      nextQueue.splice(toIndex, 0, movedItem)
      return { queue: nextQueue }
    }),

  dequeueNext: () => {
    let nextMedia = null

    set((state) => {
      if (state.queue.length === 0) return state
      nextMedia = state.queue[0]
      return { queue: state.queue.slice(1) }
    })

    return nextMedia
  },

  clearQueue: () => set({ queue: [] }),
}))
