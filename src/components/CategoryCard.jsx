import React, { useMemo } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

export default function CategoryCard({ category, onPress }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

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

const makeStyles = (theme) => StyleSheet.create({
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
    color: theme.color.textPrimary,
  },
});