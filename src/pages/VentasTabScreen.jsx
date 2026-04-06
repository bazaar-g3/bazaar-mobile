import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native'
import {
  getCatalogErrorMessage,
  isRemoteImage,
  listSellerProducts,
  mapCatalogProductToVentasItem,
  updateSellerProductStatus,
  updateSellerProductStock,
} from '../services/catalog'
import { COLORS } from '../constants/colors'
import { SPACING, FONT } from '../constants/theme'
import EditProductModal from '../components/EditProductModal'
import EditableStockStepper from '../components/EditableStockStepper'

const FILTROS = ['activa', 'inactiva']

function EstadoSwitch({ value, onToggle }) {
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

export default function VentasTab({ sellerId, refreshKey, onOpenPublish }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtrosActivos, setFiltrosActivos] = useState(['activa', 'inactiva'])
  const [publicaciones, setPublicaciones] = useState([])
  const [loadingPublicaciones, setLoadingPublicaciones] = useState(true)
  const [publicacionesError, setPublicacionesError] = useState('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [publicacionEnEdicion, setPublicacionEnEdicion] = useState(null)

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

  function handleEditarPublicacion(pub) {
    setPublicacionEnEdicion(pub)
    setEditModalVisible(true)
  }

  function handleCerrarModalEdicion() {
    setEditModalVisible(false)
    setPublicacionEnEdicion(null)
  }

  function handleGuardarEdicion(productoActualizado) {
    if (!productoActualizado?.id) {
      handleCerrarModalEdicion()
      return
    }

    setPublicaciones((prev) =>
      prev.map((p) =>
        p.id === productoActualizado.id
          ? {
              ...p,
              titulo: productoActualizado.titulo ?? p.titulo,
              precio:
                productoActualizado.precio !== undefined
                  ? Number(productoActualizado.precio) || 0
                  : p.precio,
              stock:
                productoActualizado.stock !== undefined
                  ? Number(productoActualizado.stock) || 0
                  : p.stock,
              imagen: productoActualizado.imagen || p.imagen,
              categoria: productoActualizado.categoria ?? p.categoria,
              descripcion: productoActualizado.descripcion ?? p.descripcion,
            }
          : p
      )
    )

    handleCerrarModalEdicion()
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

      setPublicaciones((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                stock: Number(updatedProduct.stock) || 0,
                precio: Number(updatedProduct.price) || 0,
                titulo: updatedProduct.name,
                imagen: updatedProduct.images?.[0] || p.imagen,
                estado: updatedProduct.status === 'disabled' ? 'inactiva' : 'activa',
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
        <TouchableOpacity style={styles.btnPublicar} onPress={handleCrearPublicacion}>
          <Text style={styles.btnPublicarText}>+ Publicar</Text>
        </TouchableOpacity>
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
        <View style={styles.lista}>
          <View style={styles.filaHeader}>
            <Text style={[styles.colHeader, { flex: 4 }]}>Publicación</Text>
            <Text style={[styles.colHeader, styles.alignRight, { flex: 2 }]}>Precio</Text>
            <Text style={[styles.colHeader, styles.alignCenter, { flex: 1 }]}>Stock</Text>
            <Text style={[styles.colHeader, styles.alignCenter, { flex: 1 }]}>Vendidos</Text>
            <Text style={[styles.colHeader, styles.alignCenter, { flex: 1.2 }]}>Estado</Text>
            <Text style={[styles.colHeader, styles.alignCenter, { flex: 1.2 }]}>Visible</Text>
            <Text style={[styles.colHeader, styles.alignCenter, { flex: 1.4 }]}>Acciones</Text>
          </View>

          {publicacionesFiltradas.map((pub, idx) => (
            <View
              key={pub.id}
              style={[styles.fila, idx % 2 === 0 && styles.filaAlterna]}
            >
              <View style={[styles.colTitulo, { flex: 4 }]}>
                {isRemoteImage(pub.imagen) ? (
                  <Image source={{ uri: pub.imagen }} style={styles.pubImage} />
                ) : (
                  <Text style={styles.pubEmoji}>{pub.imagen}</Text>
                )}
                <Text style={styles.pubTitulo} numberOfLines={2}>
                  {pub.titulo}
                </Text>
              </View>

              <Text style={[styles.colText, styles.precioText, styles.alignRight, { flex: 2 }]}>
                ${pub.precio.toLocaleString('es-AR')}
              </Text>

              <View style={[styles.stockCell, { flex: 1 }]}>
                <EditableStockStepper
                  value={pub.stock}
                  onChange={(nuevoStock) => handleUpdateStock(pub.id, nuevoStock)}
                />
              </View>

              <Text style={[styles.colText, styles.alignCenter, { flex: 1 }]}>
                {pub.vendidos}
              </Text>

              <View style={[styles.estadoCell, { flex: 1.2 }]}>
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

              <View style={[styles.switchCell, { flex: 1.2 }]}>
                <EstadoSwitch
                  value={pub.estado === 'activa'}
                  onToggle={() => handleTogglePublicacion(pub.id)}
                />
              </View>

              <View style={[styles.actionsCell, { flex: 1.4 }]}>
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
      )}

      <View style={styles.aviso}>
        <Text style={styles.avisoText}>
          Las publicaciones se cargan desde el catálogo real. La edición y la baja
          quedarán para una próxima etapa.
        </Text>
      </View>

      <EditProductModal
        visible={editModalVisible}
        product={publicacionEnEdicion}
        onClose={handleCerrarModalEdicion}
        onSave={handleGuardarEdicion}
      />
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

  aviso: {
    backgroundColor: '#FFF9E8',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },

  avisoText: {
    fontSize: FONT.small,
    color: COLORS.dark,
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
})