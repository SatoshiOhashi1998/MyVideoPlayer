import { apiClient } from './client.js'
import { API_CONFIG, joinUrl } from './config.js'

const commentsUrl = (path = '') =>
  joinUrl(API_CONFIG.videoBase, `api/comments${path}`)

export const commentApi = {
  async list(mediaId) {
    const response = await apiClient.get(
      commentsUrl(`/${encodeURIComponent(mediaId)}`),
    )
    return response.data?.data || []
  },

  async create(mediaId, content, mediaType) {
    const response = await apiClient.post(
      commentsUrl(`/${encodeURIComponent(mediaId)}`),
      {
        content,
        media_type: mediaType,
      },
    )
    return response.data
  },

  async update(commentId, content) {
    const response = await apiClient.put(
      commentsUrl(`/${encodeURIComponent(commentId)}`),
      { content },
    )
    return response.data?.data
  },

  async remove(commentId) {
    const response = await apiClient.delete(
      commentsUrl(`/${encodeURIComponent(commentId)}`),
    )
    return response.data
  },
}
