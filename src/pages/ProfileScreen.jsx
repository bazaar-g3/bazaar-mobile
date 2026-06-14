import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import api from '../api/api'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileInfoTab from '../components/profile/ProfileInfoTab'
import CouponsTab from '../components/profile/ProfileCouponsTab'
import ProfileSidebar, {
  PROFILE_MENU_ITEMS,
} from '../components/profile/ProfileSidebar'
import { COLORS } from '../constants/colors'
import PublicacionesTab from '../components/profile/PublicacionesTabScreen'
import SellerSalesScreen from '../components/profile/SellerSalesScreen'
import { styles } from '../styles/profile/profileStyles'
import {
  getCatalogErrorMessage,
  listSellerProducts,
} from '../services/catalog'
import { getSessionStatus } from '../services/session'
import { buildLoginRedirect } from '../utils/authRedirect'
import { isPinEnabled } from '../services/pin'
import DisablePinModal from '../components/DisablePinModal'

export default function ProfileScreen() {
  const router = useRouter()
  const {
    activeTab: requestedActiveTab,
    refreshCatalog,
    productId: requestedProductId,
    openEdit: requestedOpenEdit,
  } = useLocalSearchParams()

  const [activeTab, setActiveTab] = useState('Perfil')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
  const [loadingActiveProductsSummary, setLoadingActiveProductsSummary] =
    useState(true)
  const [activeProductsSummaryError, setActiveProductsSummaryError] =
    useState('')
  const [checkingSession, setCheckingSession] = useState(true)

  // Estado de PIN
  const [pinEnabled, setPinEnabled] = useState(false)
  const [disablePinModalVisible, setDisablePinModalVisible] = useState(false)

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
    if (checkingSession || !refreshCatalogKey) return

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
    const existsRequestedTab = PROFILE_MENU_ITEMS.some(
      ({ key }) => key === normalizedRequestedTab
    )

    if (normalizedRequestedTab && existsRequestedTab) {
      setActiveTab(normalizedRequestedTab)
      return
    }

    if (shouldOpenSalesEdit) {
      setActiveTab('Publicaciones')
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

  // Verificar estado del PIN al ganar foco (se actualiza al volver de pin-setup)
  useFocusEffect(
    useCallback(() => {
      async function checkPin() {
        const enabled = await isPinEnabled()
        setPinEnabled(enabled)
      }
      checkPin()
    }, [])
  )

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
        ext === 'png'
          ? 'image/png'
          : ext === 'webp'
            ? 'image/webp'
            : 'image/jpeg'

      formData.append('avatar', {
        uri: localUri,
        name: `avatar.${ext}`,
        type: mimeType,
      })
    }

    const token = await AsyncStorage.getItem('token')
    const baseUrl = (api.defaults.baseURL ?? 'http://localhost:8001').replace(
      /\/$/,
      ''
    )

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
        ...(finalAvatarUrl !== profile?.avatarUrl && {
          avatarUrl: finalAvatarUrl,
        }),
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
    setActiveTab('Publicaciones')
  }, [])

  const handleTabSelect = useCallback(
    (key) => {
      if (key === 'Wishlist') {
        router.push('/wishlist')
        return
      }

      setActiveTab(key)
    },
    [router]
  )

  const renderMainContent = () => {
    if (activeTab === 'Compras') {
      return <Text style={styles.emptyText}>No tenés compras aún.</Text>
    }

    if (activeTab === 'Publicaciones') {
      return (
        <PublicacionesTab
          sellerId={profile?.id}
          refreshKey={refreshCatalogKey}
          onOpenPublish={handleOpenPublish}
          initialProductId={normalizedRequestedProductId ?? null}
          initialOpenEdit={shouldOpenSalesEdit}
        />
      )
    }

    if (activeTab === 'Ventas') {
      return <SellerSalesScreen sellerId={profile?.id} />
    }

    if (activeTab === 'Cupones') {
      return <CouponsTab />
    }

    return (
      <>
        <ProfileInfoTab
          profile={profile}
          editing={editing}
          setEditing={setEditing}
          fullName={fullName}
          setFullName={setFullName}
          description={description}
          setDescription={setDescription}
          avatarUri={avatarUri}
          saveSuccess={saveSuccess}
          saveError={saveError}
          fieldErrors={fieldErrors}
          setFieldErrors={setFieldErrors}
          saving={saving}
          onPickImage={handlePickImage}
          onSave={handleSave}
          onCancel={handleCancel}
          activeProductsSummary={activeProductsSummary}
          loadingActiveProductsSummary={loadingActiveProductsSummary}
          activeProductsSummaryError={activeProductsSummaryError}
          onReloadActiveProductsSummary={loadActiveProductsSummary}
          onOpenPublish={handleOpenPublish}
          onGoToSalesTab={handleGoToSalesTab}
        />

        {/* Sección Seguridad */}
        <View style={securityStyles.card}>
          <Text style={securityStyles.sectionTitle}>Seguridad</Text>
          <View style={securityStyles.row}>
            <View style={securityStyles.rowLeft}>
              <Ionicons
                name="keypad-outline"
                size={22}
                color={COLORS.primary}
                style={securityStyles.rowIcon}
              />
              <View>
                <Text style={securityStyles.rowLabel}>PIN de acceso</Text>
                <Text style={securityStyles.rowSubLabel}>
                  Acceso rápido desde este dispositivo
                </Text>
              </View>
            </View>
            <View style={securityStyles.rowRight}>
              <View
                style={[
                  securityStyles.badge,
                  pinEnabled ? securityStyles.badgeActive : securityStyles.badgeInactive,
                ]}
              >
                <Text
                  style={[
                    securityStyles.badgeText,
                    pinEnabled ? securityStyles.badgeTextActive : securityStyles.badgeTextInactive,
                  ]}
                >
                  {pinEnabled ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  securityStyles.actionButton,
                  pinEnabled ? securityStyles.actionButtonDanger : securityStyles.actionButtonPrimary,
                ]}
                onPress={() => {
                  if (pinEnabled) {
                    setDisablePinModalVisible(true)
                  } else {
                    router.push('/pin-setup')
                  }
                }}
              >
                <Text
                  style={[
                    securityStyles.actionButtonText,
                    pinEnabled ? securityStyles.actionButtonTextDanger : securityStyles.actionButtonTextPrimary,
                  ]}
                >
                  {pinEnabled ? 'Desactivar' : 'Activar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>
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
      <ProfileHeader
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
        onGoHome={() => router.replace('/')}
      />

      <DisablePinModal
        visible={disablePinModalVisible}
        userEmail={profile?.email ?? ''}
        onSuccess={() => {
          setPinEnabled(false)
          setDisablePinModalVisible(false)
        }}
        onCancel={() => setDisablePinModalVisible(false)}
      />

      <View style={styles.mainWrapper}>
        {isMenuOpen && (
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setIsMenuOpen(false)}
          />
        )}

        {isMenuOpen && (
          <ProfileSidebar
            activeTab={activeTab}
            onSelectTab={(key) => {
              handleTabSelect(key)
              setIsMenuOpen(false)
            }}
          />
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

const securityStyles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    marginRight: 10,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rowSubLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: '#dcfce7',
  },
  badgeInactive: {
    backgroundColor: '#f3f4f6',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: '#15803d',
  },
  badgeTextInactive: {
    color: COLORS.textMuted,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  actionButtonPrimary: {
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  actionButtonDanger: {
    borderColor: COLORS.error,
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionButtonTextPrimary: {
    color: COLORS.primary,
  },
  actionButtonTextDanger: {
    color: COLORS.error,
  },
})