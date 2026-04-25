import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, SafeAreaView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getSessionStatus } from "../services/session";
import { buildLoginRedirect, normalizeRouteParam } from "../utils/authRedirect";
import {
  getCatalogErrorMessage,
  listCatalogProducts,
  listProductCategories,
} from "../services/catalog";

import ProductListHeader from "../components/productList/ProductListHeader";
import ProductListSidebar from "../components/productList/ProductListSidebar";
import ProductListGrid from "../components/productList/ProductListGrid";

import { mapProductToListItem } from "../utils/productList/productListHelpers";
import { styles } from "../styles/productList/productListStyles";
import { getPublicProfile } from "../services/user";

const LIMIT = 20;

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
          //onlyAvailable: true,
          limit: LIMIT,
          offset: currentOffset,
        };

        if (search) requestParams.search = search;
        if (categorySlug) requestParams.category = categorySlug;
        if (sortBy === "recent" || section === "recommended") {
          requestParams.sort = "recent";
        }

        const response = await listCatalogProducts(requestParams);
        const mappedProducts = response.map((product) =>
          mapProductToListItem(product, {
            recommended: section === "recommended",
          })
        );

        setProducts((prev) =>
          replace ? mappedProducts : [...prev, ...mappedProducts]
        );
        setHasMore(response.length === LIMIT);
        setOffset(currentOffset);
      } catch (error) {
        setProductsError(
          getCatalogErrorMessage(
            error,
            "No pudimos cargar los productos por el momento."
          )
        );

        if (replace) setProducts([]);
      } finally {
        setLoadingProducts(false);
        setLoadingMore(false);
      }
    },
    [search, categorySlug, sortBy, section]
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
      <ProductListHeader
        searchText={searchText}
        setSearchText={setSearchText}
        onSearch={handleSearch}
        onBack={() => router.back()}
      />

      <View style={styles.mainContainer}>
        <ProductListSidebar
          loadingCategories={loadingCategories}
          categoriesError={categoriesError}
          categories={categories}
          isCategoryActive={isCategoryActive}
          onSelectCategory={handleCategoryFilter}
          onSortRecent={() =>
            router.push({
              pathname: "/products",
              params: { sortBy: "recent" },
            })
          }
          onSortRecommended={() =>
            router.push({
              pathname: "/products",
              params: { section: "recommended" },
            })
          }
          onClearFilters={clearFilters}
        />

        <ProductListGrid
          screenTitle={screenTitle}
          screenSubtitle={screenSubtitle}
          loadingProducts={loadingProducts}
          productsError={productsError}
          products={products}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onRetry={loadProducts}
          onLoadMore={loadMore}
          onOpenProduct={handleOpenProduct}
          onAddToCart={handleAddToCart}
        />
      </View>
    </SafeAreaView>
  );
}