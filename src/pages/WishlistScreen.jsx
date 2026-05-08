import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { getSessionStatus } from '../services/session'
import { buildLoginRedirect } from '../utils/authRedirect'
import { getWishlist, removeFromWishlist } from '../services/wishlist'
import { getCatalogProduct, PRODUCT_IMAGE_PLACEHOLDER } from '../services/catalog'
import { COLORS } from '../constants/colors'
import { FONT, SPACING } from '../constants/theme'
import Logo from '../components/Logo'

export default function WishlistScreen() {
  const router = useRouter()

  const [checkingSession, setCheckingSession] = useState(true)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function ensureAuth() {
      const session = await getSessionStatus()
      if (!session.isAuthenticated) {
        router.replace(buildLoginRedirect({ redirectPath: '/wishlist' }))
        return
      }
      if (!cancelled) setCheckingSession(false)
    }

    ensureAuth()
    return () => { cancelled = true }
  }, [router])

  const loadWishlist = useCallback(async () => {
    let cancelled = false
    setLoading(true)
    setError(null)

    try {
      const wishlistItems = await getWishlist()
      const productResults = await Promise.all(
        wishlistItems.map(async ({ productId, addedAt }) => {
          try {
            const product = await getCatalogProduct(String(productId))
            if (!product) return null
            return {
              productId: String(productId),
              addedAt,
              name: product.name,
              price: Number(product.price) || 0,
              image: product.images?.[0] || PRODUCT_IMAGE_PLACEHOLDER,
              stock: Number(product.stock) ?? 0,
              status: product.status,
            }
          } catch {
            return null
          }
        })
      )

      if (!cancelled) {
        setItems(productResults.filter(Boolean))
      }
    } catch (err) {
      // Si el servidor devuelve 4xx/5xx o hay error de red, mostramos wishlist vacía
      // en lugar de un mensaje de error que confunde al usuario.
      const status = err?.response?.status
      if (!cancelled) {
        if (status >= 400) {
          setItems([])
        } else {
          setError('No pudimos cargar tu wishlist. Verificá tu conexión y volvé a intentarlo.')
        }
      }
    } finally {
      if (!cancelled) setLoading(false)
    }

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!checkingSession) loadWishlist()
  }, [checkingSession, loadWishlist])

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId)
      setItems(prev => prev.filter(item => item.productId !== productId))
    } catch {
      Alert.alert('Error', 'No se pudo quitar el producto de tu wishlist.')
    }
  }

  if (checkingSession) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} style={{ flex: 1 }} />
      </SafeAreaView>
    )
  }

  const renderItem = ({ item }) => {
    const outOfStock = item.stock === 0
    const disabled = item.status !== 'active'
    const unavailable = disabled || outOfStock

    return (
      <View style={[styles.card, unavailable && styles.cardUnavailable]}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => !unavailable && router.push(`/product/${item.productId}`)}
          activeOpacity={unavailable ? 1 : 0.8}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            {disabled && (
              <View style={styles.overlayBadge}>
                <Text style={styles.overlayBadgeText}>No disponible</Text>
              </View>
            )}
            {!disabled && outOfStock && (
              <View style={[styles.overlayBadge, styles.outOfStockBadge]}>
                <Text style={styles.overlayBadgeText}>Sin stock</Text>
              </View>
            )}
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={[styles.productPrice, unavailable && styles.priceUnavailable]}>
              ${item.price.toFixed(2)}
            </Text>
            {disabled && <Text style={styles.statusLabel}>No disponible</Text>}
            {!disabled && outOfStock && <Text style={styles.statusLabel}>Sin stock</Text>}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemove(item.productId)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.removeButtonText}>♥</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Logo />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.screenTitle}>Mi Wishlist</Text>
        {items.length > 0 && (
          <Text style={styles.itemCount}>{items.length} {items.length === 1 ? 'producto' : 'productos'}</Text>
        )}
      </View>

      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryLight} />
          <Text style={styles.loadingText}>Cargando tu wishlist...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadWishlist}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && items.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyEmoji}>🤍</Text>
          <Text style={styles.emptyTitle}>Tu wishlist está vacía</Text>
          <Text style={styles.emptySubtitle}>
            Tocá el ♡ en cualquier publicación para guardar productos y encontrarlos acá fácilmente.
          </Text>
          <TouchableOpacity
            style={styles.exploreCatalogButton}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.exploreCatalogButtonText}>Explorar catálogo</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={item => item.productId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backButton: {
    fontSize: FONT.regular,
    color: COLORS.primary,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  screenTitle: {
    fontSize: FONT.large,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  itemCount: {
    fontSize: FONT.small,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: FONT.regular,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT.regular,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT.large,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  exploreCatalogButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
  },
  exploreCatalogButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT.regular,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  cardUnavailable: {
    opacity: 0.7,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: 90,
    height: 90,
  },
  productImage: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.imagePlaceholder,
  },
  overlayBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: 'rgba(198,40,40,0.75)',
  },
  overlayBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  productInfo: {
    flex: 1,
    padding: SPACING.sm,
  },
  productName: {
    fontSize: FONT.regular,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: FONT.medium,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceUnavailable: {
    color: COLORS.textMuted,
  },
  statusLabel: {
    fontSize: FONT.small,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  removeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 24,
    color: COLORS.error,
  },
})
