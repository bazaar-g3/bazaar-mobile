import AsyncStorage from '@react-native-async-storage/async-storage'
import catalogApi, { getCatalogApiBaseUrl } from '../api/catalogApi'

export const PRODUCT_IMAGE_PLACEHOLDER = 'https://via.placeholder.com/500x350.png?text=Producto'

function normalizeIssueField(field) {
  if (typeof field !== 'string') return ''
  return field.startsWith('images[') ? 'images' : field
}

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

function getResponseValidationDetail(error) {
  return error?.response?.data?.detail ?? error?.data?.detail
}

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

export function getCatalogErrorMessage(error, fallback = 'No se pudo completar la operacion') {
  const validationErrors = getCatalogValidationErrors(error)
  const firstValidationMessage = Object.values(validationErrors)[0]
  if (firstValidationMessage) return firstValidationMessage

  const detail = error?.response?.data?.detail ?? error?.data?.detail
  if (typeof detail === 'string') return detail

  return error?.message || fallback
}

export function isRemoteImage(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}

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

export function mapCatalogProductToVentasItem(product) {
  return {
    id: String(product.id),
    titulo: product.name,
    precio: Number(product.price) || 0,
    estado: product.status === 'disabled' ? 'inactiva' : 'activa',
    stock: Number(product.stock) || 0,
    vendidos: product.sold_count ?? 0,
    imagen: product.images?.[0] || '📦',
  }
}

export async function listCatalogProducts(params = {}) {
  const response = await catalogApi.get('/products/', { params })
  return response.data?.products ?? []
}

export async function getCatalogProduct(productId) {
  const response = await catalogApi.get(`/products/${productId}`)
  return response.data?.product ?? null
}

export async function listRecentProducts() {
  return listCatalogProducts({
    status: 'active',
    onlyAvailable: false,
    sort: 'recent',
    limit: 20,
    offset: 0,
  })
}

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
    sort: 'recent',
    limit,
    offset,
  }

  if (status) {
    params.status = status
  }

  return listCatalogProducts(params)
}

export async function listProductCategories() {
  const response = await catalogApi.get('/categories/')
  return response.data?.categories ?? []
}

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

export async function listRecommendedProducts() {
  return listCatalogProducts({
    status: 'active',
    onlyAvailable: false,
    sort: 'recent',
    limit: 10,
    offset: 0,
  })
}

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