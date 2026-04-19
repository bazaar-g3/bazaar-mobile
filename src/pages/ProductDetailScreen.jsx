import React, { useEffect, useState } from "react";
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
import { useResponsive } from "../utils/responsive";
import {
  buildLoginRedirect,
  normalizeRouteParam,
} from "../utils/authRedirect";

import { styles } from "../styles/productDetail/productDetailStyles";

import ProductDetailHeader from "../components/productDetail/ProductDetailHeader";
import ProductImageGallery from "../components/productDetail/ProductImageGallery";
import ProductInfoPanel from "../components/productDetail/ProductInfoPanel";
import LoginPromptModal from "../components/productDetail/LoginPromptModal";
import ShareProductModal from "../components/productDetail/ShareProductModal";

const PRODUCT_SHARE_BASE_URL = "http://localhost:8081";

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const id = normalizeRouteParam(params.id);
  const pendingAction = normalizeRouteParam(params.pendingAction);
  const pendingQuantity = normalizeRouteParam(params.quantity);
  const { isSmall } = useResponsive();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [catalogProduct, setCatalogProduct] = useState(null);
  const [loadingCatalogProduct, setLoadingCatalogProduct] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [handledPendingActionKey, setHandledPendingActionKey] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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

    const isAuthenticated = await handleRequireAuthForCart();

    if (!isAuthenticated) return;

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

  function handleLoginRedirect() {
    setShowLoginPrompt(false);

    router.push(
      buildLoginRedirect({
        redirectPath: `/product/${id}`,
        pendingAction: "add-to-cart",
        quantity,
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
          title: '¡Mirá este producto en Bazaar!',
          text: shareMessage,
        });
        return;
      }

      await Share.share({
        title: '¡Mirá este producto en Bazaar!',
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <ActivityIndicator size="large" color="#000" />
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

  if (!isAvailable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ProductDetailHeader onBack={() => router.back()} />

        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundEmoji}>⚠️</Text>
          <Text style={styles.notFoundTitle}>Producto no disponible</Text>
          <Text style={styles.notFoundText}>
            Este producto fue dado de baja o deshabilitado y ya no está disponible.
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.safeArea}>
        <ProductDetailHeader onBack={() => router.back()} />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
        >
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>
              INICIO &gt; {product.categoryName.toUpperCase()} &gt; {product.name.toUpperCase()}
            </Text>
          </View>

          <View style={[styles.mainCard, isSmall && styles.mainCardSmall]}>
            <View style={[styles.leftColumn, isSmall && styles.leftColumnSmall]}>
              <View style={styles.imageWrapper}>
                <Image source={{ uri: selectedImage }} style={[styles.productImage, isSmall && styles.productImageSmall]} />
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

            <View style={[styles.rightColumn, isSmall && styles.rightColumnSmall]}>
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
