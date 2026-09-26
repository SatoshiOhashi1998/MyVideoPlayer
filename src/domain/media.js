import { DEFAULT_MEDIA_TYPE, normalizeMediaType } from './mediaTypes.js'

export const normalizeMedia = (item, fallbackType = DEFAULT_MEDIA_TYPE) => ({
  ...item,
  type: normalizeMediaType(item?.type || fallbackType),
  filetitle: item?.filetitle || item?.title || String(item?.id ?? ''),
})

export const getMediaRoute = (media) => {
  const type = normalizeMediaType(media?.type)
  const id = encodeURIComponent(String(media?.id ?? ''))
  return `/watch?v=${id}&type=${encodeURIComponent(type)}`
}
