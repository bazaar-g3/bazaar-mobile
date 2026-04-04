import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import SearchBar from "../components/SearchBar";
import SectionHeader from "../components/SectionHeader";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";

// Colores basados en la imagen
const COLORS = {
  primary: "#00C2B3", // Turquesa de la barra de categorías
  secondary: "#FF9800", // Naranja de ofertas
  dark: "#003238", // Azul muy oscuro para el buscador
  background: "#F5F7F8",
  white: "#FFFFFF",
  text: "#1F1F1F",
};

const mockCategories = [
  { id: "1", name: "MODA", color: "#FFFFFF", emoji: "👕" },
  { id: "2", name: "TECNOLOGÍA", color: "#FFFFFF", emoji: "📱" },
  { id: "3", name: "HOGAR", color: "#FFFFFF", emoji: "🪑" },
  { id: "4", name: "DEPORTES", color: "#FFFFFF", emoji: "🏈" },
  { id: "5", name: "LIBROS", color: "#FFFFFF", emoji: "📚" },
];

const mockRecommendedProducts = [
  {
    id: "1",
    name: "Auriculares Bluetooth",
    price: 25000,
    image: "https://via.placeholder.com/500x350.png?text=Auriculares",
  tag: "OFERTA!"
  },
  {
    id: "2",
    name: "Silla Gamer",
    price: 120000,
    image: "https://via.placeholder.com/500x350.png?text=Silla+Gamer",
    tag: "OFERTA!"
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER: LOGO Y BUSCADOR */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            <Text style={{ color: COLORS.primary }}>BA</Text>
            <Text style={{ color: COLORS.secondary }}>ZA</Text>
            <Text style={{ color: "#F44336" }}>AR</Text>
          </Text>
        </View>
        <View style={styles.searchContainer}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onSearch={handleSearch}
          placeholder="Search for products, brands..."
          containerStyle={styles.customSearchBar}
        />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* BARRA DE CATEGORÍAS (TURQUESA) */}
        <View style={styles.categoriesBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockCategories.map((cat) => (
              <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryItem}
                  onPress={() => handleCategoryPress(cat)}
                >
                <View style={styles.categoryCircle}>
                  <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
                </View>
                <Text style={styles.categoryLabel}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.content}>
          {/* PRODUCTOS RECOMENDADOS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRODUCTOS <Text style={{color: COLORS.primary}}>RECOMENDADOS</Text></Text>
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

          {/* SECCIÓN DE OFERTAS (BANNER NARANJA) */}
          <Text style={styles.sectionTitle}>SECCIÓN DE <Text style={{color: COLORS.secondary}}>OFERTAS Y DESCUENTOS</Text></Text>
          <TouchableOpacity style={styles.promoBanner} activeOpacity={0.9}>
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTag}>¡OFERTA ESPECIAL DE LA SEMANA!</Text>
              <Text style={styles.promoTitle}>30% DTO.</Text>
              <Text style={styles.promoSubtitle}>Licuadora Ninja Pro{"\n"}¡Solo por tiempo limitado!</Text>
              <View style={styles.promoButton}>
                <Text style={styles.promoButtonText}>COMPRAR AHORA</Text>
              </View>
            </View>
            <Text style={{fontSize: 60}}>🥤</Text> 
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 2,
  },
  searchContainer: {
    backgroundColor: COLORS.dark,
    padding: 15,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  categoriesBar: {
    backgroundColor: COLORS.primary,
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
  categoryLabel: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 15,
    color: "#444",
  },
  recommendedList: {
    paddingBottom: 10,
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
});