import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import { styles } from "../styles/OrdersScreenStyles";
import { getOrders, getOrderById, confirmDelivery } from '../services/orders'
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
    try {
      const detail = await getOrderById(order.id)
      setSelectedOrder(detail)
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

  async function handleConfirmDelivery(sellerId) {
    if (!selectedOrder || !sellerId) return
    setConfirmingDelivery(true)
    setConfirmDeliveryError(null)
    try {
      const updated = await confirmDelivery(selectedOrder.id, sellerId)
      const freshDetail = await getOrderById(selectedOrder.id)
      setSelectedOrder(freshDetail)
      
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: freshDetail.status } : o))
      )
    } catch (e) {
      const detail = e?.response?.data?.detail
      setConfirmDeliveryError(
        typeof detail === 'string' ? detail : 'No se pudo confirmar la entrega. Intentá de nuevo.'
      )
    } finally {
      setConfirmingDelivery(false)
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
      <View style={[styles.header, { paddingHorizontal: hPad }]}>
        <Text style={[styles.title, { fontSize: isSmall ? FONT.large : 26 }]}>
          Mis órdenes
        </Text>
        {loading && orders.length > 0 && (
          <ActivityIndicator size="small" color={COLORS.primary} />
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
              <View style={styles.detailHero}>
                <Text style={styles.detailOrderId}>
                  Orden #{String(selectedOrder.id).slice(0, 8).toUpperCase()}
                </Text>
                {/* ESTADO GLOBAL */}
                <StatusBadge status={selectedOrder.status} />
                <Text style={styles.detailMeta}>{formatDate(selectedOrder.created_at)}</Text>
              </View>

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

              {/* PRODUCTOS COMPRADOS */}
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
                            router.push(`/product/${item.product_id}`)
                          }}
                          activeOpacity={0.7}
                          style={styles.detailItemNameRow}
                        >
                          <Text style={styles.detailItemName} numberOfLines={2}>
                            {displayName}
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

              {/* TRACKING POR PAQUETES */}
              {Array.isArray(selectedOrder.fulfillments) && selectedOrder.fulfillments.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>Seguimiento por paquetes</Text>
                  
                  {selectedOrder.fulfillments.map((fulfillment, fIndex) => (
                    <View key={`f-${fulfillment.seller_id}`} style={styles.packageCard}>
                      <View style={styles.packageHeader}>
                        <Text style={styles.packageTitle}>Paquete {fIndex + 1}</Text>
                        <StatusBadge status={fulfillment.status} small />
                      </View>

                      {fulfillment.tracking_code && (
                        <View style={[styles.detailSectionCard, { marginTop: 0, marginBottom: 10 }]}>
                          <Ionicons name="barcode-outline" size={16} color={COLORS.textSecondary} />
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
                            <ActivityIndicator color={COLORS.white} size="small" />
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

                  {/* Historial por Vendedor (Agrupado) */}
                  {Object.entries(
                    selectedOrder.status_history
                      .filter(h => h.seller_id) // Filtra solo los que SI tienen seller_id
                      .reduce((acc, h) => {
                        if (!acc[h.seller_id]) acc[h.seller_id] = [];
                        acc[h.seller_id].push(h);
                        return acc;
                      }, {})
                  ).map(([sellerId, history]) => (
                    <View key={`seller-history-${sellerId}`} style={{ marginTop: 15 }}>
                      <Text style={[styles.sectionLabel, { color: COLORS.primary }]}>
                        Historial del Vendedor
                      </Text>
                      {[...history].reverse().map((h, i) => (
                        <View key={`sh-${i}`} style={styles.historyRow}>
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