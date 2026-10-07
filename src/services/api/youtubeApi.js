import { apiClient } from './client.js'
import { API_CONFIG, joinUrl } from './config.js'
import { normalizeMedia } from '../../domain/media.js'
import { MEDIA_TYPES } from '../../domain/mediaTypes.js'

export const youtubeApi = {
  async search(query) {
    const response = await apiClient.get(
      joinUrl(API_CONFIG.youtubeBase, 'api/youtube/search'),
      { params: { q: query } },
    )

    return (response.data?.data || []).map((item) =>
      normalizeMedia(item, MEDIA_TYPES.YOUTUBE),
    )
  },

  async getVideoInfo(id) {
    const response = await apiClient.get(
      joinUrl(
        API_CONFIG.youtubeBase,
        `api/youtube/${encodeURIComponent(id)}/info`,
      ),
    )

    return normalizeMedia(response.data?.data, MEDIA_TYPES.YOUTUBE)
  },

  async getDownloadDirectories() {
    const response = await apiClient.get(
      joinUrl(API_CONFIG.videoBase, 'api/youtube/download'),
    )

    return response.data?.data || []
  },

  async download({
    videoId,
    saveDir,
    quality,
    startTime,
    endTime,
    downloadType,
  }) {
    const response = await apiClient.post(
      joinUrl(API_CONFIG.videoBase, 'api/youtube/download'),
      {
        video_id: videoId,
        save_dir: saveDir,
        save_quality: quality,
        start_time: startTime || null,
        end_time: endTime || null,
        download_type: downloadType,
      },
    )

    return response.data
  },
}
