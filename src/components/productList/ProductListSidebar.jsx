import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { COLORS } from "../../constants/colors";
import { styles } from "../../styles/productList/productListStyles";
import PriceRangeSlider from "./PriceRangeSlider";

const PRICE_MIN_LIMIT = 0;
const PRICE_MAX_LIMIT = 50000;

export default function ProductListSidebar({
  loadingCategories,
  categoriesError,
  categories,
  isCategoryActive,
  onSelectCategory,
  onSortRecent,
  onSortRecommended,
  onClearFilters,
  minPrice,
  maxPrice,
  onPriceChange,
}) {
  return (
    <View style={styles.sidebar}>
      <ScrollView showsVerticalScrollIndicator={false}>
      {/* ── CATEGORÍAS ── */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>CATEGORÍAS</Text>
          <Text style={styles.filterIcon}>−</Text>
        </View>

        {loadingCategories ? (
          <View style={styles.sidebarStatus}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.sidebarStatusText}>Cargando...</Text>
          </View>
        ) : categoriesError ? (
          <Text style={styles.sidebarErrorText}>{categoriesError}</Text>
        ) : (
          categories.map((cat) => {
            const active = isCategoryActive(cat);
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.checkboxRow}
                onPress={() => onSelectCategory(cat)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, active && styles.checkboxActive]} />
                <Text style={[styles.filterItem, active && styles.filterItemActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* ── PRECIO ── */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>PRECIO</Text>
          <Text style={styles.filterIcon}>−</Text>
        </View>

        <PriceRangeSlider
          minValue={minPrice}
          maxValue={maxPrice}
          minLimit={PRICE_MIN_LIMIT}
          maxLimit={PRICE_MAX_LIMIT}
          step={500}
          onChange={onPriceChange}
        />
      </View>

      {/* ── ORDENAR ── */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>ORDENAR</Text>
          <Text style={styles.filterIcon}>−</Text>
        </View>

        <TouchableOpacity style={styles.filterAction} onPress={onSortRecent}>
          <Text style={styles.filterActionText}>Más recientes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterAction} onPress={onSortRecommended}>
          <Text style={styles.filterActionText}>Recomendados</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={onClearFilters}>
          <Text style={styles.clearButtonText}>Limpiar filtros</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}
