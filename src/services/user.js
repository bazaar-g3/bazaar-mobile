import api from '../api/api'

/**
 * Obtiene el perfil público de un usuario.
 * @param {string} userId - ID del usuario.
 * @returns {Promise<Object|null>} - El perfil público del usuario o null si no se encuentra.
 */
export async function getPublicProfile(userId) {
  try {
    const response = await api.get(`/users/${userId}/profile`)
    return response.data ?? null
  } catch {
    return null
  }
}