import api from '../api/api'

export async function getPublicProfile(userId) {
  try {
    const response = await api.get(`/users/${userId}/profile`)
    return response.data ?? null
  } catch {
    return null
  }
}
