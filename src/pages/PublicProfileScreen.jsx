import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import api from '../api/api'
import { COLORS } from '../constants/colors'

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams()
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorType, setErrorType] = useState(null) // null | '404' | 'generic'

  const fetchProfile = async () => {
    setLoading(true)
    setErrorType(null)
    try {
      const response = await api.get(`/users/${userId}/profile`)
      setProfile(response.data)
    } catch (error) {
      if (error.response?.status === 404) {
        setErrorType('404')
      } else {
        setErrorType('generic')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />
      </SafeAreaView>
    )
  }

  if (errorType === '404') {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorEmoji}>🚫</Text>
        <Text style={styles.errorTitle}>Este perfil no está disponible</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
          <Text style={styles.actionButtonText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  if (errorType === 'generic') {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Ocurrió un error</Text>
        <TouchableOpacity style={styles.actionButton} onPress={fetchProfile}>
          <Text style={styles.actionButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const fullName = profile?.fullName ?? 'Usuario'
  const description = profile?.description ?? 'Sin descripción'
  const avatarUrl = profile?.avatarUrl ?? null

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
            )}
          </View>

          <Text style={styles.fullName}>{fullName}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
  backButton: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  fullName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
})
