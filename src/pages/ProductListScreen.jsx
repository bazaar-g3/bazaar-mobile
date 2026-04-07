import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getSessionStatus } from "../services/session";
import { buildLoginRedirect, normalizeRouteParam } from "../utils/authRedirect";
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  getCatalogErrorMessage,
  listCatalogProducts,
  listProductCategories,
} from "../services/catalog";
import { COLORS } from "../constants/colors";
import Logo from "../components/Logo";

function formatPrice(value) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`;
}

function mapProductToListItem(product, { recommended = false } = {}) {
  const price = Number(product.price) || 0;
  const oldPrice = Number((price * 1.3).toFixed(2));

  return {
    id: String(product.id),
    name: product.name || "Producto",
    price,
    oldPrice,
    image: product.images?.[0] || PRODUCT_IMAGE_PLACEHOLDER,
    categoryId:
      product.category?.id !== undefined && product.category?.id !== null
        ? String(product.category.id)
        : "",
    categorySlug: product.category?.slug || "",
    categoryName: product.category?.label || "Catálogo",
    createdAt: product.createdAt || product.created_at || null,
    stock: Number(product.stock) || 0,
    sellerId: product.sellerId,
    seller: product.sellerName || `Vendedor #${product.sellerId ?? "-"}`,
    tag: recommended ? "RECOMENDADO" : null,
  };
}

export default function ProductListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const search = normalizeRouteParam(params.search);
  const categoryId = normalizeRouteParam(params.categoryId);
  const categoryName = normalizeRouteParam(params.categoryName);
  const categorySlug = normalizeRouteParam(params.categorySlug);
  const sortBy = normalizeRouteParam(params.sortBy);
  const section = normalizeRouteParam(params.section);

  const [searchText, setSearchText] = useState(search ? String(search) : "");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [productsError, setProductsError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 20;

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    setCategoriesError("");

    try {
      const response = await listProductCategories();
      setCategories(
        response.map((category) => ({
          id:
            category.id !== undefined && category.id !== null
              ? String(category.id)
              : String(category.slug ?? category.label ?? category.name),
          label: String(category.label ?? category.name ?? "Categoría"),
          slug: category.slug ?? undefined,
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

  const loadProducts = useCallback(async (currentOffset = 0, replace = true) => {
    if (replace) {
      setLoadingProducts(true);
    } else {
      setLoadingMore(true);
    }
    setProductsError("");

    try {
      const requestParams = {
        status: "active",
        onlyAvailable: true,
        limit: LIMIT,
        offset: currentOffset,
      };

      if (search) requestParams.search = search;
      if (categorySlug) requestParams.category = categorySlug; // fix CA2 también
      if (sortBy === "recent" || section === "recommended") requestParams.sort = "recent";

      const response = await listCatalogProducts(requestParams);
      const mappedProducts = response.map((product) =>
        mapProductToListItem(product, { recommended: section === "recommended" })
      );

      setProducts((prev) => replace ? mappedProducts : [...prev, ...mappedProducts]);
      setHasMore(response.length === LIMIT);
      setOffset(currentOffset);
    } catch (error) {
      setProductsError(getCatalogErrorMessage(error, "No pudimos cargar los productos por el momento."));
      if (replace) setProducts([]);
    } finally {
      setLoadingProducts(false);
      setLoadingMore(false);
    }
  }, [search, categorySlug, sortBy, section]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadProducts(offset + LIMIT, false);
    }
  };

  useEffect(() => {
    setSearchText(search ? String(search) : "");
  }, [search]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const screenTitle = useMemo(() => {
    if (search) return `RESULTADOS PARA "${String(search).toUpperCase()}"`;
    if (categoryName) return `CATEGORÍA: ${String(categoryName).toUpperCase()}`;
    if (sortBy === "recent") return "PRODUCTOS RECIENTES";
    if (section === "recommended") return "PRODUCTOS RECOMENDADOS";
    return "TODOS LOS PRODUCTOS";
  }, [search, categoryName, sortBy, section]);

  const screenSubtitle = useMemo(() => {
    if (loadingProducts) return "Cargando productos...";
    if (productsError) return productsError;
    if (products.length === 0) return "No encontramos productos.";
    if (products.length === 1) return "1 producto encontrado";
    return `${products.length} productos encontrados`;
  }, [loadingProducts, productsError, products.length]);

  const handleSearch = () => {
    const trimmedSearch = searchText.trim();

    router.push({
      pathname: "/products",
      params: trimmedSearch ? { search: trimmedSearch } : {},
    });
  };

  const handleCategoryFilter = (selectedCategory) => {
    router.push({
      pathname: "/products",
      params: {
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.label,
        ...(selectedCategory.slug
          ? { categorySlug: selectedCategory.slug }
          : {}),
      },
    });
  };

  const handleOpenProduct = (productId) => {
    router.push(`/product/${productId}`);
  };

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

    Alert.alert("Añadido", "1 unidad agregada al carrito.");
  };

  const clearFilters = () => {
    router.push("/products");
  };

  const isCategoryActive = (cat) => {
    if (categorySlug && cat.slug) {
      return String(categorySlug) === String(cat.slug);
    }
    return String(categoryId || "") === String(cat.id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.logoCenter}>
          <Logo size={34} textSize={32} style={styles.logoNoMargin} />
        </View>

        <View style={styles.searchBarContainer}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar productos..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContainer}>
        <View style={styles.sidebar}>
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>CATEGORÍAS</Text>
              <Text style={styles.filterIcon}>−</Text>
            </View>

            {loadingCategories ? (
              <View style={styles.sidebarStatus}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.sidebarStatusText}>Cargando...</Text>
              </View>
            ) : categoriesError ? (
              <Text style={styles.sidebarErrorText}>{categoriesError}</Text>
            ) : (
              categories.map((cat) => {
                const active = isCategoryActive(cat);

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.checkboxRow}
                    onPress={() => handleCategoryFilter(cat)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        active && styles.checkboxActive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.filterItem,
                        active && styles.filterItemActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>ORDENAR</Text>
              <Text style={styles.filterIcon}>−</Text>
            </View>

            <TouchableOpacity
              style={styles.filterAction}
              onPress={() =>
                router.push({
                  pathname: "/products",
                  params: { sortBy: "recent" },
                })
              }
            >
              <Text style={styles.filterActionText}>Más recientes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterAction}
              onPress={() =>
                router.push({
                  pathname: "/products",
                  params: { section: "recommended" },
                })
              }
            >
              <Text style={styles.filterActionText}>Recomendados</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Limpiar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.gridContainer}>
          <Text style={styles.sectionHeading}>{screenTitle}</Text>
          <Text style={styles.sectionSubheading}>{screenSubtitle}</Text>

          {loadingProducts ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.emptyText}>Cargando productos...</Text>
            </View>
          ) : productsError ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>⚠️</Text>
              <Text style={styles.emptyTitle}>No pudimos cargar el listado</Text>
              <Text style={styles.emptyText}>{productsError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🛍️</Text>
              <Text style={styles.emptyTitle}>No hay resultados</Text>
              <Text style={styles.emptyText}>
                Probá con otra búsqueda o explorá otras categorías.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {products.map((item) => (
                <View key={item.id} style={styles.card}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleOpenProduct(item.id)}
                  >
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                  </TouchableOpacity>

                  <View style={styles.cardContent}>
                    {item.tag ? (
                      <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>{item.tag}</Text>
                      </View>
                    ) : null}

                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardOldPrice}>{formatPrice(item.oldPrice)}</Text>
                    <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
                    <Text style={styles.cardSeller}>Vendido por {item.seller}</Text>
                    <Text style={styles.cardStock}>
                      Stock disponible: {item.stock}
                    </Text>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.btnCart}
                        onPress={() => handleAddToCart(item.id)}
                      >
                        <Text style={styles.btnText}>AÑADIR AL CARRITO</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btnBuy}
                        onPress={() => handleOpenProduct(item.id)}
                      >
                        <Text style={styles.btnText}>COMPRAR AHORA</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {hasMore && !loadingProducts && (
            <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
              {loadingMore
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.loadMoreText}>Cargar más productos</Text>
              }
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  header: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    minHeight: 132,
  },

  backButton: {
    fontSize: FONT.medium,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 10,
    zIndex: 2,
  },

  logoCenter: {
    position: "absolute",
    top: 14,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },

  logoNoMargin: {
    marginBottom: 0,
  },

  searchBarContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.dark,
    borderRadius: 10,
    padding: 5,
    width: "100%",
    marginTop: 26,
  },

  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    paddingHorizontal: 14,
    marginRight: 6,
    height: 42,
  },

  searchButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 18,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  searchButtonText: {
    color: COLORS.white,
    fontWeight: "800",
  },

  mainContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.background,
  },

  sidebar: {
    width: "25%",
    backgroundColor: COLORS.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.divider,
    padding: 15,
  },

  filterSection: {
    marginBottom: 24,
  },

  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.dark,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },

  filterTitle: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },

  filterIcon: {
    color: COLORS.white,
    fontWeight: "900",
  },

  sidebarStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },

  sidebarStatusText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  sidebarErrorText: {
    color: COLORS.error,
    fontSize: 13,
    lineHeight: 18,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: COLORS.white,
  },

  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterItem: {
    fontSize: 14,
    color: COLORS.dark,
  },

  filterItemActive: {
    fontWeight: "800",
    color: COLORS.primary,
  },

  filterAction: {
    paddingVertical: 8,
  },

  filterActionText: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: "700",
  },

  clearButton: {
    marginTop: 10,
    backgroundColor: COLORS.promoLight,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },

  clearButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 12,
  },

  gridContainer: {
    padding: 20,
    width: "75%",
    paddingBottom: 30,
  },

  sectionHeading: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.sectionTitle,
    textAlign: "center",
    marginBottom: 6,
  },

  sectionSubheading: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
    overflow: "hidden",
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  productImage: {
    width: "100%",
    height: 160,
    backgroundColor: COLORS.imagePlaceholder,
  },

  cardContent: {
    padding: 12,
  },

  tagBadge: {
    backgroundColor: COLORS.secondary,
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },

  tagText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.white,
  },

  cardName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },

  cardOldPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: COLORS.textSecondary,
  },

  cardPrice: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.secondary,
    marginBottom: 4,
  },

  cardSeller: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  cardStock: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
    marginVertical: 6,
  },

  cardActions: {
    gap: 6,
    marginTop: 10,
  },

  btnCart: {
    backgroundColor: COLORS.dark,
    padding: 9,
    borderRadius: 6,
    alignItems: "center",
  },

  btnBuy: {
    backgroundColor: COLORS.secondary,
    padding: 9,
    borderRadius: 6,
    alignItems: "center",
  },

  btnText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },

  emptyState: {
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 10,
  },

  emptyEmoji: {
    fontSize: 44,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  retryButtonText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 13,
  },
});