import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native'
import {
  getCatalogErrorMessage,
  getCatalogProduct,
  isRemoteImage,
  listSellerProducts,
  mapCatalogProductToVentasItem,
  updateSellerProductStatus,
  updateSellerProductStock,
  updateSellerProduct,
} from '../services/catalog'
import { getSellerSales } from '../services/orders'
import { getPublicProfile } from '../services/user'
import { COLORS } from '../constants/colors'
import { SPACING, FONT } from '../constants/theme'
import EditProductModal from '../components/EditProductModal'
import EditableStockStepper from '../components/EditableStockStepper'

const FILTROS = ['activa', 'inactiva']

function StateSwitch({ value, onToggle }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.85}
      style={[styles.switchTrack, value ? styles.switchTrackOn : styles.switchTrackOff]}
    >
      <View
        style={[styles.switchThumb, value ? styles.switchThumbOn : styles.switchThumbOff]}
      />
    </TouchableOpacity>
  )
}

export default function VentasTab({
  sellerId,
  refreshKey,
  onOpenPublish,
  initialProductId = null,
  initialOpenEdit = false,
}) {
  const [busqueda, setBusqueda] = useState('')
  const [filtrosActivos, setFiltrosActivos] = useState(['activa', 'inactiva'])
  const [publicaciones, setPublicaciones] = useState([])
  const [loadingPublicaciones, setLoadingPublicaciones] = useState(true)
  const [publicacionesError, setPublicacionesError] = useState('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [publicacionEnEdicion, setPublicacionEnEdicion] = useState(null)
  const [loadingEditProduct, setLoadingEditProduct] = useState(false)

  // --- Pedidos recibidos (ventas confirmadas) ---
  const [pedidosModalVisible, setPedidosModalVisible] = useState(false)
  const [pedidos, setPedidos] = useState([])
  const [loadingPedidos, setLoadingPedidos] = useState(false)
  const [pedidosError, setPedidosError] = useState('')
  // Mapa buyer_id → nombre legible, para evitar refetch
  const [buyerNames, setBuyerNames] = useState({})

  const alreadyAutoOpenedRef = useRef('')

  const loadPublicaciones = useCallback(async () => {
    if (!sellerId) {
      setPublicaciones([])
      setLoadingPublicaciones(false)
      return
    }

    setLoadingPublicaciones(true)
    setPublicacionesError('')

    try {
      const products = await listSellerProducts({
        sellerId,
        onlyAvailable: false,
      })

      setPublicaciones(products.map(mapCatalogProductToVentasItem))
    } catch (error) {
      setPublicacionesError(
        getCatalogErrorMessage(error, 'No pudimos cargar tus publicaciones.')
      )
    } finally {
      setLoadingPublicaciones(false)
    }
  }, [sellerId])

  useEffect(() => {
    loadPublicaciones()
  }, [loadPublicaciones, refreshKey])

  // --- Lógica de pedidos recibidos ---

  function formatDeliveryAddress(addr) {
    if (!addr) return 'Dirección no disponible'
    const parts = [`${addr.calle} ${addr.altura}`]
    if (addr.departamento) parts[0] += ` Dpto. ${addr.departamento}`
    if (addr.zona) parts.push(addr.zona)
    parts.push(`CP ${addr.codigo_postal}`)
    return parts.join(', ')
  }

  async function loadPedidos() {
    if (!sellerId) return

    setLoadingPedidos(true)
    setPedidosError('')
    setPedidos([])

    try {
      const sales = await getSellerSales(sellerId)
      setPedidos(sales)

      // Cargar nombres de compradores en segundo plano
      const uniqueBuyerIds = [...new Set(sales.map((s) => s.buyer_id))]
      const names = {}
      await Promise.all(
        uniqueBuyerIds.map(async (buyerId) => {
          const profile = await getPublicProfile(buyerId)
          names[buyerId] = profile?.name || profile?.username || profile?.email || 'Comprador'
        })
      )
      setBuyerNames(names)
    } catch (error) {
      setPedidosError(
        error?.response?.data?.detail || error?.message || 'No se pudieron cargar los pedidos.'
      )
    } finally {
      setLoadingPedidos(false)
    }
  }

  function handleOpenPedidos() {
    setPedidosModalVisible(true)
    loadPedidos()
  }

  function handleClosePedidos() {
    setPedidosModalVisible(false)
  }

  function toggleFiltro(filtro) {
    setFiltrosActivos((prev) =>
      prev.includes(filtro)
        ? prev.filter((f) => f !== filtro)
        : [...prev, filtro]
    )
  }

  async function handleTogglePublicacion(id) {
    const pub = publicaciones.find((p) => p.id === id)
    if (!pub) return

    const nuevoEnabled = pub.estado !== 'activa'

    try {
      const updatedProduct = await updateSellerProductStatus({
        productId: id,
        enabled: nuevoEnabled,
      })

      if (!updatedProduct) return

      setPublicaciones((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                estado: updatedProduct.status === 'disabled' ? 'inactiva' : 'activa',
                stock: Number(updatedProduct.stock) || 0,
                precio: Number(updatedProduct.price) || 0,
                titulo: updatedProduct.name,
                imagen: updatedProduct.images?.[0] || p.imagen,
              }
            : p
        )
      )
    } catch (error) {
      console.error('Error al cambiar estado de la publicación:', error)
      alert(getCatalogErrorMessage(error, 'No se pudo actualizar la publicación'))
    }
  }

  function handleCrearPublicacion() {
    onOpenPublish?.()
  }

  const handleEditarPublicacion = useCallback(async (pub) => {
    if (!pub?.id) return

    setLoadingEditProduct(true)
    setEditModalVisible(true)
    setPublicacionEnEdicion(null)

    try {
      const product = await getCatalogProduct(pub.id)

      if (!product) {
        throw new Error('No se pudo obtener el detalle del producto')
      }

      setPublicacionEnEdicion(product)
    } catch (error) {
      console.error('Error al cargar la publicación para editar:', error)
      alert(getCatalogErrorMessage(error, 'No se pudo cargar la publicación'))
      setEditModalVisible(false)
    } finally {
      setLoadingEditProduct(false)
    }
  }, [])

  useEffect(() => {
    if (!initialOpenEdit || !initialProductId) {
      return
    }

    if (loadingPublicaciones || publicaciones.length === 0) {
      return
    }

    const autoOpenKey = `${sellerId}-${initialProductId}-${refreshKey ?? 'base'}`
    if (alreadyAutoOpenedRef.current === autoOpenKey) {
      return
    }

    const publicacionObjetivo = publicaciones.find(
      (pub) => String(pub.id) === String(initialProductId)
    )

    if (!publicacionObjetivo) {
      return
    }

    alreadyAutoOpenedRef.current = autoOpenKey
    handleEditarPublicacion(publicacionObjetivo)
  }, [
    handleEditarPublicacion,
    initialOpenEdit,
    initialProductId,
    loadingPublicaciones,
    publicaciones,
    refreshKey,
    sellerId,
  ])

  function handleCloseModal() {
    setEditModalVisible(false)
    setPublicacionEnEdicion(null)
    setLoadingEditProduct(false)
  }

  async function handleSaveChanges(productoActualizado) {
    if (!productoActualizado?.id) {
      handleCloseModal()
      return
    }

    try {
      const updatedProduct = await updateSellerProduct({
        productId: productoActualizado.id,
        name: productoActualizado.name ?? productoActualizado.titulo,
        description:
          productoActualizado.description ?? productoActualizado.descripcion,
        price: productoActualizado.price ?? productoActualizado.precio,
        stock: productoActualizado.stock,
        category:
          productoActualizado.categorySlug ?? productoActualizado.categoria,
        images: productoActualizado.images,
      })

      if (!updatedProduct) {
        handleCloseModal()
        return
      }

      setPublicaciones((prev) =>
        prev.map((p) =>
          p.id === updatedProduct.id
            ? {
                ...p,
                titulo: updatedProduct.name ?? p.titulo,
                precio:
                  updatedProduct.price !== undefined
                    ? Number(updatedProduct.price) || 0
                    : p.precio,
                stock:
                  updatedProduct.stock !== undefined
                    ? Number(updatedProduct.stock) || 0
                    : p.stock,
                imagen: updatedProduct.images?.[0] || p.imagen,
                images: updatedProduct.images ?? p.images,
                categoria:
                  updatedProduct.categorySlug ??
                  updatedProduct.category ??
                  p.categoria,
                descripcion:
                  updatedProduct.description ?? p.descripcion,
                estado:
                  updatedProduct.status === 'disabled'
                    ? 'inactiva'
                    : 'activa',
              }
            : p
        )
      )

      handleCloseModal()
    } catch (error) {
      console.error('Error al editar la publicación:', {
        message: error?.message,
        status: error?.status,
        data: error?.data,
      })
      alert(
        getCatalogErrorMessage(
          error,
          error?.data?.detail || 'No se pudo guardar la edición'
        )
      )
    }
  }

  async function handleUpdateStock(id, nuevoStock) {
    const pub = publicaciones.find((p) => p.id === id)
    if (!pub) return

    try {
      const updatedProduct = await updateSellerProductStock({
        productId: id,
        stock: nuevoStock,
      })

      if (!updatedProduct) return
      let finalProduct = updatedProduct
      setPublicaciones((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                stock: Number(finalProduct.stock) || 0,
                precio: Number(finalProduct.price) || 0,
                titulo: finalProduct.name,
                imagen: finalProduct.images?.[0] || p.imagen,
                estado:
                  finalProduct.status === 'disabled'
                    ? 'inactiva'
                    : 'activa',
              }
            : p
        )
      )
    } catch (error) {
      console.error('Error al actualizar stock de la publicación:', error)
      alert(getCatalogErrorMessage(error, 'No se pudo actualizar el stock'))
    }
  }

  const publicacionesFiltradas = useMemo(() => {
    return publicaciones.filter((p) => {
      const coincideBusqueda = p.titulo.toLowerCase().includes(busqueda.toLowerCase())
      const coincideFiltro = filtrosActivos.includes(p.estado)
      return coincideBusqueda && coincideFiltro
    })
  }, [busqueda, filtrosActivos, publicaciones])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Gestión de publicaciones</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.btnPedidos} onPress={handleOpenPedidos}>
            <Text style={styles.btnPedidosText}>📦 Pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPublicar} onPress={handleCrearPublicacion}>
            <Text style={styles.btnPublicarText}>+ Publicar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título de publicación..."
            value={busqueda}
            onChangeText={setBusqueda}
            placeholderTextColor={COLORS.textMuted}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtrosRow}>
          {FILTROS.map((filtro) => {
            const activo = filtrosActivos.includes(filtro)
            return (
              <TouchableOpacity
                key={filtro}
                style={[styles.chip, activo && styles.chipActivo]}
                onPress={() => toggleFiltro(filtro)}
              >
                <Text style={[styles.chipText, activo && styles.chipTextoActivo]}>
                  {filtro.charAt(0).toUpperCase() + filtro.slice(1)}
                  {activo ? '  ✕' : ''}
                </Text>
              </TouchableOpacity>
            )
          })}
          <Text style={styles.conteo}>
            {publicacionesFiltradas.length} publicación
            {publicacionesFiltradas.length !== 1 ? 'es' : ''}
          </Text>
        </View>
      </View>

      {publicacionesError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{publicacionesError}</Text>
          <TouchableOpacity onPress={loadPublicaciones}>
            <Text style={styles.errorBannerAction}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loadingPublicaciones ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primaryLight} />
          <Text style={styles.emptyTitulo}>Cargando tus publicaciones...</Text>
          <Text style={styles.emptySubtitulo}>
            Estamos trayendo la información del catálogo real.
          </Text>
        </View>
      ) : publicacionesFiltradas.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitulo}>
            {busqueda.length > 0
              ? 'No encontramos publicaciones con ese nombre.'
              : 'Todavía no tenés publicaciones.'}
          </Text>
          <Text style={styles.emptySubtitulo}>
            {busqueda.length > 0
              ? 'Probá con otro término de búsqueda.'
              : 'Podés crear una y empezar a vender cuando quieras.'}
          </Text>
          {busqueda.length === 0 && (
            <TouchableOpacity style={styles.btnCrearEmpty} onPress={handleCrearPublicacion}>
              <Text style={styles.btnCrearEmptyText}>Publicar ahora</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.lista}>
            <View style={styles.filaHeader}>
              <Text style={[styles.colHeader, styles.colPublicacion]}>Publicación</Text>
              <Text style={[styles.colHeader, styles.alignRight, styles.colPrecio]}>Precio</Text>
              <Text style={[styles.colHeader, styles.alignCenter, styles.colStock]}>Stock</Text>
              <Text style={[styles.colHeader, styles.alignCenter, styles.colVendidos]}>Vendidos</Text>
              <Text style={[styles.colHeader, styles.alignCenter, styles.colEstado]}>Estado</Text>
              <Text style={[styles.colHeader, styles.alignCenter, styles.colVisible]}>Visible</Text>
              <Text style={[styles.colHeader, styles.alignCenter, styles.colAcciones]}>Acciones</Text>
            </View>

            {publicacionesFiltradas.map((pub, idx) => (
              <View
                key={pub.id}
                style={[styles.fila, idx % 2 === 0 && styles.filaAlterna]}
              >
                <View style={[styles.colTitulo, styles.colPublicacion]}>
                  {isRemoteImage(pub.imagen) ? (
                    <Image source={{ uri: pub.imagen }} style={styles.pubImage} />
                  ) : (
                    <Text style={styles.pubEmoji}>{pub.imagen}</Text>
                  )}
                  <Text style={styles.pubTitulo} numberOfLines={2}>
                    {pub.titulo}
                  </Text>
                </View>

                <Text style={[styles.colText, styles.precioText, styles.alignRight, styles.colPrecio]}>
                  ${pub.precio.toLocaleString('es-AR')}
                </Text>

                <View style={[styles.stockCell, styles.colStock]}>
                  <EditableStockStepper
                    value={pub.stock}
                    onChange={(nuevoStock) => handleUpdateStock(pub.id, nuevoStock)}
                  />
                </View>

                <Text style={[styles.colText, styles.alignCenter, styles.colVendidos]}>
                  {pub.vendidos}
                </Text>

                <View style={[styles.estadoCell, styles.colEstado]}>
                  <View
                    style={[
                      styles.estadoBadge,
                      pub.estado === 'activa' ? styles.estadoActiva : styles.estadoInactiva,
                    ]}
                  >
                    <Text
                      style={[
                        styles.estadoText,
                        pub.estado === 'activa'
                          ? styles.estadoTextActiva
                          : styles.estadoTextInactiva,
                      ]}
                    >
                      {pub.estado.charAt(0).toUpperCase() + pub.estado.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.switchCell, styles.colVisible]}>
                  <StateSwitch
                    value={pub.estado === 'activa'}
                    onToggle={() => handleTogglePublicacion(pub.id)}
                  />
                </View>

                <View style={[styles.actionsCell, styles.colAcciones]}>
                  <TouchableOpacity
                    style={styles.btnEditar}
                    onPress={() => handleEditarPublicacion(pub)}
                  >
                    <Text style={styles.btnEditarText}>Editar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <EditProductModal
        visible={editModalVisible}
        product={publicacionEnEdicion}
        loading={loadingEditProduct}
        onClose={handleCloseModal}
        onSave={handleSaveChanges}
      />

      {/* Modal de pedidos recibidos */}
      <Modal
        visible={pedidosModalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleClosePedidos}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pedidosModal}>
            {/* Header del modal */}
            <View style={styles.pedidosModalHeader}>
              <Text style={styles.pedidosModalTitulo}>Pedidos recibidos</Text>
              <TouchableOpacity onPress={handleClosePedidos} style={styles.pedidosCloseBtn}>
                <Text style={styles.pedidosCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingPedidos ? (
              <View style={styles.pedidosCentered}>
                <ActivityIndicator size="large" color={COLORS.primaryLight} />
                <Text style={styles.pedidosSubtitulo}>Cargando pedidos...</Text>
              </View>
            ) : pedidosError ? (
              <View style={styles.pedidosCentered}>
                <Text style={styles.pedidosError}>{pedidosError}</Text>
                <TouchableOpacity style={styles.btnReintentar} onPress={loadPedidos}>
                  <Text style={styles.btnReintentarText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : pedidos.length === 0 ? (
              <View style={styles.pedidosCentered}>
                <Text style={styles.pedidosEmptyIcon}>🛒</Text>
                <Text style={styles.pedidosTituloVacio}>Sin pedidos todavía</Text>
                <Text style={styles.pedidosSubtitulo}>
                  Aquí verás los pedidos confirmados de tus compradores.
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.pedidosList}
                contentContainerStyle={styles.pedidosListContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.pedidosConteo}>
                  {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} confirmado{pedidos.length !== 1 ? 's' : ''}
                </Text>

                {pedidos.map((pedido) => {
                  const buyerName = buyerNames[pedido.buyer_id] || 'Cargando...'
                  const fecha = new Date(pedido.created_at).toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })
                  return (
                    <View key={String(pedido.order_id)} style={styles.pedidoCard}>
                      {/* Fecha y subtotal del vendedor */}
                      <View style={styles.pedidoCardHeader}>
                        <Text style={styles.pedidoFecha}>{fecha}</Text>
                        <Text style={styles.pedidoSubtotal}>
                          ${Number(pedido.seller_subtotal).toLocaleString('es-AR')}
                        </Text>
                      </View>

                      {/* Comprador */}
                      <View style={styles.pedidoRow}>
                        <Text style={styles.pedidoLabel}>Comprador</Text>
                        <Text style={styles.pedidoValue}>{buyerName}</Text>
                      </View>

                      {/* Dirección de entrega */}
                      <View style={styles.pedidoRow}>
                        <Text style={styles.pedidoLabel}>Dirección</Text>
                        <Text style={styles.pedidoValue}>
                          {formatDeliveryAddress(pedido.delivery_address)}
                        </Text>
                      </View>

                      {/* Productos comprados */}
                      <View style={styles.pedidoProductosContainer}>
                        <Text style={styles.pedidoLabel}>Productos</Text>
                        {pedido.items.map((item, idx) => (
                          <View key={idx} style={styles.pedidoProductoRow}>
                            <Text style={styles.pedidoProductoName} numberOfLines={2}>
                              {item.product_name || item.product_id}
                            </Text>
                            <Text style={styles.pedidoProductoQty}>
                              x{item.quantity}
                            </Text>
                            <Text style={styles.pedidoProductoSubtotal}>
                              ${Number(item.subtotal).toLocaleString('es-AR')}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  titulo: {
    fontSize: FONT.large,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  btnPublicar: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
  },

  btnPublicarText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT.medium,
  },

  btnPedidos: {
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },

  btnPedidosText: {
    color: COLORS.primaryLight,
    fontWeight: '700',
    fontSize: FONT.medium,
  },

  toolbar: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: SPACING.sm,
  },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
  },

  searchIcon: {
    fontSize: FONT.small,
    color: COLORS.textMuted,
  },

  searchInput: {
    flex: 1,
    fontSize: FONT.small,
    color: COLORS.textPrimary,
    outlineStyle: 'none',
  },

  clearSearch: {
    fontSize: FONT.small,
    color: COLORS.textMuted,
    paddingHorizontal: 4,
  },

  filtrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },

  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
  },

  chipActivo: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.promoLight,
  },

  chipText: {
    fontSize: FONT.small,
    color: COLORS.textSecondary,
  },

  chipTextoActivo: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  conteo: {
    marginLeft: 'auto',
    fontSize: FONT.small,
    color: COLORS.textSecondary,
  },

  errorBanner: {
    backgroundColor: '#FFF7ED',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
  },

  errorBannerText: {
    flex: 1,
    fontSize: FONT.small,
    color: COLORS.dark,
  },

  errorBannerAction: {
    color: COLORS.secondary,
    fontWeight: '700',
  },

  lista: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: SPACING.md,
  },

  filaHeader: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.background,
  },

  colHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },

  filaAlterna: {
    backgroundColor: '#FAFCFC',
  },

  colTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  pubEmoji: {
    fontSize: 24,
  },

  pubImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.imagePlaceholder,
  },

  pubTitulo: {
    fontSize: FONT.small,
    color: COLORS.textPrimary,
    flex: 1,
    flexShrink: 1,
  },

  colText: {
    fontSize: FONT.small,
    color: COLORS.textSecondary,
  },

  precioText: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  estadoCell: {
    alignItems: 'center',
  },

  estadoBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  estadoActiva: {
    backgroundColor: COLORS.promoLight,
  },

  estadoInactiva: {
    backgroundColor: COLORS.background,
  },

  estadoText: {
    fontSize: 12,
    fontWeight: '600',
  },

  estadoTextActiva: {
    color: COLORS.success,
  },

  estadoTextInactiva: {
    color: COLORS.textSecondary,
  },

  switchCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionsCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnEditar: {
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  btnEditarText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },

  switchTrack: {
    width: 46,
    height: 24,
    borderRadius: 999,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },

  switchTrackOn: {
    backgroundColor: COLORS.secondary,
  },

  switchTrackOff: {
    backgroundColor: '#D9D9D9',
  },

  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },

  switchThumbOn: {
    alignSelf: 'flex-end',
  },

  switchThumbOff: {
    alignSelf: 'flex-start',
  },

  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 60,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: SPACING.md,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },

  emptyTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },

  emptySubtitulo: {
    fontSize: FONT.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  btnCrearEmpty: {
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 28,
    backgroundColor: COLORS.white,
  },

  btnCrearEmptyText: {
    color: COLORS.primaryLight,
    fontWeight: '600',
    fontSize: FONT.small,
  },

  alignRight: {
    textAlign: 'right',
  },

  alignCenter: {
    textAlign: 'center',
  },

  stockCell: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
  },

  // ── Modal de pedidos ─────────────────────────────────────────────────────────

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },

  pedidosModal: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    width: '100%',
    maxWidth: 600,
    maxHeight: '85%',
    overflow: 'hidden',
  },

  pedidosModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },

  pedidosModalTitulo: {
    fontSize: FONT.large,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  pedidosCloseBtn: {
    padding: SPACING.sm,
  },

  pedidosCloseBtnText: {
    fontSize: FONT.medium,
    color: COLORS.textMuted,
  },

  pedidosCentered: {
    padding: SPACING.xl ?? 40,
    alignItems: 'center',
    gap: SPACING.md,
  },

  pedidosEmptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },

  pedidosTituloVacio: {
    fontSize: FONT.medium,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  pedidosSubtitulo: {
    fontSize: FONT.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  pedidosError: {
    fontSize: FONT.small,
    color: '#C0392B',
    textAlign: 'center',
  },

  btnReintentar: {
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },

  btnReintentarText: {
    color: COLORS.primaryLight,
    fontWeight: '600',
    fontSize: FONT.small,
  },

  pedidosList: {
    flex: 1,
  },

  pedidosListContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },

  pedidosConteo: {
    fontSize: FONT.small,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },

  pedidoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: SPACING.sm,
  },

  pedidoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs ?? 4,
  },

  pedidoFecha: {
    fontSize: FONT.small,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  pedidoSubtotal: {
    fontSize: FONT.medium,
    fontWeight: '700',
    color: COLORS.primary,
  },

  pedidoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },

  pedidoLabel: {
    fontSize: FONT.small,
    fontWeight: '700',
    color: COLORS.textSecondary,
    minWidth: 80,
  },

  pedidoValue: {
    fontSize: FONT.small,
    color: COLORS.textPrimary,
    flex: 1,
    flexShrink: 1,
  },

  pedidoProductosContainer: {
    gap: 4,
  },

  pedidoProductoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingLeft: 80,
  },

  pedidoProductoName: {
    flex: 1,
    fontSize: FONT.small,
    color: COLORS.textPrimary,
  },

  pedidoProductoQty: {
    fontSize: FONT.small,
    color: COLORS.textMuted,
    minWidth: 28,
    textAlign: 'right',
  },

  pedidoProductoSubtotal: {
    fontSize: FONT.small,
    fontWeight: '600',
    color: COLORS.textPrimary,
    minWidth: 70,
    textAlign: 'right',
  },

  // ── Column widths for horizontal-scroll table ─────────────────────────────
  colPublicacion: { width: 180 },
  colPrecio:      { width: 100 },
  colStock:       { width: 90 },
  colVendidos:    { width: 80 },
  colEstado:      { width: 90 },
  colVisible:     { width: 80 },
  colAcciones:    { width: 90 },
})