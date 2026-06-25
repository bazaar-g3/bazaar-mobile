import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../../theme/ThemeContext'
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native'
import { useReduceMotion } from '../../utils/useReduceMotion'

import {
  getCatalogErrorMessage,
  getCatalogProduct,
  isRemoteImage,
  listSellerProducts,
  mapCatalogProductToVentasItem,
  updateSellerProductStatus,
  updateSellerProductStock,
  updateSellerProduct,
} from '../../services/catalog'
import { makeStyles } from '../../styles/profile/PublicacionesTabStyles'
import EditProductModal from '../EditProductModal'
import EditableStockStepper from '../EditableStockStepper'
import { Ionicons } from '@expo/vector-icons'

const FILTROS = ['activa', 'inactiva']
const MOBILE_BREAKPOINT = 768
const SWITCH_THUMB_TRAVEL = 22

function StateSwitch({ value, onToggle, styles }) {
  const reduceMotion = useReduceMotion()
  const x = useRef(new Animated.Value(value ? SWITCH_THUMB_TRAVEL : 0)).current

  useEffect(() => {
    const to = value ? SWITCH_THUMB_TRAVEL : 0
    if (reduceMotion) {
      x.setValue(to)
      return
    }
    Animated.spring(x, { toValue: to, useNativeDriver: true, speed: 20, bounciness: 8 }).start()
  }, [value, reduceMotion, x])

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.switchTrack, value ? styles.switchTrackOn : styles.switchTrackOff]}
    >
      <Animated.View
        style={[styles.switchThumb, styles.switchThumbOff, { transform: [{ translateX: x }] }]}
      />
    </Pressable>
  )
}

export default function VentasTab({
  sellerId,
  refreshKey,
  onOpenPublish,
  initialProductId = null,
  initialOpenEdit = false,
}) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const { width } = useWindowDimensions()
  const isMobile = width < MOBILE_BREAKPOINT

  const [busqueda, setBusqueda] = useState('')
  const [filtrosActivos, setFiltrosActivos] = useState(['activa', 'inactiva'])
  const [publicaciones, setPublicaciones] = useState([])
  const [loadingPublicaciones, setLoadingPublicaciones] = useState(true)
  const [publicacionesError, setPublicacionesError] = useState('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [publicacionEnEdicion, setPublicacionEnEdicion] = useState(null)
  const [loadingEditProduct, setLoadingEditProduct] = useState(false)

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
        getCatalogErrorMessage(
          error,
          'No pudimos cargar tus publicaciones.'
        )
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

    if (!pub || pub.estado === 'bloqueado_admin') return

    try {
      const updatedProduct = await updateSellerProductStatus({
        productId: id,
        enabled: pub.estado !== 'activa',
      })

      if (!updatedProduct) return

      setPublicaciones((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                estado:
                  updatedProduct.status === 'disabled' ? 'inactiva' : 'activa',
                stock: Number(updatedProduct.stock) || 0,
                precio: Number(updatedProduct.price) || 0,
                titulo: updatedProduct.name,
                imagen: updatedProduct.images?.[0] || p.imagen,
              }
            : p
        )
      )
    } catch (error) {
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
      alert(getCatalogErrorMessage(error, 'No se pudo cargar la publicación'))
      setEditModalVisible(false)
    } finally {
      setLoadingEditProduct(false)
    }
  }, [])

  useEffect(() => {
    if (!initialOpenEdit || !initialProductId) return
    if (loadingPublicaciones || publicaciones.length === 0) return

    const autoOpenKey = `${sellerId}-${initialProductId}-${refreshKey ?? 'base'}`

    if (alreadyAutoOpenedRef.current === autoOpenKey) return

    const publicacionObjetivo = publicaciones.find(
      (pub) => String(pub.id) === String(initialProductId)
    )

    if (!publicacionObjetivo) return

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
        category: productoActualizado.categorySlug ?? productoActualizado.categoria,
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
                descripcion: updatedProduct.description ?? p.descripcion,
                estado:
                  updatedProduct.status === 'disabled' ? 'inactiva' : 'activa',
              }
            : p
        )
      )

      handleCloseModal()
    } catch (error) {
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

    if (!pub || pub.estado === 'bloqueado_admin') return

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
                estado:
                  updatedProduct.status === 'disabled' ? 'inactiva' : 'activa',
              }
            : p
        )
      )
    } catch (error) {
      alert(getCatalogErrorMessage(error, 'No se pudo actualizar el stock'))
    }
  }

  const publicacionesFiltradas = useMemo(() => {
    return publicaciones.filter((p) => {
      const coincideBusqueda = p.titulo
        .toLowerCase()
        .includes(busqueda.toLowerCase())

      const coincideFiltro = p.estado === 'bloqueado_admin' || filtrosActivos.includes(p.estado)

      return coincideBusqueda && coincideFiltro
    })
  }, [busqueda, filtrosActivos, publicaciones])

  function renderPublicacionCard(pub) {
    return (
      <View key={pub.id} style={styles.pubCard}>
        <View style={styles.pubCardTop}>
          <View style={styles.pubCardLeft}>
            {isRemoteImage(pub.imagen) ? (
              <Image source={{ uri: pub.imagen }} style={styles.pubCardImage} />
            ) : (
              <Text style={styles.pubEmoji}>{pub.imagen}</Text>
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.pubCardTitulo} numberOfLines={2}>
                {pub.titulo}
              </Text>
              <Text style={styles.pubCardPrecio}>
                ${pub.precio.toLocaleString('es-AR')}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.estadoBadge,
              pub.estado === 'bloqueado_admin'
                ? styles.estadoBloqueado
                : pub.estado === 'activa'
                  ? styles.estadoActiva
                  : styles.estadoInactiva,
            ]}
          >
            <Text
              style={[
                styles.estadoText,
                pub.estado === 'bloqueado_admin'
                  ? styles.estadoTextBloqueado
                  : pub.estado === 'activa'
                    ? styles.estadoTextActiva
                    : styles.estadoTextInactiva,
              ]}
            >
              {pub.estado === 'bloqueado_admin' ? 'Bloqueado' : pub.estado.charAt(0).toUpperCase() + pub.estado.slice(1)}
            </Text>
          </View>
        </View>

        {pub.estado === 'bloqueado_admin' && (
          <View style={styles.bloqueadoContainer}>
            <Ionicons name="warning-outline" style={styles.warningIcon}/>
            <Text style={styles.bloqueadoAviso}>
              El administrador deshabilitó esta publicación. No podés modificarla hasta que sea rehabilitada.
            </Text>
          </View>
        )}

        <View style={styles.pubCardStats}>
          <View style={styles.pubCardStat}>
            <Text style={styles.pubCardStatLabel}>Stock</Text>
            {pub.estado === 'bloqueado_admin' ? (
              <Text style={styles.pubCardStatValue}>{pub.stock}</Text>
            ) : (
              <EditableStockStepper
                value={pub.stock}
                onChange={(n) => handleUpdateStock(pub.id, n)}
              />
            )}
          </View>

          <View style={styles.pubCardStat}>
            <Text style={styles.pubCardStatLabel}>Vendidos</Text>
            <Text style={styles.pubCardStatValue}>{pub.vendidos}</Text>
          </View>

          <View style={styles.pubCardStat}>
            <Text style={styles.pubCardStatLabel}>Visible</Text>
            <StateSwitch
              value={pub.estado === 'activa'}
              onToggle={pub.estado === 'bloqueado_admin' ? undefined : () => handleTogglePublicacion(pub.id)}
              styles={styles}
            />
          </View>
        </View>

        {pub.estado !== 'bloqueado_admin' && (
          <TouchableOpacity
            style={styles.pubCardBtnEditar}
            onPress={() => handleEditarPublicacion(pub)}
          >
            <Text style={styles.pubCardBtnEditarText}>Editar publicación</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  function renderPublicacionRow(pub, idx) {
    return (
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

        <Text
          style={[
            styles.colText,
            styles.precioText,
            styles.alignRight,
            styles.colPrecio,
          ]}
        >
          ${pub.precio.toLocaleString('es-AR')}
        </Text>

        <View style={[styles.stockCell, styles.colStock]}>
          {pub.estado === 'bloqueado_admin' ? (
            <Text style={[styles.colText, styles.alignCenter]}>{pub.stock}</Text>
          ) : (
            <EditableStockStepper
              value={pub.stock}
              onChange={(n) => handleUpdateStock(pub.id, n)}
            />
          )}
        </View>

        <Text style={[styles.colText, styles.alignCenter, styles.colVendidos]}>
          {pub.vendidos}
        </Text>

        <View style={[styles.estadoCell, styles.colEstado]}>
          <View
            style={[
              styles.estadoBadge,
              pub.estado === 'bloqueado_admin'
                ? styles.estadoBloqueado
                : pub.estado === 'activa'
                  ? styles.estadoActiva
                  : styles.estadoInactiva,
            ]}
          >
            <Text
              style={[
                styles.estadoText,
                pub.estado === 'bloqueado_admin'
                  ? styles.estadoTextBloqueado
                  : pub.estado === 'activa'
                    ? styles.estadoTextActiva
                    : styles.estadoTextInactiva,
              ]}
            >
              {pub.estado === 'bloqueado_admin' ? 'Bloqueado' : pub.estado.charAt(0).toUpperCase() + pub.estado.slice(1)}
            </Text>
          </View>
        </View>

        <View style={[styles.switchCell, styles.colVisible]}>
          <StateSwitch
            value={pub.estado === 'activa'}
            onToggle={pub.estado === 'bloqueado_admin' ? undefined : () => handleTogglePublicacion(pub.id)}
            styles={styles}
          />
        </View>

        <View style={[styles.actionsCell, styles.colAcciones]}>
          {pub.estado !== 'bloqueado_admin' && (
            <TouchableOpacity
              style={styles.btnEditar}
              onPress={() => handleEditarPublicacion(pub)}
            >
              <Text style={styles.btnEditarText}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.titulo, isMobile && styles.tituloMobile]}>
          {isMobile ? 'Mis publicaciones' : 'Gestión de publicaciones'}
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.btnPublicar}
            onPress={handleCrearPublicacion}
          >
            <Text style={styles.btnPublicarText}>+ Publicar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={24} color={theme.color.textSecondary} style={styles.searchIcon} />

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título..."
            value={busqueda}
            onChangeText={setBusqueda}
            placeholderTextColor={theme.color.textMuted}
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
                <Text
                  style={[
                    styles.chipText,
                    activo && styles.chipTextoActivo,
                  ]}
                >
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
          <ActivityIndicator size="large" color={theme.color.accent} />
          <Text style={styles.emptyTitulo}>Cargando tus publicaciones...</Text>
        </View>
      ) : publicacionesFiltradas.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" style={styles.emptyIcon} />
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
            <TouchableOpacity
              style={styles.btnCrearEmpty}
              onPress={handleCrearPublicacion}
            >
              <Text style={styles.btnCrearEmptyText}>Publicar ahora</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : isMobile ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pubCardsList}
        >
          {publicacionesFiltradas.map(renderPublicacionCard)}
        </ScrollView>
      ) : (
        <View style={styles.lista}>
          <View style={styles.filaHeader}>
            <Text style={[styles.colHeader, styles.colPublicacion]}>
              Publicación
            </Text>
            <Text
              style={[styles.colHeader, styles.alignRight, styles.colPrecio]}
            >
              Precio
            </Text>
            <Text
              style={[styles.colHeader, styles.alignCenter, styles.colStock]}
            >
              Stock
            </Text>
            <Text
              style={[
                styles.colHeader,
                styles.alignCenter,
                styles.colVendidos,
              ]}
            >
              Vendidos
            </Text>
            <Text
              style={[styles.colHeader, styles.alignCenter, styles.colEstado]}
            >
              Estado
            </Text>
            <Text
              style={[styles.colHeader, styles.alignCenter, styles.colVisible]}
            >
              Visible
            </Text>
            <Text
              style={[styles.colHeader, styles.alignCenter, styles.colAcciones]}
            >
              Acciones
            </Text>
          </View>

          {publicacionesFiltradas.map((pub, idx) =>
            renderPublicacionRow(pub, idx)
          )}
        </View>
      )}

      <EditProductModal
        visible={editModalVisible}
        product={publicacionEnEdicion}
        loading={loadingEditProduct}
        onClose={handleCloseModal}
        onSave={handleSaveChanges}
      />
    </View>
  )
}