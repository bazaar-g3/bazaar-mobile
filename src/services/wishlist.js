import api from '../api/api'

/**
 * Obtiene la lista de deseos del usuario.
 * @returns {Promise<Array>} - Lista de deseos.
 */
export async function getWishlist() {
    const response = await api.get('/wishlists/me')
    return response.data.items ?? []
}

/**
 * Agrega un producto a la lista de deseos.
 * @param {string} productId - ID del producto a agregar.
 * @returns {Promise<Object>} - El producto agregado.
 */
export async function addToWishlist(productId) {
    const response = await api.post(`/wishlists/${productId}`)
    return response.data
}

/**
 * Elimina un producto de la lista de deseos.
 * @param {string} productId - ID del producto a eliminar.
 * @returns {Promise<void>}
 */
export async function removeFromWishlist(productId) {
    await api.delete(`/wishlists/${productId}`)
}

/**
 * Verifica si un producto está en la lista de deseos.
 * @param {string} productId - ID del producto a verificar.
 * @returns {Promise<boolean>} - true si está en la lista de deseos, false en caso contrario.
 */
export async function isInWishlist(productId) {
    try {
        const items = await getWishlist()
        return items.some(item => String(item.productId) === String(productId))
    } catch {
        return false
    }
}
