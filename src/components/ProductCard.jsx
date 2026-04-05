import React from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";

const COLORS = {
  white: "#FFFFFF",
  coral: "#FF6B3D",
  purple: "#6C3BFF",
  purpleDark: "#4B24C4",
  text: "#1F1F1F",
  cardBorder: "#F0E8E2",
};

export default function ProductCard({ product, onPress, variant = "horizontal" }) {
  const badgeText = product.tag || "Recomendado";

  if (variant === "grid") {
    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => onPress(product)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: product.image }} style={styles.gridImage} />
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>{product.tag || "Nuevo"}</Text>
        </View>
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
      <Image source={{ uri: product.image }} style={styles.recommendedImage} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badgeText}</Text>
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
    width: 190,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 10,
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  recommendedImage: {
    width: "100%",
    height: 130,
    borderRadius: 16,
    backgroundColor: "#ECECEC",
    marginBottom: 10,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFE7FF",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  badgeText: {
    color: COLORS.purple,
    fontSize: 12,
    fontWeight: "700",
  },
  productName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 6,
  },
  productPrice: {
    color: COLORS.coral,
    fontSize: 18,
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
    backgroundColor: COLORS.coral,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  newBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
  },
  gridInfo: {
    padding: 12,
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
