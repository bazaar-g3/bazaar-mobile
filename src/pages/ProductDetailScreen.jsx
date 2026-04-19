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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

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

import { styles } from "../styles/productDetail/productDetailStyles";

import ProductDetailHeader from "../components/productDetail/ProductDetailHeader";
import ProductImageGallery from "../components/productDetail/ProductImageGallery";
import ProductInfoPanel from "../components/productDetail/ProductInfoPanel";
import LoginPromptModal from "../components/productDetail/LoginPromptModal";

const PRODUCT_SHARE_BASE_URL = "https://bazaar.app";

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
      Alert.alert("Producto no disponible", "Este producto ya no está disponible.");
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

  async function handleShareProduct() {
    if (!product || !isAvailable) {
      Alert.alert(
        "Producto no disponible",
        "Este producto no está disponible para compartir."
      );
      return;
    }

    try {
      const productUrl = `${PRODUCT_SHARE_BASE_URL}/product/${product.id}`;

      await Share.share({
        title: product.name,
        message: `Mirá este producto en Bazaar: ${product.name}\n${productUrl}`,
        url: productUrl,
      });
    } catch {
      Alert.alert("Error", "No se pudo compartir el producto.");
    }
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

          <View style={styles.mainCard}>
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
              onShareProduct={handleShareProduct}
            />
          </View>
        </ScrollView>

        <LoginPromptModal
          visible={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          onLogin={handleLoginRedirect}
        />
      </View>
    </SafeAreaView>
  );
}