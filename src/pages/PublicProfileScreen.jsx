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
import { listSellerProducts, PRODUCT_IMAGE_PLACEHOLDER } from '../services/catalog'
import { getSellerReputation, formatAverageScore } from '../services/reviews'

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams()
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorType, setErrorType] = useState(null) // null | '404' | 'generic'
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [reputation, setReputation] = useState(null)
  const [loadingReputation, setLoadingReputation] = useState(false)

  const fetchProfile = async () => {
    setLoading(true)
    setErrorType(null)
    try {
      const response = await api.get(`/users/${userId}/profile`)
      setProfile(response.data)
      return true
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

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const result = await listSellerProducts({ sellerId: userId, status: 'active', onlyAvailable: false })
      setProducts(result ?? [])
    } catch {
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchReputation = async () => {
    setLoadingReputation(true)
    try {
      const data = await getSellerReputation(userId)
      setReputation(data)
    } catch {
      setReputation({ seller_id: String(userId), average_score: null, review_count: 0, reviews: [] })
    } finally {
      setLoadingReputation(false)
    }
  }

  useEffect(() => {
    async function load() {
      const ok = await fetchProfile()
      if (ok) {
        fetchProducts()
        fetchReputation()
      }
    }
    load()
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

        {/* ── Sección de Reputación ─────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Reputación del vendedor</Text>

        {loadingReputation ? (
          <ActivityIndicator size="small" color={COLORS.primaryLight} style={styles.reputationLoader} />
        ) : reputation && reputation.review_count > 0 ? (
          <View style={styles.reputationCard}>
            <View style={styles.reputationSummary}>
              <View style={styles.reputationScore}>
                <Text style={styles.reputationScoreValue}>
                  {formatAverageScore(reputation.average_score)}
                </Text>
                <Text style={styles.reputationStarIcon}>★</Text>
              </View>
              <Text style={styles.reputationCount}>
                {reputation.review_count} {reputation.review_count === 1 ? 'calificación' : 'calificaciones'}
              </Text>
            </View>

            <View style={styles.reviewsDivider} />

            {reputation.reviews.map((review) => (
              <View key={String(review.id)} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text
                        key={star}
                        style={[
                          styles.reviewStar,
                          { color: star <= review.score ? COLORS.secondary : COLORS.textMuted },
                        ]}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                {review.comment ? (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Este vendedor aún no tiene calificaciones</Text>
        )}

        {/* ── Publicaciones activas ─────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Publicaciones activas</Text>

        {loadingProducts ? (
          <ActivityIndicator size="small" color={COLORS.primaryLight} />
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>Este vendedor no tiene publicaciones activas</Text>
        ) : (
          products.map((product) => (
            <TouchableOpacity
              key={String(product.id)}
              style={styles.productCard}
              onPress={() => router.push(`/product/${product.id}`)}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: product.images?.[0] ?? PRODUCT_IMAGE_PLACEHOLDER }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>
                  ${Number(product.price).toLocaleString('es-AR')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 28,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  // ── Reputación ──────────────────────────────────────────────────────────
  reputationLoader: {
    marginTop: 8,
  },
  reputationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  reputationSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  reputationScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  reputationScoreValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 36,
  },
  reputationStarIcon: {
    fontSize: 22,
    color: COLORS.secondary,
  },
  reputationCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  reviewsDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginBottom: 12,
  },
  reviewItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewStar: {
    fontSize: 16,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  // ── Productos ───────────────────────────────────────────────────────────
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: 90,
    height: 90,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
})
