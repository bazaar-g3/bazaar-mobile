import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const COLORS = {
  primary: "#00C2B3",
  secondary: "#FF9800",
  dark: "#003238",
  background: "#F5F7F8",
  white: "#FFFFFF",
  grey: "#6B6B6B",
  lightGrey: "#EAEAEA",
  text: "#1F1F1F",
};

const mockProducts = [
  {
    id: "1",
    name: "Auriculares Bluetooth",
    price: 25000,
    oldPrice: 32500,
    image: "https://via.placeholder.com/300x200.png?text=Auriculares",
    categoryId: "2",
    categoryName: "Tecnología",
    createdAt: "2026-04-03T10:00:00Z",
    stock: 8,
    seller: "Tech Store",
    tag: "OFERTA DESTACADA!",
  },
  {
    id: "2",
    name: "Silla Gamer",
    price: 120000,
    oldPrice: 156000,
    image: "https://via.placeholder.com/300x200.png?text=Silla",
    categoryId: "3",
    categoryName: "Hogar",
    createdAt: "2026-04-01T15:30:00Z",
    stock: 3,
    seller: "Home Design",
    tag: null,
  },
  {
    id: "3",
    name: "Campera Nike",
    price: 89000,
    oldPrice: 115700,
    image: "https://via.placeholder.com/300x200.png?text=Campera",
    categoryId: "1",
    categoryName: "Moda",
    createdAt: "2026-04-02T12:00:00Z",
    stock: 5,
    seller: "Urban Wear",
    tag: "OFERTA DESTACADA!",
  },
  {
    id: "4",
    name: "Mochila Urbana",
    price: 34000,
    oldPrice: 44200,
    image: "https://via.placeholder.com/300x200.png?text=Mochila",
    categoryId: "1",
    categoryName: "Moda",
    createdAt: "2026-04-04T08:45:00Z",
    stock: 10,
    seller: "City Bags",
    tag: null,
  },
  {
    id: "5",
    name: "Mouse Inalámbrico",
    price: 18000,
    oldPrice: 23400,
    image: "https://via.placeholder.com/300x200.png?text=Mouse",
    categoryId: "2",
    categoryName: "Tecnología",
    createdAt: "2026-03-30T09:15:00Z",
    stock: 15,
    seller: "Tech Store",
    tag: "OFERTA DESTACADA!",
  },
  {
    id: "6",
    name: "Zapatillas Adidas",
    price: 76000,
    oldPrice: 98800,
    image: "https://via.placeholder.com/300x200.png?text=Zapatillas",
    categoryId: "4",
    categoryName: "Deportes",
    createdAt: "2026-04-03T18:20:00Z",
    stock: 6,
    seller: "Sport House",
    tag: null,
  },
  {
    id: "7",
    name: "Lámpara LED",
    price: 21000,
    oldPrice: 27300,
    image: "https://via.placeholder.com/300x200.png?text=Lampara",
    categoryId: "3",
    categoryName: "Hogar",
    createdAt: "2026-03-29T11:00:00Z",
    stock: 4,
    seller: "Home Design",
    tag: null,
  },
  {
    id: "8",
    name: "Pelota de fútbol",
    price: 15000,
    oldPrice: 19500,
    image: "https://via.placeholder.com/300x200.png?text=Pelota",
    categoryId: "4",
    categoryName: "Deportes",
    createdAt: "2026-04-04T14:10:00Z",
    stock: 12,
    seller: "Sport House",
    tag: "OFERTA DESTACADA!",
  },
];

const categoryOptions = [
  { id: "1", label: "Moda" },
  { id: "2", label: "Tecnología" },
  { id: "3", label: "Hogar" },
  { id: "4", label: "Deportes" },
  { id: "5", label: "Libros" },
];

export default function ProductListScreen() {
  const router = useRouter();
  const { search, categoryId, categoryName, sortBy, section } =
    useLocalSearchParams();

  const [searchText, setSearchText] = useState(search ? String(search) : "");

  const filteredProducts = useMemo(() => {
    let result = [...mockProducts];

    if (search) {
      const normalizedSearch = String(search).toLowerCase().trim();
      result = result.filter((product) =>
        product.name.toLowerCase().includes(normalizedSearch)
      );
    }

    if (categoryId) {
      result = result.filter(
        (product) => product.categoryId === String(categoryId)
      );
    }

    if (section === "recommended") {
      result = result.slice(0, 4);
    }

    if (sortBy === "recent") {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [search, categoryId, sortBy, section]);

  const screenTitle = useMemo(() => {
    if (search) return `RESULTADOS PARA "${String(search).toUpperCase()}"`;
    if (categoryName) return `CATEGORÍA: ${String(categoryName).toUpperCase()}`;
    if (sortBy === "recent") return "PRODUCTOS RECIENTES";
    if (section === "recommended") return "PRODUCTOS RECOMENDADOS";
    return "TODOS LOS PRODUCTOS";
  }, [search, categoryName, sortBy, section]);

  const screenSubtitle = useMemo(() => {
    if (filteredProducts.length === 0) return "No encontramos productos.";
    if (filteredProducts.length === 1) return "1 producto encontrado";
    return `${filteredProducts.length} productos encontrados`;
  }, [filteredProducts.length]);

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
      },
    });
  };

  const handleOpenProduct = (productId) => {
    router.push(`/product/${productId}`);
  };

  const clearFilters = () => {
    router.push("/products");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>
          <Text style={{ color: COLORS.primary }}>BA</Text>
          <Text style={{ color: COLORS.secondary }}>ZA</Text>
          <Text style={{ color: "#F44336" }}>AR</Text>
        </Text>

        <View style={styles.searchBarContainer}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar productos..."
            placeholderTextColor="#7D8B8E"
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

            {categoryOptions.map((cat) => {
              const isActive = String(categoryId || "") === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.checkboxRow}
                  onPress={() => handleCategoryFilter(cat)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, isActive && styles.checkboxActive]} />
                  <Text style={[styles.filterItem, isActive && styles.filterItemActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>ORDENAR</Text>
              <Text style={styles.filterIcon}>−</Text>
            </View>

            <TouchableOpacity
              style={styles.filterAction}
              onPress={() =>
                router.push({ pathname: "/products", params: { sortBy: "recent" } })
              }
            >
              <Text style={styles.filterActionText}>Más recientes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterAction}
              onPress={() =>
                router.push({ pathname: "/products", params: { section: "recommended" } })
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

          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🛍️</Text>
              <Text style={styles.emptyTitle}>No hay resultados</Text>
              <Text style={styles.emptyText}>
                Probá con otra búsqueda o explorá otras categorías.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredProducts.map((item) => (
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
                    <Text style={styles.cardOldPrice}>${item.oldPrice}</Text>
                    <Text style={styles.cardPrice}>${item.price}</Text>
                    <Text style={styles.cardSeller}>Vendido por {item.seller}</Text>
                    <Text style={styles.cardStock}>Stock disponible: {item.stock}</Text>

                    <View style={styles.cardActions}>
                      <TouchableOpacity style={styles.btnCart}>
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
    padding: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  backButton: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 10,
  },
  logo: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  searchBarContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.dark,
    borderRadius: 10,
    padding: 5,
    width: "100%",
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
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
    borderRightColor: COLORS.lightGrey,
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: COLORS.grey,
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
    backgroundColor: "#EEF8F7",
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
    color: COLORS.grey,
    textAlign: "center",
    marginBottom: 6,
  },
  sectionSubheading: {
    fontSize: 14,
    color: COLORS.grey,
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
    borderColor: COLORS.lightGrey,
    overflow: "hidden",
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#F0F0F0",
  },
  cardContent: {
    padding: 12,
  },
  tagBadge: {
    backgroundColor: "#FFD700",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#4E3B00",
  },
  cardName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
    marginBottom: 4,
  },
  cardOldPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: COLORS.grey,
  },
  cardPrice: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.secondary,
    marginBottom: 4,
  },
  cardSeller: {
    fontSize: 11,
    color: COLORS.grey,
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
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.grey,
    textAlign: "center",
  },
});