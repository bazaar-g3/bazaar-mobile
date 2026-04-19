import React, { useEffect, useMemo, useState } from "react";
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

import { styles as sharedStyles } from "../styles/productDetail/productDetailStyles";

import ProductImageGallery from "../components/productDetail/ProductImageGallery";
import ProductInfoPanel from "../components/productDetail/ProductInfoPanel";
import LoginPromptModal from "../components/productDetail/LoginPromptModal";
import ShareProductModal from "../components/productDetail/ShareProductModal";

import Logo from "../components/Logo";
import { COLORS } from "../constants/colors";
import { FONT } from "../constants/theme";

const PRODUCT_SHARE_BASE_URL = "http://localhost:8081";

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
  const [showShareModal, setShowShareModal] = useState(false);
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

        if (!product) {
          if (!cancelled) {
            setCatalogProduct(null);
          }
          return;
        }

        const sellerProfile = await getPublicProfile(product.sellerId);

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
            seller: sellerProfile?.fullName ?? `Vendedor #${product.sellerId}`,
            status: product.status || "active",
          });
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

  useEffect(() => {
    setSelectedImageIndex(0);
    setHandledPendingActionKey("");
  }, [product?.id, pendingAction, pendingQuantity]);

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

  function completeAddToCart(quantityToAdd, onDismiss) {
    Alert.alert(
      "Añadido",
      `${quantityToAdd} unidad(es) agregadas al carrito.`,
      onDismiss ? [{ text: "OK", onPress: onDismiss }] : undefined
    );
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
    if (!isAvailable) {
      Alert.alert(
        "Producto no disponible",
        "Este producto ya no está disponible."
      );
      return;
    }

    setPendingLoginAction("add-to-cart");
    const authenticated = await handleRequireAuthForCart();

    if (!authenticated) return;

    completeAddToCart(quantity);
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
          <ActivityIndicator size="large" color="#000" />
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
        <View style={sharedStyles.notFoundContainer}>
          <Text style={sharedStyles.notFoundEmoji}>📦</Text>
          <Text style={sharedStyles.notFoundTitle}>Producto no encontrado</Text>
          <Text style={sharedStyles.notFoundText}>
            No pudimos encontrar el producto que estás buscando.
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

  if (!isAvailable) {
    return (
      <SafeAreaView style={sharedStyles.safeArea}>
        <View style={headerStyles.topHeader}>
          <View style={headerStyles.topHeaderContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={headerStyles.headerBack}>← Volver</Text>
            </TouchableOpacity>
            <View style={headerStyles.logoCenter}>
              <Logo size={32} textSize={30} />
            </View>
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

            <View style={headerStyles.logoCenter}>
              <Logo size={32} textSize={30} />
            </View>

            {!isOwnProduct && (
              <TouchableOpacity
                onPress={handleToggleWishlist}
                disabled={wishlistLoading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[
                  headerStyles.wishlistIcon,
                  isWishlisted && headerStyles.wishlistIconActive,
                  wishlistLoading && headerStyles.wishlistIconLoading,
                ]}>
                  {isWishlisted ? "♥" : "♡"}
                </Text>
              </TouchableOpacity>
            )}

            {isOwnProduct && <View style={headerStyles.placeholder} />}
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
              onSellerPress={() => router.push(`/user/${product.sellerId}`)}
              onDecreaseQuantity={() => setQuantity(Math.max(1, quantity - 1))}
              onIncreaseQuantity={() => setQuantity(quantity + 1)}
              onManagePublication={handleManagePublication}
              onAddToCart={handleAddToCart}
              onShareProduct={handleOpenShareModal}
            />
          </View>
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

const headerStyles = StyleSheet.create({
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

  placeholder: {
    width: 26,
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
