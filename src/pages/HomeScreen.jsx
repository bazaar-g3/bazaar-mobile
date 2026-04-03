import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import SearchBar from "../components/SearchBar";
import SectionHeader from "../components/SectionHeader";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";

const mockCategories = [
  { id: "1", name: "Tecnología", color: "#EDE0FF", emoji: "💻" },
  { id: "2", name: "Hogar", color: "#FFE7D6", emoji: "🏠" },
  { id: "3", name: "Ropa", color: "#DDF4FF", emoji: "👕" },
  { id: "4", name: "Deportes", color: "#E7F8E7", emoji: "⚽" },
  { id: "5", name: "Belleza", color: "#FFE0EC", emoji: "💄" },
  { id: "6", name: "Libros", color: "#FFF1C7", emoji: "📚" },
];

const mockRecentProducts = [
  {
    id: "1",
    name: "Auriculares Bluetooth",
    price: 25000,
    image: "https://via.placeholder.com/300x200.png?text=Auriculares",
  },
  {
    id: "2",
    name: "Silla Gamer",
    price: 120000,
    image: "https://via.placeholder.com/300x200.png?text=Silla",
  },
  {
    id: "3",
    name: "Campera Nike",
    price: 89000,
    image: "https://via.placeholder.com/300x200.png?text=Campera",
  },
  {
    id: "4",
    name: "Mochila Urbana",
    price: 34000,
    image: "https://via.placeholder.com/300x200.png?text=Mochila",
  },
];

const mockRecommendedProducts = [
  {
    id: "5",
    name: "Mouse Inalámbrico",
    price: 18000,
    image: "https://via.placeholder.com/300x200.png?text=Mouse",
  },
  {
    id: "6",
    name: "Zapatillas Adidas",
    price: 76000,
    image: "https://via.placeholder.com/300x200.png?text=Zapatillas",
  },
  {
    id: "7",
    name: "Lámpara LED",
    price: 21000,
    image: "https://via.placeholder.com/300x200.png?text=Lampara",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

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

  const handleProductPress = (product) => {
    router.push(`/product/${product.id}`);
  };

  const handleSeeAllCategories = () => {
    router.push("/products");
  };

  const handleSeeAllRecommended = () => {
    router.push({
      pathname: "/products",
      params: { section: "recommended" },
    });
  };

  const handleSeeAllRecent = () => {
    router.push({
      pathname: "/products",
      params: { sortBy: "recent" },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroGreeting}>Hola 👋</Text>
          <Text style={styles.heroTitle}>Encontrá eso que estás buscando</Text>
          <Text style={styles.heroSubtitle}>
            Comprá, vendé y descubrí oportunidades únicas en Bazaar.
          </Text>

          <SearchBar
            value={search}
            onChangeText={setSearch}
            onSearch={handleSearch}
          />
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.bannerCard} activeOpacity={0.9}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTag}>Descubrí Bazaar</Text>
              <Text style={styles.bannerTitle}>Productos nuevos todos los días</Text>
              <Text style={styles.bannerSubtitle}>
                Explorá categorías, encontrá ofertas y conectate con vendedores.
              </Text>
            </View>
            <Text style={styles.bannerEmoji}>✨</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <SectionHeader
              title="Categorías"
              actionText="Ver más"
              onPressAction={handleSeeAllCategories}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {mockCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onPress={handleCategoryPress}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Recomendados para vos"
              actionText="Ver todos"
              onPressAction={handleSeeAllRecommended}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {mockRecommendedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={handleProductPress}
                  variant="horizontal"
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Publicados recientemente"
              actionText="Ver todos"
              onPressAction={handleSeeAllRecent}
            />
            <View style={styles.grid}>
              {mockRecentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={handleProductPress}
                  variant="grid"
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const COLORS = {
  background: "#FFF8F3",
  purple: "#6C3BFF",
  text: "#1F1F1F",
  textSecondary: "#6B6B6B",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.purple,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroSection: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroGreeting: {
    fontSize: 16,
    color: "#E8DCFF",
    marginBottom: 6,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#E8DCFF",
    marginBottom: 22,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  bannerCard: {
    backgroundColor: "#FFE7D6",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  bannerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  bannerTag: {
    color: "#FF6B3D",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  bannerTitle: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  bannerEmoji: {
    fontSize: 34,
  },
  section: {
    marginBottom: 28,
  },
  categoriesRow: {
    paddingRight: 10,
  },
  horizontalList: {
    paddingRight: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});