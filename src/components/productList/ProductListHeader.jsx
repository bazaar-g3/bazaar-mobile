import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Logo from "../Logo";
import { COLORS } from "../../constants/colors";
import { styles } from "../../styles/productList/productListStyles";

export default function ProductListHeader({
  searchText,
  setSearchText,
  onSearch,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.logoCenter}>
        <Logo size={34} textSize={32} style={styles.logoNoMargin} />
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar productos..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}