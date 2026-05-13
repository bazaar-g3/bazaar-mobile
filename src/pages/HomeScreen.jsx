import React, { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import Logo from "../components/Logo";
import ProductFiltersModal from "../components/productList/ProductFiltersModal";
import { PRICE_MIN_LIMIT, PRICE_MAX_LIMIT } from "../constants/filters";
import { COLORS } from "../constants/colors";
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
import { getWishlist } from "../services/wishlist";
import { useResponsive } from "../utils/responsive";
import { styles } from "../styles/homeStyles";

export default function HomeScreen() {
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
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // ── Estado del modal de filtros ──
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterSortBy, setFilterSortBy] = useState(null);
  const [filterSection, setFilterSection] = useState(null);
  const [filterMinPrice, setFilterMinPrice] = useState(PRICE_MIN_LIMIT);
  const [filterMaxPrice, setFilterMaxPrice] = useState(PRICE_MAX_LIMIT);

  const activeFiltersCount =
    (filterCategory ? 1 : 0) +
    (filterSortBy || filterSection ? 1 : 0) +
    (filterMinPrice > PRICE_MIN_LIMIT || filterMaxPrice < PRICE_MAX_LIMIT ? 1 : 0);

  const handleApplyFilters = () => {
    setFiltersVisible(false);
    const params = {};
    if (filterCategory) {
      params.categoryId = filterCategory.id;
      params.categoryName = filterCategory.label;
      if (filterCategory.slug) params.categorySlug = filterCategory.slug;
    }
    if (filterSortBy === "recent") params.sortBy = "recent";
    if (filterSection === "recommended") params.section = "recommended";
    if (filterMinPrice > PRICE_MIN_LIMIT) params.minPrice = filterMinPrice;
    if (filterMaxPrice < PRICE_MAX_LIMIT) params.maxPrice = filterMaxPrice;
    router.push({ pathname: "/products", params });
  };

  const handleClearFilters = () => {
    setFilterCategory(null);
    setFilterSortBy(null);
    setFilterSection(null);
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
      } else {
        setWishlistIds(new Set());
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
        catalogCategories.map((category) => ({
          id: String(category.id ?? category.slug ?? category.name ?? category.label),
          name: String(category.label ?? category.name ?? "Categoría").toUpperCase(),
          slug: category.slug,
          emoji: "🛍️",
        }))
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
      const products = await listPopularProducts({ limit: 20, offset: 0 });

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

  return (
    <SafeAreaView style={styles.safeArea}>
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
              <Logo size={34} textSize={32} style={styles.logoNoMargin} />
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
                  <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.iconButton}
                onPress={async () => {
                  const token = await AsyncStorage.getItem("token");

                  if (token) {
                    router.push("/cart");
                  } else {
                    router.push(
                      buildLoginRedirect({
                        redirectPath: "/cart",
                      })
                    );
                  }
                }}
              >
                <Text style={styles.icon}>🛒</Text>
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
            >
              <Text style={[
                styles.filterButtonText,
                activeFiltersCount > 0 && styles.filterButtonTextActive,
              ]}>
                ⊟ Filtros
              </Text>
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
                <ActivityIndicator size="small" color={COLORS.white} />
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
                  <View style={styles.categoryCircle}>
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
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
                <ActivityIndicator size="small" color={COLORS.primary} />
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
              >
                {popularProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="horizontal"
                    isWishlisted={wishlistIds.has(String(product.id))}
                    onPress={() => router.push(`/product/${product.id}`)}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {!loadingForYou && forYouProducts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                PARA <Text style={styles.sectionAccent}>VOS</Text>
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendedList}
              >
                {forYouProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="horizontal"
                    isWishlisted={wishlistIds.has(String(product.id))}
                    onPress={() => router.push(`/product/${product.id}`)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

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
                    isWishlisted={wishlistIds.has(String(product.id))}
                    onPress={() => router.push(`/product/${product.id}`)}
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
        activeSortBy={filterSortBy}
        activeSection={filterSection}
        onSortRecent={() => { setFilterSortBy("recent"); setFilterSection(null); }}
        onSortRecommended={() => { setFilterSection("recommended"); setFilterSortBy(null); }}
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

