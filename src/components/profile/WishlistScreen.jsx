import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'

import ProfileHeader from './ProfileHeader'
import ProfileSidebar from './ProfileSidebar'
import { useTheme } from '../../theme/ThemeContext'
import { getCatalogProduct, PRODUCT_IMAGE_PLACEHOLDER } from '../../services/catalog'
import { getSessionStatus } from '../../services/session'
import { getWishlist, removeFromWishlist } from '../../services/wishlist'
import { buildLoginRedirect } from '../../utils/authRedirect'

export default function WishlistScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const [checkingSession, setCheckingSession] = useState(true)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

    return () => {
      cancelled = true
    }
  }, [router])

  const loadWishlist = useCallback(async () => {
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

      setItems(productResults.filter(Boolean))
    } catch (err) {
      const status = err?.response?.status

      if (status >= 400) {
        setItems([])
      } else {
        setError('No pudimos cargar tu wishlist. Verificá tu conexión y volvé a intentarlo.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!checkingSession) loadWishlist()
  }, [checkingSession, loadWishlist])

  const handleSelectTab = useCallback(
    (key) => {
      setIsMenuOpen(false)

      if (key === 'Wishlist') return

      router.push({
        pathname: '/profile',
        params: { activeTab: key },
      })
    },
    [router]
  )

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId)
      setItems((prev) => prev.filter((item) => item.productId !== productId))
    } catch {
      Alert.alert('Error', 'No se pudo quitar el producto de tu wishlist.')
    }
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
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>

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

  if (checkingSession) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={theme.color.accent} style={styles.fullLoader} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfileHeader
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
        onGoHome={() => router.replace('/')}
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
          <ProfileSidebar activeTab="Wishlist" onSelectTab={handleSelectTab} />
        )}

        <View style={styles.titleRow}>
          {items.length > 0 && (
            <Text style={styles.itemCount}>
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </Text>
          )}
        </View>

        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.color.accent} />
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
            keyExtractor={(item) => item.productId}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const makeStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.color.surfaceSubtle,
  },
  mainWrapper: {
    flex: 1,
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 5,
  },
  fullLoader: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.md,
    paddingBottom: theme.space.sm,
  },
  itemCount: {
    fontSize: theme.type.meta.size,
    fontWeight: theme.type.meta.weight,
    color: theme.color.textSecondary,
  },
  listContent: {
    paddingHorizontal: theme.space.md,
    paddingBottom: theme.space.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.space.xl,
  },
  loadingText: {
    marginTop: theme.space.sm,
    color: theme.color.textSecondary,
    fontSize: theme.type.body.size,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: theme.space.md,
  },
  errorText: {
    fontSize: theme.type.body.size,
    color: theme.color.textSecondary,
    textAlign: 'center',
    marginBottom: theme.space.md,
  },
  retryButton: {
    backgroundColor: theme.color.accent,
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space.lg,
    borderRadius: theme.radius.md,
    minHeight: theme.button.minHeight,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: theme.color.onAccent,
    fontWeight: '700',
    fontSize: theme.type.body.size,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: theme.space.md,
  },
  emptyTitle: {
    fontSize: theme.type.title.size,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginBottom: theme.space.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.type.body.size,
    color: theme.color.textSecondary,
    textAlign: 'center',
    marginBottom: theme.space.lg,
  },
  exploreCatalogButton: {
    backgroundColor: theme.color.accent,
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space.lg,
    borderRadius: theme.radius.md,
    minHeight: theme.button.minHeight,
    justifyContent: 'center',
  },
  exploreCatalogButtonText: {
    color: theme.color.onAccent,
    fontWeight: '700',
    fontSize: theme.type.body.size,
  },

  // ── Card de item ─────────────────────────────────────────────────
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.image,
    marginBottom: theme.space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    // sin border ni shadow — dirección Social/P2P
  },
  cardUnavailable: {
    opacity: 0.6,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // overflow:hidden solo en el recorte de imagen, nunca en el card wrapper
  imageContainer: {
    position: 'relative',
    width: 90,
    height: 90,
    borderTopLeftRadius: theme.radius.image,
    borderBottomLeftRadius: theme.radius.image,
    overflow: 'hidden',
  },
  productImage: {
    width: 90,
    height: 90,
    backgroundColor: theme.color.surfaceSubtle,
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
    color: theme.color.onAccent,
    fontSize: theme.type.meta.size,
    fontWeight: '700',
  },
  productInfo: {
    flex: 1,
    padding: theme.space.sm,
  },
  productName: {
    fontSize: theme.type.body.size,
    fontWeight: '600',
    color: theme.color.textPrimary,
    marginBottom: theme.space.xs,
  },
  productPrice: {
    fontSize: theme.type.price.size,
    fontWeight: theme.type.price.weight,
    color: theme.color.textPrimary,
  },
  priceUnavailable: {
    color: theme.color.textMuted,
  },
  statusLabel: {
    fontSize: theme.type.meta.size,
    color: theme.color.textMuted,
    marginTop: 2,
  },
  removeButton: {
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.button.minHeight,
  },
  removeButtonText: {
    fontSize: 24,
    color: theme.color.like,
  },
})