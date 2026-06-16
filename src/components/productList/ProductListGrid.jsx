import React, { useMemo } from "react";
import { View, ScrollView, ActivityIndicator, useWindowDimensions } from "react-native";
import { lightTheme } from "../../theme";
import { makeStyles } from "../../styles/productList/productListStyles";
import { useTheme } from "../../theme/ThemeContext";
import ProductCard from "./ProductCard";
import ProductListEmptyState from "./ProductListEmptyState";

const GRID_H_PADDING = lightTheme.space.lg * 2;
const GRID_GAP = lightTheme.space.lg;
const MAX_GRID_WIDTH = 1200;
const MAX_CARD_WIDTH = 300;
const LOAD_MORE_THRESHOLD = 400;

function useCardWidth() {
  const { width } = useWindowDimensions();
  const numCols = width >= 1024 ? 4 : width >= 640 ? 3 : 2;
  const containerWidth = Math.min(width, MAX_GRID_WIDTH) - GRID_H_PADDING;
  return Math.min(
    Math.floor((containerWidth - GRID_GAP * (numCols - 1)) / numCols),
    MAX_CARD_WIDTH
  );
}

export default function ProductListGrid({
  loadingProducts,
  productsError,
  products,
  hasMore,
  loadingMore,
  onRetry,
  onLoadMore,
  onOpenProduct,
  onAddToCart,
  onWishlistToggle,
  wishlistedIds,
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const cardWidth = useCardWidth();

  const handleScroll = ({ nativeEvent }) => {
    if (loadingMore || !hasMore) return;
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    if (contentSize.height - contentOffset.y - layoutMeasurement.height < LOAD_MORE_THRESHOLD) {
      onLoadMore();
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.gridContainer}
      onScroll={handleScroll}
      scrollEventThrottle={200}
    >
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
                onWishlistToggle={onWishlistToggle}
                isWishlisted={wishlistedIds ? wishlistedIds.has(String(item.id)) : false}
                cardStyle={{ width: cardWidth }}
              />
            ))}
          </View>

          {loadingMore && (
            <View style={{ paddingTop: 24, alignItems: "center" }}>
              <ActivityIndicator color={theme.color.accent} />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
