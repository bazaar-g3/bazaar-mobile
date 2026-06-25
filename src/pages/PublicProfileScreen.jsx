import React, { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import api from '../api/api'
import { useTheme } from '../theme/ThemeContext'
import ProductCard from '../components/productList/ProductCard'
import { listSellerProducts, PRODUCT_IMAGE_PLACEHOLDER } from '../services/catalog'
import { getSellerReputation, formatAverageScore } from '../services/reviews'
import { makeStyles } from '../styles/publicProfileStyles'

export default function PublicProfileScreen() {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])
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
        <ActivityIndicator size="large" color={theme.color.accent} />
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
  const description = profile?.description ?? null
  const avatarUrl = profile?.avatarUrl ?? null
  const nameInitial = fullName[0]?.toUpperCase() ?? '?'

  const hasReputation = reputation && reputation.review_count > 0

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>

        {/* ── Header: avatar + nombre + rating inline ── */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>{nameInitial}</Text>
                </View>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.fullName} numberOfLines={2}>{fullName}</Text>

              {loadingReputation ? (
                <ActivityIndicator size="small" color={theme.color.accent} style={styles.ratingLoader} />
              ) : hasReputation ? (
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingStar}>★</Text>
                  <Text style={styles.ratingValue}>{formatAverageScore(reputation.average_score)}</Text>
                  <Text style={styles.ratingCount}>
                    · {reputation.review_count} {reputation.review_count === 1 ? 'reseña' : 'reseñas'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.noRating}>Sin calificaciones aún</Text>
              )}
            </View>
          </View>

          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
        </View>

        {/* ── Reseñas del vendedor ── */}
        {hasReputation ? (
          <>
            <Text style={styles.sectionTitle}>Calificaciones</Text>
            <View style={styles.reputationCard}>
              {reputation.reviews.map((review) => (
                <View key={String(review.id)} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text
                          key={star}
                          style={[
                            styles.reviewStar,
                            { color: star <= review.score ? theme.color.like : theme.color.textMuted },
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
          </>
        ) : null}

        {/* ── Publicaciones activas: grilla 2 columnas ── */}
        <Text style={styles.sectionTitle}>Publicaciones activas</Text>

        {loadingProducts ? (
          <ActivityIndicator size="small" color={theme.color.accent} />
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>Este vendedor no tiene publicaciones activas</Text>
        ) : (
          <View style={styles.productGrid}>
            {products.map((product) => (
              <ProductCard
                key={String(product.id)}
                layout="grid"
                cardStyle={{ width: '48%' }}
                item={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images?.[0] ?? PRODUCT_IMAGE_PLACEHOLDER,
                  seller: fullName,
                }}
                onOpenProduct={(id) => router.push(`/product/${id}`)}
                onAddToCart={() => {}}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}