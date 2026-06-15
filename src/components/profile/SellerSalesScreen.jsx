import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { COLORS } from '../../constants/colors'
import { getSellerSales, updateOrderStatus, cancelOrder, getCancelErrorMessage } from '../../services/orders'
import { getPublicProfile } from '../../services/user'
import { styles } from '../../styles/sellerSales/sellerSalesStyles'

const CANCELLED_STATUSES = ['cancelled', 'refund_in_progress', 'refund_processed']

const STATUS_FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Confirmadas', value: 'confirmed' },
  { label: 'En preparación', value: 'in_preparation' },
  { label: 'Enviadas', value: 'shipped' },
  { label: 'Entregadas', value: 'delivered' },
  { label: 'Canceladas', value: 'cancelled' },
]

const SELLER_STATUS_LABELS = {
  confirmed: 'Confirmada',
  in_preparation: 'En preparación',
  shipped: 'Enviada',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
  refund_in_progress: 'Reembolso en proceso',
  refund_processed: 'Reembolsada',
}

const SELLER_NEXT_STATUS = {
  confirmed: 'in_preparation',
  in_preparation: 'shipped',
}

export default function SellerSalesScreen({ sellerId }) {
  const [sales, setSales] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [buyerNames, setBuyerNames] = useState({})

  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [trackingOrderId, setTrackingOrderId] = useState(null)
  const [trackingInput, setTrackingInput] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [cancelTargetId, setCancelTargetId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  const loadSales = useCallback(async () => {
    if (!sellerId) return

    setLoading(true)
    setError('')
    setUpdateError('')
    setTrackingOrderId(null)

    try {
      const data = await getSellerSales(sellerId)

      const filtered =
        statusFilter === 'all'
          ? data
          : statusFilter === 'cancelled'
          ? data.filter((sale) => CANCELLED_STATUSES.includes(sale.status))
          : data.filter((sale) => sale.status === statusFilter)

      setSales(filtered)

      const uniqueBuyerIds = [...new Set(filtered.map((sale) => sale.buyer_id))]
      const names = {}

      await Promise.all(
        uniqueBuyerIds.map(async (buyerId) => {
          const profile = await getPublicProfile(buyerId)
          names[buyerId] =
            profile?.name ||
            profile?.fullName ||
            profile?.username ||
            profile?.email ||
            'Comprador'
        })
      )

      setBuyerNames(names)
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'No se pudieron cargar las ventas.'
      )
    } finally {
      setLoading(false)
    }
  }, [sellerId, statusFilter])

  useEffect(() => {
    loadSales()
  }, [loadSales])

  function handleUpdateOrderStatus(orderId, newStatus) {
    setUpdateError('')

    if (newStatus === 'shipped') {
      setTrackingOrderId(orderId)
      setTrackingInput('')
      return
    }

    doUpdateStatus(orderId, newStatus, null)
  }

  async function doUpdateStatus(orderId, newStatus, trackingCode) {
    setUpdatingOrderId(orderId)
    setUpdateError('')

    try {
      await updateOrderStatus(
        orderId,
        {
          new_status: newStatus,
          tracking_code: trackingCode || undefined,
        },
        sellerId
      )

      setTrackingOrderId(null)

      setSales((prev) =>
        prev.map((sale) =>
          sale.order_id === orderId
            ? {
                ...sale,
                status: newStatus,
                tracking_code:
                  newStatus === 'shipped'
                    ? trackingCode || null
                    : sale.tracking_code,
              }
            : sale
        )
      )
    } catch (err) {
      const detail = err?.response?.data?.detail

      setUpdateError(
        typeof detail === 'string'
          ? detail
          : detail?.message || 'No se pudo actualizar el estado.'
      )
    } finally {
      setUpdatingOrderId(null)
    }
  }

  async function handleCancelSale() {
    if (!cancelTargetId) return
    setCancelling(true)
    setCancelError('')
    try {
      await cancelOrder(cancelTargetId, { reason: cancelReason || undefined }, sellerId)
      await loadSales()
      setCancelTargetId(null)
      setCancelReason('')
    } catch (e) {
      setCancelError(getCancelErrorMessage(e))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <View style={styles.screen}>
      <Modal
        visible={cancelTargetId !== null}
        animationType="fade"
        transparent
        onRequestClose={() => !cancelling && setCancelTargetId(null)}
      >
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.45)', justifyContent:'center', alignItems:'center', padding:24 }}>
          <View style={{ backgroundColor:'#fff', borderRadius:16, padding:24, width:'100%', maxWidth:400, gap:12 }}>
            <Text style={{ fontSize:18, fontWeight:'800', color:'#1a1a1a' }}>¿Cancelar esta venta?</Text>
            <Text style={{ fontSize:14, color:'#666', lineHeight:20 }}>
              Se restaurará el stock. Si el comprador realizó un pago aprobado, se iniciará un reembolso.
            </Text>
            <TextInput
              style={{ borderWidth:1, borderColor:'#e0e0e0', borderRadius:8, padding:10, fontSize:14 }}
              placeholder="Motivo (opcional)"
              value={cancelReason}
              onChangeText={setCancelReason}
              editable={!cancelling}
              maxLength={200}
            />
            {cancelError ? <Text style={{ color:'#e53935', fontSize:13, fontWeight:'600' }}>{cancelError}</Text> : null}
            <View style={{ flexDirection:'row', gap:10, marginTop:4 }}>
              <TouchableOpacity
                style={{ flex:1, borderWidth:1.5, borderColor:'#e0e0e0', borderRadius:10, paddingVertical:12, alignItems:'center' }}
                onPress={() => setCancelTargetId(null)}
                disabled={cancelling}
              >
                <Text style={{ color:'#666', fontWeight:'700', fontSize:15 }}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex:1, backgroundColor:'#e53935', borderRadius:10, paddingVertical:12, alignItems:'center', justifyContent:'center', minHeight:44, opacity: cancelling ? 0.6 : 1 }}
                onPress={handleCancelSale}
                disabled={cancelling}
              >
                {cancelling
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={{ color:'#fff', fontWeight:'700', fontSize:15 }}>Sí, cancelar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Text style={styles.title}>Historial de ventas</Text>
      <Text style={styles.subtitle}>Pedidos recibidos</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterChip,
              statusFilter === filter.value && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === filter.value && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={COLORS.primaryLight} />
          <Text style={styles.stateText}>Cargando ventas...</Text>
        </View>
      ) : error ? (
        <View style={styles.messageCard}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadSales}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : sales.length === 0 ? (
        <View style={styles.messageCard}>
          <Text style={styles.emptyTitle}>Todavía no tenés ventas.</Text>
          <Text style={styles.emptyText}>
            Cuando alguien compre uno de tus productos, el pedido va a aparecer acá.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          <Text style={styles.countText}>
            {sales.length} venta{sales.length !== 1 ? 's' : ''}
          </Text>

          {sales.map((sale) => {
            const nextStatus = SELLER_NEXT_STATUS[sale.status]
            const isUpdating = updatingOrderId === sale.order_id
            const isAwaitingTracking = trackingOrderId === sale.order_id
            const buyerName = buyerNames[sale.buyer_id] || 'Comprador'

            return (
              <SaleCard
                key={sale.order_id}
                sale={sale}
                buyerName={buyerName}
                nextStatus={nextStatus}
                isUpdating={isUpdating}
                isAwaitingTracking={isAwaitingTracking}
                trackingInput={trackingInput}
                updateError={updateError}
                onTrackingInputChange={setTrackingInput}
                onCancelTracking={() => setTrackingOrderId(null)}
                onAdvanceStatus={handleUpdateOrderStatus}
                onConfirmTracking={() =>
                  doUpdateStatus(sale.order_id, 'shipped', trackingInput)
                }
                onRequestCancel={(orderId) => { setCancelError(''); setCancelReason(''); setCancelTargetId(orderId) }}
              />
            )
          })}
        </View>
      )}
    </View>
  )
}

function SaleCard({
  sale,
  buyerName,
  nextStatus,
  isUpdating,
  isAwaitingTracking,
  trackingInput,
  updateError,
  onTrackingInputChange,
  onCancelTracking,
  onAdvanceStatus,
  onConfirmTracking,
  onRequestCancel,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.statusBadge,
            sale.status === 'delivered' && styles.statusBadgeDelivered,
            (sale.status === 'cancelled' || sale.status === 'refund_in_progress' || sale.status === 'refund_processed') && styles.statusBadgeCancelled,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              sale.status === 'delivered' && styles.statusTextDelivered,
              (sale.status === 'cancelled' || sale.status === 'refund_in_progress' || sale.status === 'refund_processed') && styles.statusTextCancelled,
            ]}
          >
            {SELLER_STATUS_LABELS[sale.status] || sale.status}
          </Text>
        </View>

        <Text style={styles.total}>
          ${Number(sale.seller_subtotal ?? sale.partial_total ?? 0).toLocaleString('es-AR')}
        </Text>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Comprador</Text>
        <Text style={styles.infoValue}>{buyerName}</Text>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Entrega</Text>
        <Text style={styles.infoValue} numberOfLines={2}>
          {formatDeliveryAddress(sale.delivery_address)}
        </Text>
      </View>

      <View style={styles.productsBlock}>
        <Text style={styles.infoLabel}>Productos</Text>

        {sale.items?.map((item, index) => (
          <View key={`${item.product_id}-${index}`} style={styles.productRow}>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.product_name || item.name || item.product_id}
              </Text>
              <Text style={styles.productMeta}>x{item.quantity}</Text>
            </View>

            <Text style={styles.productSubtotal}>
              ${Number(item.subtotal || 0).toLocaleString('es-AR')}
            </Text>
          </View>
        ))}
      </View>

      {(sale.tracking_code || sale.trackingCode) && (
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Código de seguimiento</Text>
          <Text style={styles.infoValue}>
            {sale.tracking_code || sale.trackingCode}
          </Text>
        </View>
      )}

      <Text style={styles.date}>{formatDate(sale.created_at)}</Text>

      {nextStatus && !isAwaitingTracking && (
        <TouchableOpacity
          style={[styles.primaryButton, isUpdating && styles.buttonDisabled]}
          disabled={isUpdating}
          onPress={() => onAdvanceStatus(sale.order_id, nextStatus)}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>
              Pasar a {SELLER_STATUS_LABELS[nextStatus]}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {sale.status === 'confirmed' && !isAwaitingTracking && (
        <TouchableOpacity
          style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, borderWidth:1.5, borderColor:'#e53935', borderRadius:10, paddingVertical:12, marginTop:8 }}
          onPress={() => onRequestCancel(sale.order_id)}
          activeOpacity={0.8}
        >
          <Text style={{ color:'#e53935', fontWeight:'700', fontSize:14 }}>Cancelar venta</Text>
        </TouchableOpacity>
      )}

      {isAwaitingTracking && (
        <View style={styles.trackingContainer}>
          <Text style={styles.trackingLabel}>
            Código de seguimiento opcional
          </Text>

          <TextInput
            style={styles.trackingInput}
            placeholder="Ej: AR123456789"
            placeholderTextColor={COLORS.textMuted}
            value={trackingInput}
            onChangeText={onTrackingInputChange}
            maxLength={100}
            autoFocus
          />

          <View style={styles.trackingActions}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.trackingConfirmButton]}
              onPress={onConfirmTracking}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Confirmar envío</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onCancelTracking}
              disabled={isUpdating}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          {updateError ? (
            <Text style={styles.updateErrorText}>{updateError}</Text>
          ) : null}
        </View>
      )}
    </View>
  )
}

function formatDeliveryAddress(address) {
  if (!address) return 'Dirección no disponible'

  const main = `${address.calle || ''} ${address.altura || ''}`.trim()
  const parts = []

  if (main) parts.push(main)
  if (address.departamento) parts.push(`Dpto. ${address.departamento}`)
  if (address.zona) parts.push(address.zona)
  if (address.codigo_postal) parts.push(`CP ${address.codigo_postal}`)

  return parts.join(', ') || 'Dirección no disponible'
}

function formatDate(date) {
  if (!date) return ''

  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}