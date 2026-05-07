import React from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import Logo from "../Logo";
import { COLORS } from "../../constants/colors";
import { styles } from "../../styles/productList/productListStyles";

export default function ProductListHeader({
  searchText,
  setSearchText,
  onSearch,
  onOpenFilters,
  activeFiltersCount = 0,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.logoCenter}>
        <Logo size={34} textSize={32} style={styles.logoNoMargin} />
      </View>

      <View style={headerStyles.searchRow}>
        {/* Barra de búsqueda */}
        <View style={headerStyles.searchBarContainer}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar productos..."
            placeholderTextColor={COLORS.textMuted}
            style={headerStyles.searchInput}
            onSubmitEditing={onSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={headerStyles.searchButton} onPress={onSearch}>
            <Text style={headerStyles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* Botón de filtros */}
        <TouchableOpacity
          style={[
            headerStyles.filterButton,
            activeFiltersCount > 0 && headerStyles.filterButtonActive,
          ]}
          onPress={onOpenFilters}
          activeOpacity={0.8}
        >
          <Text
            style={[
              headerStyles.filterButtonText,
              activeFiltersCount > 0 && headerStyles.filterButtonTextActive,
            ]}
          >
            ⊟ Filtros
          </Text>
          {activeFiltersCount > 0 && (
            <View style={headerStyles.badge}>
              <Text style={headerStyles.badgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.dark,
    borderRadius: 10,
    padding: 5,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    paddingHorizontal: 14,
    marginRight: 6,
    height: 42,
  },
  searchButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 14,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 13,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.dark,
    backgroundColor: COLORS.white,
    height: 52,
  },
  filterButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.promoLight,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.dark,
  },
  filterButtonTextActive: {
    color: COLORS.primary,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },
});
