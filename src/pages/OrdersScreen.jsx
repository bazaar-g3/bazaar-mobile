import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Modal,
  Platform,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'

import { getOrders, getOrderById, confirmDelivery } from '../services/orders'
import { createSellerReview, createProductReview } from '../services/reviews'
import { getPublicProfile } from '../services/user'
import { getSessionStatus } from '../services/session'
import { buildLoginRedirect } from '../utils/authRedirect'
import { useResponsive } from '../utils/responsive'
import { COLORS } from '../constants/colors'
import { FONT, SPACING } from '../constants/theme'

const STATUS_CONFIG = {
  pending_payment:    { label: 'Pago pendiente',      color: COLORS.secondary,    icon: 'time-outline' },
  confirmed:          { label: 'Confirmada',           color: COLORS.primary,      icon: 'checkmark-circle-outline' },
  in_preparation:     { label: 'En preparación',       color: COLORS.primaryLight, icon: 'construct-outline' },
  shipped:            { label: 'Enviada',              color: COLORS.logoB,        icon: 'bicycle-outline' },
  delivered:          { label: 'Entregada',            color: COLORS.success,      icon: 'home-outline' },
  payment_rejected:   { label: 'Pago rechazado',       color: COLORS.error,        icon: 'close-circle-outline' },
  cancelled:          { label: 'Cancelada',            color: COLORS.textMuted,    icon: 'ban-outline' },
  refund_in_progress: { label: 'Reembolso en proceso', color: COLORS.secondary,    icon: 'refresh-outline' },
  refund_processed:   { label: 'Reembolso procesado',  color: COLORS.success,      icon: 'wallet-outline' },
}

// Filtros reducidos para mobile — los más relevantes primero
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
  // Retrocompatibilidad: si por alguna razón llega como string, lo devuelve directo
  if (typeof addr === 'string') return addr
  const { calle, altura, departamento, zona, codigo_postal } = addr
  let line = `${calle ?? ''} ${altura ?? ''}`.trim()
  if (departamento) line += `, Dpto. ${departamento}`
  if (zona) line += `, ${zona}`
  if (codigo_postal) line += ` (CP ${codigo_postal})`
  return line
}

function StatusBadge({ status, small = false }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: COLORS.textMuted, icon: 'ellipse-outline' }
  return (
    <View style={[styles.badge, { backgroundColor: config.color }, small && styles.badgeSmall]}>
      <Ionicons name={config.icon} size={small ? 11 : 12} color={COLORS.white} />
      <Text style={[styles.badgeText, small && styles.badgeTextSmall]}>{config.label}</Text>
    </View>
  )
}

function StarPicker({ score, onSelect, disabled }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !disabled && onSelect(star)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={[styles.starPickerItem, { color: star <= (score ?? 0) ? COLORS.secondary : COLORS.divider }]}>
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
  const { isSmall, isTablet } = useResponsive()

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

  const loadOrders = useCallback(async (statusFilter) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getOrders(statusFilter)
      setOrders(Array.isArray(data) ? data : (data.results ?? data.items ?? []))
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

  async function handleConfirmDelivery() {
    if (!selectedOrder) return
    setConfirmingDelivery(true)
    setConfirmDeliveryError(null)
    try {
      const sellerId = selectedOrder.fulfillments?.[0]?.seller_id ?? selectedOrder.items?.[0]?.seller_id
      const updated = await confirmDelivery(selectedOrder.id, sellerId)
      setSelectedOrder((prev) => ({ ...prev, status: updated.status }))
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.order_id ? { ...o, status: updated.status } : o))
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

  if (checkingSession) {
    return (
      <SafeAreaView style={styles.fullCenter}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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
          <StatusBadge status={item.status} small />
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={styles.orderId} numberOfLines={1}>
          #{String(item.id).slice(0, 8).toUpperCase()}
        </Text>
        <View style={styles.orderCardBottom}>
          <Text style={styles.orderTotal}>${Number(item.total).toFixed(2)}</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </View>

        {/* Aviso inline para pago rechazado */}
        {isRejected && (
          <View style={styles.orderCardRejectedHint}>
            <Ionicons name="alert-circle-outline" size={13} color={COLORS.error} />
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
      {/* ── Header fijo ─────────────────────────────────────────── */}
      <View style={[styles.header, { paddingHorizontal: hPad }]}>
        <Text style={[styles.title, { fontSize: isSmall ? FONT.large : 26 }]}>
          Mis órdenes
        </Text>
        {loading && orders.length > 0 && (
          <ActivityIndicator size="small" color={COLORS.primary} />
        )}
      </View>

      {/* ── Filtros full-width (scroll horizontal sin padding lateral) ─ */}
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
                isActive && { backgroundColor: cfg?.color ?? COLORS.primary, borderColor: cfg?.color ?? COLORS.primary },
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

      {/* ── Lista ────────────────────────────────────────────────── */}
      <View style={[styles.listContainer, isTablet && styles.listContainerTablet]}>
        {loading && orders.length === 0 ? (
          <View style={styles.fullCenter}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : error && orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-offline-outline" size={52} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Sin conexión</Text>
            <Text style={styles.emptyText}>No pudimos cargar tus órdenes.</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => loadOrders(activeFilter)}>
              <Text style={styles.actionButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={52} color={COLORS.textMuted} />
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

      {/* ── Modal de detalle ─────────────────────────────────────── */}
      <Modal
        visible={selectedOrder !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeDetail}
      >
        <SafeAreaView style={styles.screen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={closeDetail}
              style={styles.modalCloseBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalle de orden</Text>
            <View style={{ width: 44 }} />
          </View>

          {detailLoading ? (
            <View style={styles.fullCenter}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : detailError ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textMuted} />
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
              {/* Orden ID + badge */}
              <View style={styles.detailHero}>
                <Text style={styles.detailOrderId}>
                  Orden #{String(selectedOrder.id).slice(0, 8).toUpperCase()}
                </Text>
                <StatusBadge status={selectedOrder.status} />
                <Text style={styles.detailMeta}>{formatDate(selectedOrder.created_at)}</Text>
              </View>

              {/* Banner de pago rechazado */}
              {selectedOrder.status === 'payment_rejected' && (
                <View style={styles.rejectedBanner}>
                  <View style={styles.rejectedBannerTop}>
                    <Ionicons name="close-circle" size={22} color={COLORS.error} />
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
                    <Ionicons name="cart-outline" size={16} color={COLORS.error} />
                    <Text style={styles.rejectedBannerBtnText}>Volver al carrito</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Dirección */}
              {selectedOrder.delivery_address ? (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>Dirección de entrega</Text>
                  <View style={styles.detailSectionCard}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>
                      {formatDeliveryAddress(selectedOrder.delivery_address)}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Código de seguimiento */}
              {selectedOrder.tracking_code && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>Código de seguimiento</Text>
                  <View style={styles.detailSectionCard}>
                    <Ionicons name="barcode-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={[styles.detailText, styles.trackingCode]}>
                      {selectedOrder.tracking_code}
                    </Text>
                  </View>
                </View>
              )}

              {/* Productos */}
              {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>Productos</Text>
                  {selectedOrder.items.map((item, i) => {
                    const displayName = item.product_name ?? item.name ?? null
                    const shortId = String(item.product_id ?? '').slice(0, 8)
                    return (
                      <View key={i} style={styles.detailItem}>
                        <TouchableOpacity
                          onPress={() => {
                            closeDetail()
                            router.push(`/product/${item.product_id}`)
                          }}
                          activeOpacity={0.7}
                          style={styles.detailItemNameRow}
                        >
                          <Text style={styles.detailItemName} numberOfLines={2}>
                            {displayName ?? `Producto ${shortId}`}
                          </Text>
                          <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
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

              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>
                  ${Number(selectedOrder.total).toFixed(2)}
                </Text>
              </View>

              {/* Confirmar entrega (CA7) */}
              {selectedOrder.status === 'shipped' && (
                <View style={styles.confirmDeliveryBox}>
                  <Ionicons name="home-outline" size={22} color={COLORS.success} />
                  <Text style={styles.confirmDeliveryTitle}>¿Ya recibiste tu pedido?</Text>
                  <Text style={styles.confirmDeliveryText}>
                    Confirmá la recepción para dar por finalizada la compra.
                  </Text>
                  {confirmDeliveryError ? (
                    <Text style={styles.confirmDeliveryError}>{confirmDeliveryError}</Text>
                  ) : null}
                  <TouchableOpacity
                    style={[
                      styles.confirmDeliveryBtn,
                      confirmingDelivery && styles.confirmDeliveryBtnDisabled,
                    ]}
                    onPress={handleConfirmDelivery}
                    disabled={confirmingDelivery}
                    activeOpacity={0.85}
                  >
                    {confirmingDelivery ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                      <Text style={styles.confirmDeliveryBtnText}>Confirmar que lo recibí</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* ── Sección de Calificaciones (orden entregada) ── */}
              {selectedOrder.status === 'delivered' && Object.keys(sellerReviews).length > 0 && (
                <View style={styles.reviewSection}>
                  <View style={styles.reviewSectionHeader}>
                    <Ionicons name="star-outline" size={16} color={COLORS.secondary} />
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
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                            <Text style={styles.reviewDoneText}>¡Calificación enviada!</Text>
                          </View>
                        ) : entry.alreadyReviewed ? (
                          <View style={styles.reviewDoneRow}>
                            <Ionicons name="information-circle-outline" size={18} color={COLORS.textMuted} />
                            <Text style={styles.reviewAlreadyText}>Ya calificaste a este vendedor</Text>
                          </View>
                        ) : (
                          <>
                            <StarPicker
                              score={entry.score}
                              onSelect={(s) => setSellerReviews((prev) => ({ ...prev, [sellerId]: { ...prev[sellerId], score: s } }))}
                              disabled={entry.submitting}
                            />
                            <TextInput
                              style={styles.reviewInput}
                              placeholder="Comentario opcional..."
                              placeholderTextColor={COLORS.textMuted}
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
                                <ActivityIndicator color={COLORS.white} size="small" />
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
                                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                                <Text style={styles.reviewDoneText}>¡Calificación enviada!</Text>
                              </View>
                            ) : entry.alreadyReviewed ? (
                              <View style={styles.reviewDoneRow}>
                                <Ionicons name="information-circle-outline" size={18} color={COLORS.textMuted} />
                                <Text style={styles.reviewAlreadyText}>Ya calificaste este producto</Text>
                              </View>
                            ) : (
                              <>
                                <StarPicker
                                  score={entry.score}
                                  onSelect={(s) => setProductReviews((prev) => ({ ...prev, [pid]: { ...prev[pid], score: s } }))}
                                  disabled={entry.submitting}
                                />
                                <TextInput
                                  style={styles.reviewInput}
                                  placeholder="Comentario opcional..."
                                  placeholderTextColor={COLORS.textMuted}
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
                                    <ActivityIndicator color={COLORS.white} size="small" />
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

              {/* Historial */}
              {Array.isArray(selectedOrder.status_history) &&
                selectedOrder.status_history.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionLabel}>Historial</Text>
                    {[...selectedOrder.status_history].reverse().map((h, i) => (
                      <View key={i} style={styles.historyRow}>
                        <View style={[
                          styles.historyDot,
                          { backgroundColor: STATUS_CONFIG[h.status]?.color ?? COLORS.primary }
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
                )}
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  fullCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    gap: SPACING.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  // Filtros — full width, padding dentro del contentContainer
  filterScroll: {
    flexGrow: 0,
    marginBottom: SPACING.sm,
  },
  filterContent: {
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.white,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },

  // Lista
  listContainer: {
    flex: 1,
  },
  listContainerTablet: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  listContent: {
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.xs,
  },

  // Tarjetas de orden
  orderCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: 4,
  },
  orderCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  orderId: {
    fontSize: FONT.small,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  orderTotal: {
    fontSize: FONT.medium,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  // Badge de estado
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextSmall: {
    fontSize: 11,
  },

  // Estados vacíos
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: FONT.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    marginTop: SPACING.xs,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: FONT.regular,
  },

  // Modal de detalle
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalCloseBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.background,
  },
  modalTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalBody: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  // Detalle
  detailHero: {
    alignItems: 'flex-start',
    gap: SPACING.xs,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  detailOrderId: {
    fontSize: FONT.large,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  detailMeta: {
    fontSize: FONT.small,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  detailSection: {
    gap: SPACING.xs,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  detailSectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: SPACING.sm,
  },
  detailText: {
    flex: 1,
    fontSize: FONT.regular,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  detailItem: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.sm,
    gap: 6,
  },
  detailItemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  detailItemName: {
    flex: 1,
    fontSize: FONT.regular,
    fontWeight: '700',
    color: COLORS.primary,        // azul = indica que es tappable
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: COLORS.primary,
  },
  detailItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItemMeta: {
    fontSize: FONT.small,
    color: COLORS.textSecondary,
  },
  detailItemSubtotal: {
    fontSize: FONT.regular,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT.medium,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: FONT.large,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  // Historial
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    flexShrink: 0,
  },
  historyStatus: {
    fontSize: FONT.regular,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Tarjeta con pago rechazado
  orderCardRejected: {
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    backgroundColor: '#fff8f8',
  },
  orderCardRejectedHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#fca5a5',
  },
  orderCardRejectedHintText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },

  // Banner de pago rechazado en el modal
  rejectedBanner: {
    backgroundColor: '#fff0f0',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  rejectedBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rejectedBannerTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: COLORS.error,
  },
  rejectedBannerText: {
    fontSize: FONT.small,
    color: '#b91c1c',
    lineHeight: 20,
  },
  rejectedBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
  },
  rejectedBannerBtnText: {
    fontSize: FONT.small,
    fontWeight: '800',
    color: COLORS.error,
  },

  // Código de seguimiento
  trackingCode: {
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Confirmar entrega
  confirmDeliveryBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#86efac',
    padding: SPACING.md,
    gap: SPACING.xs,
    alignItems: 'flex-start',
  },
  confirmDeliveryTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: COLORS.success,
  },
  confirmDeliveryText: {
    fontSize: FONT.small,
    color: '#166534',
    lineHeight: 20,
  },
  confirmDeliveryError: {
    fontSize: FONT.small,
    color: COLORS.error,
    fontWeight: '600',
  },
  confirmDeliveryBtn: {
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: SPACING.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  confirmDeliveryBtnDisabled: {
    opacity: 0.6,
  },
  confirmDeliveryBtnText: {
    color: COLORS.white,
    fontSize: FONT.regular,
    fontWeight: '800',
  },

  // Sección de calificaciones
  reviewSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  reviewSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 2,
  },
  reviewSectionTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  reviewCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  reviewEntityName: {
    fontSize: FONT.regular,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  starRow: {
    flexDirection: 'row',
    gap: 4,
  },
  starPickerItem: {
    fontSize: 28,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontSize: FONT.regular,
    color: COLORS.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: COLORS.white,
  },
  reviewSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 2,
  },
  reviewSubmitBtnDisabled: {
    opacity: 0.45,
  },
  reviewSubmitBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: FONT.regular,
  },
  reviewDoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  reviewDoneText: {
    fontSize: FONT.regular,
    fontWeight: '700',
    color: COLORS.success,
  },
  reviewAlreadyText: {
    fontSize: FONT.regular,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  reviewError: {
    fontSize: FONT.small,
    color: COLORS.error,
    fontWeight: '600',
  },

})
