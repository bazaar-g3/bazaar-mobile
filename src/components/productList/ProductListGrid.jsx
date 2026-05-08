import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { COLORS } from "../../constants/colors";
import { styles } from "../../styles/productList/productListStyles";
import ProductCard from "./ProductCard";
import ProductListEmptyState from "./ProductListEmptyState";

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
        <View style={styles.grid}>
          {products.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onOpenProduct={onOpenProduct}
              onAddToCart={onAddToCart}
            />
          ))}
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