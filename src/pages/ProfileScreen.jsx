import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import api from '../api/api'
import VentasTab from './VentasTabScreen'
import Logo from '../components/Logo'
import { COLORS } from '../constants/colors'
import { SPACING, FONT } from '../constants/theme'
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  getCatalogErrorMessage,
  listSellerProducts,
} from '../services/catalog'
import { getSessionStatus } from '../services/session'
import { buildLoginRedirect } from '../utils/authRedirect'

const PLACEHOLDER_AVATAR =
  'https://ui-avatars.com/api/?background=69BDB6&color=fff&size=128&name='

const MENU_ITEMS = [
  { key: 'Perfil', emoji: '👤' },
  { key: 'Compras', emoji: '🛍️' },
  { key: 'Ventas', emoji: '🏷️' },
  { key: 'Tarjetas', emoji: '💳' },
]

export default function ProfileScreen() {
  const router = useRouter()
  const {
    activeTab: requestedActiveTab,
    refreshCatalog,
    productId: requestedProductId,
    openEdit: requestedOpenEdit,
  } = useLocalSearchParams()

  const [activeTab, setActiveTab] = useState('Perfil')
  const [isMenuOpen, setIsMenuOpen] = useState(true)

  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [description, setDescription] = useState('')
  const [avatarUri, setAvatarUri] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [activeProductsSummary, setActiveProductsSummary] = useState([])
  const [loadingActiveProductsSummary, setLoadingActiveProductsSummary] = useState(true)
  const [activeProductsSummaryError, setActiveProductsSummaryError] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)

  const refreshCatalogKey = Array.isArray(refreshCatalog)
    ? refreshCatalog[0]
    : refreshCatalog

  const normalizedRequestedTab = Array.isArray(requestedActiveTab)
    ? requestedActiveTab[0]
    : requestedActiveTab

  const normalizedRequestedProductId = Array.isArray(requestedProductId)
    ? requestedProductId[0]
    : requestedProductId

  const normalizedRequestedOpenEdit = Array.isArray(requestedOpenEdit)
    ? requestedOpenEdit[0]
    : requestedOpenEdit

  const shouldOpenSalesEdit =
    normalizedRequestedOpenEdit === 'true' && !!normalizedRequestedProductId

  const applyProfileData = useCallback((nextProfile) => {
    setProfile(nextProfile)
    setFullName(nextProfile?.fullName ?? '')
    setDescription(nextProfile?.description ?? '')
    setAvatarUri(nextProfile?.avatarUrl ?? null)
  }, [])

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true)
    try {
      const res = await api.get('/users/me')
      applyProfileData(res.data)
      return { ok: true, profile: res.data }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 404) {
        await AsyncStorage.removeItem('token')
        return { ok: false, authInvalid: true }
      }

      console.error(err)
      return { ok: false, authInvalid: false }
    } finally {
      setLoadingProfile(false)
    }
  }, [applyProfileData])

  useEffect(() => {
    let cancelled = false

    async function ensureAuthenticatedUser() {
      try {
        const session = await getSessionStatus()

        if (!session.isAuthenticated) {
          router.replace(
            buildLoginRedirect({
              redirectPath: '/profile',
              activeTab: normalizedRequestedTab,
              productId: normalizedRequestedProductId,
              openEdit: normalizedRequestedOpenEdit,
            })
          )
          return
        }

        if (!cancelled) {
          applyProfileData(session.profile)
          setLoadingProfile(false)
          setCheckingSession(false)
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setCheckingSession(false)
          setLoadingProfile(false)
        }
      }
    }

    ensureAuthenticatedUser()

    return () => {
      cancelled = true
    }
  }, [
    applyProfileData,
    normalizedRequestedOpenEdit,
    normalizedRequestedProductId,
    normalizedRequestedTab,
    router,
  ])

  useEffect(() => {
    if (checkingSession || !refreshCatalogKey) {
      return
    }

    async function refreshProfileIfNeeded() {
      const result = await loadProfile()
      if (result?.authInvalid) {
        router.replace(
          buildLoginRedirect({
            redirectPath: '/profile',
            activeTab: normalizedRequestedTab,
            productId: normalizedRequestedProductId,
            openEdit: normalizedRequestedOpenEdit,
          })
        )
      }
    }

    refreshProfileIfNeeded()
  }, [
    checkingSession,
    loadProfile,
    normalizedRequestedOpenEdit,
    normalizedRequestedProductId,
    normalizedRequestedTab,
    refreshCatalogKey,
    router,
  ])

  useEffect(() => {
    if (normalizedRequestedTab && MENU_ITEMS.some(({ key }) => key === normalizedRequestedTab)) {
      setActiveTab(normalizedRequestedTab)
      return
    }

    if (shouldOpenSalesEdit) {
      setActiveTab('Ventas')
    }
  }, [normalizedRequestedTab, shouldOpenSalesEdit])

  const loadActiveProductsSummary = useCallback(async () => {
    if (!profile?.id) {
      setActiveProductsSummary([])
      setLoadingActiveProductsSummary(false)
      return
    }

    setLoadingActiveProductsSummary(true)
    setActiveProductsSummaryError('')

    try {
      const products = await listSellerProducts({
        sellerId: profile.id,
        status: 'active',
        onlyAvailable: false,
        limit: 3,
      })
      setActiveProductsSummary(products)
    } catch (error) {
      setActiveProductsSummaryError(
        getCatalogErrorMessage(
          error,
          'No pudimos cargar el resumen de publicaciones activas.'
        )
      )
    } finally {
      setLoadingActiveProductsSummary(false)
    }
  }, [profile?.id])

  useEffect(() => {
    loadActiveProductsSummary()
  }, [loadActiveProductsSummary, refreshCatalogKey])

  const handleOpenPublish = useCallback(async () => {
    const token = await AsyncStorage.getItem('token')

    if (token) {
      router.push({
        pathname: '/publish-product',
        params: { from: 'profile' },
      })
      return
    }

    router.push(
      buildLoginRedirect({
        redirectPath: '/publish-product',
        redirectFrom: 'profile',
      })
    )
  }, [router])

  function validate() {
    const errors = {}

    if (fullName.trim().length > 0 && fullName.trim().length < 2) {
      errors.fullName = 'El nombre debe tener al menos 2 caracteres'
    }

    if (fullName.trim().length > 50) {
      errors.fullName = 'El nombre no puede superar los 50 caracteres'
    }

    if (description.length > 500) {
      errors.description = 'La descripción no puede superar los 500 caracteres'
    }

    return errors
  }

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })

    if (!result.canceled && result.assets?.[0]) {
      setAvatarUri(result.assets[0].uri)
      setSaveSuccess('')
    }
  }

  async function uploadAvatarToBackend(localUri) {
    const formData = new FormData()

    if (localUri.startsWith('blob:') || localUri.startsWith('data:')) {
      const blobRes = await fetch(localUri)
      const blob = await blobRes.blob()
      const mimeType = blob.type || 'image/jpeg'
      const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'
      formData.append('avatar', blob, `avatar.${ext}`)
    } else {
      const uriParts = localUri.split('.')
      const ext = uriParts[uriParts.length - 1]?.toLowerCase() ?? 'jpg'
      const mimeType =
        ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'

      formData.append('avatar', {
        uri: localUri,
        name: `avatar.${ext}`,
        type: mimeType,
      })
    }

    const token = await AsyncStorage.getItem('token')
    const baseUrl = (api.defaults.baseURL ?? 'http://localhost:8001').replace(/\/$/, '')
    const res = await fetch(`${baseUrl}/users/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.detail ?? 'Error al subir la imagen')
    return data.avatarUrl
  }

  async function handleSave() {
    setSaveError('')
    setSaveSuccess('')

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setSaving(true)

    try {
      let finalAvatarUrl = profile?.avatarUrl
      const isNewAvatar = avatarUri != null && avatarUri !== profile?.avatarUrl

      if (isNewAvatar) {
        finalAvatarUrl = await uploadAvatarToBackend(avatarUri)
      }

      const payload = {
        fullName: fullName.trim(),
        description: description.trim(),
        ...(finalAvatarUrl !== profile?.avatarUrl && { avatarUrl: finalAvatarUrl }),
      }

      const res = await api.patch('/users/me', payload)
      setProfile(res.data)
      setAvatarUri(res.data.avatarUrl)
      setSaveSuccess('¡Perfil actualizado con éxito!')
      setEditing(false)
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Error al actualizar el perfil'

      setSaveError(
        typeof msg === 'string' ? msg : 'Error de validación en los datos.'
      )
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setFullName(profile?.fullName ?? '')
    setDescription(profile?.description ?? '')
    setAvatarUri(profile?.avatarUrl ?? null)
    setFieldErrors({})
    setSaveError('')
    setSaveSuccess('')
    setEditing(false)
  }

  const handleGoToSalesTab = useCallback(() => {
    setActiveTab('Ventas')
  }, [])

  const renderActiveProductsSummary = () => (
    <View style={styles.summarySection}>
      <View style={styles.summaryHeader}>
        <Text style={styles.sectionTitle}>Publicaciones activas</Text>
        <TouchableOpacity onPress={handleGoToSalesTab}>
          <Text style={styles.summaryAction}>Ver ventas</Text>
        </TouchableOpacity>
      </View>

      {loadingActiveProductsSummary ? (
        <View style={styles.summaryStatus}>
          <ActivityIndicator size="small" color={COLORS.primaryLight} />
          <Text style={styles.summaryStatusText}>Cargando resumen...</Text>
        </View>
      ) : activeProductsSummaryError ? (
        <View style={styles.summaryMessageCard}>
          <Text style={styles.summaryErrorText}>{activeProductsSummaryError}</Text>
          <TouchableOpacity onPress={loadActiveProductsSummary}>
            <Text style={styles.summaryRetryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : activeProductsSummary.length === 0 ? (
        <View style={styles.summaryMessageCard}>
          <Text style={styles.summaryEmptyTitle}>
            Todavía no tenés publicaciones activas.
          </Text>
          <Text style={styles.summaryEmptyText}>
            Publicá tu primer producto para que empiece a aparecer en tu perfil y en
            Home.
          </Text>
          <TouchableOpacity
            style={styles.summaryPublishButton}
            onPress={handleOpenPublish}
          >
            <Text style={styles.summaryPublishButtonText}>Publicar ahora</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.summaryList}>
          {activeProductsSummary.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.summaryRow}
              activeOpacity={0.9}
              onPress={handleGoToSalesTab}
            >
              <Image
                source={{ uri: product.images?.[0] || PRODUCT_IMAGE_PLACEHOLDER }}
                style={styles.summaryImage}
              />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryProductName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.summaryMeta}>
                  ${Number(product.price).toLocaleString('es-AR')} · Stock {product.stock}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )

  const renderMainContent = () => {
    if (activeTab === 'Compras') {
      return <Text style={styles.emptyText}>No tenés compras aún.</Text>
    }

    if (activeTab === 'Ventas') {
      return (
        <VentasTab
          sellerId={profile?.id}
          refreshKey={refreshCatalogKey}
          onOpenPublish={handleOpenPublish}
          initialProductId={normalizedRequestedProductId ?? null}
          initialOpenEdit={shouldOpenSalesEdit}
        />
      )
    }

    if (activeTab === 'Tarjetas') {
      return <Text style={styles.emptyText}>No tenés tarjetas asociadas.</Text>
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Información del perfil</Text>
          {!editing ? (
            <TouchableOpacity
              onPress={() => {
                setSaveSuccess('')
                setEditing(true)
              }}
            >
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>

        {saveSuccess ? <Text style={styles.successText}>{saveSuccess}</Text> : null}
        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  avatarUri ||
                  `${PLACEHOLDER_AVATAR}${encodeURIComponent(fullName || 'U')}`,
              }}
              style={styles.avatarLarge}
            />
            {editing && (
              <TouchableOpacity
                style={styles.changePhotoOverlay}
                onPress={handlePickImage}
              >
                <Text style={styles.changePhotoText}>Cambiar foto</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.profileInfoText}>
            <Text style={styles.userName}>{profile?.fullName || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{profile?.email}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre y Apellido</Text>
          {editing ? (
            <>
              <TextInput
                style={[styles.input, fieldErrors.fullName && styles.inputError]}
                value={fullName}
                onChangeText={(v) => {
                  setFullName(v)
                  setFieldErrors((e) => ({ ...e, fullName: undefined }))
                }}
                maxLength={50}
                placeholder="Ingresá tu nombre"
                placeholderTextColor={COLORS.textMuted}
              />
              {fieldErrors.fullName ? (
                <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text>
              ) : null}
            </>
          ) : (
            <View style={styles.readonlyField}>
              <Text style={styles.valueText}>{fullName || 'No definido'}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción</Text>
          {editing ? (
            <>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  fieldErrors.description && styles.inputError,
                ]}
                value={description}
                onChangeText={(v) => {
                  setDescription(v)
                  setFieldErrors((e) => ({ ...e, description: undefined }))
                }}
                multiline
                maxLength={500}
                placeholder="Contanos algo sobre vos"
                placeholderTextColor={COLORS.textMuted}
              />
              <Text style={styles.charCount}>{description.length}/500</Text>
              {fieldErrors.description ? (
                <Text style={styles.fieldErrorText}>{fieldErrors.description}</Text>
              ) : null}
            </>
          ) : (
            <View style={styles.readonlyField}>
              <Text style={styles.valueText}>{description || 'Sin descripción'}</Text>
            </View>
          )}
        </View>

        {editing && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btnSave, saving && styles.btnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.btnTextWhite}>Guardar cambios</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnCancel}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.btnTextCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.summarySeparator} />
        {renderActiveProductsSummary()}
      </View>
    )
  }

  if (checkingSession || loadingProfile) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.topHeader}>
        <View style={styles.topHeaderContent}>
          <TouchableOpacity
            style={styles.hamburgerButton}
            onPress={() => setIsMenuOpen((prev) => !prev)}
          >
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>

          <View style={styles.logoCenter}>
            <Logo size={30} textSize={28} />
          </View>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.homeButtonText}>Inicio</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainWrapper}>
        {isMenuOpen && (
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Mi cuenta</Text>
            {MENU_ITEMS.map(({ key, emoji }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.sidebarItem,
                  activeTab === key && styles.sidebarItemActive,
                ]}
                onPress={() => setActiveTab(key)}
              >
                <Text style={styles.sidebarEmoji}>{emoji}</Text>
                <Text
                  style={[
                    styles.sidebarText,
                    activeTab === key && styles.sidebarTextActive,
                  ]}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView
          style={styles.contentArea}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.containerCenter}>{renderMainContent()}</View>
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#DDEAEA',
  },

  loaderContainer: {
    flex: 1,
    backgroundColor: '#DDEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  topHeader: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
  },

  topHeaderContent: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    minHeight: 44,
  },

  hamburgerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    zIndex: 2,
  },

  hamburgerLine: {
    width: 20,
    height: 2,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    marginVertical: 3,
  },

  logoCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },

  homeButton: {
    backgroundColor: '#F4F7F8',
    borderWidth: 1,
    borderColor: '#E4EBEE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    zIndex: 2,
  },

  homeButtonText: {
    color: COLORS.primary,
    fontSize: FONT.small,
    fontWeight: '700',
  },

  mainWrapper: {
    flex: 1,
    flexDirection: 'row',
  },

  sidebar: {
    width: 180,
    backgroundColor: COLORS.white,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRightWidth: 1,
    borderRightColor: '#E6ECEC',
  },

  sidebarTitle: {
    fontSize: FONT.medium,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  sidebarItemActive: {
    backgroundColor: '#E7F6F4',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryLight,
  },

  sidebarEmoji: {
    fontSize: 18,
  },

  sidebarText: {
    fontSize: FONT.regular,
    color: COLORS.text,
  },

  sidebarTextActive: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },

  contentArea: {
    flex: 1,
  },

  contentContainer: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },

  containerCenter: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 22,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  editText: {
    color: COLORS.primaryLight,
    fontWeight: '700',
    fontSize: FONT.regular,
    textAlign: 'right',
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },

  avatarLarge: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#D9F4F0',
    borderWidth: 2,
    borderColor: '#BDEAE4',
  },

  changePhotoOverlay: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    borderRadius: 999,
    alignItems: 'center',
  },

  changePhotoText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
  },

  profileInfoText: {
    flex: 1,
  },

  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },

  userEmail: {
    fontSize: FONT.regular,
    color: COLORS.textSecondary,
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },

  inputGroup: {
    marginBottom: SPACING.md,
  },

  label: {
    fontSize: FONT.small,
    color: COLORS.text,
    marginBottom: 6,
    fontWeight: '500',
  },

  readonlyField: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FCFC',
  },

  valueText: {
    fontSize: FONT.regular,
    color: COLORS.text,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FCFC',
    fontSize: FONT.regular,
    color: COLORS.text,
  },

  inputError: {
    borderColor: COLORS.error,
  },

  textArea: {
    minHeight: 86,
    textAlignVertical: 'top',
  },

  charCount: {
    textAlign: 'right',
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 12,
  },

  fieldErrorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },

  successText: {
    color: COLORS.success,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },

  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },

  btnSave: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  btnDisabled: {
    opacity: 0.65,
  },

  btnCancel: {
    backgroundColor: '#EDF5F4',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  btnTextWhite: {
    color: COLORS.white,
    fontWeight: '700',
  },

  btnTextCancel: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  summarySeparator: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.lg,
  },

  summarySection: {
    gap: SPACING.sm,
  },

  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  summaryAction: {
    color: '#C9941A',
    fontWeight: '700',
  },

  summaryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  summaryStatusText: {
    color: COLORS.textSecondary,
  },

  summaryMessageCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
  },

  summaryEmptyTitle: {
    fontSize: FONT.medium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },

  summaryEmptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT.regular,
    marginBottom: 12,
  },

  summaryPublishButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  summaryPublishButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 13,
  },

  summaryErrorText: {
    color: COLORS.error,
    marginBottom: 8,
  },

  summaryRetryText: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },

  summaryList: {
    gap: 10,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F7FAFA',
  },

  summaryImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: COLORS.imagePlaceholder,
  },

  summaryContent: {
    flex: 1,
  },

  summaryProductName: {
    fontSize: FONT.regular,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },

  summaryMeta: {
    fontSize: FONT.small,
    color: COLORS.textSecondary,
  },

  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT.medium,
    marginTop: 60,
  },
})