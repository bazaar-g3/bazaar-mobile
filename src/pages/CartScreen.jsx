import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'

import { useCartContext } from '../context/CartContext'
import { getCartErrorMessage } from '../services/cart'
import { getSessionStatus } from '../services/session'
import { buildLoginRedirect } from '../utils/authRedirect'
import { useResponsive } from '../utils/responsive'
import { useTheme } from '../theme/ThemeContext'
import { FONT, SPACING } from '../constants/theme'
import { makeStyles } from '../styles/cartStyles'
import { PRODUCT_IMAGE_PLACEHOLDER } from '../services/catalog'
import ConfirmModal from '../components/ConfirmModal'
import AnimatedPressable from '../components/AnimatedPressable'

export default function CartScreen() {
  const router = useRouter()
  const { isSmall, isTablet } = useResponsive()
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

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
        <ActivityIndicator size="large" color={theme.color.accent} />
      </SafeAreaView>
    )
  }

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
        <View style={[styles.itemImage, { width: imgSize, height: imgSize }]}>
          <Image
            source={{ uri: item.image || PRODUCT_IMAGE_PLACEHOLDER }}
            style={styles.itemImageInner}
          />
        </View>

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
              <Ionicons name="alert-circle" size={14} color={theme.color.onAccent} />
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

            <AnimatedPressable
              onPress={() => handleRemove(item.product_id, item.name)}
              style={styles.trashBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={20} color={theme.color.error} />
            </AnimatedPressable>
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.surface }}>
      <View style={containerStyle}>
        <Text style={[styles.title, { fontSize: titleFont }]}>Mi carrito</Text>

        {loading && items.length === 0 ? (
          <ActivityIndicator size="large" color={theme.color.accent} style={{ marginTop: SPACING.xl }} />
        ) : error && items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color={theme.color.textMuted} />
            <Text style={styles.emptyText}>
              No pudimos cargar tu carrito. Probá de nuevo.
            </Text>
            <TouchableOpacity style={styles.shopButton} onPress={refresh}>
              <Text style={styles.shopButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={48} color={theme.color.textMuted} />
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

              <AnimatedPressable
                disabled={items.length === 0 || hasUnavailable}
                style={[
                  styles.checkoutButton,
                  (items.length === 0 || hasUnavailable) && styles.checkoutDisabled,
                ]}
                onPress={() => router.push('/checkout')}
              >
                <Text style={styles.checkoutButtonText}>Finalizar compra</Text>
              </AnimatedPressable>
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