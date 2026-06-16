import { PRODUCT_IMAGE_PLACEHOLDER } from "../../services/catalog";

/**
 * Formatea el precio para mostrarlo en la interfaz.
 * @param {number} value - El valor a formatear.
 * @returns {string} - El precio formateado.
 */
export function formatPrice(value) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`;
}

/**
 * Mapea un producto a un item de lista.
 * @param {Object} product - El producto a mapear.
 * @param {Object} options - Opciones adicionales.
 * @param {boolean} [options.recommended=false] - Si el producto es recomendado.
 * @returns {Object} - El item de lista mapeado.
 */
export function mapProductToListItem(product, { recommended = false } = {}) {
  const price = Number(product.price) || 0;
  const oldPrice = Number((price * 1.3).toFixed(2));

  return {
    id: String(product.id),
    name: product.name || "Producto",
    price,
    oldPrice,
    image: product.images?.[0] || PRODUCT_IMAGE_PLACEHOLDER,
    categoryId:
      product.category?.id !== undefined && product.category?.id !== null
        ? String(product.category.id)
        : "",
    categorySlug: product.category?.slug || "",
    categoryName: product.category?.label || "Catálogo",
    createdAt: product.createdAt || product.created_at || null,
    stock: Number(product.stock) || 0,
    sellerId: product.sellerId,
    seller: product.sellerName || "Vendedor",
    tag: recommended ? "RECOMENDADO" : null,
  };
}