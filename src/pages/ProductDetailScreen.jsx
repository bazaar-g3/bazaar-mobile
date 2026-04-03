import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle del producto</Text>
      <Text style={styles.text}>ID del producto: {id}</Text>
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
    color: "#444",
  },
});