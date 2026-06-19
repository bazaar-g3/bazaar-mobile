import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from "expo-router";

import { getSessionStatus } from "../services/session";
import { getWishlist, addToWishlist, removeFromWishlist } from "../services/wishlist";
import { getPublicProfile } from "../services/user";
import { getCartErrorMessage } from "../services/cart";
import { useCartContext } from "../context/CartContext";
import { buildLoginRedirect, normalizeRouteParam } from "../utils/authRedirect";
import {
  getCatalogErrorMessage,
  listCatalogProducts,
  listProductCategories,
} from "../services/catalog";

import ProductListHeader from "../components/productList/ProductListHeader";
import ProductFiltersModal from "../components/productList/ProductFiltersModal";
import ProductListGrid from "../components/productList/ProductListGrid";

import { mapProductToListItem } from "../utils/productList/productListHelpers";
import { makeStyles } from "../styles/productList/productListStyles";
import { useTheme } from "../theme/ThemeContext";
import { PRICE_MIN_LIMIT, PRICE_MAX_LIMIT } from "../constants/filters";

const LIMIT = 20;

const SORT_TITLE = {
  newest:     "Productos recientes",
  price_asc:  "Menor precio primero",
  price_desc: "Mayor precio primero",
  relevance:  "Por relevancia",
};

export default function ProductListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addItem } = useCartContext();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Parámetros de URL (solo para inicializar el estado)
  const search = normalizeRouteParam(params.search);
  const categoryId = normalizeRouteParam(params.categoryId);
  const categoryName = normalizeRouteParam(params.categoryName);
  const categorySlug = normalizeRouteParam(params.categorySlug);
  const sortBy = normalizeRouteParam(params.sortBy);
  const initialMinPrice = params.minPrice ? Number(params.minPrice) : PRICE_MIN_LIMIT;
  const initialMaxPrice = params.maxPrice ? Number(params.maxPrice) : PRICE_MAX_LIMIT;

  const [searchText, setSearchText] = useState(search ? String(search) : "");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [productsError, setProductsError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Modal de filtros ──
  const [filtersVisible, setFiltersVisible] = useState(false);

  // ── Estado local de filtros ──
  const [activeCategory, setActiveCategory] = useState(
    categorySlug || categoryId
      ? { id: categoryId || categorySlug, label: categoryName || "", slug: categorySlug }
      : null
  );
  const [activeSortBy, setActiveSortBy] = useState(sortBy || null);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  // Cantidad de filtros activos para el badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeCategory) count++;
    if (activeSortBy) count++;
    if (minPrice > PRICE_MIN_LIMIT || maxPrice < PRICE_MAX_LIMIT) count++;
    return count;
  }, [activeCategory, activeSortBy, minPrice, maxPrice]);

  // ── Carga de categorías ──
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
        getCatalogErrorMessage(error, "No pudimos cargar las categorías por el momento.")
      );
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // ── Carga de productos ──
  const loadProducts = useCallback(
    async (currentOffset = 0, replace = true) => {
      if (replace) {
        setLoadingProducts(true);
      } else {
        setLoadingMore(true);
      }
      setProductsError("");

      try {
        const requestParams = {
          status: "active",
          limit: LIMIT,
          offset: currentOffset,
        };

        if (search) requestParams.search = search;
        if (activeCategory?.slug) requestParams.category = activeCategory.slug;
        if (activeSortBy) requestParams.sort = activeSortBy;
        // CA2: Filtros de precio (solo si difieren de los límites por defecto)
        if (minPrice > PRICE_MIN_LIMIT) requestParams.minPrice = minPrice;
        if (maxPrice < PRICE_MAX_LIMIT) requestParams.maxPrice = maxPrice;

        const response = await listCatalogProducts(requestParams);
        const mappedProducts = response.map((product) => mapProductToListItem(product));

        // Enriquecer con nombre real del vendedor (user-api GET /users/:id/profile)
        const uniqueSellerIds = [...new Set(
          mappedProducts
            .filter((p) => p.sellerId != null)
            .map((p) => Number(p.sellerId))
        )];
        const profiles = await Promise.all(uniqueSellerIds.map((id) => getPublicProfile(id)));
        const sellerMap = {};
        uniqueSellerIds.forEach((id, i) => {
          if (profiles[i]?.fullName) sellerMap[id] = profiles[i].fullName;
        });
        const enrichedProducts = mappedProducts.map((p) => ({
          ...p,
          seller: sellerMap[Number(p.sellerId)] || p.seller,
        }));

        setProducts((prev) => (replace ? enrichedProducts : [...prev, ...enrichedProducts]));
        setHasMore(response.length === LIMIT);
        setOffset(currentOffset);
      } catch (error) {
        setProductsError(
          getCatalogErrorMessage(error, "No pudimos cargar los productos por el momento.")
        );
        if (replace) setProducts([]);
      } finally {
        setLoadingProducts(false);
        setLoadingMore(false);
      }
    },
    [search, activeCategory, activeSortBy, minPrice, maxPrice]
  );

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

  // ── Títulos dinámicos ──
  const screenTitle = useMemo(() => {
    if (search) return `Resultados para "${String(search)}"`;
    if (activeCategory?.label) return `Categoría: ${String(activeCategory.label)}`;
    if (activeSortBy && SORT_TITLE[activeSortBy]) return SORT_TITLE[activeSortBy];
    return "Todos los productos";
  }, [search, activeCategory, activeSortBy]);

  const screenSubtitle = useMemo(() => {
    if (loadingProducts) return "Cargando productos...";
    if (productsError) return productsError;
    if (products.length === 0) return "No encontramos productos.";
    if (products.length === 1) return "1 producto encontrado";
    return `${products.length} productos encontrados`;
  }, [loadingProducts, productsError, products.length]);

  // ── Wishlist ──
  useEffect(() => {
    async function loadWishlist() {
      const session = await getSessionStatus();
      if (!session.isAuthenticated) return;
      try {
        const items = await getWishlist();
        setWishlistedIds(new Set(items.map((i) => String(i.productId))));
      } catch {
        // ignore — hearts just show as empty
      }
    }
    loadWishlist();
  }, []);

  const handleWishlistToggle = async (productId, newLiked) => {
    const session = await getSessionStatus();
    if (!session.isAuthenticated) {
      router.push(
        buildLoginRedirect({ redirectPath: `/product/${productId}`, pendingAction: "wishlist" })
      );
      return;
    }
    try {
      if (newLiked) {
        await addToWishlist(productId);
        setWishlistedIds((prev) => new Set([...prev, String(productId)]));
      } else {
        await removeFromWishlist(productId);
        setWishlistedIds((prev) => {
          const next = new Set(prev);
          next.delete(String(productId));
          return next;
        });
      }
    } catch {
      // API failed — card's optimistic state is already toggled; a future reload will correct it
    }
  };

  // ── Handlers ──
  const handleSearch = () => {
    const trimmedSearch = searchText.trim();
    router.push({
      pathname: "/products",
      params: trimmedSearch ? { search: trimmedSearch } : {},
    });
  };

  // CA1: Toggle categoría (deselecciona si ya estaba activa)
  const handleCategoryFilter = (selectedCategory) => {
    setActiveCategory((prev) => {
      const isSame = prev?.slug
        ? prev.slug === selectedCategory.slug
        : prev?.id === selectedCategory.id;
      return isSame ? null : selectedCategory;
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
    try {
      await addItem(productId);
      Alert.alert("Añadido al carrito", "El producto fue agregado correctamente.");
    } catch (error) {
      Alert.alert("Error", getCartErrorMessage(error, "No se pudo agregar al carrito."));
    }
  };

  // CA2: Cambio de precio desde el slider
  const handlePriceChange = (newMin, newMax) => {
    setMinPrice(newMin);
    setMaxPrice(newMax);
  };

  // CA4: Limpiar todos los filtros
  const clearFilters = () => {
    setActiveCategory(null);
    setActiveSortBy(null);
    setMinPrice(PRICE_MIN_LIMIT);
    setMaxPrice(PRICE_MAX_LIMIT);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ProductListHeader
        screenTitle={screenTitle}
        screenSubtitle={screenSubtitle}
        searchText={searchText}
        setSearchText={setSearchText}
        onSearch={handleSearch}
        onOpenFilters={() => setFiltersVisible(true)}
        onGoHome={() => router.push("/home")}
        activeFiltersCount={activeFiltersCount}
        activeSortBy={activeSortBy}
        onSortChange={(value) => setActiveSortBy(value)}
      />

      <View style={styles.mainContainer}>
        <ProductListGrid
          loadingProducts={loadingProducts}
          productsError={productsError}
          products={products}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onRetry={loadProducts}
          onLoadMore={loadMore}
          onOpenProduct={handleOpenProduct}
          onAddToCart={handleAddToCart}
          onWishlistToggle={handleWishlistToggle}
          wishlistedIds={wishlistedIds}
        />
      </View>

      {/* CA1/CA2/CA3/CA4: Modal de filtros */}
      <ProductFiltersModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        loadingCategories={loadingCategories}
        categoriesError={categoriesError}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={handleCategoryFilter}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceChange={handlePriceChange}
        onClearFilters={clearFilters}
      />
    </SafeAreaView>
  );
}
