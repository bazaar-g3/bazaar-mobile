import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ProductListScreen() {
  const { search, categoryId, categoryName, sortBy, section } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listado de productos</Text>
      <Text style={styles.text}>Búsqueda: {search || "-"}</Text>
      <Text style={styles.text}>Categoría ID: {categoryId || "-"}</Text>
      <Text style={styles.text}>Categoría: {categoryName || "-"}</Text>
      <Text style={styles.text}>Orden: {sortBy || "-"}</Text>
      <Text style={styles.text}>Sección: {section || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFF8F3",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 16,
    color: "#1F1F1F",
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    color: "#444",
  },
});