import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router'
import { getOrders, getOrderById, confirmDelivery, cancelOrder, getCancelErrorMessage } from '../services/orders'
import { createSellerReview, createProductReview } from '../services/reviews'
import { getPublicProfile } from '../services/user'
import { getSessionStatus } from '../services/session'
import { buildLoginRedirect } from '../utils/authRedirect'
import { useResponsive } from '../utils/responsive'
import { useTheme } from '../theme/ThemeContext'
import { FONT, SPACING } from '../constants/theme'
import AnimatedPressable from '../components/AnimatedPressable'
import { makeStyles } from '../styles/ordersStyles'

const STATUS_CONFIG = {
  pending_payment:    { label: 'Pago pendiente',      icon: 'time-outline' },
  confirmed:          { label: 'Confirmada',           icon: 'checkmark-circle-outline' },
  in_preparation:     { label: 'En preparación',       icon: 'construct-outline' },
  shipped:            { label: 'Enviada',              icon: 'bicycle-outline' },
  delivered:          { label: 'Entregada',            icon: 'home-outline' },
  payment_rejected:   { label: 'Pago rechazado',       icon: 'close-circle-outline' },
  cancelled:          { label: 'Cancelada',            icon: 'ban-outline' },
  refund_in_progress: { label: 'Reembolso en proceso', icon: 'refresh-outline' },
  refund_processed:   { label: 'Reembolso procesado',  icon: 'wallet-outline' },
}

const FILTERS = [
  { key: null,               label: 'Todas' },
  { key: 'pending_payment',  label: 'Pendiente' },
  { key: 'confirmed',        label: 'Confirmada' },
  { key: 'in_preparation',   label: 'Preparación' },
  { key: 'shipped',          label: 'Enviada' },
  { key: 'delivered',        label: 'Entregada' },
  { key: 'payment_rejected', label: 'Rechazada' },
  { key: 'cancelled',        label: 'Cancelada' },
]

// El chip "Cancelada" agrupa la cancelación con sus estados de reembolso:
// una orden reembolsada sigue siendo una orden cancelada.
const CANCELLED_GROUP = ['cancelled', 'refund_in_progress', 'refund_processed']

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDeliveryAddress(addr) {
  if (!addr) return ''
  if (typeof addr === 'string') return addr
  const { calle, altura, departamento, zona, codigo_postal } = addr
  let line = `${calle ?? ''} ${altura ?? ''}`.trim()
  if (departamento) line += `, Dpto. ${departamento}`
  if (zona) line += `, ${zona}`
  if (codigo_postal) line += ` (CP ${codigo_postal})`
  return line
}

function StatusBadge({ status, small = false, theme, styles }) {
  const config = STATUS_CONFIG[status] ?? { label: status }
  const palette = theme.orderStatusColor[status] ?? { bg: theme.color.surfaceSubtle, dot: theme.color.textMuted }
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }, small && styles.badgeSmall]}>
      <View style={[styles.badgeDot, { backgroundColor: palette.dot }]} />
      <Text style={[styles.badgeText, small && styles.badgeTextSmall]}>{config.label}</Text>
    </View>
  )
}

function StarPicker({ score, onSelect, disabled, theme, styles }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !disabled && onSelect(star)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={[styles.starPickerItem, { color: star <= (score ?? 0) ? theme.color.like : theme.color.border }]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

function _initReviewEntry() {
  return { score: null, comment: '', submitting: false, done: false, alreadyReviewed: false, error: null }
}

export default function OrdersScreen() {
  const router = useRouter()
  const { orderId } = useLocalSearchParams()
  const { isSmall, isTablet } = useResponsive()
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])
  const [checkingSession, setCheckingSession] = useState(true)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [confirmingDelivery, setConfirmingDelivery] = useState(false)
  const [confirmDeliveryError, setConfirmDeliveryError] = useState(null)
  const [sellerReviews, setSellerReviews] = useState({})
  const [productReviews, setProductReviews] = useState({})
  const [sellerNames, setSellerNames] = useState({})
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function ensureAuth() {
      const session = await getSessionStatus()
      if (!session.isAuthenticated) {
        router.replace(buildLoginRedirect({ redirectPath: '/orders' }))
        return
      }
      if (!cancelled) setCheckingSession(false)
    }
    ensureAuth()
    return () => { cancelled = true }
  }, [router])

  // CA3: si llegamos desde una notificación push con orderId, auto-abrir el detalle
  useEffect(() => {
    if (!orderId || checkingSession) return
    async function openOrderFromNotification() {
      try {
        setDetailLoading(true)
        setDetailError(null)
        const detail = await getOrderById(orderId)
        setSelectedOrder(detail)
      } catch (e) {
        setDetailError(e)
      } finally {
        setDetailLoading(false)
      }
    }
    openOrderFromNotification()
  }, [orderId, checkingSession])

  const loadOrders = useCallback(async (statusFilter) => {
    setLoading(true)
    setError(null)
    try {
      // El backend filtra por un único estado exacto. Para que "Cancelada"
      // incluya también los reembolsos, traemos todas y filtramos en el cliente.
      if (statusFilter === 'cancelled') {
        const data = await getOrders(null)
        const list = Array.isArray(data) ? data : (data.results ?? data.items ?? [])
        setOrders(list.filter((o) => CANCELLED_GROUP.includes(o.status)))
      } else {
        const data = await getOrders(statusFilter)
        setOrders(Array.isArray(data) ? data : (data.results ?? data.items ?? []))
      }
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!checkingSession) loadOrders(activeFilter)
  }, [checkingSession, activeFilter, loadOrders])

  useFocusEffect(
    useCallback(() => {
      if (!checkingSession) loadOrders(activeFilter)
    }, [checkingSession, activeFilter, loadOrders])
  )

  async function handleOrderPress(order) {
    setSelectedOrder(order)
    setDetailLoading(true)
    setDetailError(null)
    setSellerReviews({})
    setProductReviews({})
    try {
      const detail = await getOrderById(order.id)
      setSelectedOrder(detail)
      if (detail.status === 'delivered') {
        const uniqueSellerIds = [
          ...new Set((detail.fulfillments?.map((f) => f.seller_id) ?? []).filter(Boolean)),
        ]
        const initSellers = {}
        uniqueSellerIds.forEach((sid) => { initSellers[sid] = _initReviewEntry() })
        setSellerReviews(initSellers)

        const initProducts = {}
        ;(detail.items ?? []).forEach((item) => {
          initProducts[String(item.product_id)] = _initReviewEntry()
        })
        setProductReviews(initProducts)

        const profiles = await Promise.all(uniqueSellerIds.map((sid) => getPublicProfile(sid)))
        const names = {}
        uniqueSellerIds.forEach((sid, i) => {
          names[sid] = profiles[i]?.fullName ?? `Vendedor #${sid}`
        })
        setSellerNames(names)
      } else if (Array.isArray(detail.fulfillments) && detail.fulfillments.length > 0) {
        const uniqueSellerIds = [...new Set(detail.fulfillments.map(f => f.seller_id).filter(Boolean))]
        const profiles = await Promise.all(uniqueSellerIds.map((sid) => getPublicProfile(sid)))
        const names = {}
        uniqueSellerIds.forEach((sid, i) => {
          names[sid] = profiles[i]?.fullName ?? `Vendedor #${sid}`
        })
        setSellerNames(names)
      }
    } catch (e) {
      setDetailError(e)
    } finally {
      setDetailLoading(false)
    }
  }

  function closeDetail() {
    setSelectedOrder(null)
    setDetailError(null)
  }

  // Ahora recibe el sellerId del paquete específico que se está confirmando
  async function handleConfirmDelivery(sellerId) {
    if (!selectedOrder || !sellerId) return
    setConfirmingDelivery(true)
    setConfirmDeliveryError(null)
    try {
      await confirmDelivery(selectedOrder.id, sellerId)
      const freshDetail = await getOrderById(selectedOrder.id)
      setSelectedOrder(freshDetail)
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: freshDetail.status } : o))
      )
      // Inicializar estados de review ahora que la orden está entregada
      const currentOrder = selectedOrder
      const uniqueSellerIds = [
        ...new Set((currentOrder.fulfillments?.map((f) => f.seller_id) ?? []).filter(Boolean)),
      ]
      const initSellers = {}
      uniqueSellerIds.forEach((sid) => { initSellers[sid] = _initReviewEntry() })
      setSellerReviews(initSellers)
      const initProducts = {}
      ;(currentOrder.items ?? []).forEach((item) => {
        initProducts[String(item.product_id)] = _initReviewEntry()
      })
      setProductReviews(initProducts)
      const profiles = await Promise.all(uniqueSellerIds.map((sid) => getPublicProfile(sid)))
      const names = {}
      uniqueSellerIds.forEach((sid, i) => {
        names[sid] = profiles[i]?.fullName ?? `Vendedor #${sid}`
      })
      setSellerNames(names)
    } catch (e) {
      const detail = e?.response?.data?.detail
      setConfirmDeliveryError(
        typeof detail === 'string' ? detail : 'No se pudo confirmar la entrega. Intentá de nuevo.'
      )
    } finally {
      setConfirmingDelivery(false)
    }
  }

  async function handleSubmitSellerReview(sellerId) {
    const entry = sellerReviews[sellerId]
    if (!entry?.score || !selectedOrder) return
    setSellerReviews((prev) => ({ ...prev, [sellerId]: { ...prev[sellerId], submitting: true, error: null } }))
    try {
      await createSellerReview(selectedOrder.id, { sellerId, score: entry.score, comment: entry.comment || null })
      setSellerReviews((prev) => ({ ...prev, [sellerId]: { ...prev[sellerId], submitting: false, done: true } }))
    } catch (e) {
      const status = e?.response?.status
      if (status === 409) {
        setSellerReviews((prev) => ({ ...prev, [sellerId]: { ...prev[sellerId], submitting: false, alreadyReviewed: true } }))
      } else {
        const detail = e?.response?.data?.detail
        setSellerReviews((prev) => ({
          ...prev,
          [sellerId]: {
            ...prev[sellerId],
            submitting: false,
            error: typeof detail === 'string' ? detail : 'No se pudo enviar la calificación.',
          },
        }))
      }
    }
  }

  async function handleSubmitProductReview(productId) {
    const entry = productReviews[productId]
    if (!entry?.score || !selectedOrder) return
    setProductReviews((prev) => ({ ...prev, [productId]: { ...prev[productId], submitting: true, error: null } }))
    try {
      await createProductReview(selectedOrder.id, { productId, score: entry.score, comment: entry.comment || null })
      setProductReviews((prev) => ({ ...prev, [productId]: { ...prev[productId], submitting: false, done: true } }))
    } catch (e) {
      const status = e?.response?.status
      if (status === 409) {
        setProductReviews((prev) => ({ ...prev, [productId]: { ...prev[productId], submitting: false, alreadyReviewed: true } }))
      } else {
        const detail = e?.response?.data?.detail
        setProductReviews((prev) => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            submitting: false,
            error: typeof detail === 'string' ? detail : 'No se pudo enviar la calificación.',
          },
        }))
      }
    }
  }

  // Refetch automático mientras el reembolso está procesándose
  useEffect(() => {
    if (selectedOrder?.status !== 'refund_in_progress') return
    const interval = setInterval(async () => {
      try {
        const fresh = await getOrderById(selectedOrder.id)
        setSelectedOrder(fresh)
        if (fresh.status !== 'refund_in_progress') {
          setOrders((prev) => prev.map((o) => (o.id === fresh.id ? { ...o, status: fresh.status } : o)))
        }
      } catch (_) { /* silenciar errores de polling */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [selectedOrder?.id, selectedOrder?.status])

  const BUYER_CANCELLABLE = ['confirmed', 'in_preparation']

  async function handleCancelOrder() {
    if (!selectedOrder) return
    setCancelling(true)
    setCancelError(null)
    try {
      const result = await cancelOrder(selectedOrder.id, { reason: cancelReason || undefined })
      const fresh = await getOrderById(selectedOrder.id)
      setSelectedOrder(fresh)
      setOrders((prev) => prev.map((o) => (o.id === fresh.id ? { ...o, status: fresh.status } : o)))
      setCancelModalVisible(false)
      setCancelReason('')
    } catch (e) {
      setCancelError(getCancelErrorMessage(e))
    } finally {
      setCancelling(false)
    }
  }

  if (checkingSession) {
    return (
      <SafeAreaView style={styles.fullCenter}>
        <ActivityIndicator size="large" color={theme.color.accent} />
      </SafeAreaView>
    )
  }

  const hPad = isSmall ? SPACING.md : SPACING.lg

  const renderOrder = ({ item }) => {
    const isRejected = item.status === 'payment_rejected'
    return (
      <TouchableOpacity
        style={[styles.orderCard, isRejected && styles.orderCardRejected]}
        onPress={() => handleOrderPress(item)}
        activeOpacity={0.75}
      >
        <View style={styles.orderCardTop}>
          <StatusBadge status={item.status} small theme={theme} styles={styles} />
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={styles.orderId} numberOfLines={1}>
          #{String(item.id).slice(0, 8).toUpperCase()}
        </Text>
        <View style={styles.orderCardBottom}>
          <Text style={styles.orderTotal}>${Number(item.total).toFixed(2)}</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.color.textMuted} />
        </View>

        {isRejected && (
          <View style={styles.orderCardRejectedHint}>
            <Ionicons name="alert-circle-outline" size={13} color={theme.color.error} />
            <Text style={styles.orderCardRejectedHintText}>
              Tocá para reintentar la compra
            </Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.header, { paddingHorizontal: hPad }]}>
        <Text style={[styles.title, { fontSize: isSmall ? FONT.large : 26 }]}>
          Mis órdenes
        </Text>
        {loading && orders.length > 0 && (
          <ActivityIndicator size="small" color={theme.color.accent} />
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={[styles.filterContent, { paddingHorizontal: hPad }]}
        bounces={false}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key
          const cfg = f.key ? STATUS_CONFIG[f.key] : null
          return (
            <TouchableOpacity
              key={String(f.key)}
              style={[
                styles.filterChip,
                isActive && { backgroundColor: theme.color.surfaceInverse, borderColor: theme.color.surfaceInverse },
              ]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <View style={[styles.listContainer, isTablet && styles.listContainerTablet]}>
        {loading && orders.length === 0 ? (
          <View style={styles.fullCenter}>
            <ActivityIndicator size="large" color={theme.color.accent} />
          </View>
        ) : error && orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-offline-outline" size={52} color={theme.color.textMuted} />
            <Text style={styles.emptyTitle}>Sin conexión</Text>
            <Text style={styles.emptyText}>No pudimos cargar tus órdenes.</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => loadOrders(activeFilter)}>
              <Text style={styles.actionButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={52} color={theme.color.textMuted} />
            <Text style={styles.emptyTitle}>
              {activeFilter ? 'Sin resultados' : 'Sin órdenes'}
            </Text>
            <Text style={styles.emptyText}>
              {activeFilter
                ? 'No tenés órdenes con ese estado.'
                : 'Todavía no realizaste ninguna compra.'}
            </Text>
            {!activeFilter && (
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/home')}>
                <Text style={styles.actionButtonText}>Ir al catálogo</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderOrder}
            contentContainerStyle={[styles.listContent, { paddingHorizontal: hPad }]}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={() => loadOrders(activeFilter)}
          />
        )}
      </View>

      <Modal
        visible={selectedOrder !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeDetail}
      >
        <SafeAreaView style={styles.screen}>
          {/* MODAL DE CONFIRMACIÓN DE CANCELACIÓN — dentro del detalle para quedar encima */}
          <Modal
            visible={cancelModalVisible}
            animationType="fade"
            transparent
            onRequestClose={() => !cancelling && setCancelModalVisible(false)}
          >
            <View style={styles.cancelOverlay}>
              <View style={styles.cancelDialog}>
                <Text style={styles.cancelDialogTitle}>¿Cancelar esta orden?</Text>
                <Text style={styles.cancelDialogText}>
                  Se restaurará el stock. Si tenés pago aprobado, se iniciará un reembolso automáticamente.
                </Text>
                <TextInput
                  style={styles.cancelReasonInput}
                  placeholder="Motivo (opcional)"
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  editable={!cancelling}
                  maxLength={200}
                />
                {cancelError ? (
                  <Text style={styles.cancelErrorText}>{cancelError}</Text>
                ) : null}
                <View style={styles.cancelDialogBtns}>
                  <AnimatedPressable
                    style={styles.cancelDialogBtnSecondary}
                    onPress={() => setCancelModalVisible(false)}
                    disabled={cancelling}
                  >
                    <Text style={styles.cancelDialogBtnSecondaryText}>Volver</Text>
                  </AnimatedPressable>
                  <AnimatedPressable
                    style={[styles.cancelDialogBtnPrimary, cancelling && { opacity: 0.6 }]}
                    onPress={handleCancelOrder}
                    disabled={cancelling}
                  >
                    {cancelling
                      ? <ActivityIndicator color={theme.color.onAccent} size="small" />
                      : <Text style={styles.cancelDialogBtnPrimaryText}>Sí, cancelar</Text>}
                  </AnimatedPressable>
                </View>
              </View>
            </View>
          </Modal>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={closeDetail}
              style={styles.modalCloseBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={22} color={theme.color.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalle de orden</Text>
            <View style={{ width: 44 }} />
          </View>

          {detailLoading ? (
            <View style={styles.fullCenter}>
              <ActivityIndicator size="large" color={theme.color.accent} />
            </View>
          ) : detailError ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cloud-offline-outline" size={48} color={theme.color.textMuted} />
              <Text style={styles.emptyText}>No se pudo cargar el detalle.</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => selectedOrder && handleOrderPress(selectedOrder)}
              >
                <Text style={styles.actionButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : selectedOrder ? (
            <ScrollView
              contentContainerStyle={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.detailHero}>
                <Text style={styles.detailOrderId}>
                  Orden #{String(selectedOrder.id).slice(0, 8).toUpperCase()}
                </Text>
                {/* ESTADO GLOBAL */}
                <StatusBadge status={selectedOrder.status} theme={theme} styles={styles} />
                <Text style={styles.detailMeta}>{formatDate(selectedOrder.created_at)}</Text>
              </View>

              {selectedOrder.status === 'payment_rejected' && (
                <View style={styles.rejectedBanner}>
                  <View style={styles.rejectedBannerTop}>
                    <Ionicons name="close-circle" size={22} color={theme.color.error} />
                    <Text style={styles.rejectedBannerTitle}>Tu pago fue rechazado</Text>
                  </View>
                  <Text style={styles.rejectedBannerText}>
                    No se pudo procesar el pago. Podés volver al carrito, revisar tus datos y reintentar la compra cuando quieras.
                  </Text>
                  <TouchableOpacity
                    style={styles.rejectedBannerBtn}
                    onPress={() => { closeDetail(); router.push('/cart') }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cart-outline" size={16} color={theme.color.error} />
                    <Text style={styles.rejectedBannerBtnText}>Volver al carrito</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedOrder.delivery_address ? (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>Dirección de entrega</Text>
                  <View style={styles.detailSectionCard}>
                    <Ionicons name="location-outline" size={16} color={theme.color.textSecondary} />
                    <Text style={styles.detailText}>
                      {formatDeliveryAddress(selectedOrder.delivery_address)}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* PRODUCTOS COMPRADOS (Restaurado para que se vea siempre) */}
              {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>Productos comprados</Text>
                  {selectedOrder.items.map((item, i) => {
                    const displayName = item.product_name ?? item.name ?? `Producto ${String(item.product_id).slice(0, 8)}`
                    return (
                      <View key={i} style={styles.detailItem}>
                        <TouchableOpacity
                          onPress={() => {
                            closeDetail()
                            const sellerParam = item.seller_id ? `?sellerId=${item.seller_id}` : ''
                            router.push(`/product/${item.product_id}${sellerParam}`)
                          }}
                          activeOpacity={0.7}
                          style={styles.detailItemNameRow}
                        >
                          <Text style={styles.detailItemName} numberOfLines={2}>
                            {displayName}
                          </Text>
                          <Ionicons name="chevron-forward" size={14} color={theme.color.accent} />
                        </TouchableOpacity>
                        <View style={styles.detailItemRow}>
                          <Text style={styles.detailItemMeta}>
                            {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                          </Text>
                          <Text style={styles.detailItemSubtotal}>
                            ${Number(item.subtotal ?? item.quantity * item.unit_price).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    )
                  })}
                </View>
              )}

              {/* TRACKING POR PAQUETES (Solo se va a ver cuando actualices el back) */}
              {Array.isArray(selectedOrder.fulfillments) && selectedOrder.fulfillments.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>Seguimiento por paquetes</Text>
                  
                  {selectedOrder.fulfillments.map((fulfillment, fIndex) => (
                    <View key={`f-${fulfillment.seller_id}`} style={styles.packageCard}>
                      <View style={styles.packageHeader}>
                        <Text style={styles.packageTitle}>Paquete de {sellerNames[fulfillment.seller_id] || `Vendedor`}</Text>
                        <StatusBadge status={fulfillment.status} small theme={theme} styles={styles} />
                      </View>

                      {fulfillment.tracking_code && (
                        <View style={[styles.detailSectionCard, { marginTop: 0, marginBottom: 10 }]}>
                          <Ionicons name="barcode-outline" size={16} color={theme.color.textSecondary} />
                          <Text style={[styles.detailText, styles.trackingCode]}>
                            {fulfillment.tracking_code}
                          </Text>
                        </View>
                      )}

                      {fulfillment.status === 'shipped' && (
                        <TouchableOpacity
                          style={[styles.confirmDeliveryBtn, confirmingDelivery && styles.confirmDeliveryBtnDisabled, { marginTop: 10 }]}
                          onPress={() => handleConfirmDelivery(fulfillment.seller_id)}
                          disabled={confirmingDelivery}
                          activeOpacity={0.85}
                        >
                          {confirmingDelivery ? (
                            <ActivityIndicator color={theme.color.onAccent} size="small" />
                          ) : (
                            <Text style={styles.confirmDeliveryBtnText}>Confirmar que recibí este paquete</Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>
                  ${Number(selectedOrder.total).toFixed(2)}
                </Text>
              </View>

              {/* ESTADO DE REEMBOLSO */}
              {selectedOrder.status === 'refund_in_progress' && (
                <View style={[styles.detailSectionCard, { backgroundColor: theme.color.warningLight, marginBottom: 8 }]}>
                  <ActivityIndicator size="small" color={theme.color.warning} />
                  <Text style={[styles.detailText, { color: theme.color.warning, fontWeight: '600' }]}>
                    Reembolso en proceso…
                  </Text>
                </View>
              )}
              {selectedOrder.status === 'refund_processed' && (
                <View style={[styles.detailSectionCard, { backgroundColor: theme.color.successLight, marginBottom: 8 }]}>
                  <Ionicons name="wallet-outline" size={16} color={theme.color.success} />
                  <Text style={[styles.detailText, { color: theme.color.success, fontWeight: '600' }]}>
                    Reembolso acreditado
                  </Text>
                </View>
              )}

              {/* CANCELAR ORDEN (solo comprador, estados cancelables) */}
              {BUYER_CANCELLABLE.includes(selectedOrder.status) && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { setCancelError(null); setCancelReason(''); setCancelModalVisible(true) }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="ban-outline" size={16} color={theme.color.error} />
                  <Text style={styles.cancelBtnText}>Cancelar orden</Text>
                </TouchableOpacity>
              )}

              {/* HISTORIAL DIVIDIDO */}
              {Array.isArray(selectedOrder.status_history) && selectedOrder.status_history.length > 0 && (
                <View style={styles.detailSection}>
                  
                  {/* Historial Global */}
                  <Text style={styles.sectionLabel}>Historial de la Orden</Text>
                  {[...selectedOrder.status_history]
                    .filter(h => !h.seller_id) // Filtra los que NO tienen seller_id
                    .reverse()
                    .map((h, i) => (
                    <View key={`global-${i}`} style={styles.historyRow}>
                      <View style={[
                        styles.historyDot,
                        { backgroundColor: theme.orderStatusColor[h.status]?.dot ?? theme.color.textMuted }
                      ]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyStatus}>
                          {STATUS_CONFIG[h.status]?.label ?? h.status}
                        </Text>
                        <Text style={styles.historyDate}>
                          {formatDateTime(h.changed_at)}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {/* Historial por Vendedor (Agrupado) */}
                  {Object.entries(
                    selectedOrder.status_history
                      .filter(h => h.seller_id) 
                      .reduce((acc, h) => {
                        if (!acc[h.seller_id]) acc[h.seller_id] = [];
                        acc[h.seller_id].push(h);
                        return acc;
                      }, {})
                  ).map(([sellerId, history]) => {
                    
                    const sellerName = sellerNames[sellerId] || `Cargando...`;

                    return (
                      <View key={`seller-history-${sellerId}`} style={{ marginTop: 15 }}>
                        
                        <Text style={[styles.sectionLabel, { color: theme.color.accent }]}>
                          Historial de Vendedor {sellerName}
                        </Text>
                        
                        {[...history].reverse().map((h, i) => (
                          <View key={`sh-${i}`} style={styles.historyRow}>
                            <View style={[
                              styles.historyDot,
                              { backgroundColor: theme.orderStatusColor[h.status]?.dot ?? theme.color.textMuted }
                            ]} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.historyStatus}>
                                {STATUS_CONFIG[h.status]?.label ?? h.status}
                              </Text>
                              <Text style={styles.historyDate}>
                                {formatDateTime(h.changed_at)}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )
                  })}

                </View>
              )}

              {/* ── Sección de Calificaciones (orden entregada) ── */}
              {selectedOrder.status === 'delivered' && Object.keys(sellerReviews).length > 0 && (
                <View style={styles.reviewSection}>
                  <View style={styles.reviewSectionHeader}>
                    <Ionicons name="star-outline" size={16} color={theme.color.like} />
                    <Text style={styles.reviewSectionTitle}>Calificá tu compra</Text>
                  </View>

                  {/* Vendedores */}
                  <Text style={styles.sectionLabel}>Vendedor{Object.keys(sellerReviews).length > 1 ? 'es' : ''}</Text>
                  {Object.keys(sellerReviews).map((sellerId) => {
                    const entry = sellerReviews[sellerId]
                    return (
                      <View key={sellerId} style={styles.reviewCard}>
                        <Text style={styles.reviewEntityName} numberOfLines={1}>
                          {sellerNames[sellerId] ?? `${sellerId}`}
                        </Text>
                        {entry.done ? (
                          <View style={styles.reviewDoneRow}>
                            <Ionicons name="checkmark-circle" size={18} color={theme.color.success} />
                            <Text style={styles.reviewDoneText}>¡Calificación enviada!</Text>
                          </View>
                        ) : entry.alreadyReviewed ? (
                          <View style={styles.reviewDoneRow}>
                            <Ionicons name="information-circle-outline" size={18} color={theme.color.textMuted} />
                            <Text style={styles.reviewAlreadyText}>Ya calificaste a este vendedor</Text>
                          </View>
                        ) : (
                          <>
                            <StarPicker
                              score={entry.score}
                              onSelect={(s) => setSellerReviews((prev) => ({ ...prev, [sellerId]: { ...prev[sellerId], score: s } }))}
                              disabled={entry.submitting}
                              theme={theme}
                              styles={styles}
                            />
                            <TextInput
                              style={styles.reviewInput}
                              placeholder="Comentario opcional..."
                              placeholderTextColor={theme.color.textMuted}
                              value={entry.comment}
                              onChangeText={(t) => setSellerReviews((prev) => ({ ...prev, [sellerId]: { ...prev[sellerId], comment: t } }))}
                              editable={!entry.submitting}
                              multiline
                              maxLength={1000}
                            />
                            {entry.error ? (
                              <Text style={styles.reviewError}>{entry.error}</Text>
                            ) : null}
                            <TouchableOpacity
                              style={[
                                styles.reviewSubmitBtn,
                                (!entry.score || entry.submitting) && styles.reviewSubmitBtnDisabled,
                              ]}
                              onPress={() => handleSubmitSellerReview(sellerId)}
                              disabled={!entry.score || entry.submitting}
                              activeOpacity={0.8}
                            >
                              {entry.submitting ? (
                                <ActivityIndicator color={theme.color.onAccent} size="small" />
                              ) : (
                                <Text style={styles.reviewSubmitBtnText}>Enviar calificación</Text>
                              )}
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    )
                  })}

                  {/* Productos */}
                  {Object.keys(productReviews).length > 0 && (
                    <>
                      <Text style={[styles.sectionLabel, { marginTop: SPACING.sm }]}>
                        Producto{Object.keys(productReviews).length > 1 ? 's' : ''}
                      </Text>
                      {(selectedOrder.items ?? []).map((item) => {
                        const pid = String(item.product_id)
                        const entry = productReviews[pid]
                        if (!entry) return null
                        const displayName = item.product_name ?? item.name ?? `Producto ${pid.slice(0, 8)}`
                        return (
                          <View key={pid} style={styles.reviewCard}>
                            <Text style={styles.reviewEntityName} numberOfLines={2}>{displayName}</Text>
                            {entry.done ? (
                              <View style={styles.reviewDoneRow}>
                                <Ionicons name="checkmark-circle" size={18} color={theme.color.success} />
                                <Text style={styles.reviewDoneText}>¡Calificación enviada!</Text>
                              </View>
                            ) : entry.alreadyReviewed ? (
                              <View style={styles.reviewDoneRow}>
                                <Ionicons name="information-circle-outline" size={18} color={theme.color.textMuted} />
                                <Text style={styles.reviewAlreadyText}>Ya calificaste este producto</Text>
                              </View>
                            ) : (
                              <>
                                <StarPicker
                                  score={entry.score}
                                  onSelect={(s) => setProductReviews((prev) => ({ ...prev, [pid]: { ...prev[pid], score: s } }))}
                                  disabled={entry.submitting}
                                  theme={theme}
                                  styles={styles}
                                />
                                <TextInput
                                  style={styles.reviewInput}
                                  placeholder="Comentario opcional..."
                                  placeholderTextColor={theme.color.textMuted}
                                  value={entry.comment}
                                  onChangeText={(t) => setProductReviews((prev) => ({ ...prev, [pid]: { ...prev[pid], comment: t } }))}
                                  editable={!entry.submitting}
                                  multiline
                                  maxLength={1000}
                                />
                                {entry.error ? (
                                  <Text style={styles.reviewError}>{entry.error}</Text>
                                ) : null}
                                <TouchableOpacity
                                  style={[
                                    styles.reviewSubmitBtn,
                                    (!entry.score || entry.submitting) && styles.reviewSubmitBtnDisabled,
                                  ]}
                                  onPress={() => handleSubmitProductReview(pid)}
                                  disabled={!entry.score || entry.submitting}
                                  activeOpacity={0.8}
                                >
                                  {entry.submitting ? (
                                    <ActivityIndicator color={theme.color.onAccent} size="small" />
                                  ) : (
                                    <Text style={styles.reviewSubmitBtnText}>Enviar calificación</Text>
                                  )}
                                </TouchableOpacity>
                              </>
                            )}
                          </View>
                        )
                      })}
                    </>
                  )}
                </View>
              )}

            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}