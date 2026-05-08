import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'

import { useCartContext } from '../context/CartContext'
import { getCartErrorMessage } from '../services/cart'
import { getSessionStatus } from '../services/session'
import { buildLoginRedirect } from '../utils/authRedirect'
import { useResponsive } from '../utils/responsive'
import { COLORS } from '../constants/colors'
import { FONT, SPACING } from '../constants/theme'
import { PRODUCT_IMAGE_PLACEHOLDER } from '../services/catalog'
import ConfirmModal from '../components/ConfirmModal'

export default function CartScreen() {
  const router = useRouter()
  const { isSmall, isTablet } = useResponsive()

  const {
    items,
    total,
    hasUnavailable,
    loading,
    error,
    refresh,
    updateQuantity,
    removeItem,
  } = useCartContext()

  const [checkingSession, setCheckingSession] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [confirmState, setConfirmState] = useState({
    visible: false,
    productId: null,
    productName: null,
  })

  // Auth gate (igual al original)
  useEffect(() => {
    let cancelled = false
    async function ensureAuthenticatedUser() {
      const session = await getSessionStatus()
      if (!session.isAuthenticated) {
        router.replace(buildLoginRedirect({ redirectPath: '/cart' }))
        return
      }
      if (!cancelled) setCheckingSession(false)
    }
    ensureAuthenticatedUser()
    return () => { cancelled = true }
  }, [router])

  // CA4: refresh con datos vivos cada vez que se entra
  useFocusEffect(
    useCallback(() => {
      if (!checkingSession) refresh()
    }, [checkingSession, refresh])
  )

  async function handleQuantityChange(productId, newQuantity) {
    if (newQuantity < 1) return
    setUpdatingId(productId)
    try {
      await updateQuantity(productId, newQuantity)
    } catch (e) {
      Alert.alert('Error', getCartErrorMessage(e))
    } finally {
      setUpdatingId(null)
    }
  }

  function handleRemove(productId, name) {
    setConfirmState({ visible: true, productId, productName: name })
  }

  async function confirmRemove() {
    const { productId } = confirmState
    setConfirmState({ visible: false, productId: null, productName: null })
    if (!productId) return
    try {
      await removeItem(productId)
    } catch (e) {
      Alert.alert('Error', getCartErrorMessage(e))
    }
  }

  function cancelRemove() {
    setConfirmState({ visible: false, productId: null, productName: null })
  }

  if (checkingSession) {
    return (
      <SafeAreaView style={styles.fullCenter}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    )
  }

  // Estilos responsive
  const containerStyle = [
    styles.container,
    { paddingHorizontal: isSmall ? SPACING.md : SPACING.lg },
    isTablet && styles.containerTablet,
  ]
  const imgSize = isSmall ? 64 : isTablet ? 96 : 80
  const titleFont = isSmall ? FONT.large : FONT.title

  const renderItem = ({ item }) => {
    const disabled = !item.available
    const reason = item.unavailable_reason
    const canIncrement =
      !disabled &&
      item.stock != null &&
      item.quantity < item.stock
    const isUpdating = updatingId === item.product_id

    return (
      <View
        style={[
          styles.itemCard,
          disabled && styles.itemCardDisabled,
          isSmall ? styles.itemCardSmall : styles.itemCardWide,
        ]}
      >
        <Image
          source={{ uri: item.image || PRODUCT_IMAGE_PLACEHOLDER }}
          style={{
            width: imgSize,
            height: imgSize,
            borderRadius: 8,
            backgroundColor: COLORS.divider,
          }}
        />

        <View style={styles.itemBody}>
          <Text
            numberOfLines={2}
            style={[styles.itemTitle, disabled && styles.strikethrough]}
          >
            {item.name || `Producto ${String(item.product_id).slice(0, 8)}`}
          </Text>

          <Text style={styles.itemDetail}>
            Precio unitario: ${Number(item.unit_price).toFixed(2)}
          </Text>
          <Text style={styles.subtotal}>
            Subtotal: ${Number(item.subtotal).toFixed(2)}
          </Text>

          {disabled && (
            <View style={styles.unavailableTag}>
              <Ionicons name="alert-circle" size={14} color={COLORS.white} />
              <Text style={styles.unavailableTagText}>
                {reason === 'disabled' ? 'No disponible' : 'Sin stock suficiente'}
              </Text>
            </View>
          )}

          <View style={styles.controlsRow}>
            <View style={styles.stepper}>
              <TouchableOpacity
                onPress={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                disabled={disabled || item.quantity <= 1 || isUpdating}
                style={[
                  styles.stepperBtn,
                  (disabled || item.quantity <= 1 || isUpdating) && styles.stepperBtnDisabled,
                ]}
              >
                <Text style={styles.stepperText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.qtyValue}>{item.quantity}</Text>

              <TouchableOpacity
                onPress={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                disabled={!canIncrement || isUpdating}
                style={[
                  styles.stepperBtn,
                  (!canIncrement || isUpdating) && styles.stepperBtnDisabled,
                ]}
              >
                <Text style={styles.stepperText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => handleRemove(item.product_id, item.name)}
              style={styles.trashBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={containerStyle}>
        <Text style={[styles.title, { fontSize: titleFont }]}>Mi carrito</Text>

        {loading && items.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        ) : error && items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>
              No pudimos cargar tu carrito. Probá de nuevo.
            </Text>
            <TouchableOpacity style={styles.shopButton} onPress={refresh}>
              <Text style={styles.shopButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Tu carrito está vacío</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push('/home')}
            >
              <Text style={styles.shopButtonText}>Ir al catálogo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.product_id)}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshing={loading}
              onRefresh={refresh}
            />

            <View style={styles.summary}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>${Number(total).toFixed(2)}</Text>
              </View>

              {hasUnavailable && (
                <Text style={styles.warnText}>
                  Hay productos no disponibles. Quitalos para continuar.
                </Text>
              )}

              <TouchableOpacity
                disabled={items.length === 0 || hasUnavailable}
                style={[
                  styles.checkoutButton,
                  (items.length === 0 || hasUnavailable) && styles.checkoutDisabled,
                ]}
                onPress={() => router.push('/checkout')}
              >
                <Text style={styles.checkoutButtonText}>Finalizar compra</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <ConfirmModal
        visible={confirmState.visible}
        title="Eliminar item"
        message={`¿Seguro que querés quitar ${confirmState.productName || 'este producto'} del carrito?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        destructive
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  fullCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
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
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  listContent: {
    paddingBottom: SPACING.lg,
  },
  itemCard: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemCardSmall: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  itemCardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  itemCardDisabled: {
    opacity: 0.7,
    borderColor: COLORS.error,
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: FONT.medium,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  itemDetail: {
    fontSize: FONT.small,
    color: COLORS.textSecondary,
  },
  subtotal: {
    fontSize: FONT.regular,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  unavailableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.third,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 6,
    gap: 4,
  },
  unavailableTagText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    overflow: 'hidden',
  },
  stepperBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperText: {
    fontSize: FONT.large,
    fontWeight: '800',
    color: COLORS.primary,
    lineHeight: FONT.large + 2,
  },
  qtyValue: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: FONT.medium,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  trashBtn: {
    padding: 8,
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
  warnText: {
    color: COLORS.error,
    fontSize: FONT.small,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: FONT.medium,
    fontWeight: '800',
    letterSpacing: 0.4,
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
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
  },
  shopButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: FONT.regular,
  },
})