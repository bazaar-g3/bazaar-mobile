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
import api from "../api/api";
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  getCatalogProduct,
} from "../services/catalog";

const mockProducts = [
  {
    id: "1",
    name: "Auriculares Bluetooth",
    price: 25000,
    image: "https://via.placeholder.com/500x350.png?text=Auriculares",
    categoryId: "1",
    categoryName: "Tecnología",
    description:
      "Auriculares inalámbricos con sonido envolvente, batería de larga duración y diseño cómodo para uso diario.",
    stock: 8,
    seller: "Tech Store",
    features: [
      "Bluetooth 5.2",
      "Cancelación de ruido",
      "Micrófono integrado",
    ],
    rating: 4.8,
    reviews: 312,
  },
  {
    id: "2",
    name: "Silla Gamer",
    price: 120000,
    image: "https://via.placeholder.com/500x350.png?text=Silla+Gamer",
    categoryId: "2",
    categoryName: "Hogar",
    description:
      "Silla ergonómica con respaldo reclinable, apoyabrazos acolchados y excelente soporte lumbar.",
    stock: 3,
    seller: "Home Design",
    features: ["Respaldo reclinable", "Soporte lumbar", "Apoyabrazos acolchados"],
    rating: 4.7,
    reviews: 128,
  },
  {
    id: "3",
    name: "Campera Nike",
    price: 89000,
    image: "https://via.placeholder.com/500x350.png?text=Campera",
    categoryId: "3",
    categoryName: "Ropa",
    description:
      "Campera deportiva liviana, ideal para media estación, confeccionada con materiales resistentes.",
    stock: 5,
    seller: "Urban Wear",
    features: ["Liviana", "Resistente", "Ideal media estación"],
    rating: 4.6,
    reviews: 95,
  },
  {
    id: "4",
    name: "Mochila Urbana",
    price: 34000,
    image: "https://via.placeholder.com/500x350.png?text=Mochila",
    categoryId: "3",
    categoryName: "Ropa",
    description:
      "Mochila versátil con varios compartimentos, ideal para facultad, oficina o salidas de todos los días.",
    stock: 10,
    seller: "City Bags",
    features: ["Múltiples compartimentos", "Uso diario", "Diseño urbano"],
    rating: 4.5,
    reviews: 201,
  },
  {
    id: "5",
    name: "Mouse Inalámbrico",
    price: 18000,
    image: "https://via.placeholder.com/500x350.png?text=Mouse",
    categoryId: "1",
    categoryName: "Tecnología",
    description:
      "Mouse inalámbrico compacto, preciso y liviano, con conexión estable y excelente autonomía.",
    stock: 15,
    seller: "Tech Store",
    features: ["Compacto", "Preciso", "Gran autonomía"],
    rating: 4.9,
    reviews: 410,
  },
  {
    id: "6",
    name: "Zapatillas Adidas",
    price: 76000,
    image: "https://via.placeholder.com/500x350.png?text=Zapatillas",
    categoryId: "4",
    categoryName: "Deportes",
    description:
      "Zapatillas deportivas con gran amortiguación, pensadas para entrenamiento y uso urbano.",
    stock: 6,
    seller: "Sport House",
    features: ["Gran amortiguación", "Entrenamiento", "Uso urbano"],
    rating: 4.8,
    reviews: 278,
  },
  {
    id: "7",
    name: "Lámpara LED",
    price: 21000,
    image: "https://via.placeholder.com/500x350.png?text=Lampara",
    categoryId: "2",
    categoryName: "Hogar",
    description:
      "Lámpara LED moderna de bajo consumo, perfecta para escritorio o mesa de luz.",
    stock: 4,
    seller: "Home Design",
    features: ["Bajo consumo", "Diseño moderno", "Ideal escritorio"],
    rating: 4.4,
    reviews: 77,
  },
  {
    id: "8",
    name: "Pelota de fútbol",
    price: 15000,
    image: "https://via.placeholder.com/500x350.png?text=Pelota",
    categoryId: "4",
    categoryName: "Deportes",
    description:
      "Pelota resistente para entrenamiento y recreación, con excelente terminación y durabilidad.",
    stock: 12,
    seller: "Sport House",
    features: ["Resistente", "Entrenamiento", "Alta durabilidad"],
    rating: 4.7,
    reviews: 166,
  },
];

const COLORS = {
  primary: "#00C2B3",
  secondary: "#FF9800",
  dark: "#003238",
  background: "#F5F7F8",
  white: "#FFFFFF",
  text: "#1F1F1F",
  grey: "#6B6B6B",
  lightGrey: "#EAEAEA",
  success: "#23A26D",
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [catalogProduct, setCatalogProduct] = useState(null);
  const [loadingCatalogProduct, setLoadingCatalogProduct] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const mockProduct = useMemo(() => {
    return mockProducts.find((item) => item.id === String(id));
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogProduct() {
      if (mockProduct || !id) {
        setCatalogProduct(null);
        setLoadingCatalogProduct(false);
        return;
      }

      setLoadingCatalogProduct(true);

      try {
        const product = await getCatalogProduct(String(id));
        if (!cancelled && product) {
          setCatalogProduct({
            id: String(product.id),
            sellerId: Number(product.sellerId),
            name: product.name,
            price: Number(product.price) || 0,
            images: product.images?.length ? product.images : [PRODUCT_IMAGE_PLACEHOLDER],
            image: product.images?.[0] || PRODUCT_IMAGE_PLACEHOLDER,
            categoryName: product.category?.label || "Catalogo",
            description: product.description || "Sin descripcion disponible.",
            stock: Number(product.stock) || 0,
            seller: `Vendedor #${product.sellerId}`,
            features: [
              `Categoria: ${product.category?.label || "Catalogo"}`,
              product.stock > 0 ? "Disponible para compra inmediata" : "Sin stock disponible",
              "Publicacion cargada desde el catalogo real",
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
  }, [id, mockProduct]);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          if (!cancelled) {
            setCurrentUserId(null);
          }
          return;
        }

        const response = await api.get("/users/me");
        if (!cancelled) {
          setCurrentUserId(response.data?.id ?? null);
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

  const product = mockProduct || catalogProduct;
  const isOwnProduct =
    currentUserId !== null &&
    product?.sellerId !== undefined &&
    Number(product.sellerId) === Number(currentUserId);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  const oldPrice = useMemo(() => {
    if (!product) return 0;
    return Number((product.price * 1.3).toFixed(2));
  }, [product]);

  const discountPercent = useMemo(() => {
    if (!product || !oldPrice) return 0;
    return Math.round(((oldPrice - product.price) / oldPrice) * 100);
  }, [product, oldPrice]);

  const requireAuth = async (onSuccess) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setShowLoginPrompt(true);
        return;
      }

      onSuccess();
    } catch (error) {
      Alert.alert("Error", "No se pudo verificar la sesión.");
    }
  };

  const handleAddToCart = async () => {
    await requireAuth(() => {
      Alert.alert("Añadido", `${quantity} unidad(es) agregadas al carrito.`);
    });
  };

  const handleBuyNow = async () => {
    await requireAuth(() => {
      Alert.alert("Comprar ahora", "Redirigir a checkout.");
    });
  };

  if (loadingCatalogProduct) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>

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

            <Text style={styles.sellerText}>Vendido por {product.seller}</Text>

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

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={handleAddToCart}
                activeOpacity={0.9}
              >
                <Text style={styles.cartButtonText}>
                  {isOwnProduct ? "PRODUCTO PROPIO" : "AÑADIR AL CARRITO"}
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </ScrollView>

      {showLoginPrompt && (
        <View style={styles.loginPromptOverlay}>
          <TouchableOpacity
            style={styles.loginPromptBackdrop}
            activeOpacity={1}
            onPress={() => setShowLoginPrompt(false)}
          />
          <View style={styles.loginPromptWrapper}>
            <View style={styles.loginPromptBox}>
              <Text style={styles.loginPromptTitle}>
                ⚠️ DEBES INICIAR SESIÓN PARA REALIZAR ESTA ACCIÓN
              </Text>

              <Text style={styles.loginPromptText}>
                Iniciá sesión para agregar productos al carrito o comprar ahora.
              </Text>

              <View style={styles.loginPromptButtons}>
                <TouchableOpacity
                  style={styles.loginPromptLoginButton}
                  onPress={() => {
                    setShowLoginPrompt(false);
                    router.push("/login");
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={styles.loginPromptLoginButtonText}>
                    Iniciar sesión
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginPromptCancelButton}
                  onPress={() => setShowLoginPrompt(false)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.loginPromptCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.loginPromptArrow} />
            </View>
          </View>
        </View>
      )}
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
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  mainCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
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
    backgroundColor: "#F8FAFA",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#CDECEA",
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
    borderColor: COLORS.lightGrey,
    padding: 5,
    backgroundColor: COLORS.white,
  },
  activeThumbnail: {
    borderColor: COLORS.dark,
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
    color: COLORS.text,
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
    backgroundColor: "#FFD84D",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  promoBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#5B4700",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.grey,
  },
  priceContainer: {
    marginBottom: 12,
  },
  oldPrice: {
    fontSize: 15,
    textDecorationLine: "line-through",
    color: COLORS.grey,
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
    color: COLORS.grey,
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
    backgroundColor: "#E8FBF8",
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
    color: "#444",
    marginBottom: 12,
  },
  featuresBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEF1F2",
    marginBottom: 18,
  },
  featureItem: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: 5,
  },
  quantitySection: {
    marginBottom: 18,
  },
  quantityLabel: {
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A8E5DF",
    borderRadius: 10,
    width: 118,
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  qtyBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#F5FBFA",
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
    color: COLORS.text,
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
    color: COLORS.text,
    marginBottom: 8,
  },
  notFoundText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.grey,
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
    backgroundColor: "rgba(34, 93, 98, 0.96)",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: "#000",
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
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loginPromptText: {
    color: "rgba(255,255,255,0.92)",
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
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  loginPromptCancelButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },
  loginPromptArrow: {
    position: "absolute",
    bottom: -12,
    width: 22,
    height: 22,
    backgroundColor: "rgba(34, 93, 98, 0.96)",
    transform: [{ rotate: "45deg" }],
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
});
