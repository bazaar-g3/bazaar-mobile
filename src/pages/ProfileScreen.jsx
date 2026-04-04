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
  Dimensions
} from 'react-native'
import { useRouter } from 'expo-router'
import api from '../api/api'

const PLACEHOLDER_AVATAR = 'https://ui-avatars.com/api/?background=007AFF&color=fff&size=128&name='

export default function ProfileScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Perfil') // Controla el contenido central

  // --- Estados de Perfil ---
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [description, setDescription] = useState('')
  const [avatarUri, setAvatarUri] = useState(null)
  const [saving, setSaving] = useState(false)

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

  // --- Renderizado de Contenido Dinámico ---
  const renderMainContent = () => {
    if (activeTab === 'Compras') return <Text style={styles.emptyText}>No tenés compras aún.</Text>
    if (activeTab === 'Ventas') return <Text style={styles.emptyText}>No tenés ventas aún.</Text>
    if (activeTab === 'Tarjetas') return <Text style={styles.emptyText}>No tenés tarjetas asociadas.</Text>

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>Información del perfil</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.profileHeader}>
          <Image
            source={{ uri: avatarUri || `${PLACEHOLDER_AVATAR}${fullName}` }}
            style={styles.avatarLarge}
          />
          <View style={styles.profileInfoText}>
            <Text style={styles.userName}>{profile?.fullName || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{profile?.email}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre y Apellido</Text>
          {editing ? (
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
          ) : (
            <Text style={styles.valueText}>{fullName || 'No definido'}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción</Text>
          {editing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          ) : (
            <Text style={styles.valueText}>{description || 'Sin descripción'}</Text>
          )}
        </View>

        {editing && (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.btnSave} onPress={() => setEditing(false)}>
              <Text style={styles.btnTextWhite}>Guardar cambios</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancel} onPress={() => setEditing(false)}>
              <Text style={styles.btnTextBlue}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  if (loadingProfile) return <ActivityIndicator style={{ flex: 1 }} />

  return (
    <View style={styles.mainWrapper}>
      {/* SIDEBAR IZQUIERDA */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Mi cuenta</Text>
        {['Compras', 'Ventas', 'Perfil', 'Tarjetas'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.sidebarItem, activeTab === item && styles.sidebarItemActive]}
            onPress={() => setActiveTab(item)}
          >
            <Text style={[styles.sidebarText, activeTab === item && styles.sidebarTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CONTENIDO DERECHA */}
      <ScrollView style={styles.contentArea}>
        <View style={styles.containerCenter}>
          {renderMainContent()}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    flexDirection: 'row', // Esto crea el layout de columnas
    backgroundColor: '#EDEDED', // Gris clarito tipo Meli
  },
  sidebar: {
    width: 240,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  sidebarItem: {
    paddingVertical: 15,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  sidebarItemActive: {
    borderLeftColor: '#3483FA',
  },
  sidebarText: {
    fontSize: 16,
    color: '#666',
    paddingLeft: 10,
  },
  sidebarTextActive: {
    color: '#3483FA',
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
    paddingTop: 60,
  },
  containerCenter: {
    maxWidth: 800,
    width: '90%',
    alignSelf: 'center',
  },
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
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  editText: {
    color: '#3483FA',
    fontSize: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfoText: {
    marginLeft: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#999',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 5,
  },
  valueText: {
    fontSize: 16,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  btnSave: {
    backgroundColor: '#3483FA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  btnCancel: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  btnTextWhite: { color: '#fff', fontWeight: '600' },
  btnTextBlue: { color: '#3483FA', fontWeight: '600' },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
    marginTop: 50,
  },
})