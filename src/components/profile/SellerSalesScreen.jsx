import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import { useTheme } from '../../theme/ThemeContext'
import { getSellerSales, updateOrderStatus } from '../../services/orders'
import { getPublicProfile } from '../../services/user'
import { makeStyles } from '../../styles/sellerSales/sellerSalesStyles'

const STATUS_FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Confirmadas', value: 'confirmed' },
  { label: 'En preparación', value: 'in_preparation' },
  { label: 'Enviadas', value: 'shipped' },
  { label: 'Entregadas', value: 'delivered' },
]

const SELLER_STATUS_LABELS = {
  confirmed: 'Confirmada',
  in_preparation: 'En preparación',
  shipped: 'Enviada',
  delivered: 'Entregada',
}

const SELLER_NEXT_STATUS = {
  confirmed: 'in_preparation',
  in_preparation: 'shipped',
}

export default function SellerSalesScreen({ sellerId }) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const [sales, setSales] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [buyerNames, setBuyerNames] = useState({})

  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [trackingOrderId, setTrackingOrderId] = useState(null)
  const [trackingInput, setTrackingInput] = useState('')
  const [updateError, setUpdateError] = useState('')

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

  return (
    <View style={styles.screen}>
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
          <ActivityIndicator color={theme.color.accent} />
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
}) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.statusBadge,
            sale.status === 'delivered' && styles.statusBadgeDelivered,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              sale.status === 'delivered' && styles.statusTextDelivered,
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
            <ActivityIndicator size="small" color={theme.color.onAccent} />
          ) : (
            <Text style={styles.primaryButtonText}>
              Pasar a {SELLER_STATUS_LABELS[nextStatus]}
            </Text>
          )}
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
            placeholderTextColor={theme.color.textMuted}
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
                <ActivityIndicator size="small" color={theme.color.onAccent} />
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