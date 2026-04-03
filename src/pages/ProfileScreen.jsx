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
import { uploadAvatar } from '../services/storage'

const PLACEHOLDER_AVATAR = 'https://ui-avatars.com/api/?background=007AFF&color=fff&size=128&name='

export default function ProfileScreen() {
  const router = useRouter()

  // Estado del perfil cargado desde la API
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Estado del formulario de edición
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [description, setDescription] = useState('')
  const [avatarUri, setAvatarUri] = useState(null) // URI local o URL remota

  // Estado de guardado
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')

  //CARGAR PERFIL

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true)
    setLoadError('')
    try {
      const res = await api.get('/users/me')
      setProfile(res.data)
      setFullName(res.data.fullName ?? '')
      setDescription(res.data.description ?? '')
      setAvatarUri(res.data.avatarUrl ?? null)
    } catch (err) {
      setLoadError('No se pudo cargar el perfil. Intentá de nuevo.')
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  //VALIDAR FORMULARIO DE PERFIL

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

  // SELECCIONAR IMAAGEN DE PERFIL HANDLER

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos acceso a tu galería para cambiar la foto de perfil.'
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets?.[0]) {
      setAvatarUri(result.assets[0].uri)
    }
  }

  // HANDLER GUARDADO DE CAMBIOS

  async function handleSave() {
    setSaveError('')
    setSaveSuccess('')
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    // Detectar si realmente hubo cambios
    const nameChanged = fullName.trim() !== (profile?.fullName ?? '')
    const descChanged = description !== (profile?.description ?? '')
    const isLocalUri = avatarUri && !avatarUri.startsWith('http')
    const avatarChanged = isLocalUri

    if (!nameChanged && !descChanged && !avatarChanged) {
      setSaveSuccess('No realizaste ningún cambio.')
      return
    }

    setSaving(true)
    try {
      const payload = {}

      // 1. Subir imagen a Supabase Storage
      if (avatarChanged) {
        try {
          const newAvatarUrl = await uploadAvatar(avatarUri, profile.id)
          payload.avatarUrl = newAvatarUrl
        } catch (uploadErr) {
          setSaveError(
            `No se pudo subir la foto: ${uploadErr.message ?? 'error desconocido'}. `
          )
          // Revertir la preview al avatar actual para no mostrar una URI local rota
          setAvatarUri(profile?.avatarUrl ?? null)
        }
      }

      //Armar payload de texto
      if (nameChanged) payload.fullName = fullName.trim()
      if (descChanged) payload.description = description

      //Guardar en el backend si hay algo que actualizar
      if (Object.keys(payload).length > 0) {
        const res = await api.patch('/users/me', payload)
        setProfile(res.data)
        setAvatarUri(res.data.avatarUrl ?? null)
        if (!saveError) setSaveSuccess('¡Perfil actualizado!')
      } else if (!saveError) {
        setSaveSuccess('No realizaste ningún cambio.')
      }

      setEditing(false)
    } catch (err) {
      if (err.response?.status === 422) {
        const detail = err.response.data?.detail
        setSaveError(typeof detail === 'string'
          ? detail
          : 'Algunos datos no son válidos. Revisalos e intentá de nuevo.')
      } else {
        setSaveError('Ocurrió un error al guardar. Intentá de nuevo.')
      }
    } finally {
      setSaving(false)
    }
  }

  // HANDLER CANCELAR EDICIÓN

  function handleCancel() {
    setFullName(profile?.fullName ?? '')
    setDescription(profile?.description ?? '')
    setAvatarUri(profile?.avatarUrl ?? null)
    setFieldErrors({})
    setSaveError('')
    setSaveSuccess('')
    setEditing(false)
  }

  // HANDLER CERRAR SESION

  async function handleLogout() {
    await AsyncStorage.removeItem('token')
    router.replace('/login')
  }

  // RENDER

  const avatarSource = avatarUri
    ? { uri: avatarUri }
    : { uri: `${PLACEHOLDER_AVATAR}${encodeURIComponent(profile?.fullName ?? 'U')}` }

  if (loadingProfile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{loadError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ── Botón volver ── */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Inicio</Text>
      </TouchableOpacity>

      {/* ── Avatar ── */}
      <View style={styles.avatarWrapper}>
        <Image source={avatarSource} style={styles.avatar} />
        {editing && (
          <TouchableOpacity style={styles.changePhotoButton} onPress={handlePickImage}>
            <Text style={styles.changePhotoText}>Cambiar foto</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Mensajes globales ── */}
      {saveSuccess ? <Text style={styles.successText}>{saveSuccess}</Text> : null}
      {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

      {/* ── Campos del formulario ── */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nombre</Text>
        {editing ? (
          <>
            <TextInput
              style={[styles.input, fieldErrors.fullName && styles.inputError]}
              value={fullName}
              onChangeText={(v) => { setFullName(v); setFieldErrors((e) => ({ ...e, fullName: undefined })) }}
              placeholder="Tu nombre completo"
              maxLength={50}
            />
            {fieldErrors.fullName ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.value}>{profile?.fullName || '—'}</Text>
        )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email</Text>
        {/* El email no es editable */}
        <Text style={[styles.value, styles.emailValue]}>{profile?.email}</Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Descripción</Text>
        {editing ? (
          <>
            <TextInput
              style={[styles.input, styles.textArea, fieldErrors.description && styles.inputError]}
              value={description}
              onChangeText={(v) => { setDescription(v); setFieldErrors((e) => ({ ...e, description: undefined })) }}
              placeholder="Contá algo sobre vos (máx. 500 caracteres)"
              maxLength={500}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
            {fieldErrors.description ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.description}</Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.value}>{profile?.description || '—'}</Text>
        )}
      </View>

      {/* ── Botones de acción ── */}
      {editing ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btnSmall, styles.btnSecondary]}
            onPress={handleCancel}
            disabled={saving}
          >
            <Text style={styles.btnSecondaryText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSmall, styles.btnPrimary, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.btnPrimaryText}>Guardar</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[styles.btnSmall, styles.btnPrimary, { alignSelf: 'flex-start' }]} onPress={() => { setSaveSuccess(''); setEditing(true) }}>
          <Text style={styles.btnPrimaryText}>Editar perfil</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingTop: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  // Avatar
  avatarWrapper: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#e5e7eb' },
  changePhotoButton: { marginTop: 8 },
  changePhotoText: { color: '#007AFF', fontWeight: '600' },

  // Campos
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 16, color: '#111827' },
  emailValue: { color: '#6b7280' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  inputError: { borderColor: '#ef4444' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  charCount: { textAlign: 'right', fontSize: 12, color: '#9ca3af', marginTop: 4 },
  fieldErrorText: { color: '#ef4444', fontSize: 13, marginTop: 4 },

  // Mensajes globales
  successText: { color: '#15803d', textAlign: 'center', marginBottom: 12, fontWeight: '500' },
  errorText: { color: '#dc2626', textAlign: 'center', marginBottom: 12 },

  // Botones compactos
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btnSmall: { borderRadius: 8, paddingVertical: 9, paddingHorizontal: 20, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#007AFF' },
  btnSecondary: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db' },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  btnSecondaryText: { color: '#374151', fontWeight: '600', fontSize: 14 },

  // Volver
  backButton: { alignSelf: 'flex-start', marginBottom: 16 },
  backButtonText: { fontSize: 15, color: '#38bdf8', fontWeight: '600' },

  // Retry
  retryButton: { marginTop: 12, backgroundColor: '#007AFF', borderRadius: 8, padding: 12, paddingHorizontal: 24 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
})