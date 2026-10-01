import { create } from 'zustand'

export const useYouTubeSearchStore = create((set) => ({
  query: '',
  items: [],

  setSearchResults: (query, items) =>
    set({
      query,
      items,
    }),

  clearSearchResults: () =>
    set({
      query: '',
      items: [],
    }),
}))