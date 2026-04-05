import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import Logo from "../components/Logo";
import { COLORS } from "../constants/colors";
import {
  getCatalogErrorMessage,
  listRecentProducts,
  mapCatalogProductToCard,
} from "../services/catalog";
import { buildLoginRedirect } from "../utils/authRedirect";

const mockCategories = [
  { id: "1", name: "MODA", emoji: "👕" },
  { id: "2", name: "TECNOLOGÍA", emoji: "📱" },
  { id: "3", name: "HOGAR", emoji: "🪑" },
  { id: "4", name: "DEPORTES", emoji: "🏈" },
  { id: "5", name: "LIBROS", emoji: "📚" },
];

const mockRecommendedProducts = [
  {
    id: "1",
    name: "Auriculares Bluetooth",
    price: 25000,
    image: "https://via.placeholder.com/500x350.png?text=Auriculares",
    tag: "OFERTA!",
  },
  {
    id: "2",
    name: "Silla Gamer",
    price: 120000,
    image: "https://via.placeholder.com/500x350.png?text=Silla+Gamer",
    tag: "OFERTA!",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { refreshCatalog } = useLocalSearchParams();
  const [search, setSearch] = useState("");
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingRecentProducts, setLoadingRecentProducts] = useState(true);
  const [recentProductsError, setRecentProductsError] = useState("");

  const refreshCatalogKey = Array.isArray(refreshCatalog) ? refreshCatalog[0] : refreshCatalog;

  const loadRecentCatalogProducts = useCallback(async () => {
    setLoadingRecentProducts(true);
    setRecentProductsError("");

    try {
      const products = await listRecentProducts();
      setRecentProducts(
        products.map((product) =>
          mapCatalogProductToCard(product, { tag: "NUEVO" })
        )
      );
    } catch (error) {
      setRecentProductsError(
        getCatalogErrorMessage(
          error,
          "No pudimos cargar las publicaciones recientes por el momento."
        )
      );
    } finally {
      setLoadingRecentProducts(false);
    }
  }, []);

  useEffect(() => {
    loadRecentCatalogProducts();
  }, [loadRecentCatalogProducts, refreshCatalogKey]);

  const handleSearch = () => {
    const trimmedSearch = search.trim();

    router.push({
      pathname: "/products",
      params: trimmedSearch ? { search: trimmedSearch } : {},
    });
  };

  const handleCategoryPress = (category) => {
    router.push({
      pathname: "/products",
      params: {
        categoryId: category.id,
        categoryName: category.name,
      },
    });
  };

  const handlePublishPress = async () => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      router.push({
        pathname: "/publish-product",
        params: { from: "home" },
      });
      return;
    }

    router.push(
      buildLoginRedirect({
        redirectPath: "/publish-product",
        redirectFrom: "home",
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.topBar}>
          <View style={styles.leftSpacer} />

          <Logo />

          <View style={styles.iconsContainer}>
            <TouchableOpacity
              style={styles.publishButton}
              onPress={handlePublishPress}
            >
              <Text style={styles.publishButtonText}>+ Publicar producto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={async () => {
                const token = await AsyncStorage.getItem('token')

                if (token) {
                  router.push('/profile')
                } else {
                  router.push(
                    buildLoginRedirect({
                      redirectPath: '/profile',
                    })
                  )
                }
              }}
            >
              <Text style={styles.icon}>👤</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={async () => {
                const token = await AsyncStorage.getItem('token')

                if (token) {
                  router.push('/cart')
                } else {
                  router.push(
                    buildLoginRedirect({
                      redirectPath: '/cart',
                    })
                  )
                }
              }}
            >
              <Text style={styles.icon}>🛒</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onSearch={handleSearch}
            placeholder="Buscar productos..."
            containerStyle={styles.customSearchBar}
          />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(cat)}
              >
                <View style={styles.categoryCircle}>
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                </View>
                <Text style={styles.categoryLabel}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              PRODUCTOS <Text style={styles.sectionAccent}>RECOMENDADOS</Text>
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedList}
            >
              {mockRecommendedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="horizontal"
                  onPress={() => router.push(`/product/${product.id}`)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              PRODUCTOS <Text style={styles.sectionAccent}>RECIENTES</Text>
            </Text>

            {loadingRecentProducts ? (
              <View style={styles.sectionStatusCard}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.sectionStatusText}>
                  Cargando publicaciones recientes...
                </Text>
              </View>
            ) : recentProductsError ? (
              <View style={styles.sectionStatusCard}>
                <Text style={styles.sectionErrorText}>{recentProductsError}</Text>
                <TouchableOpacity onPress={loadRecentCatalogProducts}>
                  <Text style={styles.sectionRetryText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : recentProducts.length === 0 ? (
              <View style={styles.sectionStatusCard}>
                <Text style={styles.sectionStatusText}>
                  Todavía no hay publicaciones recientes disponibles.
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentList}
              >
                {recentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="horizontal"
                    onPress={() => router.push(`/product/${product.id}`)}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          <Text style={styles.sectionTitle}>
            SECCIÓN DE <Text style={styles.sectionAccent}>OFERTAS Y DESCUENTOS</Text>
          </Text>

          <TouchableOpacity style={styles.promoBanner} activeOpacity={0.9}>
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTag}>¡OFERTA ESPECIAL DE LA SEMANA!</Text>
              <Text style={styles.promoTitle}>30% DTO.</Text>
              <Text style={styles.promoSubtitle}>
                Licuadora Ninja Pro{"\n"}¡Solo por tiempo limitado!
              </Text>
              <View style={styles.promoButton}>
                <Text style={styles.promoButtonText}>COMPRAR AHORA</Text>
              </View>
            </View>
            <Text style={styles.promoEmoji}>🥤</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: 10,
    backgroundColor: COLORS.white,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  leftSpacer: {
    width: 1,
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexShrink: 1,
  },
  publishButton: {
    borderWidth: 1,
    borderColor: "#B9D8D4",
    backgroundColor: "#F2FBFA",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 4,
    flexShrink: 1,
  },
  publishButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  iconButton: {
    marginLeft: 12,
    padding: 6,
  },
  icon: {
    fontSize: 22,
  },
  searchContainer: {
    backgroundColor: COLORS.dark,
    padding: 15,
  },
  customSearchBar: {
    marginBottom: 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  categoriesBar: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 15,
  },
  categoryItem: {
    alignItems: "center",
    marginHorizontal: 15,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 15,
    color: COLORS.sectionTitle,
  },
  sectionAccent: {
    color: COLORS.third,
  },
  recommendedList: {
    paddingBottom: 10,
  },
  recentList: {
    paddingBottom: 10,
  },
  sectionStatusCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#DCE7EA",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 10,
  },
  sectionStatusText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  sectionErrorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: "center",
  },
  sectionRetryText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  promoBanner: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTag: {
    color: COLORS.dark,
    fontWeight: "700",
    fontSize: 12,
  },
  promoTitle: {
    fontSize: 40,
    fontWeight: "900",
    color: COLORS.dark,
  },
  promoSubtitle: {
    fontSize: 14,
    color: COLORS.dark,
    marginBottom: 10,
  },
  promoButton: {
    backgroundColor: COLORS.dark,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  promoButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 12,
  },
  promoEmoji: {
    fontSize: 60,
  },
});
