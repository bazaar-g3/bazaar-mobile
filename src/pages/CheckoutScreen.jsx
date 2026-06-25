/**
 * CheckoutScreen — Flujo completo de pago con MercadoPago Checkout Pro.
 *
 * Estados:
 *   'form'       → Resumen del pedido + formulario de dirección
 *   'processing' → Esperando resultado tras volver del browser de MP
 *   'success'    → Pago confirmado (orden en estado 'confirmed')
 *   'failed'     → Pago rechazado (orden en estado 'payment_rejected')
 *   'pending'    → Pago todavía en proceso (volver a verificar más tarde)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'

import { useCartContext } from '../context/CartContext'
import { checkout, getOrderById, getCheckoutErrorMessage, previewCart } from '../services/orders'
import { getSessionStatus } from '../services/session'
import { buildLoginRedirect } from '../utils/authRedirect'
import { useResponsive } from '../utils/responsive'
import { useTheme } from '../theme/ThemeContext'
import { makeStyles } from '../styles/checkoutStyles'
import AnimatedButton from '../components/AnimatedButton'
import { FONT, SPACING } from '../constants/theme'

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const POLL_DELAY_MS = 1500
const MAX_POLL_RETRIES = 4
const POLL_INTERVAL_MS = 2000

export default function CheckoutScreen() {
  const router = useRouter()
  const { isSmall, isTablet } = useResponsive()
  const { items, total, clearLocal } = useCartContext()
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const [checkingSession, setCheckingSession] = useState(true)
  const [address, setAddress] = useState({
    calle: '',
    altura: '',
    codigo_postal: '',
    zona: '',
    departamento: '',
  })
  const [addressErrors, setAddressErrors] = useState({})
  const [idempotencyKey, setIdempotencyKey] = useState(generateUUID)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [screen, setScreen] = useState('form')
  const [orderResult, setOrderResult] = useState(null)
  const pollTimerRef = useRef(null)

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState(null)
  const [loadingCoupon, setLoadingCoupon] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function checkAuth() {
      const session = await getSessionStatus()
      if (!session.isAuthenticated) {
        router.replace(buildLoginRedirect({ redirectPath: '/checkout' }))
        return
      }
      if (!cancelled) setCheckingSession(false)
    }
    checkAuth()
    return () => { cancelled = true }
  }, [router])

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current)
    }
  }, [])

  function validateAddressFields(addr) {
    const errors = {}
    if (!addr.calle?.trim() || addr.calle.trim().length < 2)
      errors.calle = 'Ingresá el nombre de la calle.'
    if (!addr.altura?.trim())
      errors.altura = 'Ingresá la altura.'
    const cp = addr.codigo_postal?.trim() ?? ''
    if (cp.length < 4 || cp.length > 8)
      errors.codigo_postal = 'El código postal debe tener entre 4 y 8 caracteres.'
    else if (!/^[a-zA-Z0-9-]+$/.test(cp))
      errors.codigo_postal = 'Solo letras, números y guiones.'
    return errors
  }

  function setField(field, value) {
    setAddress((prev) => ({ ...prev, [field]: value }))
    setAddressErrors((prev) => {
      if (!prev[field]) return prev
      const newErrors = validateAddressFields({ ...address, [field]: value })
      return { ...prev, [field]: newErrors[field] ?? undefined }
    })
  }

  async function pollOrderStatus(orderId, retries = 0) {
    try {
      const order = await getOrderById(orderId)
      if (order.status === 'confirmed') {
        clearLocal()
        setScreen('success')
        return
      }
      if (order.status === 'payment_rejected') {
        setScreen('failed')
        return
      }
      if (retries < MAX_POLL_RETRIES) {
        pollTimerRef.current = setTimeout(
          () => pollOrderStatus(orderId, retries + 1),
          POLL_INTERVAL_MS,
        )
      } else {
        setScreen('pending')
      }
    } catch {
      setScreen('pending')
    }
  }

  async function handleSubmit() {
    const errors = validateAddressFields(address)
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors)
      return
    }
    setAddressErrors({})
    setApiError(null)
    setSubmitting(true)

    const deliveryAddress = {
      calle: address.calle.trim(),
      altura: address.altura.trim(),
      codigo_postal: address.codigo_postal.trim(),
      zona: address.zona?.trim() || null,
      departamento: address.departamento?.trim() || null,
    }

    try {
      const couponCode = appliedCoupon?.code ?? null
      const result = await checkout(deliveryAddress, idempotencyKey, couponCode)
      setOrderResult(result)

      await WebBrowser.openBrowserAsync(result.init_point, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: false,
        controlsColor: theme.color.accent,
      })

      setSubmitting(false)
      setScreen('processing')
      pollTimerRef.current = setTimeout(
        () => pollOrderStatus(result.order_id),
        POLL_DELAY_MS,
      )
    } catch (e) {
      setSubmitting(false)
      if (e?.response?.status === 422 && appliedCoupon) {
        const detail = e?.response?.data?.detail
        const msg = typeof detail === 'object' ? detail.message : (detail || 'El cupón ya no está disponible.')
        setAppliedCoupon(null)
        setCouponError(msg)
      } else {
        setApiError(getCheckoutErrorMessage(e))
      }
    }
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (!code) return

    setLoadingCoupon(true)
    setCouponError(null)
    try {
      const result = await previewCart(code)
      if (result.coupon_valid === true) {
        setAppliedCoupon({
          code,
          discount_amount: result.discount_amount,
          total: result.total,
        })
        setCouponError(null)
      } else {
        setAppliedCoupon(null)
        setCouponError(result.coupon_error || 'Cupón inválido.')
      }
    } catch {
      setAppliedCoupon(null)
      setCouponError('No se pudo verificar el cupón. Intentá nuevamente.')
    } finally {
      setLoadingCoupon(false)
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError(null)
  }

  function handleRetry() {
    setIdempotencyKey(generateUUID())
    setApiError(null)
    setAddressErrors({})
    setScreen('form')
  }

  function goToOrders() {
    router.replace('/orders')
  }

  function goToCart() {
    router.back()
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

  if (screen === 'processing') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.surface }}>
        <View style={[styles.fullCenter, { padding: SPACING.lg }]}>
          <ActivityIndicator size="large" color={theme.color.accent} />
          <Text style={styles.processingTitle}>Procesando tu pago…</Text>
          <Text style={styles.processingSubtitle}>
            Estamos verificando el resultado con MercadoPago. Esto tarda solo unos segundos.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (screen === 'success') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.surface }}>
        <View style={[styles.fullCenter, { padding: SPACING.lg }]}>
          <View style={styles.resultIconCircle}>
            <Ionicons name="checkmark" size={48} color={theme.color.onAccent} />
          </View>
          <Text style={styles.resultTitle}>¡Pago exitoso!</Text>
          <Text style={styles.resultSubtitle}>
            Tu orden fue confirmada. Podés seguir su estado en «Mis órdenes».
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={goToOrders}>
            <Text style={styles.primaryButtonText}>Ver mis órdenes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ghostButton}
            onPress={() => router.replace('/home')}
          >
            <Text style={styles.ghostButtonText}>Seguir comprando</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (screen === 'failed') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.surface }}>
        <View style={[styles.fullCenter, { padding: SPACING.lg }]}>
          <View style={[styles.resultIconCircle, { backgroundColor: theme.color.error }]}>
            <Ionicons name="close" size={48} color={theme.color.onAccent} />
          </View>
          <Text style={styles.resultTitle}>Pago rechazado</Text>
          <Text style={styles.resultSubtitle}>
            Tu pago no pudo procesarse. Podés intentarlo nuevamente o usar otro medio de pago.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleRetry}>
            <Text style={styles.primaryButtonText}>Reintentar pago</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostButton} onPress={goToCart}>
            <Text style={styles.ghostButtonText}>Volver al carrito</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (screen === 'pending') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.surface }}>
        <View style={[styles.fullCenter, { padding: SPACING.lg }]}>
          <View style={[styles.resultIconCircle, { backgroundColor: theme.color.like }]}>
            <Ionicons name="time" size={48} color={theme.color.onAccent} />
          </View>
          <Text style={styles.resultTitle}>Pago en proceso</Text>
          <Text style={styles.resultSubtitle}>
            Tu pago está siendo verificado por MercadoPago. Puede demorar unos minutos.
            Revisá el estado en «Mis órdenes».
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={goToOrders}>
            <Text style={styles.primaryButtonText}>Ver mis órdenes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.surface }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={containerStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={goToCart}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={theme.color.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontSize: isSmall ? FONT.large : 26 }]}>
              Confirmar compra
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Resumen del pedido */}
          <Text style={styles.sectionLabel}>Resumen del pedido</Text>
          <View style={styles.summaryCard}>
            {items.map((item) => (
              <View key={item.product_id} style={styles.summaryRow}>
                <Text style={styles.summaryItemName} numberOfLines={2}>
                  {item.name ?? `Producto ${String(item.product_id).slice(0, 8)}`}
                </Text>
                <View style={styles.summaryItemRight}>
                  <Text style={styles.summaryQty}>×{item.quantity}</Text>
                  <Text style={styles.summarySubtotal}>
                    ${Number(item.subtotal ?? item.unit_price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}

            {appliedCoupon && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryItemName, styles.discountLabel]}>
                  Descuento ({appliedCoupon.code})
                </Text>
                <Text style={[styles.summarySubtotal, styles.discountAmount]}>
                  -${Number(appliedCoupon.discount_amount).toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                ${Number(appliedCoupon ? appliedCoupon.total : total).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Cupón de descuento */}
          <Text style={styles.sectionLabel}>Cupón de descuento</Text>
          {appliedCoupon ? (
            <View style={styles.couponAppliedRow}>
              <View style={styles.couponAppliedBadge}>
                <Ionicons name="pricetag" size={14} color={theme.color.success} />
                <Text style={styles.couponAppliedText}>{appliedCoupon.code} aplicado</Text>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={20} color={theme.color.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <TextInput
                style={[styles.input, styles.couponInput, { fontSize: isSmall ? FONT.small : FONT.regular }]}
                placeholder="Código de cupón"
                placeholderTextColor={theme.color.textMuted}
                value={couponInput}
                onChangeText={(v) => {
                  setCouponInput(v.toUpperCase())
                  if (couponError) setCouponError(null)
                }}
                autoCapitalize="characters"
                returnKeyType="done"
                maxLength={50}
                editable={!loadingCoupon}
              />
              <TouchableOpacity
                style={[styles.couponApplyButton, (!couponInput.trim() || loadingCoupon) && styles.payButtonDisabled]}
                onPress={handleApplyCoupon}
                disabled={!couponInput.trim() || loadingCoupon}
              >
                {loadingCoupon
                  ? <ActivityIndicator size="small" color={theme.color.onAccent} />
                  : <Text style={styles.couponApplyText}>Aplicar</Text>
                }
              </TouchableOpacity>
            </View>
          )}
          {couponError ? (
            <Text style={styles.couponErrorText}>{couponError}</Text>
          ) : null}

          {/* Dirección de entrega */}
          <Text style={styles.sectionLabel}>Dirección de entrega</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressRow}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[
                    styles.input,
                    addressErrors.calle && styles.inputError,
                    { fontSize: isSmall ? FONT.small : FONT.regular },
                  ]}
                  placeholder="Calle / Avenida *"
                  placeholderTextColor={theme.color.textMuted}
                  value={address.calle}
                  onChangeText={(v) => setField('calle', v)}
                  onBlur={() => setAddressErrors((e) => ({ ...e, ...validateAddressFields(address) }))}
                  returnKeyType="next"
                  maxLength={100}
                />
                {addressErrors.calle ? <Text style={styles.errorText}>{addressErrors.calle}</Text> : null}
              </View>
              <View style={{ width: 90 }}>
                <TextInput
                  style={[
                    styles.input,
                    addressErrors.altura && styles.inputError,
                    { fontSize: isSmall ? FONT.small : FONT.regular },
                  ]}
                  placeholder="Altura *"
                  placeholderTextColor={theme.color.textMuted}
                  value={address.altura}
                  onChangeText={(v) => setField('altura', v)}
                  onBlur={() => setAddressErrors((e) => ({ ...e, ...validateAddressFields(address) }))}
                  returnKeyType="next"
                  keyboardType="default"
                  maxLength={10}
                />
                {addressErrors.altura ? <Text style={styles.errorText}>{addressErrors.altura}</Text> : null}
              </View>
            </View>

            <TextInput
              style={[
                styles.input,
                { fontSize: isSmall ? FONT.small : FONT.regular },
              ]}
              placeholder="Departamento / Piso (opcional)"
              placeholderTextColor={theme.color.textMuted}
              value={address.departamento}
              onChangeText={(v) => setField('departamento', v)}
              returnKeyType="next"
              maxLength={20}
            />

            <TextInput
              style={[
                styles.input,
                { fontSize: isSmall ? FONT.small : FONT.regular },
              ]}
              placeholder="Barrio (opcional)"
              placeholderTextColor={theme.color.textMuted}
              value={address.zona}
              onChangeText={(v) => setField('zona', v)}
              returnKeyType="next"
              maxLength={100}
            />

            <TextInput
              style={[
                styles.input,
                addressErrors.codigo_postal && styles.inputError,
                { fontSize: isSmall ? FONT.small : FONT.regular },
              ]}
              placeholder="Código Postal *"
              placeholderTextColor={theme.color.textMuted}
              value={address.codigo_postal}
              onChangeText={(v) => setField('codigo_postal', v)}
              onBlur={() => setAddressErrors((e) => ({ ...e, ...validateAddressFields(address) }))}
              returnKeyType="done"
              keyboardType="default"
              maxLength={8}
            />
            {addressErrors.codigo_postal ? (
              <Text style={styles.errorText}>{addressErrors.codigo_postal}</Text>
            ) : null}
          </View>

          {apiError ? (
            <View style={styles.apiErrorBox}>
              <Ionicons name="alert-circle" size={18} color={theme.color.error} />
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          ) : null}

          <AnimatedButton
            variant="cta"
            label="Pagar con MercadoPago"
            icon={<Ionicons name="card-outline" size={20} color={theme.color.onAccent} />}
            onPress={handleSubmit}
            disabled={submitting || items.length === 0}
          />

          <Text style={styles.secureNote}>
            <Ionicons name="lock-closed-outline" size={12} color={theme.color.textMuted} />
            {' '}Pago procesado de forma segura por MercadoPago
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
