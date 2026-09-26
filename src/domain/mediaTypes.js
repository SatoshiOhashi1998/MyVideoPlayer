export const MEDIA_TYPES = Object.freeze({
  VIDEO: 'video',
  AUDIO: 'audio',
  YOUTUBE: 'youtube',
})

export const DEFAULT_MEDIA_TYPE = MEDIA_TYPES.VIDEO

export const normalizeMediaType = (type) => {
  if (type === MEDIA_TYPES.AUDIO) return MEDIA_TYPES.AUDIO
  if (type === MEDIA_TYPES.YOUTUBE) return MEDIA_TYPES.YOUTUBE
  return MEDIA_TYPES.VIDEO
}
