import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  getCatalogProduct,
} from "../services/catalog";
import { getSessionStatus } from "../services/session";
import { buildLoginRedirect, normalizeRouteParam } from "../utils/authRedirect";
import { addToWishlist, removeFromWishlist, isInWishlist } from "../services/wishlist";
import { COLORS } from "../constants/colors";
import Logo from "../components/Logo";
import { FONT } from "../constants/theme";
import { getPublicProfile } from "../services/user";

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = normalizeRouteParam(params.id);
  const pendingAction = normalizeRouteParam(params.pendingAction);
  const pendingQuantity = normalizeRouteParam(params.quantity);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [catalogProduct, setCatalogProduct] = useState(null);
  const [loadingCatalogProduct, setLoadingCatalogProduct] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [handledPendingActionKey, setHandledPendingActionKey] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [pendingLoginAction, setPendingLoginAction] = useState("add-to-cart");

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogProduct() {
      if (!id) {
        setCatalogProduct(null);
        setLoadingCatalogProduct(false);
        return;
      }

      setLoadingCatalogProduct(true);

      try {
        const product = await getCatalogProduct(String(id));

        if (!cancelled && product) {
          const sellerProfile = await getPublicProfile(product.sellerId)
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
            seller: sellerProfile?.fullName ?? `Vendedor #${product.sellerId}`,
            features: [
              `Categoria: ${product.category?.label || "Catalogo"}`,
              product.stock > 0
                ? "Disponible para compra inmediata"
                : "Sin stock disponible",
            ],
            rating: "Nuevo",
            reviews: "sin reseñas",
          });
        } else if (!cancelled) {
          setCatalogProduct(null);
        }
      } catch {
        if (!cancelled) {
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
  }, [id]);

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

  const product = catalogProduct;

  const isOwnProduct =
    currentUserId !== null &&
    product?.sellerId !== undefined &&
    Number(product.sellerId) === Number(currentUserId);

  useEffect(() => {
    setSelectedImageIndex(0);
    setHandledPendingActionKey("");
  }, [product?.id, pendingAction, pendingQuantity]);

  const oldPrice = useMemo(() => {
    if (!product) return 0;
    return Number((product.price * 1.3).toFixed(2));
  }, [product]);

  const discountPercent = useMemo(() => {
    if (!product || !oldPrice) return 0;
    return Math.round(((oldPrice - product.price) / oldPrice) * 100);
  }, [product, oldPrice]);

  const completeAddToCart = (quantityToAdd, onDismiss) => {
    Alert.alert(
      "Añadido",
      `${quantityToAdd} unidad(es) agregadas al carrito.`,
      onDismiss ? [{ text: "OK", onPress: onDismiss }] : undefined
    );
  };

  const handleRequireAuthForCart = async () => {
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
  };

  const handleAddToCart = async () => {
    setPendingLoginAction("add-to-cart");
    const isAuthenticated = await handleRequireAuthForCart();

    if (!isAuthenticated) {
      return;
    }

    completeAddToCart(quantity);
  };

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
      }
    } catch {
      setIsWishlisted(previousState);
      Alert.alert("Error", "No se pudo actualizar tu wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleManagePublication = () => {
    router.push({
      pathname: "/profile",
      params: {
        section: "sales",
        productId: String(product.id),
        openEdit: "true",
      },
    });
  };

  const handleLoginRedirect = () => {
    setShowLoginPrompt(false);
    router.push(
      buildLoginRedirect({
        redirectPath: `/product/${id}`,
        pendingAction: pendingLoginAction,
        quantity: pendingLoginAction === "add-to-cart" ? quantity : undefined,
      })
    );
  };

  useEffect(() => {
    if (!product || !pendingAction || !id) {
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

        completeAddToCart(restoredQuantity, () => {
          router.replace(`/product/${id}`);
        });
      }

      if (pendingAction === "add-to-wishlist") {
        setHandledPendingActionKey(actionKey);
        try {
          await addToWishlist(String(id));
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
  }, [product, pendingAction, pendingQuantity, id, handledPendingActionKey, router]);

  if (loadingCatalogProduct) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryLight} />
          <Text style={styles.notFoundText}>
            Cargando información del producto...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundEmoji}>📦</Text>
          <Text style={styles.notFoundTitle}>Producto no encontrado</Text>
          <Text style={styles.notFoundText}>
            No pudimos encontrar el producto que estás buscando.
          </Text>
          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.backHomeButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const safeFeatures = product.features || [];
  const safeImages = product.images?.length
    ? product.images
    : [product.image || PRODUCT_IMAGE_PLACEHOLDER];
  const selectedImage = safeImages[selectedImageIndex] || safeImages[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.safeArea}>
        <View style={styles.topHeader}>
          <View style={styles.topHeaderContent}>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.headerBack}>← Volver</Text>
            </TouchableOpacity>

            <View style={styles.logoCenter}>
              <Logo size={32} textSize={30} />
            </View>

            {!isOwnProduct && (
              <TouchableOpacity
                onPress={handleToggleWishlist}
                disabled={wishlistLoading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[
                  styles.wishlistIcon,
                  isWishlisted && styles.wishlistIconActive,
                  wishlistLoading && styles.wishlistIconLoading,
                ]}>
                  {isWishlisted ? "♥" : "♡"}
                </Text>
              </TouchableOpacity>
            )}

          </View>
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>
              INICIO &gt; {product.categoryName.toUpperCase()} &gt; {product.name.toUpperCase()}
            </Text>
          </View>

          <View style={styles.mainCard}>
            <View style={styles.leftColumn}>
              <View style={styles.imageWrapper}>
                <Image source={{ uri: selectedImage }} style={styles.productImage} />
              </View>

              <View style={styles.thumbnailRow}>
                {safeImages.slice(0, 5).map((imageUri, index) => (
                  <TouchableOpacity
                    key={`${imageUri}-${index}`}
                    style={[
                      styles.thumbnail,
                      index === selectedImageIndex ? styles.activeThumbnail : null,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setSelectedImageIndex(index)}
                  >
                    <Image source={{ uri: imageUri }} style={styles.thumbnailImg} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.rightColumn}>
              <Text style={styles.productTitle}>{product.name}</Text>

              <View style={styles.metaRow}>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>OFERTA DESTACADA</Text>
                </View>
                <Text style={styles.ratingText}>
                  ⭐ {product.rating} ({product.reviews})
                </Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.oldPrice}>${oldPrice}</Text>
                <Text style={styles.currentPrice}>${product.price}</Text>
                <Text style={styles.savings}>
                  Ahorrá ${Number((oldPrice - product.price).toFixed(2))} ({discountPercent}% DTO)
                </Text>
              </View>

              <TouchableOpacity onPress={() => router.push(`/user/${product.sellerId}`)}>
                <Text style={[styles.sellerText, { textDecorationLine: 'underline' }]}>
                  Vendido por {product.seller}
                </Text>
              </TouchableOpacity>

              <View style={styles.stockRow}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>{product.categoryName}</Text>
                </View>
                <Text style={styles.stockText}>Stock disponible: {product.stock}</Text>
              </View>

              <Text style={styles.descriptionText}>{product.description}</Text>

              <View style={styles.featuresBox}>
                {safeFeatures.map((feature, index) => (
                  <Text key={index} style={styles.featureItem}>
                    • {feature}
                  </Text>
                ))}
              </View>

              {!isOwnProduct ? (
                <View style={styles.quantitySection}>
                  <Text style={styles.quantityLabel}>Cantidad</Text>
                  <View style={styles.quantitySelector}>
                    <TouchableOpacity
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.qtyValue}>{quantity}</Text>

                    <TouchableOpacity
                      onPress={() => setQuantity(quantity + 1)}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              <View style={styles.actions}>
                {isOwnProduct ? (
                  <TouchableOpacity
                    style={styles.manageButton}
                    onPress={handleManagePublication}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.manageButtonText}>GESTIONAR PUBLICACIÓN</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.cartButton}
                    onPress={handleAddToCart}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.cartButtonText}>AÑADIR AL CARRITO</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {showLoginPrompt ? (
          <View style={styles.loginPromptOverlay}>
            <TouchableOpacity
              style={styles.loginPromptBackdrop}
              activeOpacity={1}
              onPress={() => setShowLoginPrompt(false)}
            />

            <View style={styles.loginPromptWrapper}>
              <View style={styles.loginPromptBox}>
                <Text style={styles.loginPromptTitle}>⚠️</Text>
                <Text style={styles.loginPromptText}>
                  Necesitas loggearte para agregar el producto al carrito.
                </Text>

                <View style={styles.loginPromptButtons}>
                  <TouchableOpacity
                    style={styles.loginPromptLoginButton}
                    onPress={handleLoginRedirect}
                  >
                    <Text style={styles.loginPromptLoginButtonText}>
                      Iniciar sesión
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.loginPromptCancelButton}
                    onPress={() => setShowLoginPrompt(false)}
                  >
                    <Text style={styles.loginPromptCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 16,
    paddingBottom: 28,
  },

  backButton: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 10,
  },

  breadcrumb: {
    marginBottom: 14,
  },

  breadcrumbText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
  },

  mainCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },

  leftColumn: {
    width: "44%",
    paddingRight: 16,
  },

  imageWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  productImage: {
    width: "100%",
    height: 260,
    resizeMode: "contain",
  },

  thumbnailRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
    gap: 10,
  },

  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    padding: 5,
    backgroundColor: COLORS.white,
  },

  activeThumbnail: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },

  thumbnailImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  rightColumn: {
    width: "56%",
  },

  productTitle: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },

  promoBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },

  promoBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.white,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },

  priceContainer: {
    marginBottom: 12,
  },

  oldPrice: {
    fontSize: 15,
    textDecorationLine: "line-through",
    color: COLORS.textSecondary,
    marginBottom: 2,
  },

  currentPrice: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.secondary,
    marginBottom: 2,
  },

  savings: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  sellerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },

  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },

  categoryPill: {
    backgroundColor: COLORS.promoLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  categoryPillText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 12,
  },

  stockText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.success,
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text,
    marginBottom: 12,
  },

  featuresBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 18,
  },

  featureItem: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "600",
    marginBottom: 5,
  },

  quantitySection: {
    marginBottom: 18,
  },

  quantityLabel: {
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    width: 118,
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },

  qtyBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },

  qtyBtnText: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },

  qtyValue: {
    flex: 1,
    textAlign: "center",
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  actions: {
    gap: 12,
  },

  cartButton: {
    backgroundColor: COLORS.dark,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  cartButtonText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 15,
  },

  manageButton: {
    backgroundColor: COLORS.logoA2,
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.lightPurple,
  },

  manageButtonText: {
    color: COLORS.lightPurple,
    fontWeight: "900",
    fontSize: 15,
  },

  shippingInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 18,
    gap: 10,
  },

  shippingText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.dark,
  },

  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },

  notFoundEmoji: {
    fontSize: 42,
    marginBottom: 16,
  },

  notFoundTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  notFoundText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },

  backHomeButton: {
    backgroundColor: COLORS.dark,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
  },

  backHomeButtonText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 15,
  },

  loginPromptOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  loginPromptBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
  },

  loginPromptWrapper: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  loginPromptBox: {
    width: 320,
    maxWidth: "92%",
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
    alignItems: "center",
  },

  loginPromptTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 28,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  loginPromptText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },

  loginPromptButtons: {
    width: "100%",
    gap: 10,
  },

  loginPromptLoginButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  loginPromptLoginButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
  },

  loginPromptCancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  loginPromptCancelButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
  },

  loginPromptArrow: {
    position: "absolute",
    bottom: -12,
    width: 22,
    height: 22,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: "45deg" }],
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.primaryLight,
  },

  topHeader: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingHorizontal: 16,
    paddingVertical: 25,
  },

  topHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },

  logoCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "none",
  },

  headerBack: {
    fontSize: FONT.medium,
    fontWeight: "700",
    color: COLORS.primary,
    zIndex: 2,
  },

  wishlistIcon: {
    fontSize: 26,
    color: COLORS.textMuted,
    zIndex: 2,
  },

  wishlistIconActive: {
    color: COLORS.error,
  },

  wishlistIconLoading: {
    opacity: 0.4,
  },
});