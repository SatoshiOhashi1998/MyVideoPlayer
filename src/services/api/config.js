export const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '')
export const trimLeadingSlash = (value = '') => value.replace(/^\/+/, '')

export const joinUrl = (baseUrl, path) => {
  const base = trimTrailingSlash(baseUrl || '')
  const cleanPath = trimLeadingSlash(path || '')

  if (!base) return `/${cleanPath}`
  if (!cleanPath) return base
  return `${base}/${cleanPath}`
}

export const API_CONFIG = Object.freeze({
  videoBase: import.meta.env.VITE_API_VIDEO_BASE_URL || '',
  audioBase: import.meta.env.VITE_API_AUDIO_BASE_URL || '',
  youtubeBase:
    import.meta.env.VITE_API_YOUTUBE_BASE_URL ||
    import.meta.env.VITE_API_VIDEO_BASE_URL || '',
  allVideoData: import.meta.env.VITE_ALL_VIDEO_DATA || 'api/videos',
  allAudioData: import.meta.env.VITE_ALL_AUDIO_DATA || 'api/musics',
})
