import React from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../Logo";
import { COLORS } from "../../constants/colors";
import { styles } from "../../styles/productList/productListStyles";

const SORT_OPTIONS = [
  { value: "newest",     label: "Más recientes" },
  { value: "price_asc",  label: "Menor precio"  },
  { value: "price_desc", label: "Mayor precio"  },
  { value: "relevance",  label: "Relevancia"    },
];

export default function ProductListHeader({
  searchText,
  setSearchText,
  onSearch,
  onOpenFilters,
  activeFiltersCount = 0,
  activeSortBy,
  onSortChange,
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
          <TouchableOpacity style={headerStyles.searchButton} onPress={onSearch} accessibilityLabel="Buscar">
            <Ionicons name="search" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Botón filtros */}
        <TouchableOpacity
          style={[
            headerStyles.filterButton,
            activeFiltersCount > 0 && headerStyles.filterButtonActive,
          ]}
          onPress={onOpenFilters}
          activeOpacity={0.8}
          accessibilityLabel="Filtros"
        >
          <Ionicons
            name="funnel-outline"
            size={20}
            color={activeFiltersCount > 0 ? COLORS.primary : COLORS.dark}
          />
          {activeFiltersCount > 0 && (
            <View style={headerStyles.badge}>
              <Text style={headerStyles.badgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Fila de ordenamiento */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={headerStyles.sortRow}
        style={headerStyles.sortScroll}
      >
        {SORT_OPTIONS.map(({ value, label }) => {
          const active = activeSortBy === value;
          return (
            <TouchableOpacity
              key={value}
              style={[headerStyles.sortChip, active && headerStyles.sortChipActive]}
              onPress={() => onSortChange(active ? null : value)}
              activeOpacity={0.8}
            >
              <Text style={[headerStyles.sortChipText, active && headerStyles.sortChipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
    minWidth: 0,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    paddingHorizontal: 14,
    marginRight: 6,
    height: 42,
  },
  searchButton: {
    flexShrink: 0,
    width: 42,
    height: 42,
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  filterButton: {
    flexShrink: 0,
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
  sortScroll: {
    marginTop: 10,
  },
  sortRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.white,
  },
  sortChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.promoLight,
  },
  sortChipText: {
    fontSize: 13,
    color: COLORS.dark,
    fontWeight: "600",
  },
  sortChipTextActive: {
    color: COLORS.primary,
    fontWeight: "800",
  },
});
