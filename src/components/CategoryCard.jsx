import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const COLORS = {
  text: "#1F1F1F",
};

export default function CategoryCard({ category, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: category.color }]}
      onPress={() => onPress(category)}
      activeOpacity={0.8}
    >
      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
      <Text style={styles.categoryName}>{category.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoryCard: {
    width: 110,
    height: 110,
    borderRadius: 22,
    padding: 14,
    marginRight: 12,
    justifyContent: "space-between",
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
});