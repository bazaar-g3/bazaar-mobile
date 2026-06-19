import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/productList/ProductCard";
import Logo from "../components/Logo";
import ProductFiltersModal from "../components/productList/ProductFiltersModal";
import { PRICE_MIN_LIMIT, PRICE_MAX_LIMIT } from "../constants/filters";
import { categoryPalette } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import {
  getCatalogErrorMessage,
  listRecentProducts,
  listProductCategories,
  listPopularProducts,
  listForYouProducts,
  mapCatalogProductToCard,
} from "../services/catalog";
import { buildLoginRedirect } from "../utils/authRedirect";
import { getSessionStatus } from "../services/session";
import { useCartContext } from "../context/CartContext";
import { getCartErrorMessage } from "../services/cart";
import { getNotificationsHistory } from "../services/notifications";
import { recordCategoryBrowse } from "../services/browseHistory";
import { getWishlist } from "../services/wishlist";
import { useResponsive } from "../utils/responsive";
import { makeStyles } from "../styles/homeStyles";

// Configuración visual por slug de categoría: ícono Ionicons + colores del círculo
const CATEGORY_CONFIG = {
  tecnologia:     { icon: "laptop-outline",          circleColor: categoryPalette.tecnologia.circle,     iconColor: categoryPalette.tecnologia.icon },
  hogar:          { icon: "home-outline",             circleColor: categoryPalette.hogar.circle,          iconColor: categoryPalette.hogar.icon },
  moda:           { icon: "shirt-outline",            circleColor: categoryPalette.moda.circle,           iconColor: categoryPalette.moda.icon },
  deportes:       { icon: "football-outline",         circleColor: categoryPalette.deportes.circle,       iconColor: categoryPalette.deportes.icon },
  libros:         { icon: "book-outline",             circleColor: categoryPalette.libros.circle,         iconColor: categoryPalette.libros.icon },
  juguetes:       { icon: "game-controller-outline",  circleColor: categoryPalette.juguetes.circle,       iconColor: categoryPalette.juguetes.icon },
  coleccionables: { icon: "star-outline",             circleColor: categoryPalette.coleccionables.circle, iconColor: categoryPalette.coleccionables.icon },
  herramientas:   { icon: "build-outline",            circleColor: categoryPalette.herramientas.circle,   iconColor: categoryPalette.herramientas.icon },
};
const DEFAULT_CATEGORY_CONFIG = { icon: "grid-outline", circleColor: categoryPalette._default.circle, iconColor: categoryPalette._default.icon };

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const router = useRouter();
  const { isSmall, isMedium } = useResponsive();
  const { refreshCatalog } = useLocalSearchParams();

  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [forYouProducts, setForYouProducts] = useState([]);
  const [loadingForYou, setLoadingForYou] = useState(true);

  const [popularProducts, setPopularProducts] = useState([]);
  const [loadingPopularProducts, setLoadingPopularProducts] = useState(true);
  const [popularProductsError, setPopularProductsError] = useState("");

  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingRecentProducts, setLoadingRecentProducts] = useState(true);
  const [recentProductsError, setRecentProductsError] = useState("");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // ── Estado del modal de filtros ──
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterSortBy, setFilterSortBy] = useState(null);
  const [filterMinPrice, setFilterMinPrice] = useState(PRICE_MIN_LIMIT);
  const [filterMaxPrice, setFilterMaxPrice] = useState(PRICE_MAX_LIMIT);

  const activeFiltersCount =
    (filterCategory ? 1 : 0) +
    (filterSortBy ? 1 : 0) +
    (filterMinPrice > PRICE_MIN_LIMIT || filterMaxPrice < PRICE_MAX_LIMIT ? 1 : 0);

  const handleApplyFilters = () => {
    setFiltersVisible(false);
    const params = {};
    if (filterCategory) {
      params.categoryId = filterCategory.id;
      params.categoryName = filterCategory.label;
      if (filterCategory.slug) params.categorySlug = filterCategory.slug;
      if (isAuthenticated && filterCategory.slug) {
        recordCategoryBrowse(filterCategory.slug).catch(() => {});
      }
    }
    if (filterSortBy) params.sortBy = filterSortBy;
    if (filterMinPrice > PRICE_MIN_LIMIT) params.minPrice = filterMinPrice;
    if (filterMaxPrice < PRICE_MAX_LIMIT) params.maxPrice = filterMaxPrice;
    router.push({ pathname: "/products", params });
  };

  const handleClearFilters = () => {
    setFilterCategory(null);
    setFilterSortBy(null);
    setFilterMinPrice(PRICE_MIN_LIMIT);
    setFilterMaxPrice(PRICE_MAX_LIMIT);
  };

  const profileButtonRef = useRef(null);
  const [profileMenuPosition, setProfileMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const refreshCatalogKey = Array.isArray(refreshCatalog)
    ? refreshCatalog[0]
    : refreshCatalog;

  const { addItem } = useCartContext();

  const handleAddToCart = async (productId) => {
    const session = await getSessionStatus();
    if (!session.isAuthenticated) {
      router.push(
        buildLoginRedirect({
          redirectPath: `/product/${productId}`,
          pendingAction: "add-to-cart",
          quantity: 1,
        })
      );
      return;
    }
    try {
      await addItem(productId);
      Alert.alert("Añadido al carrito", "El producto fue agregado correctamente.");
    } catch (error) {
      Alert.alert("Error", getCartErrorMessage(error, "No se pudo agregar al carrito."));
    }
  };

  const loadSessionData = useCallback(async () => {
    try {
      const session = await getSessionStatus();
      setIsAuthenticated(Boolean(session?.isAuthenticated));
      setProfileImageUri(session?.profile?.avatarUrl ?? null);

      if (session?.isAuthenticated) {
        try {
          const items = await getWishlist();
          setWishlistIds(new Set(items.map(item => String(item.productId))));
        } catch {
          // non-critical
        }
        try {
          const notifData = await getNotificationsHistory();
          setUnreadNotifications(notifData.unread_count ?? 0);
        } catch {
          // non-critical
        }
      } else {
        setWishlistIds(new Set());
        setUnreadNotifications(0);
      }
    } catch (error) {
      const token = await AsyncStorage.getItem("token");
      setIsAuthenticated(Boolean(token));
      setProfileImageUri(null);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    setCategoriesError("");

    try {
      const catalogCategories = await listProductCategories();

      setCategories(
        catalogCategories.map((category) => {
          const config = CATEGORY_CONFIG[category.slug] ?? DEFAULT_CATEGORY_CONFIG;
          return {
            id: String(category.id ?? category.slug ?? category.name ?? category.label),
            name: String(category.label ?? category.name ?? "Categoría").toUpperCase(),
            slug: category.slug,
            icon: config.icon,
            circleColor: config.circleColor,
            iconColor: config.iconColor,
          };
        })
      );
    } catch (error) {
      setCategoriesError(
        getCatalogErrorMessage(
          error,
          "No pudimos cargar las categorías por el momento."
        )
      );
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const loadForYouProducts = useCallback(async () => {
    setLoadingForYou(true);

    try {
      const products = await listForYouProducts({ limit: 10 });
      setForYouProducts(
        products.map((product) =>
          mapCatalogProductToCard(product, { tag: "PARA VOS" })
        )
      );
    } catch {
      setForYouProducts([]);
    } finally {
      setLoadingForYou(false);
    }
  }, []);

  const loadPopularProducts = useCallback(async () => {
    setLoadingPopularProducts(true);
    setPopularProductsError("");

    try {
      const products = await listPopularProducts({ limit: 25, offset: 0 });

      setPopularProducts(
        products.map((product) =>
          mapCatalogProductToCard(product, { tag: "POPULAR" })
        )
      );
    } catch (error) {
      setPopularProductsError(
        getCatalogErrorMessage(
          error,
          "No pudimos cargar los productos populares por el momento."
        )
      );
      setPopularProducts([]);
    } finally {
      setLoadingPopularProducts(false);
    }
  }, []);

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
      setRecentProducts([]);
    } finally {
      setLoadingRecentProducts(false);
    }
  }, []);

  useEffect(() => {
    async function refreshData() {
      await Promise.all([
        loadSessionData(),
        loadCategories(),
        loadPopularProducts(),
        loadForYouProducts(),
        loadRecentCatalogProducts(),
      ]);
    }

    refreshData();
  }, [
    loadSessionData,
    loadCategories,
    loadPopularProducts,
    loadForYouProducts,
    loadRecentCatalogProducts,
    refreshCatalogKey,
  ]);

  const handleSearch = () => {
    const trimmedSearch = search.trim();

    router.push({
      pathname: "/products",
      params: trimmedSearch ? { search: trimmedSearch } : {},
    });
  };

  const handleCategoryPress = (category) => {
    if (isAuthenticated && category.slug) {
      recordCategoryBrowse(category.slug).catch(() => {});
    }
    router.push({
      pathname: "/products",
      params: {
        categoryId: category.id,
        categoryName: category.name,
        ...(category.slug ? { categorySlug: category.slug } : {}),
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

  const handleOpenProfileMenu = () => {
    profileButtonRef.current?.measureInWindow((x, y, width, height) => {
      setProfileMenuPosition({
        top: y + height + 8,
        left: x - 184 + width,
      });
      setProfileMenuVisible(true);
    });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setIsAuthenticated(false);
    setProfileImageUri(null);
    setProfileMenuVisible(false);
    router.replace("/home");
  };

  // Productos para el fallback "RECOMENDACIONES PARA VOS" (autenticado sin historial).
  // Si hay más de 20 populares: primero los 5 extra (distintos de "POPULARES EN BAZAAR"),
  // luego los 20 primeros en orden inverso. Si no hay suficientes: solo orden inverso.
  const popularForMain = popularProducts.slice(0, 20);
  // Si hay > 20 populares: 5 distintos (pos 21-25) + 15 de los primeros 20 invertidos = 20 total.
  // Si no hay suficientes: mismos 20 en orden invertido.
  const trendingProducts = popularProducts.length > 20
    ? [...popularProducts.slice(20, 25), ...[...popularProducts.slice(0, 15)].reverse()]
    : [...popularProducts].reverse();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={[styles.topBar, isSmall && styles.topBarSmall]}>
          <View style={styles.topBarContent}>
            <View style={styles.leftPlaceholder}>
              {(isSmall || isMedium) && (
                <TouchableOpacity style={styles.publishButtonCircle} onPress={handlePublishPress}>
                  <Text style={styles.publishButtonCircleText}>+</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.logoCenter}>
              <Logo size={28} textSize={24} style={styles.logoNoMargin} />
            </View>

            <View style={styles.iconsContainer}>
              {!isSmall && !isMedium && (
                <TouchableOpacity style={styles.publishButton} onPress={handlePublishPress}>
                  <Text style={styles.publishButtonText}>+ Publicar producto</Text>
                </TouchableOpacity>
              )}

              {isAuthenticated ? (
                <TouchableOpacity
                  ref={profileButtonRef}
                  style={styles.iconButton}
                  onPress={handleOpenProfileMenu}
                >
                  {profileImageUri ? (
                    <Image
                      source={{ uri: profileImageUri }}
                      style={styles.profileAvatar}
                    />
                  ) : (
                    <View style={styles.profileAvatarFallback}>
                      <Text style={styles.icon}>👤</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => router.push('/login')}
                >
                  <Ionicons name="person-outline" size={20} color={theme.color.accent} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.iconButton}
                onPress={async () => {
                  const token = await AsyncStorage.getItem("token");
                  if (token) {
                    router.push("/notifications");
                  } else {
                    router.push(buildLoginRedirect({ redirectPath: "/notifications" }));
                  }
                }}
              >
                <View style={{ position: 'relative' }}>
                  <Ionicons name="notifications-outline" size={26} color={theme.color.accent} />
                  {unreadNotifications > 0 && (
                    <View style={styles.notifBadge}>
                      <Text style={styles.notifBadgeText}>
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchRow}>
            <View style={styles.searchBarWrapper}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                onSearch={handleSearch}
                style={{ flex: 1 }}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFiltersCount > 0 && styles.filterButtonActive,
              ]}
              onPress={() => setFiltersVisible(true)}
              activeOpacity={0.8}
              accessibilityLabel="Filtros"
            >
              <Ionicons
                name="funnel-outline"
                size={20}
                color={activeFiltersCount > 0 ? theme.color.like : theme.color.textPrimary}
              />
              {activeFiltersCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>


      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {loadingCategories ? (
              <View style={styles.categoriesStatus}>
                <ActivityIndicator size="small" color={theme.color.accent} />
                <Text style={styles.categoriesStatusText}>
                  Cargando categorías...
                </Text>
              </View>
            ) : categoriesError ? (
              <View style={styles.categoriesStatus}>
                <Text style={styles.categoriesErrorText}>{categoriesError}</Text>
              </View>
            ) : categories.length === 0 ? (
              <View style={styles.categoriesStatus}>
                <Text style={styles.categoriesStatusText}>
                  No hay categorías disponibles.
                </Text>
              </View>
            ) : (
              categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryItem}
                  onPress={() => handleCategoryPress(cat)}
                >
                  <View style={[styles.categoryCircle, { backgroundColor: cat.circleColor }]}>
                    <Ionicons name={cat.icon} size={28} color={cat.iconColor} />
                  </View>
                  <Text style={styles.categoryLabel}>{cat.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              POPULARES <Text style={styles.sectionAccent}>EN BAZAAR</Text>
            </Text>

            {loadingPopularProducts ? (
              <View style={styles.sectionStatusCard}>
                <ActivityIndicator size="small" color={theme.color.accent} />
                <Text style={styles.sectionStatusText}>
                  Cargando productos populares...
                </Text>
              </View>
            ) : popularProductsError ? (
              <View style={styles.sectionStatusCard}>
                <Text style={styles.sectionErrorText}>
                  {popularProductsError}
                </Text>
                <TouchableOpacity onPress={loadPopularProducts}>
                  <Text style={styles.sectionRetryText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : popularProducts.length === 0 ? (
              <View style={styles.sectionStatusCard}>
                <Text style={styles.sectionStatusText}>
                  Todavía no hay productos populares disponibles.
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendedList}
                scrollEnabled={true}
                alwaysBounceHorizontal={true}
                directionalLockEnabled={true}
              >
                {popularForMain.map((product) => (
                  <ProductCard
                    key={product.id}
                    item={product}
                    layout="grid"
                    cardStyle={{ width: 164, marginRight: 12 }}
                    isWishlisted={wishlistIds.has(String(product.id))}
                    onOpenProduct={() => router.push(`/product/${product.id}${product.sellerId ? `?sellerId=${product.sellerId}` : ''}`)}
                    onAddToCart={() => handleAddToCart(product.id)}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {isAuthenticated && (
            <View style={styles.section}>
              {loadingForYou ? (
                <View style={styles.sectionStatusCard}>
                  <ActivityIndicator size="small" color={theme.color.accent} />
                  <Text style={styles.sectionStatusText}>
                    Cargando recomendaciones...
                  </Text>
                </View>
              ) : forYouProducts.length > 0 ? (
                <>
                  <Text style={styles.sectionTitle}>
                    RECOMENDACIONES <Text style={styles.sectionAccent}>PARA VOS</Text>
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recommendedList}
                  >
                    {forYouProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        item={product}
                        layout="grid"
                        cardStyle={{ width: 164, marginRight: 12 }}
                        isWishlisted={wishlistIds.has(String(product.id))}
                        onOpenProduct={() => router.push(`/product/${product.id}${product.sellerId ? `?sellerId=${product.sellerId}` : ''}`)}
                        onAddToCart={() => handleAddToCart(product.id)}
                      />
                    ))}
                  </ScrollView>
                </>
              ) : trendingProducts.length > 0 ? (
                <>
                  <Text style={styles.sectionTitle}>
                    RECOMENDACIONES <Text style={styles.sectionAccent}>PARA VOS</Text>
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recommendedList}
                  >
                    {trendingProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        item={product}
                        layout="grid"
                        cardStyle={{ width: 164, marginRight: 12 }}
                        isWishlisted={wishlistIds.has(String(product.id))}
                        onOpenProduct={() => router.push(`/product/${product.id}${product.sellerId ? `?sellerId=${product.sellerId}` : ''}`)}
                        onAddToCart={() => handleAddToCart(product.id)}
                      />
                    ))}
                  </ScrollView>
                </>
              ) : null}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              PRODUCTOS <Text style={styles.sectionAccent}>RECIENTES</Text>
            </Text>

            {loadingRecentProducts ? (
              <View style={styles.sectionStatusCard}>
                <ActivityIndicator size="small" color={theme.color.accent} />
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
                    item={product}
                    layout="grid"
                    cardStyle={{ width: 164, marginRight: 12 }}
                    isWishlisted={wishlistIds.has(String(product.id))}
                    onOpenProduct={() => router.push(`/product/${product.id}${product.sellerId ? `?sellerId=${product.sellerId}` : ''}`)}
                    onAddToCart={() => handleAddToCart(product.id)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal de filtros avanzados */}
      <ProductFiltersModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        onApply={handleApplyFilters}
        loadingCategories={loadingCategories}
        categoriesError={categoriesError}
        categories={categories.map((c) => ({
          id: c.id,
          label: c.name,
          slug: c.slug,
        }))}
        activeCategory={filterCategory}
        onSelectCategory={(cat) =>
          setFilterCategory((prev) => {
            const isSame = prev?.slug ? prev.slug === cat.slug : prev?.id === cat.id;
            return isSame ? null : cat;
          })
        }
        minPrice={filterMinPrice}
        maxPrice={filterMaxPrice}
        onPriceChange={(min, max) => {
          setFilterMinPrice(min);
          setFilterMaxPrice(max);
        }}
        onClearFilters={handleClearFilters}
      />

      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <View style={styles.dropdownOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setProfileMenuVisible(false)}
          />

          <View
            style={[
              styles.dropdownMenu,
              {
                top: profileMenuPosition.top,
                left: profileMenuPosition.left,
              },
            ]}
          >
            <View style={styles.dropdownArrow} />

            <Text style={styles.modalTitle}>Mi cuenta</Text>

            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={() => {
                setProfileMenuVisible(false);
                router.push("/profile");
              }}
            >
              <Text style={styles.modalPrimaryButtonText}>Ir a perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={handleLogout}
            >
              <Text style={styles.modalSecondaryButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

