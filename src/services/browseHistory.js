import catalogApi from '../api/catalogApi'

/**
 * Registra que el usuario autenticado visitó el detalle de un producto.
 * Fire and forget: no bloquea la UI ni lanza error si falla.
 * Si el usuario no está autenticado el interceptor de catalogApi no enviará
 * token y el backend responderá 204 sin registrar nada.
 *
 * @param {string} productId - ID del producto visitado.
 */
export async function recordProductView(productId) {
  if (!productId) return
  try {
    await catalogApi.post(`/products/${productId}/view`)
  } catch {
    // Silencioso: el historial de navegación no debe interrumpir la experiencia
  }
}

/**
 * Registra que el usuario autenticado navegó a una categoría.
 * Fire and forget: no bloquea la UI ni lanza error si falla.
 *
 * @param {string} categorySlug - Slug de la categoría navegada.
 */
export async function recordCategoryBrowse(categorySlug) {
  if (!categorySlug) return
  try {
    await catalogApi.post(`/categories/${categorySlug}/view`)
  } catch {
    // Silencioso
  }
}

export async function recordCartAdd(productId) {
  if (!productId) return
  try {
    await catalogApi.post(`/products/${productId}/cart-add`)
  } catch {
    // Silencioso
  }
}

export async function recordWishlistAdd(productId) {
  if (!productId) return
  try {
    await catalogApi.post(`/products/${productId}/wishlist-add`)
  } catch {
    // Silencioso
  }
}
