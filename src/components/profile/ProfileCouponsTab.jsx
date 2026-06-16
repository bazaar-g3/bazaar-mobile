import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'

import { useTheme } from '../../theme/ThemeContext'
import { Feather } from '@expo/vector-icons'
import {
  createCoupon,
  getCouponErrorMessage,
  getCouponStatusLabel,
  listMyCoupons,
  updateCouponExpiration,
  updateCouponStatus,
} from '../../services/coupons'
import { makeStyles } from '../../styles/profile/couponsTabStyles'

function formatDate(value) {
  if (!value) return 'Sin fecha'
  return new Date(value).toLocaleDateString('es-AR')
}

function toIsoEndOfDay(dateText) {
  const [year, month, day] = dateText.split('-').map(Number)

  if (!year || !month || !day) {
    throw new Error('Usá el formato AAAA-MM-DD.')
  }

  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59)).toISOString()
}

function getInitialExpirationDate(value) {
  if (!value) return ''

  return value.slice(0, 10)
}

function CouponModal({
  visible,
  title,
  submitLabel,
  loading,
  initialCode = '',
  initialDiscount = '',
  initialExpiration = '',
  showCode = true,
  showDiscount = true,
  onClose,
  onSubmit,
}) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const [code, setCode] = useState(initialCode)
  const [discountPercent, setDiscountPercent] = useState(initialDiscount)
  const [expiresAt, setExpiresAt] = useState(initialExpiration)

  useEffect(() => {
    setCode(initialCode)
    setDiscountPercent(initialDiscount)
    setExpiresAt(initialExpiration)
  }, [initialCode, initialDiscount, initialExpiration, visible])

  function handleSubmit() {
    onSubmit({
      code: code.trim(),
      discountPercent: Number(discountPercent),
      expiresAt,
    })
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.couponModalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.couponModalScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.couponModalCard}>
            <Text style={styles.couponModalTitle}>{title}</Text>

            <Text style={styles.couponModalSubtitle}>
              Completá los datos del cupón para que quede disponible en la
              plataforma.
            </Text>

            {showCode && (
              <View style={styles.couponInputGroup}>
                <Text style={styles.couponInputLabel}>Código</Text>

                <TextInput
                  value={code}
                  onChangeText={setCode}
                  autoCapitalize="characters"
                  placeholder="Ej: VERANO20"
                  placeholderTextColor={theme.color.textMuted}
                  style={styles.couponInput}
                />
              </View>
            )}

            {showDiscount && (
              <View style={styles.couponInputGroup}>
                <Text style={styles.couponInputLabel}>Descuento (%)</Text>

                <TextInput
                  value={String(discountPercent)}
                  onChangeText={setDiscountPercent}
                  keyboardType="numeric"
                  placeholder="Ej: 20"
                  placeholderTextColor={theme.color.textMuted}
                  style={styles.couponInput}
                />
              </View>
            )}

            <View style={styles.couponInputGroup}>
              <Text style={styles.couponInputLabel}>
                Vencimiento (AAAA-MM-DD)
              </Text>

              <TextInput
                value={expiresAt}
                onChangeText={setExpiresAt}
                placeholder="Ej: 2026-12-31"
                placeholderTextColor={theme.color.textMuted}
                style={styles.couponInput}
              />
            </View>

            <View style={styles.couponModalActions}>
              <TouchableOpacity
                style={styles.couponModalCancelButton}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.couponModalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.couponModalSubmitButton,
                  loading && styles.btnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.color.onAccent} size="small" />
                ) : (
                  <Text style={styles.couponModalSubmitText}>{submitLabel}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

function CouponCard({ coupon, compact, onToggleStatus, onEditExpiration }) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const isActive = coupon.status === 'active'
  const isExpired = coupon.status === 'expired'

  return (
    <View style={[styles.couponCard, compact && styles.couponCardMobile]}>
        <View
          style={[
            styles.couponCardHeader,
            compact && styles.couponCardHeaderMobile,
          ]}
        >
        <View style={styles.couponCodeBox}>
          <Text style={styles.couponCode}>{coupon.code}</Text>

          <Text style={styles.couponDiscount}>
            {coupon.discountPercent}% OFF
          </Text>
        </View>

        <View
          style={[
            styles.couponStatusBadge,
            compact && styles.couponStatusBadgeMobile,
            coupon.status === 'active' && styles.couponStatusActive,
            coupon.status === 'inactive' && styles.couponStatusInactive,
            coupon.status === 'expired' && styles.couponStatusExpired,
          ]}
        >
          <Text style={styles.couponStatusText}>
            {getCouponStatusLabel(coupon.status)}
          </Text>
        </View>
      </View>

      <View style={styles.couponMetaRow}>
        <Text style={styles.couponMeta}>
          Vence el {formatDate(coupon.expiresAt)}
        </Text>

        <TouchableOpacity
          onPress={() => onEditExpiration(coupon)}
        >
          <Feather
            name="edit-2"
            size={15}
            color={theme.color.textMuted}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.couponActions}>
        <TouchableOpacity
          style={[
            styles.couponToggleButton,
            isActive ? styles.couponDisableButton : styles.couponEnableButton,
            isExpired && styles.btnDisabled,
          ]}
          onPress={() => onToggleStatus(coupon)}
          disabled={isExpired}
        >
          <Text style={styles.couponActionText}>
            {isActive ? 'Desactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function ProfileCouponsTab() {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const { width } = useWindowDimensions()
  const compact = width < 720

  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [createVisible, setCreateVisible] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)

  const loadCoupons = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await listMyCoupons()
      setCoupons(data)
    } catch (err) {
      setError(getCouponErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCoupons()
  }, [loadCoupons])

  async function handleCreateCoupon(formData) {
    try {
      setActionLoading(true)

      await createCoupon({
        code: formData.code,
        discountPercent: formData.discountPercent,
        expiresAt: toIsoEndOfDay(formData.expiresAt),
      })

      setCreateVisible(false)
      await loadCoupons()
    } catch (err) {
      Alert.alert('No pudimos crear el cupón', getCouponErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleToggleStatus(coupon) {
    try {
      setActionLoading(true)

      await updateCouponStatus({
        couponId: coupon.id,
        isActive: coupon.status !== 'active',
      })

      await loadCoupons()
    } catch (err) {
      Alert.alert('No pudimos actualizar el cupón', getCouponErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleUpdateExpiration(formData) {
    if (!editingCoupon) return

    try {
      setActionLoading(true)

      await updateCouponExpiration({
        couponId: editingCoupon.id,
        expiresAt: toIsoEndOfDay(formData.expiresAt),
      })

      setEditingCoupon(null)
      await loadCoupons()
    } catch (err) {
      Alert.alert(
        'No pudimos actualizar el vencimiento',
        getCouponErrorMessage(err)
      )
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <View style={styles.couponsContainer}>
      <View style={[styles.couponsHeader, compact && styles.couponsHeaderMobile]}>
        <View style={styles.couponsTitleBox}>
          <Text style={styles.cardTitle}>Cupones de descuento</Text>

          <Text style={styles.couponsSubtitle}>
            Creá y administrá códigos promocionales para tus clientes.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.couponCreateButton,
            compact && styles.couponCreateButtonMobile,
          ]}
          onPress={() => setCreateVisible(true)}
        >
          <Text
            style={[
              styles.couponCreateButtonText,
              compact && styles.couponCreateButtonTextMobile,
            ]}
          >
            {compact ? '+' : 'Nuevo cupón'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.summaryStatus}>
          <ActivityIndicator color={theme.color.accent} />
          <Text style={styles.summaryStatusText}>Cargando cupones...</Text>
        </View>
      ) : error ? (
        <View style={styles.summaryMessageCard}>
          <Text style={styles.summaryErrorText}>{error}</Text>

          <TouchableOpacity onPress={loadCoupons}>
            <Text style={styles.summaryRetryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : coupons.length === 0 ? (
        <View style={styles.summaryMessageCard}>
          <Text style={styles.summaryEmptyTitle}>
            Todavía no creaste cupones.
          </Text>

          <Text style={styles.summaryEmptyText}>
            Creá tu primer cupón para incentivar compras y premiar clientes.
          </Text>

          <TouchableOpacity
            style={styles.couponCreateButton}
            onPress={() => setCreateVisible(true)}
          >
            <Text style={styles.couponCreateButtonText}>Crear cupón</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.couponsList}>
          {coupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              compact={compact}
              onToggleStatus={handleToggleStatus}
              onEditExpiration={setEditingCoupon}
            />
          ))}
        </View>
      )}

      <CouponModal
        visible={createVisible}
        title="Crear cupón"
        submitLabel="Crear cupón"
        loading={actionLoading}
        onClose={() => setCreateVisible(false)}
        onSubmit={handleCreateCoupon}
      />

      <CouponModal
        visible={!!editingCoupon}
        title="Editar vencimiento"
        submitLabel="Guardar cambios"
        loading={actionLoading}
        showCode={false}
        showDiscount={false}
        initialExpiration={getInitialExpirationDate(editingCoupon?.expiresAt)}
        onClose={() => setEditingCoupon(null)}
        onSubmit={handleUpdateExpiration}
      />
    </View>
  )
}
