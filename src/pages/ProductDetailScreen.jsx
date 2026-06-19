import React, { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  Share,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";

import { useCartContext } from "../context/CartContext";
import { getCartErrorMessage } from "../services/cart";

import {
  PRODUCT_IMAGE_PLACEHOLDER,
  getCatalogProduct,
} from "../services/catalog";
import { getSessionStatus } from "../services/session";
import { getPublicProfile } from "../services/user";
import {
  buildLoginRedirect,
  normalizeRouteParam,
} from "../utils/authRedirect";
import { addToWishlist, removeFromWishlist, isInWishlist } from "../services/wishlist";
import { getProductReputation, formatAverageScore } from "../services/reviews";
import { recordProductView, recordCartAdd, recordWishlistAdd } from "../services/browseHistory";

import { makeStyles as makeSharedStyles } from "../styles/productDetail/productDetailStyles";
import { useTheme } from "../theme/ThemeContext";

import ProductImageGallery from "../components/productDetail/ProductImageGallery";
import ProductInfoPanel from "../components/productDetail/ProductInfoPanel";
import LoginPromptModal from "../components/productDetail/LoginPromptModal";
import ShareProductModal from "../components/productDetail/ShareProductModal";

import { FONT, SPACING } from "../constants/theme";

const PRODUCT_SHARE_BASE_URL = "http://localhost:8081";

export default function ProductDetailScreen() {
  const { theme } = useTheme();
  const sharedStyles = useMemo(() => makeSharedStyles(theme), [theme]);
  const reviewStyles = useMemo(() => makeReviewStyles(theme), [theme]);
  const headerStyles = useMemo(() => makeHeaderStyles(theme), [theme]);

  const router = useRouter();
  const params = useLocalSearchParams();

  const id = normalizeRouteParam(params.id);
  const paramSellerId = normalizeRouteParam(params.sellerId);
  const pendingAction = normalizeRouteParam(params.pendingAction);
  const pendingQuantity = normalizeRouteParam(params.quantity);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [catalogProduct, setCatalogProduct] = useState(null);
  const [loadingCatalogProduct, setLoadingCatalogProduct] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [handledPendingActionKey, setHandledPendingActionKey] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [pendingLoginAction, setPendingLoginAction] = useState("add-to-cart");
  const { addItem, items: cartItems } = useCartContext();
  const [addingToCart, setAddingToCart] = useState(false);
  const [sellerUnavailable, setSellerUnavailable] = useState(false);
  const [reputation, setReputation] = useState(null);
  const [loadingReputation, setLoadingReputation] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogProduct() {
      if (!id) {
        setCatalogProduct(null);
        setLoadingCatalogProduct(false);
        return;
      }

      setLoadingCatalogProduct(true);
      setSellerUnavailable(false);

      try {
        const product = await getCatalogProduct(String(id));

        if (!product) {
          if (!cancelled) {
            // El catálogo no pudo devolver el producto (puede estar eliminado, o la API falló).
            // Si tenemos el seller_id del producto (pasado como param desde la pantalla anterior),
            // verificamos si el vendedor está bloqueado para mostrar el mensaje correcto.
            if (paramSellerId) {
              const sellerProfile = await getPublicProfile(Number(paramSellerId));
              if (!sellerProfile) {
                setSellerUnavailable(true);
              }
            }
            setCatalogProduct(null);
          }
          return;
        }

        const sellerProfile = await getPublicProfile(product.sellerId);

        // Si el perfil del vendedor no está disponible (bloqueado/suspendido),
        // marcamos el producto como de vendedor no disponible para mostrar
        // un mensaje claro en lugar de "Producto no encontrado".
        if (!sellerProfile) {
          if (!cancelled) {
            setSellerUnavailable(true);
            setCatalogProduct(null);
          }
          return;
        }

        if (!cancelled) {
          setCatalogProduct({
            id: String(product.id),
            sellerId: Number(product.sellerId),
            name: product.name,
            price: Number(product.price) || 0,
            images: product.images?.length
              ? product.images
              : [PRODUCT_IMAGE_PLACEHOLDER],
            image: product.images?.[0] || PRODUCT_IMAGE_PLACEHOLDER,
            categoryName: product.category?.label || "Catalogo",
            description: product.description || "Sin descripcion disponible.",
            stock: Number(product.stock) || 0,
            seller: sellerProfile.fullName,
            status: product.status || "active",
          });
          recordProductView(String(product.id)).catch(() => {});
        }
      } catch (error) {
        if (!cancelled) {
          if (error?.reason === 'seller_blocked') {
            // El catálogo confirmó explícitamente que el vendedor está bloqueado
            setSellerUnavailable(true);
          } else if (paramSellerId) {
            // Fallback: el catálogo devolvió otro error (o el reason se perdió).
            // Si tenemos el sellerId, verificamos directamente con users-api.
            try {
              const fallbackProfile = await getPublicProfile(Number(paramSellerId));
              if (!fallbackProfile) setSellerUnavailable(true);
            } catch { /* ignorar error secundario */ }
          }
          setCatalogProduct(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingCatalogProduct(false);
        }
      }
    }

    loadCatalogProduct();

    return () => {
      cancelled = true;
    };
  }, [id, paramSellerId]);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const session = await getSessionStatus();

        if (!session.isAuthenticated) {
          if (!cancelled) {
            setCurrentUserId(null);
          }
          return;
        }

        if (!cancelled) {
          setCurrentUserId(session.profile?.id ?? null);
        }
      } catch {
        if (!cancelled) {
          setCurrentUserId(null);
        }
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!catalogProduct?.id) return;
    let cancelled = false;

    async function loadReputation() {
      setLoadingReputation(true);
      try {
        const data = await getProductReputation(catalogProduct.id);
        if (!cancelled) setReputation(data);
      } catch {
        if (!cancelled) setReputation({ product_id: catalogProduct.id, average_score: null, review_count: 0, reviews: [] });
      } finally {
        if (!cancelled) setLoadingReputation(false);
      }
    }

    loadReputation();
    return () => { cancelled = true; };
  }, [catalogProduct?.id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadWishlistState() {
      const token = await AsyncStorage.getItem('token');
      if (!token || cancelled) return;
      try {
        const wishlisted = await isInWishlist(id);
        if (!cancelled) setIsWishlisted(wishlisted);
      } catch {
        // non-critical
      }
    }

    loadWishlistState();
    return () => { cancelled = true; };
  }, [id]);

  const product = catalogProduct;

  const isOwnProduct =
    currentUserId !== null &&
    product?.sellerId !== undefined &&
    Number(product.sellerId) === Number(currentUserId);

  const isAvailable = !!product && product.status === "active";

  const quantityInCart = product
    ? cartItems.find(it => String(it.product_id) === String(product.id))?.quantity ?? 0
    : 0;
  const maxAddable = product ? Math.max(product.stock - quantityInCart, 0) : 0;
  const cartLimitReached = isAvailable && product && product.stock > 0 && maxAddable === 0;

  useEffect(() => {
    setSelectedImageIndex(0);
    setHandledPendingActionKey("");
  }, [product?.id, pendingAction, pendingQuantity]);

  useEffect(() => {
    if (quantity > maxAddable && maxAddable > 0) {
      setQuantity(maxAddable);
    }
  }, [maxAddable, quantity]);

  const safeImages = product?.images?.length
    ? product.images
    : [product?.image || PRODUCT_IMAGE_PLACEHOLDER];

  const selectedImage = safeImages[selectedImageIndex] || safeImages[0];

  function getProductShareUrl(productId) {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      return `${window.location.origin}/product/${productId}`;
    }

    return `${PRODUCT_SHARE_BASE_URL}/product/${productId}`;
  }

  async function completeAddToCart(quantityToAdd, onDismiss) {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addItem(product.id, quantityToAdd);
      recordCartAdd(String(product.id)).catch(() => {});
      // El éxito lo confirma el morph a ✓ del AnimatedButton (sin alert redundante)
      if (onDismiss) onDismiss();
    } catch (e) {
      Alert.alert(
        "Error",
        getCartErrorMessage(e, "No se pudo agregar al carrito.")
      );
      throw e; // re-lanzamos para que el botón no muestre éxito
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleRequireAuthForCart() {
    try {
      const session = await getSessionStatus();

      if (!session.isAuthenticated) {
        setShowLoginPrompt(true);
        return false;
      }

      return true;
    } catch {
      Alert.alert("Error", "No se pudo verificar la sesión.");
      return false;
    }
  }

  async function handleAddToCart() {
    // Cada camino que NO agrega lanza, para que el AnimatedButton no muestre éxito.
    if (!isAvailable) {
      Alert.alert("Producto no disponible", "Este producto ya no está disponible.");
      throw new Error("not-available");
    }
    if (product.stock <= 0) {
      Alert.alert("Sin stock", "No hay unidades disponibles de este producto por el momento.");
      throw new Error("no-stock");
    }
    if (cartLimitReached) {
      Alert.alert(
        "Límite alcanzado",
        "Ya tenés el máximo disponible de este producto en tu carrito."
      );
      throw new Error("cart-limit");
    }
    if (quantity > maxAddable) {
      Alert.alert(
        "Cantidad no disponible",
        `Solo podés agregar ${maxAddable} unidad/es más (ya tenés ${quantityInCart} en el carrito).`
      );
      throw new Error("exceeds-max");
    }

    setPendingLoginAction("add-to-cart");
    const authenticated = await handleRequireAuthForCart();
    if (!authenticated) throw new Error("auth-required");
    await completeAddToCart(quantity);
  }

  function handleManagePublication() {
    if (!product) return;

    router.push({
      pathname: "/profile",
      params: {
        section: "sales",
        productId: String(product.id),
        openEdit: "true",
      },
    });
  }

  const handleToggleWishlist = async () => {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      setPendingLoginAction("add-to-wishlist");
      setShowLoginPrompt(true);
      return;
    }

    if (wishlistLoading) return;

    const previousState = isWishlisted;
    setIsWishlisted(!isWishlisted);
    setWishlistLoading(true);

    try {
      if (previousState) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist(id);
        recordWishlistAdd(String(id)).catch(() => {});
      }
    } catch {
      setIsWishlisted(previousState);
      Alert.alert("Error", "No se pudo actualizar tu wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  };

  function handleLoginRedirect() {
    setShowLoginPrompt(false);

    router.push(
      buildLoginRedirect({
        redirectPath: `/product/${id}`,
        pendingAction: pendingLoginAction,
        quantity: pendingLoginAction === "add-to-cart" ? quantity : undefined,
      })
    );
  }

  async function copyProductLink() {
    if (!product || !isAvailable) {
      Alert.alert(
        "Producto no disponible",
        "Este producto no está disponible para compartir."
      );
      return;
    }

    const productUrl = getProductShareUrl(product.id);

    try {
      if (
        Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(productUrl);
      } else {
        await Clipboard.setStringAsync(productUrl);
      }

      setShowShareModal(false);
      Alert.alert("Link copiado", "El link del producto fue copiado.");
    } catch {
      Alert.alert("Error", "No se pudo copiar el link.");
    }
  }

  async function shareProductLink() {
    if (!product || !isAvailable) {
      Alert.alert(
        "Producto no disponible",
        "Este producto no está disponible para compartir."
      );
      return;
    }

    const productUrl = getProductShareUrl(product.id);
    const shareMessage = `${product.name}\n${productUrl}`;

    try {
      setShowShareModal(false);

      if (
        Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        navigator.share
      ) {
        await navigator.share({
          title: "¡Mirá este producto en Bazaar!",
          text: shareMessage,
        });
        return;
      }

      await Share.share({
        title: "¡Mirá este producto en Bazaar!",
        message: shareMessage,
      });
    } catch {
      Alert.alert("Error", "No se pudo compartir el producto.");
    }
  }

  function handleOpenShareModal() {
    if (!product || !isAvailable) {
      Alert.alert(
        "Producto no disponible",
        "Este producto no está disponible para compartir."
      );
      return;
    }

    setShowShareModal(true);
  }

  useEffect(() => {
    if (!product || !pendingAction || !id || !isAvailable) {
      return;
    }

    const actionKey = `${product.id}:${pendingAction}:${pendingQuantity || "1"}`;

    if (handledPendingActionKey === actionKey) {
      return;
    }

    let cancelled = false;

    async function resumePendingAction() {
      const token = await AsyncStorage.getItem("token");

      if (!token || cancelled) {
        return;
      }

      if (pendingAction === "add-to-cart") {
        const restoredQuantity = Math.max(
          1,
          Number.parseInt(pendingQuantity || "1", 10) || 1
        );

        setHandledPendingActionKey(actionKey);
        setQuantity(restoredQuantity);

        await completeAddToCart(restoredQuantity, () => {
          router.replace(`/product/${id}`);
        });
      }

      if (pendingAction === "add-to-wishlist") {
        setHandledPendingActionKey(actionKey);
        try {
          await addToWishlist(String(id));
          recordWishlistAdd(String(id)).catch(() => {});
          setIsWishlisted(true);
          Alert.alert("Guardado", "Producto agregado a tu wishlist.", [
            { text: "OK", onPress: () => router.replace(`/product/${id}`) },
          ]);
        } catch {
          router.replace(`/product/${id}`);
        }
      }
    }

    resumePendingAction();

    return () => {
      cancelled = true;
    };
  }, [
    product,
    pendingAction,
    pendingQuantity,
    id,
    handledPendingActionKey,
    router,
    isAvailable,
  ]);

  if (loadingCatalogProduct) {
    return (
      <SafeAreaView style={sharedStyles.safeArea}>
        <View style={sharedStyles.notFoundContainer}>
          <ActivityIndicator size="large" color={theme.color.accent} />
          <Text style={sharedStyles.notFoundText}>
            Cargando información del producto...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={sharedStyles.safeArea}>
        <View style={headerStyles.topHeader}>
          <View style={headerStyles.topHeaderContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={headerStyles.headerBack}>← Volver</Text>
            </TouchableOpacity>
            <View style={headerStyles.placeholder} />
          </View>
        </View>
        <View style={sharedStyles.notFoundContainer}>
          {sellerUnavailable ? (
            <>
              <Text style={sharedStyles.notFoundEmoji}>🚫</Text>
              <Text style={sharedStyles.notFoundTitle}>Publicación no disponible</Text>
              <Text style={sharedStyles.notFoundText}>
                Este producto no está disponible porque la cuenta del vendedor fue suspendida.
              </Text>
            </>
          ) : (
            <>
              <Text style={sharedStyles.notFoundEmoji}>📦</Text>
              <Text style={sharedStyles.notFoundTitle}>Producto no encontrado</Text>
              <Text style={sharedStyles.notFoundText}>
                No pudimos encontrar el producto que estás buscando.
              </Text>
            </>
          )}
          <TouchableOpacity
            style={sharedStyles.backHomeButton}
            onPress={() => router.replace("/home")}
          >
            <Text style={sharedStyles.backHomeButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAvailable) {
    return (
      <SafeAreaView style={sharedStyles.safeArea}>
        <View style={headerStyles.topHeader}>
          <View style={headerStyles.topHeaderContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={headerStyles.headerBack}>← Volver</Text>
            </TouchableOpacity>
            <View style={headerStyles.placeholder} />
          </View>
        </View>

        <View style={sharedStyles.notFoundContainer}>
          <Text style={sharedStyles.notFoundEmoji}>⚠️</Text>
          <Text style={sharedStyles.notFoundTitle}>Producto no disponible</Text>
          <Text style={sharedStyles.notFoundText}>
            Este producto fue dado de baja o deshabilitado y ya no está disponible.
          </Text>
          <TouchableOpacity
            style={sharedStyles.backHomeButton}
            onPress={() => router.replace("/home")}
          >
            <Text style={sharedStyles.backHomeButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <View style={sharedStyles.safeArea}>
        <View style={headerStyles.topHeader}>
          <View style={headerStyles.topHeaderContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={headerStyles.headerBack}>← Volver</Text>
            </TouchableOpacity>

            <View style={headerStyles.placeholder} />
          </View>
        </View>

        <ScrollView
          style={sharedStyles.container}
          contentContainerStyle={sharedStyles.content}
        >
          <View style={sharedStyles.breadcrumb}>
            <Text style={sharedStyles.breadcrumbText}>
              INICIO &gt; {product.categoryName.toUpperCase()} &gt; {product.name.toUpperCase()}
            </Text>
          </View>

          <View style={sharedStyles.mainCard}>
            <ProductImageGallery
              images={safeImages}
              selectedImage={selectedImage}
              selectedImageIndex={selectedImageIndex}
              onSelectImage={setSelectedImageIndex}
            />

            <ProductInfoPanel
              product={product}
              quantity={quantity}
              isOwnProduct={isOwnProduct}
              isAvailable={isAvailable}
              maxAddable={maxAddable}
              cartLimitReached={cartLimitReached}
              isWishlisted={isWishlisted}
              wishlistLoading={wishlistLoading}
              onSellerPress={() => router.push(`/user/${product.sellerId}`)}
              onDecreaseQuantity={() => setQuantity(Math.max(1, quantity - 1))}
              onIncreaseQuantity={() => {
                if (quantity < maxAddable) {
                  setQuantity(quantity + 1);
                }
              }}
              onManagePublication={handleManagePublication}
              onAddToCart={handleAddToCart}
              onShareProduct={handleOpenShareModal}
              onToggleWishlist={handleToggleWishlist}
              reputation={reputation}
            />
          </View>

          {/* ── Reputación del producto ── */}
          <Text style={reviewStyles.sectionTitle}>Calificaciones del producto</Text>

          {loadingReputation ? (
            <ActivityIndicator size="small" color={theme.color.accent} style={{ marginTop: 8 }} />
          ) : reputation && reputation.review_count > 0 ? (
            <View style={reviewStyles.reputationCard}>
              <View style={reviewStyles.reputationSummary}>
                <View style={reviewStyles.reputationScore}>
                  <Text style={reviewStyles.reputationScoreValue}>
                    {formatAverageScore(reputation.average_score)}
                  </Text>
                  <Text style={reviewStyles.reputationStarIcon}>★</Text>
                </View>
                <Text style={reviewStyles.reputationCount}>
                  {reputation.review_count}{' '}
                  {reputation.review_count === 1 ? 'calificación' : 'calificaciones'}
                </Text>
              </View>

              <View style={reviewStyles.divider} />

              {reputation.reviews.map((review) => (
                <View key={String(review.id)} style={reviewStyles.reviewItem}>
                  <View style={reviewStyles.reviewHeader}>
                    <View style={reviewStyles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text
                          key={star}
                          style={[
                            reviewStyles.reviewStar,
                            { color: star <= review.score ? theme.color.like : theme.color.border },
                          ]}
                        >
                          ★
                        </Text>
                      ))}
                    </View>
                    <Text style={reviewStyles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  {review.comment ? (
                    <Text style={reviewStyles.reviewComment}>{review.comment}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <Text style={reviewStyles.emptyText}>Este producto aún no tiene calificaciones</Text>
          )}
        </ScrollView>

        <LoginPromptModal
          visible={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          onLogin={handleLoginRedirect}
        />

        <ShareProductModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          onCopyLink={copyProductLink}
          onShareLink={shareProductLink}
        />
      </View>
    </SafeAreaView>
  );
}

const makeReviewStyles = (theme) => StyleSheet.create({
  sectionTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: theme.color.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  reputationCard: {
    backgroundColor: theme.color.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    // no shadow — Social/P2P direction
  },
  reputationSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  reputationScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  reputationScoreValue: {
    fontSize: FONT.title,
    fontWeight: '800',
    color: theme.color.textPrimary,
    lineHeight: 34,
  },
  reputationStarIcon: {
    fontSize: FONT.large,
    color: theme.color.like,
  },
  reputationCount: {
    fontSize: FONT.small,
    color: theme.color.textSecondary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: theme.color.border,
    marginBottom: SPACING.sm,
  },
  reviewItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewStar: {
    fontSize: FONT.regular,
  },
  reviewDate: {
    fontSize: 11,
    color: theme.color.textMuted,
  },
  reviewComment: {
    fontSize: FONT.small,
    color: theme.color.textSecondary,
    lineHeight: 19,
    marginTop: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT.small,
    color: theme.color.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
});

const makeHeaderStyles = (theme) => StyleSheet.create({
  topHeader: {
    backgroundColor: theme.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    paddingHorizontal: 16,
    paddingVertical: 25,
  },

  topHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },

  headerBack: {
    fontSize: FONT.medium,
    fontWeight: "700",
    color: theme.color.accent,
    zIndex: 2,
  },

  placeholder: {
    width: 26,
  },

  wishlistIcon: {
    fontSize: 26,
    color: theme.color.textMuted,
    zIndex: 2,
  },

  wishlistIconActive: {
    color: theme.color.like,
  },

  wishlistIconLoading: {
    opacity: 0.4,
  },
});
