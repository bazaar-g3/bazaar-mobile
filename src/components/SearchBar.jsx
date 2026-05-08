import React from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";

const COLORS = {
  white: "#FFFFFF",
  coral: "#FF6B3D",
  text: "#1F1F1F",
};

export default function SearchBar({ value, onChangeText, onSearch, style }) {
  return (
    <View style={[styles.searchWrapper, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar productos..."
        placeholderTextColor="#8E8E93"
        style={styles.searchInput}
        onSubmitEditing={onSearch}
      />
      <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
        <Text style={styles.searchButtonText}>Buscar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 6,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 15,
  },
  searchButton: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },
});