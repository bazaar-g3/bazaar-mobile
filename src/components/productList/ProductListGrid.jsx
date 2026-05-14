import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from "react-native";
import { COLORS } from "../../constants/colors";
import { styles } from "../../styles/productList/productListStyles";
import ProductCard from "./ProductCard";
import ProductListEmptyState from "./ProductListEmptyState";

const GRID_H_PADDING = 32;
const GRID_GAP = 12;
// Ancho máximo del contenedor del grid (evita que en pantallas muy anchas las cards sean enormes)
const MAX_GRID_WIDTH = 1200;
// Ancho máximo de una card individual
const MAX_CARD_WIDTH = 300;

function useGridLayout() {
  const { width } = useWindowDimensions();

  const numCols = width >= 1024 ? 4 : width >= 640 ? 3 : 2;

  // El contenedor del grid tiene un max-width, así que usamos eso para el cálculo
  const containerWidth = Math.min(width, MAX_GRID_WIDTH) - GRID_H_PADDING;
  const cardWidth = Math.min(
    Math.floor((containerWidth - GRID_GAP * (numCols - 1)) / numCols),
    MAX_CARD_WIDTH
  );

  const imageHeight = Math.round(cardWidth * (numCols <= 2 ? 0.9 : 0.85));

  return { cardWidth, imageHeight, numCols };
}

export default function ProductListGrid({
  screenTitle,
  screenSubtitle,
  loadingProducts,
  productsError,
  products,
  hasMore,
  loadingMore,
  onRetry,
  onLoadMore,
  onOpenProduct,
  onAddToCart,
}) {
  const { cardWidth, imageHeight } = useGridLayout();

  return (
    <ScrollView contentContainerStyle={styles.gridContainer}>
      <Text style={styles.sectionHeading}>{screenTitle}</Text>
      <Text style={styles.sectionSubheading}>{screenSubtitle}</Text>

      {loadingProducts ? (
        <ProductListEmptyState loading text="Cargando productos..." />
      ) : productsError ? (
        <ProductListEmptyState
          emoji="⚠️"
          title="No pudimos cargar el listado"
          text={productsError}
          buttonText="Reintentar"
          onPress={onRetry}
        />
      ) : products.length === 0 ? (
        <ProductListEmptyState
          emoji="🛍️"
          title="No hay resultados"
          text="Probá con otra búsqueda o explorá otras categorías."
        />
      ) : (
        <View style={styles.gridWrapper}>
          <View style={styles.grid}>
            {products.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onOpenProduct={onOpenProduct}
                onAddToCart={onAddToCart}
                cardStyle={{ width: cardWidth }}
                imageStyle={{ height: imageHeight }}
              />
            ))}
          </View>
        </View>
      )}

      {hasMore && !loadingProducts && (
        <TouchableOpacity style={styles.loadMoreButton} onPress={onLoadMore}>
          {loadingMore ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.loadMoreText}>Cargar más productos</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}