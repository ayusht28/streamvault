import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sv_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sv_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Video APIs
export const videoAPI = {
  getAll: (params) => api.get('/videos', { params }),
  getById: (id) => api.get(`/videos/${id}`),
  upload: (formData, onProgress) => api.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
    timeout: 0,
  }),
  update: (id, data) => api.put(`/videos/${id}`, data),
  delete: (id) => api.delete(`/videos/${id}`),
  search: (params) => api.get('/videos/search', { params }),
  getUserVideos: (userId, params) => api.get(`/videos/user/${userId}`, { params }),
  getMyVideos: (params) => api.get('/videos/my', { params }),
  toggleLike: (id, type) => api.post(`/videos/${id}/like`, { type }),
}

export const commentAPI = {
  getByVideo: (videoId, params) => api.get(`/comments/${videoId}`, { params }),
  create: (videoId, comment_text) => api.post(`/comments/${videoId}`, { comment_text }),
  delete: (id) => api.delete(`/comments/${id}`),
}

export const subscriptionAPI = {
  getAll: () => api.get('/subscriptions'),
  getFeed: (params) => api.get('/subscriptions/feed', { params }),
  getStatus: (channelId) => api.get(`/subscriptions/status/${channelId}`),
  toggle: (channelId) => api.post(`/subscriptions/${channelId}`),
}

export const authAPI = {
  getChannel: (userId) => api.get(`/auth/channel/${userId}`),
  updateProfile: (formData) => api.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}
