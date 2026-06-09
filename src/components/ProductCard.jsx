import React from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = Math.min(150, SCREEN_WIDTH * 0.4);

const COLORS = {
  white: "#FFFFFF",
  coral: "#FF6B3D",
  purple: "#6C3BFF",
  purpleDark: "#4B24C4",
  text: "#1F1F1F",
  cardBorder: "#F0E8E2",
};

// Paleta de colores por tipo de tag
const TAG_STYLES = {
  POPULAR:  { bg: "#FFF3E0", color: "#E65100" },   // naranja cálido
  NUEVO:    { bg: "#E8F5E9", color: "#2E7D32" },   // verde esmeralda
  "PARA VOS": { bg: "#E0F7FA", color: "#00695C" }, // teal suave
};
const DEFAULT_TAG_STYLE = { bg: "#EFE7FF", color: "#6C3BFF" }; // violeta (fallback)

export default function ProductCard({ product, onPress, variant = "horizontal", isWishlisted = false }) {
  const badgeText = product.tag || "Recomendado";
  const tagStyle = TAG_STYLES[badgeText] ?? DEFAULT_TAG_STYLE;

  if (variant === "grid") {
    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => onPress(product)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: product.image }} style={styles.gridImage} />
        <View style={[styles.newBadge, { backgroundColor: tagStyle.bg }]}>
          <Text style={[styles.newBadgeText, { color: tagStyle.color }]}>{product.tag || "Nuevo"}</Text>
        </View>
        {isWishlisted && (
          <View style={styles.wishlistedBadge}>
            <Text style={styles.wishlistedBadgeText}>♥</Text>
          </View>
        )}
        <View style={styles.gridInfo}>
          <Text style={styles.gridProductName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.gridPrice}>${product.price}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.recommendedCard}
      onPress={() => onPress(product)}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.image }} style={styles.recommendedImage} />
        {isWishlisted && (
          <View style={styles.wishlistedBadge}>
            <Text style={styles.wishlistedBadgeText}>♥</Text>
          </View>
        )}
      </View>
      <View style={[styles.badge, { backgroundColor: tagStyle.bg }]}>
        <Text style={[styles.badgeText, { color: tagStyle.color }]}>{badgeText}</Text>
      </View>
      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.productPrice}>${product.price}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  recommendedCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  imageWrapper: {
    position: "relative",
  },
  recommendedImage: {
    width: "100%",
    height: CARD_WIDTH * 0.7,
    borderRadius: 12,
    backgroundColor: "#ECECEC",
    marginBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    // backgroundColor inyectado dinámicamente según el tag
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  badgeText: {
    // color inyectado dinámicamente según el tag
    fontSize: 12,
    fontWeight: "700",
  },
  productName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginBottom: 4,
  },
  productPrice: {
    color: COLORS.coral,
    fontSize: 14,
    fontWeight: "800",
  },
  gridCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: 22,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  gridImage: {
    width: "100%",
    height: 130,
    backgroundColor: "#ECECEC",
  },
  newBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    // backgroundColor inyectado dinámicamente según el tag
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  newBadgeText: {
    // color inyectado dinámicamente según el tag
    fontSize: 11,
    fontWeight: "800",
  },
  gridInfo: {
    padding: 12,
  },
  wishlistedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 999,
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  wishlistedBadgeText: {
    color: "#C62828",
    fontSize: 14,
    fontWeight: "800",
  },
  gridProductName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
    marginBottom: 6,
  },
  gridPrice: {
    color: COLORS.purpleDark,
    fontSize: 17,
    fontWeight: "800",
  },
});
