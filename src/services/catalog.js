import AsyncStorage from '@react-native-async-storage/async-storage'
import catalogApi, { getCatalogApiBaseUrl } from '../api/catalogApi'

export const PRODUCT_IMAGE_PLACEHOLDER = 'https://via.placeholder.com/500x350.png?text=Producto'

/**
 * Normaliza el nombre de un campo de issue.
 * @param field - El nombre del campo.
 * @returns El nombre del campo normalizado.
 */
function normalizeIssueField(field) {
  if (typeof field !== 'string') return ''
  return field.startsWith('images[') ? 'images' : field
}

/**
 * Obtiene la extensión de un archivo a partir de su nombre, tipo MIME o URI.
 * @param fileName - Nombre del archivo.
 * @param mimeType - Tipo MIME del archivo.
 * @param uri - URI del archivo.
 * @returns La extensión del archivo.
 */
function getFileExtension({ fileName, mimeType, uri }) {
  if (typeof fileName === 'string' && fileName.includes('.')) {
    return fileName.split('.').pop()?.toLowerCase() ?? 'jpg'
  }

  if (typeof mimeType === 'string') {
    if (mimeType === 'image/png') return 'png'
    if (mimeType === 'image/webp') return 'webp'
  }

  if (typeof uri === 'string' && uri.includes('.')) {
    return uri.split('.').pop()?.split('?')[0]?.toLowerCase() ?? 'jpg'
  }

  return 'jpg'
}

/**
 * Agrega una imagen al FormData.
 * @param formData - El objeto FormData.
 * @param asset - El activo de la imagen.
 * @param index - El índice de la imagen.
 */
async function appendImageToFormData(formData, asset, index) {
  const extension = getFileExtension(asset)
  const filename = asset.fileName || `product-image-${index + 1}.${extension}`
  const mimeType =
    asset.mimeType ||
    (extension === 'png'
      ? 'image/png'
      : extension === 'webp'
        ? 'image/webp'
        : 'image/jpeg')

  if (asset.file) {
    formData.append('images', asset.file, asset.file.name || filename)
    return
  }

  if (typeof asset.uri === 'string' && (asset.uri.startsWith('blob:') || asset.uri.startsWith('data:'))) {
    const response = await fetch(asset.uri)
    const blob = await response.blob()
    formData.append('images', blob, filename)
    return
  }

  formData.append('images', {
    uri: asset.uri,
    name: filename,
    type: mimeType,
  })
}

/**
 * Obtiene el detalle de validación de la respuesta de error.
 * @param error - El error recibido de la API.
 * @returns El detalle de validación.
 */
function getResponseValidationDetail(error) {
  return error?.response?.data?.detail ?? error?.data?.detail
}

/**
 * Obtiene los errores de validación del catálogo.
 * @param error - El error recibido de la API.
 * @returns Un objeto con los errores de validación.
 */
export function getCatalogValidationErrors(error) {
  const detail = getResponseValidationDetail(error)
  if (!Array.isArray(detail)) return {}

  return detail.reduce((accumulator, issue) => {
    const field = normalizeIssueField(issue?.field)
    if (!field || accumulator[field]) return accumulator
    accumulator[field] = issue?.message || 'Campo invalido'
    return accumulator
  }, {})
}

/**
 * Obtiene un mensaje de error para el catálogo.
 * @param error - El error recibido de la API.
 * @param fallback - Mensaje de error por defecto.
 * @returns El mensaje de error.
 */
export function getCatalogErrorMessage(error, fallback = 'No se pudo completar la operacion') {
  const validationErrors = getCatalogValidationErrors(error)
  const firstValidationMessage = Object.values(validationErrors)[0]
  if (firstValidationMessage) return firstValidationMessage

  const detail = error?.response?.data?.detail ?? error?.data?.detail
  if (typeof detail === 'string') return detail

  return error?.message || fallback
}

/**
 * Verifica si un valor es una imagen remota.
 * @param value - El valor a verificar.
 * @returns Verdadero si es una imagen remota, falso en caso contrario.
 */
export function isRemoteImage(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}

/**
 * Mapea un producto del catálogo a una tarjeta de producto.
 * @param product - El producto del catálogo.
 * @param overrides - Valores que sobrescriben los del producto.
 * @returns Un objeto con los datos de la tarjeta de producto.
 */
export function mapCatalogProductToCard(product, overrides = {}) {
  return {
    id: String(product.id),
    name: product.name,
    price: Number(product.price) || 0,
    image: product.images?.[0] || PRODUCT_IMAGE_PLACEHOLDER,
    tag: overrides.tag || product.tag,
    categoryId: product.category?.id ? String(product.category.id) : undefined,
    categoryName: product.category?.label || '',
  }
}

/**
 * Mapea un producto del catálogo a un ítem de ventas.
 * @param product - El producto del catálogo.
 * @returns Un objeto con los datos del ítem de ventas.
 */
export function mapCatalogProductToVentasItem(product) {
  return {
    id: String(product.id),
    titulo: product.name,
    precio: Number(product.price) || 0,
    estado: product.adminDisabled
      ? 'bloqueado_admin'
      : product.status === 'disabled' ? 'inactiva' : 'activa',
    stock: Number(product.stock) || 0,
    vendidos: product.sold_count ?? 0,
    imagen: product.images?.[0] || '📦',
  }
}

/**
 * Lista los productos del catálogo.
 * @param params - Parámetros de búsqueda.
 * @returns Una lista de productos.
 */
export async function listCatalogProducts(params = {}) {
  const response = await catalogApi.get('/products/', { params })
  return response.data?.products ?? []
}

/**
 * Obtiene el detalle de un producto del catálogo.
 * @param productId - ID del producto.
 * @returns El detalle del producto.
 * @throws {Error} Con `reason = 'seller_blocked'` si el vendedor está bloqueado.
 */
export async function getCatalogProduct(productId) {
  try {
    const response = await catalogApi.get(`/products/${productId}`)
    return response.data?.product ?? null
  } catch (error) {
    const detail = error?.response?.data?.detail
    if (detail === 'seller_blocked') {
      const err = new Error('seller_blocked')
      err.reason = 'seller_blocked'
      throw err
    }
    return null
  }
}

/**
 * Lista los productos recientes del catálogo.
 * @returns Una lista de productos.
 */
export async function listRecentProducts() {
  return listCatalogProducts({
    status: 'active',
    onlyAvailable: false,
    sort: 'newest',
    limit: 20,
    offset: 0,
  })
}

/**
 * Lista los productos de un vendedor.
 * @param sellerId - ID del vendedor.
 * @param status - Estado de los productos.
 * @param onlyAvailable - Si solo se deben incluir productos disponibles.
 * @param limit - Límite de productos a devolver.
 * @returns Una lista de productos.
 */
export async function listSellerProducts({
  sellerId,
  status,
  onlyAvailable = false,
  limit = 100,
  offset = 0,
}) {
  const params = {
    sellerId,
    onlyAvailable,
    sort: 'newest',
    limit,
    offset,
  }

  if (status) {
    params.status = status
  }

  return listCatalogProducts(params)
}

/**
 * Lista las categorías de productos.
 * @returns Una lista de categorías.
 */
export async function listProductCategories() {
  const response = await catalogApi.get('/categories/')
  return response.data?.categories ?? []
}

/**
 * Crea un nuevo producto.
 * @param name - Nombre del producto.
 * @param description - Descripción del producto.
 * @param price - Precio del producto.
 * @param stock - Stock del producto.
 * @param categorySlug - Slug de la categoría del producto.
 * @param images - Imágenes del producto.
 * @returns El producto creado.
 */
export async function createProduct({
  name,
  description,
  price,
  stock,
  categorySlug,
  images,
}) {
  const token = await AsyncStorage.getItem('token')
  if (!token) {
    const error = new Error('No autenticado')
    error.status = 401
    throw error
  }

  const formData = new FormData()
  formData.append('name', String(name))
  formData.append('description', String(description))
  formData.append('price', String(price))
  formData.append('stock', String(stock))
  formData.append('categorySlug', String(categorySlug))

  for (const [index, asset] of images.entries()) {
    await appendImageToFormData(formData, asset, index)
  }

  const response = await fetch(`${getCatalogApiBaseUrl()}/products/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const error = new Error(
      typeof data?.detail === 'string'
        ? data.detail
        : 'No se pudo publicar el producto'
    )
    error.status = response.status
    error.data = data
    throw error
  }

  return data?.product
}

/**
 * Lista los productos recomendados.
 * @returns Una lista de productos.
 */
export async function listRecommendedProducts() {
  return listCatalogProducts({
    status: 'active',
    onlyAvailable: false,
    sort: 'newest',
    limit: 10,
    offset: 0,
  })
}

/**
 * Lista los productos más vendidos en los últimos 30 días.
 *
 * Si el usuario está autenticado, catalogApi inyecta el JWT automáticamente
 * y el endpoint personaliza los resultados por las categorías más frecuentes
 * del usuario. Si no hay sesión activa, devuelve los populares globales.
 *
 * @param {object} params - Parámetros opcionales.
 * @param {number} params.limit - Cantidad máxima de productos (1-50).
 * @returns {Promise<Array>} Una lista de productos populares.
 */
export async function listPopularProducts({ limit = 10 } = {}) {
  const response = await catalogApi.get('/products/popular', { params: { limit } })
  return response.data?.products ?? []
}

/**
 * Actualiza el estado de un producto del vendedor.
 * @param productId - ID del producto.
 * @param enabled - Si el producto debe estar habilitado o no.
 * @returns El producto actualizado.
 */
export async function updateSellerProductStatus({ productId, enabled }) {
  const token = await AsyncStorage.getItem('token')
  if (!token) {
    const error = new Error('No autenticado')
    error.status = 401
    throw error
  }

  const response = await fetch(
    `${getCatalogApiBaseUrl()}/products/${productId}/status`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: enabled ? 'active' : 'disabled',
      }),
    }
  )

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const error = new Error(
      typeof data?.detail === 'string'
        ? data.detail
        : 'No se pudo actualizar el estado de la publicacion'
    )
    error.status = response.status
    error.data = data
    throw error
  }

  return data?.product ?? null
}

/**
 * Actualiza el stock de un producto del vendedor.
 * @param productId - ID del producto.
 * @param stock - Nuevo stock del producto.
 * @returns El producto actualizado.
 */
export async function updateSellerProductStock({ productId, stock }) {
  const token = await AsyncStorage.getItem('token')
  if (!token) {
    const error = new Error('No autenticado')
    error.status = 401
    throw error
  }

  const response = await fetch(
    `${getCatalogApiBaseUrl()}/products/${productId}/stock`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stock,
      }),
    }
  )

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const error = new Error(
      typeof data?.detail === 'string'
        ? data.detail
        : 'No se pudo actualizar el stock de la publicacion'
    )
    error.status = response.status
    error.data = data
    throw error
  }

  return data?.product ?? null
}

/**
 * Actualiza un producto del vendedor.
 * @param productId - ID del producto.
 * @param name - Nombre del producto.
 * @param description - Descripción del producto.
 * @param price - Precio del producto.
 * @param stock - Stock del producto.
 * @param category - Categoría del producto.
 * @param images - Imágenes del producto.
 * @param status - Estado del producto.
 * @returns El producto actualizado.
 */
export async function updateSellerProduct({
  productId,
  name,
  description,
  price,
  stock,
  category,
  images,
  status,
}) {
  const token = await AsyncStorage.getItem('token')
  if (!token) {
    const error = new Error('No autenticado')
    error.status = 401
    throw error
  }

  const body = {}

  if (typeof name === 'string' && name.trim() !== '') {
    body.name = name.trim()
  }

  if (typeof description === 'string' && description.trim() !== '') {
    body.description = description.trim()
  }

  if (price !== undefined && price !== null && price !== '') {
    body.price = Number(price)
  }

  if (stock !== undefined && stock !== null && stock !== '') {
    body.stock = Number(stock)
  }

  if (typeof category === 'string' && category.trim() !== '') {
    body.categorySlug = category.trim()
  }

  if (Array.isArray(images) && images.length > 0) {
    body.images = images
  }

  if (status !== undefined) {
    body.status = status
  }

  const response = await fetch(
    `${getCatalogApiBaseUrl()}/products/${productId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const error = new Error(
      typeof data?.detail === 'string'
        ? data.detail
        : 'No se pudo actualizar la publicacion'
    )
    error.status = response.status
    error.data = data
    throw error
  }

  return data?.product ?? null
}