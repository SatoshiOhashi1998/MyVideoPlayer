import { apiClient } from './client.js'
import { API_CONFIG, joinUrl } from './config.js'
import { normalizeMedia } from '../../domain/media.js'
import { MEDIA_TYPES } from '../../domain/mediaTypes.js'

const extractItems = (data) => data?.items || []

export const mediaApi = {
  async getVideos() {
    const response = await apiClient.get(
      joinUrl(API_CONFIG.videoBase, API_CONFIG.allVideoData),
    )
    return extractItems(response.data).map((item) =>
      normalizeMedia(item, MEDIA_TYPES.VIDEO),
    )
  },

  async getAudios() {
    const response = await apiClient.get(
      joinUrl(API_CONFIG.audioBase, API_CONFIG.allAudioData),
    )
    return extractItems(response.data).map((item) =>
      normalizeMedia(item, MEDIA_TYPES.AUDIO),
    )
  },

  async getVideoInfo(id) {
    const response = await apiClient.get(
      joinUrl(API_CONFIG.videoBase, `${API_CONFIG.allVideoData}/${encodeURIComponent(id)}/info`),
    )
    return normalizeMedia(response.data, MEDIA_TYPES.VIDEO)
  },

  async getAudioInfo(id) {
    const response = await apiClient.get(
      joinUrl(API_CONFIG.audioBase, `${API_CONFIG.allAudioData}/${encodeURIComponent(id)}/info`),
    )
    return normalizeMedia(response.data, MEDIA_TYPES.AUDIO)
  },
}
