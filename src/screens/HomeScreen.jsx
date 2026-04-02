import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'

export default function HomeScreen() {
  const router = useRouter()

  async function handleLogout() {
    await AsyncStorage.removeItem('token')
    router.replace('/login')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Bazaar 🛍️</Text>
      <Text style={styles.subtitle}>Products coming soon...</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title:      { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle:   { fontSize: 16, color: '#888', marginBottom: 48 },
  button:     { backgroundColor: '#FF3B30', borderRadius: 8, padding: 14, paddingHorizontal: 32 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
})
