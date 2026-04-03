import { useEffect, useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback,
  Image, Modal, StyleSheet,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import api from '../api/api'

const PLACEHOLDER_AVATAR = 'https://ui-avatars.com/api/?background=fff&color=38bdf8&size=64&name='

export default function HomeScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const avatarRef = useRef(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })

  useEffect(() => {
    api.get('/users/me')
      .then(res => setProfile(res.data))
      .catch(() => {})
  }, [])

  function handleAvatarPress() {
    avatarRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPos({ top: y + height + 4, right: 16 })
      setDropdownVisible(true)
    })
  }

  async function handleLogout() {
    setDropdownVisible(false)
    await AsyncStorage.removeItem('token')
    router.replace('/login')
  }

  function handleGoToProfile() {
    setDropdownVisible(false)
    router.push('/profile')
  }

  const avatarUri = profile?.avatarUrl
    ? { uri: profile.avatarUrl }
    : { uri: `${PLACEHOLDER_AVATAR}${encodeURIComponent(profile?.fullName ?? 'U')}` }

  return (
    <View style={styles.container}>

      {/* ── Barra superior celeste ── */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>Bazaar</Text>

        <TouchableOpacity ref={avatarRef} onPress={handleAvatarPress} activeOpacity={0.8}>
          <Image source={avatarUri} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      {/* ── Dropdown del perfil ── */}
      <Modal visible={dropdownVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.dropdown, { top: dropdownPos.top, right: dropdownPos.right }]}>
                <TouchableOpacity style={styles.dropdownItem} onPress={handleGoToProfile}>
                  <Text style={styles.dropdownItemText}>👤  Ver perfil</Text>
                </TouchableOpacity>
                <View style={styles.dropdownDivider} />
                <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                  <Text style={[styles.dropdownItemText, styles.dropdownItemDanger]}>
                    🚪  Cerrar sesión
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── Contenido del home ── */}
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Bazaar 🛍️</Text>
        <Text style={styles.subtitle}>Products coming soon...</Text>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  // Barra celeste
  topBar: {
    backgroundColor: '#38bdf8',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  avatar:  { width: 38, height: 38, borderRadius: 19, backgroundColor: '#bae6fd', borderWidth: 2, borderColor: '#fff' },

  // Dropdown
  overlay:       { flex: 1 },
  dropdown:      {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem:       { paddingVertical: 13, paddingHorizontal: 18 },
  dropdownItemText:   { fontSize: 15, color: '#111827' },
  dropdownItemDanger: { color: '#dc2626' },
  dropdownDivider:    { height: 1, backgroundColor: '#f3f4f6' },

  // Contenido
  content:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title:    { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888' },
})
