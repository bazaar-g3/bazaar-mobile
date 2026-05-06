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
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'

import { useCartContext } from '../context/CartContext'
import { checkout, getOrderById, getCheckoutErrorMessage } from '../services/orders'
import { getSessionStatus } from '../services/session'
import { buildLoginRedirect } from '../utils/authRedirect'
import { useResponsive } from '../utils/responsive'
import { COLORS } from '../constants/colors'
import { FONT, SPACING } from '../constants/theme'

// Genera un UUID v4 sin dependencias externas.
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Cuántos ms esperar antes del primer poll de estado (el webhook puede tardar un poco)
const POLL_DELAY_MS = 1500
// Cuántas veces reintentar el poll si la orden sigue en pending_payment
const MAX_POLL_RETRIES = 4
const POLL_INTERVAL_MS = 2000

export default function CheckoutScreen() {
  const router = useRouter()
  const { isSmall, isTablet } = useResponsive()
  const { items, total, clearLocal } = useCartContext()

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
  const [screen, setScreen] = useState('form') // 'form' | 'processing' | 'success' | 'failed' | 'pending'
  const [orderResult, setOrderResult] = useState(null)
  const pollTimerRef = useRef(null)

  // Auth gate
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

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current)
    }
  }, [])

  // Validación por campo
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
    // Revalidar el campo tocado en tiempo real solo si ya había error
    setAddressErrors((prev) => {
      if (!prev[field]) return prev
      const newErrors = validateAddressFields({ ...address, [field]: value })
      return { ...prev, [field]: newErrors[field] ?? undefined }
    })
  }

  /**
   * Polling de estado de la orden.
   * Reintenta hasta MAX_POLL_RETRIES veces si sigue en pending_payment.
   */
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
      // Todavía pending_payment → reintentar
      if (retries < MAX_POLL_RETRIES) {
        pollTimerRef.current = setTimeout(
          () => pollOrderStatus(orderId, retries + 1),
          POLL_INTERVAL_MS,
        )
      } else {
        // Demasiado tiempo sin respuesta → mostrar estado pendiente
        setScreen('pending')
      }
    } catch {
      // Error de red → mostrar pendiente para que el usuario verifique en Mis órdenes
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
      const result = await checkout(deliveryAddress, idempotencyKey)
      setOrderResult(result)

      // Abrir MercadoPago Checkout Pro en el browser nativo / pestaña web
      await WebBrowser.openBrowserAsync(result.init_point, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: false,
        controlsColor: COLORS.primary,
      })

      // El usuario volvió del browser → esperar un poco y consultar estado
      setSubmitting(false)
      setScreen('processing')
      pollTimerRef.current = setTimeout(
        () => pollOrderStatus(result.order_id),
        POLL_DELAY_MS,
      )
    } catch (e) {
      setSubmitting(false)
      setApiError(getCheckoutErrorMessage(e))
    }
  }

  function handleRetry() {
    // Generar nueva idempotency key para el reintento
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

  // ── Loading auth ──────────────────────────────────────────────────────────
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

  // ── Procesando (esperando webhook) ────────────────────────────────────────
  if (screen === 'processing') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View style={[styles.fullCenter, { padding: SPACING.lg }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.processingTitle}>Procesando tu pago…</Text>
          <Text style={styles.processingSubtitle}>
            Estamos verificando el resultado con MercadoPago. Esto tarda solo unos segundos.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  // ── Éxito ─────────────────────────────────────────────────────────────────
  if (screen === 'success') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View style={[styles.fullCenter, { padding: SPACING.lg }]}>
          <View style={styles.resultIconCircle}>
            <Ionicons name="checkmark" size={48} color={COLORS.white} />
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

  // ── Fallo ─────────────────────────────────────────────────────────────────
  if (screen === 'failed') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View style={[styles.fullCenter, { padding: SPACING.lg }]}>
          <View style={[styles.resultIconCircle, { backgroundColor: COLORS.error }]}>
            <Ionicons name="close" size={48} color={COLORS.white} />
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

  // ── Pendiente (sin respuesta después del polling) ─────────────────────────
  if (screen === 'pending') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View style={[styles.fullCenter, { padding: SPACING.lg }]}>
          <View style={[styles.resultIconCircle, { backgroundColor: COLORS.secondary }]}>
            <Ionicons name="time" size={48} color={COLORS.white} />
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

  // ── Formulario ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
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
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
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

            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>${Number(total).toFixed(2)}</Text>
            </View>
          </View>

          {/* Dirección de entrega */}
          <Text style={styles.sectionLabel}>Dirección de entrega</Text>

          {/* Calle + Altura en la misma fila */}
          <View style={styles.addressRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={[
                  styles.input,
                  addressErrors.calle && styles.inputError,
                  { fontSize: isSmall ? FONT.small : FONT.regular },
                ]}
                placeholder="Calle / Avenida *"
                placeholderTextColor={COLORS.textMuted}
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
                placeholderTextColor={COLORS.textMuted}
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

          {/* Departamento (opcional) */}
          <TextInput
            style={[
              styles.input,
              { fontSize: isSmall ? FONT.small : FONT.regular },
            ]}
            placeholder="Departamento / Piso (opcional)"
            placeholderTextColor={COLORS.textMuted}
            value={address.departamento}
            onChangeText={(v) => setField('departamento', v)}
            returnKeyType="next"
            maxLength={20}
          />

          {/* Zona / Barrio (opcional) */}
          <TextInput
            style={[
              styles.input,
              { fontSize: isSmall ? FONT.small : FONT.regular },
            ]}
            placeholder="Barrio (opcional)"
            placeholderTextColor={COLORS.textMuted}
            value={address.zona}
            onChangeText={(v) => setField('zona', v)}
            returnKeyType="next"
            maxLength={100}
          />

          {/* Código Postal */}
          <TextInput
            style={[
              styles.input,
              addressErrors.codigo_postal && styles.inputError,
              { fontSize: isSmall ? FONT.small : FONT.regular },
            ]}
            placeholder="Código Postal *"
            placeholderTextColor={COLORS.textMuted}
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

          {/* Error de API */}
          {apiError ? (
            <View style={styles.apiErrorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          ) : null}

          {/* Botón de pago */}
          <TouchableOpacity
            style={[
              styles.payButton,
              (submitting || items.length === 0) && styles.payButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting || items.length === 0}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <View style={styles.payButtonContent}>
                <Ionicons name="card-outline" size={20} color={COLORS.white} />
                <Text style={styles.payButtonText}>Pagar con MercadoPago</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.secureNote}>
            <Ionicons name="lock-closed-outline" size={12} color={COLORS.textMuted} />
            {' '}Pago procesado de forma segura por MercadoPago
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  fullCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.white,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  containerTablet: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  headerTitle: {
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  // Sección labels
  sectionLabel: {
    fontSize: FONT.small,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },

  // Resumen
  summaryCard: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  summaryItemName: {
    flex: 1,
    fontSize: FONT.regular,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  summaryItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  summaryQty: {
    fontSize: FONT.small,
    color: COLORS.textMuted,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'right',
  },
  summarySubtotal: {
    fontSize: FONT.regular,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 72,
    textAlign: 'right',
  },
  totalDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FONT.medium,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: FONT.large,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  // Dirección
  addressRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.divider,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT.small,
    color: COLORS.error,
    fontWeight: '600',
    marginTop: -SPACING.xs,
  },

  // API error
  apiErrorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    padding: SPACING.sm,
  },
  apiErrorText: {
    flex: 1,
    fontSize: FONT.small,
    color: COLORS.error,
    fontWeight: '600',
    lineHeight: 18,
  },

  // Botón de pago
  payButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    minHeight: 54,
  },
  payButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: FONT.medium,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secureNote: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  // Pantallas de resultado
  resultIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  resultTitle: {
    fontSize: FONT.large,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  resultSubtitle: {
    fontSize: FONT.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  processingTitle: {
    fontSize: FONT.large,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: FONT.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT.medium,
    fontWeight: '800',
  },
  ghostButton: {
    marginTop: SPACING.sm,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.divider,
    width: '100%',
    maxWidth: 320,
  },
  ghostButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT.medium,
    fontWeight: '700',
  },
})
