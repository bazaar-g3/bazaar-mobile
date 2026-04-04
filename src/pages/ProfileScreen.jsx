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
import { useRouter } from 'expo-router'
import api from '../api/api'
import BazaarLogo from '../../assets/Bazaar-logo.png'

const PLACEHOLDER_AVATAR = 'https://ui-avatars.com/api/?background=007AFF&color=fff&size=128&name='

const MENU_ITEMS = [
  { key: 'Perfil', emoji: '👤' },
  { key: 'Compras', emoji: '🛍️' },
  { key: 'Ventas', emoji: '🏷️' },
  { key: 'Tarjetas', emoji: '💳' },
]

export default function ProfileScreen() {
  const router = useRouter()
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

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true)
    try {
      const res = await api.get('/users/me')
      setProfile(res.data)
      setFullName(res.data.fullName ?? '')
      setDescription(res.data.description ?? '')
      setAvatarUri(res.data.avatarUrl ?? null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  function validate() {
    const errors = {}
    if (fullName.trim().length > 0 && fullName.trim().length < 2)
      errors.fullName = 'El nombre debe tener al menos 2 caracteres'
    if (fullName.trim().length > 50)
      errors.fullName = 'El nombre no puede superar los 50 caracteres'
    if (description.length > 500)
      errors.description = 'La descripción no puede superar los 500 caracteres'
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
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
      formData.append('avatar', { uri: localUri, name: `avatar.${ext}`, type: mimeType })
    }
    const token = await AsyncStorage.getItem('token')
    const baseUrl = (api.defaults.baseURL ?? 'http://localhost:8001').replace(/\/$/, '')
    const res = await fetch(`${baseUrl}/users/me/avatar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
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
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    setFieldErrors({})
    setSaving(true)
    try {
      let finalAvatarUrl = profile?.avatarUrl
      const isLocalUri = avatarUri && (
        avatarUri.startsWith('blob:') ||
        avatarUri.startsWith('data:') ||
        avatarUri.startsWith('file')
      )
      if (isLocalUri) finalAvatarUrl = await uploadAvatarToBackend(avatarUri)
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
      const msg = err.response?.data?.detail || err.message || 'Error al actualizar el perfil'
      setSaveError(typeof msg === 'string' ? msg : 'Error de validación en los datos.')
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

  const renderMainContent = () => {
    if (activeTab === 'Compras') return <Text style={styles.emptyText}>No tenés compras aún.</Text>
    if (activeTab === 'Ventas') return <Text style={styles.emptyText}>No tenés ventas aún.</Text>
    if (activeTab === 'Tarjetas') return <Text style={styles.emptyText}>No tenés tarjetas asociadas.</Text>

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>Información del perfil</Text>
          {!editing && (
            <TouchableOpacity onPress={() => { setSaveSuccess(''); setEditing(true) }}>
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        {saveSuccess ? <Text style={styles.successText}>{saveSuccess}</Text> : null}
        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

        <View style={styles.profileHeader}>
          <View>
            <Image
              source={{ uri: avatarUri || `${PLACEHOLDER_AVATAR}${encodeURIComponent(fullName || 'U')}` }}
              style={styles.avatarLarge}
            />
            {editing && (
              <TouchableOpacity style={styles.changePhotoOverlay} onPress={handlePickImage}>
                <Text style={styles.changePhotoText}>Cambiar{'\n'}foto</Text>
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
                onChangeText={(v) => { setFullName(v); setFieldErrors(e => ({ ...e, fullName: undefined })) }}
                maxLength={50}
              />
              {fieldErrors.fullName ? <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text> : null}
            </>
          ) : (
            <Text style={styles.valueText}>{fullName || 'No definido'}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción</Text>
          {editing ? (
            <>
              <TextInput
                style={[styles.input, styles.textArea, fieldErrors.description && styles.inputError]}
                value={description}
                onChangeText={(v) => { setDescription(v); setFieldErrors(e => ({ ...e, description: undefined })) }}
                multiline
                maxLength={500}
              />
              <Text style={styles.charCount}>{description.length}/500</Text>
              {fieldErrors.description ? <Text style={styles.fieldErrorText}>{fieldErrors.description}</Text> : null}
            </>
          ) : (
            <Text style={styles.valueText}>{description || 'Sin descripción'}</Text>
          )}
        </View>

        {editing && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btnSave, saving && styles.btnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.btnTextWhite}>Guardar cambios</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancel} onPress={handleCancel} disabled={saving}>
              <Text style={styles.btnTextBlue}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  if (loadingProfile) return <ActivityIndicator style={{ flex: 1 }} />

  return (
    <View style={styles.root}>

      {/* ── HEADER SUPERIOR ── */}
      <View style={styles.topBar}>
        {/* Botonn menu desplegable */}
        <TouchableOpacity style={styles.hamburger} onPress={() => setIsMenuOpen(v => !v)}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>

        {/* Logo + nombre */}
        <View style={styles.topBarBrand}>
          <Image source={BazaarLogo} style={styles.topBarLogo} resizeMode="contain" />
          <Text style={styles.topBarTitle}>Bazaar</Text>
        </View>

        {/* Boton home */}
        <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/')}>
          <Text style={styles.homeButtonText}>🏠 Inicio</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainWrapper}>

        {/* SIDEBAR */}
        {isMenuOpen && (
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Mi cuenta</Text>
            {MENU_ITEMS.map(({ key, emoji }) => (
              <TouchableOpacity
                key={key}
                style={[styles.sidebarItem, activeTab === key && styles.sidebarItemActive]}
                onPress={() => setActiveTab(key)}
              >
                <Text style={styles.sidebarEmoji}>{emoji}</Text>
                <Text style={[styles.sidebarText, activeTab === key && styles.sidebarTextActive]}>
                  {key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CONTENIDO */}
        <ScrollView style={styles.contentArea}>
          <View style={styles.containerCenter}>
            {renderMainContent()}
          </View>
        </ScrollView>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#EDEDED',
  },

  //Top bar
  topBar: {
    height: 60,
    backgroundColor: '#3483FA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  hamburger: {
    justifyContent: 'center',
    gap: 5,
    padding: 4,
  },
  hamburgerLine: {
    width: 22,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  topBarBrand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarLogo: {
    width: 32,
    height: 32,
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  homeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  homeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  //Layout
  mainWrapper: {
    flex: 1,
    flexDirection: 'row',
  },

  //Sidebar
  sidebar: {
    width: 220,
    backgroundColor: '#fff',
    paddingTop: 24,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    paddingLeft: 4,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    borderRadius: 4,
    gap: 10,
  },
  sidebarItemActive: {
    borderLeftColor: '#3483FA',
    backgroundColor: '#f0f5ff',
  },
  sidebarEmoji: {
    fontSize: 18,
  },
  sidebarText: {
    fontSize: 15,
    color: '#555',
  },
  sidebarTextActive: {
    color: '#3483FA',
    fontWeight: 'bold',
  },

  //Content
  contentArea: {
    flex: 1,
    paddingTop: 32,
  },
  containerCenter: {
    maxWidth: 800,
    width: '90%',
    alignSelf: 'center',
  },

  //Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: { fontSize: 20, fontWeight: '600' },
  editText: { color: '#3483FA', fontSize: 14 },

  //Avatar
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLarge: { width: 80, height: 80, borderRadius: 40 },
  changePhotoOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#fff', fontSize: 9, fontWeight: '600',
    textAlign: 'center', lineHeight: 11,
  },
  profileInfoText: { marginLeft: 20 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userEmail: { color: '#999' },

  //Formulario
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: '#333', fontWeight: '500', marginBottom: 5 },
  valueText: { fontSize: 16, color: '#666' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 6, padding: 10, fontSize: 16 },
  inputError: { borderColor: '#ef4444' },
  textArea: { height: 80, textAlignVertical: 'top' },
  charCount: { textAlign: 'right', fontSize: 12, color: '#9ca3af', marginTop: 4 },
  fieldErrorText: { color: '#ef4444', fontSize: 13, marginTop: 4 },
  successText: { color: '#15803d', marginBottom: 12, fontWeight: '500' },
  errorText: { color: '#dc2626', marginBottom: 12 },

  //Botones
  buttonRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
  btnSave: { backgroundColor: '#3483FA', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 6 },
  btnDisabled: { opacity: 0.6 },
  btnCancel: { paddingVertical: 12, paddingHorizontal: 20 },
  btnTextWhite: { color: '#fff', fontWeight: '600' },
  btnTextBlue: { color: '#3483FA', fontWeight: '600' },
  emptyText: { textAlign: 'center', fontSize: 18, color: '#999', marginTop: 50 },
})