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
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'

import { getOrders, getOrderById } from '../services/orders'
import { getSessionStatus } from '../services/session'
import { buildLoginRedirect } from '../utils/authRedirect'
import { useResponsive } from '../utils/responsive'
import { COLORS } from '../constants/colors'
import { FONT, SPACING } from '../constants/theme'

const STATUS_CONFIG = {
  pending_payment:    { label: 'Pago pendiente',      color: COLORS.secondary },
  confirmed:          { label: 'Confirmada',           color: COLORS.primary },
  in_preparation:     { label: 'En preparación',       color: COLORS.primaryLight },
  shipped:            { label: 'Enviada',              color: COLORS.logoB },
  delivered:          { label: 'Entregada',            color: COLORS.success },
  payment_rejected:   { label: 'Pago rechazado',       color: COLORS.error },
  cancelled:          { label: 'Cancelada',            color: COLORS.textMuted },
  refund_in_progress: { label: 'Reembolso en proceso', color: COLORS.secondary },
  refund_processed:   { label: 'Reembolso procesado',  color: COLORS.success },
}

const FILTERS = [
  { key: null, label: 'Todas' },
  ...Object.entries(STATUS_CONFIG).map(([key, { label }]) => ({ key, label })),
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

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: COLORS.textMuted }
  return (
    <View style={[styles.badge, { backgroundColor: config.color }]}>
      <Text style={styles.badgeText}>{config.label}</Text>
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

  if (checkingSession) {
    return (
      <SafeAreaView style={styles.fullCenter}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    )
  }

  const containerStyle = [
    styles.container,
    { paddingHorizontal: isSmall ? SPACING.md : SPACING.lg },
    isTablet && styles.containerTablet,
  ]

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
      activeOpacity={0.75}
    >
      <View style={styles.orderCardTop}>
        <StatusBadge status={item.status} />
        <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
      </View>
      <Text style={styles.orderId} numberOfLines={1}>
        Orden #{String(item.id).slice(0, 8).toUpperCase()}
      </Text>
      <View style={styles.orderCardBottom}>
        <Text style={styles.orderTotal}>${Number(item.total).toFixed(2)}</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={containerStyle}>
        <Text style={[styles.title, { fontSize: isSmall ? FONT.large : FONT.title }]}>
          Mis órdenes
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key
            return (
              <TouchableOpacity
                key={String(f.key)}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(f.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {loading && orders.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: SPACING.xl }}
          />
        ) : error && orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>
              No pudimos cargar tus órdenes. Probá de nuevo.
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => loadOrders(activeFilter)}
            >
              <Text style={styles.actionButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>
              {activeFilter
                ? 'No tenés órdenes con ese estado.'
                : 'Todavía no realizaste ninguna compra.'}
            </Text>
            {!activeFilter && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/home')}
              >
                <Text style={styles.actionButtonText}>Ir al catálogo</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderOrder}
            contentContainerStyle={styles.listContent}
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
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalle de orden</Text>
            <TouchableOpacity
              onPress={closeDetail}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {detailLoading ? (
            <View style={styles.fullCenter}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : detailError ? (
            <View style={styles.fullCenter}>
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
            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.orderId}>
                  Orden #{String(selectedOrder.id).slice(0, 8).toUpperCase()}
                </Text>
                <StatusBadge status={selectedOrder.status} />
                <Text style={styles.detailMeta}>
                  Fecha: {formatDate(selectedOrder.created_at)}
                </Text>
              </View>

              {selectedOrder.delivery_address && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>Dirección de entrega</Text>
                  <Text style={styles.detailText}>
                    {[
                      selectedOrder.delivery_address.street,
                      selectedOrder.delivery_address.city,
                      selectedOrder.delivery_address.state,
                    ].filter(Boolean).join(', ')}
                  </Text>
                </View>
              )}

              {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>Productos</Text>
                  {selectedOrder.items.map((item, i) => (
                    <View key={i} style={styles.detailItem}>
                      <Text style={styles.detailItemName} numberOfLines={2}>
                        {item.product_name ?? item.name ?? `Producto ${String(item.product_id ?? '').slice(0, 8)}`}
                      </Text>
                      <View style={styles.detailItemRow}>
                        <Text style={styles.detailItemMeta}>
                          {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                        </Text>
                        <Text style={styles.detailItemSubtotal}>
                          ${Number(item.subtotal ?? item.quantity * item.unit_price).toFixed(2)}
                        </Text>
                      </View>
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

              {Array.isArray(selectedOrder.status_history) &&
                selectedOrder.status_history.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionLabel}>Historial de estados</Text>
                    {selectedOrder.status_history.map((h, i) => (
                      <View key={i} style={styles.historyRow}>
                        <View style={styles.historyDot} />
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
  fullCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    gap: SPACING.md,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  containerTablet: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  filterScroll: { marginBottom: SPACING.md },
  filterContent: { gap: SPACING.xs, paddingRight: SPACING.md },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.background,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: FONT.small,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: { color: COLORS.white },
  listContent: { paddingBottom: SPACING.lg },
  orderCard: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  orderCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  orderCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  orderId: {
    fontSize: FONT.small,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: FONT.small,
    color: COLORS.textMuted,
  },
  orderTotal: {
    fontSize: FONT.medium,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: FONT.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: FONT.regular,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalBody: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  detailSection: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONT.small,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailMeta: {
    fontSize: FONT.small,
    color: COLORS.textSecondary,
  },
  detailText: {
    fontSize: FONT.regular,
    color: COLORS.textPrimary,
  },
  detailItem: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  detailItemName: {
    fontSize: FONT.regular,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
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
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
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
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  historyStatus: {
    fontSize: FONT.regular,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  historyDate: {
    fontSize: FONT.small,
    color: COLORS.textMuted,
  },
})
