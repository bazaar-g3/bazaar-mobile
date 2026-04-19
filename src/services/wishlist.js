import api from '../api/api'

export async function getWishlist() {
    const response = await api.get('/wishlists/me')
    return response.data.items ?? []
}

export async function addToWishlist(productId) {
    const response = await api.post(`/wishlists/${productId}`)
    return response.data
}

export async function removeFromWishlist(productId) {
    await api.delete(`/wishlists/${productId}`)
}

export async function isInWishlist(productId) {
    try {
        const items = await getWishlist()
        return items.some(item => item.productId === String(productId))
    } catch {
        return false
    }
}
