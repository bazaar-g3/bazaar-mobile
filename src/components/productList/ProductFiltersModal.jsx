import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from "../../constants/colors";
import PriceRangeSlider from "./PriceRangeSlider";
import { PRICE_MIN_LIMIT, PRICE_MAX_LIMIT } from "../../constants/filters";

export default function ProductFiltersModal({
  visible,
  onClose,       // se llama al tocar backdrop o ✕ (solo cerrar)
  onApply,       // se llama al tocar "Ver resultados" (cerrar + aplicar)
  // Categorías
  loadingCategories,
  categoriesError,
  categories,
  activeCategory,
  onSelectCategory,
  // Precio
  minPrice,
  maxPrice,
  onPriceChange,
  // Orden
  activeSortBy,
  activeSection,
  onSortRecent,
  onSortRecommended,
  // Limpiar
  onClearFilters,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Fondo oscuro semi-transparente */}
      <TouchableOpacity
        style={modalStyles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Panel de filtros */}
      <SafeAreaView style={modalStyles.panel}>
        {/* Handle decorativo */}
        <View style={modalStyles.handleBar} />

        {/* Header del panel */}
        <View style={modalStyles.panelHeader}>
          <Text style={modalStyles.panelTitle}>Filtros</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={modalStyles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={modalStyles.scrollArea}
          contentContainerStyle={modalStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── CATEGORÍAS ── */}
          <View style={modalStyles.section}>
            <Text style={modalStyles.sectionTitle}>CATEGORÍAS</Text>

            {loadingCategories ? (
              <View style={modalStyles.loadingRow}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={modalStyles.loadingText}>Cargando...</Text>
              </View>
            ) : categoriesError ? (
              <Text style={modalStyles.errorText}>{categoriesError}</Text>
            ) : (
              <View style={modalStyles.chipGrid}>
                {categories.map((cat) => {
                  const isSame = activeCategory?.slug
                    ? activeCategory.slug === cat.slug
                    : activeCategory?.id === cat.id;
                  const active = !!activeCategory && isSame;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[modalStyles.chip, active && modalStyles.chipActive]}
                      onPress={() => onSelectCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Text style={[modalStyles.chipText, active && modalStyles.chipTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── PRECIO ── */}
          <View style={modalStyles.section}>
            <Text style={modalStyles.sectionTitle}>PRECIO</Text>
            <PriceRangeSlider
              minValue={minPrice}
              maxValue={maxPrice}
              minLimit={PRICE_MIN_LIMIT}
              maxLimit={PRICE_MAX_LIMIT}
              onChange={onPriceChange}
            />
          </View>

          {/* ── ORDENAR ── */}
          <View style={modalStyles.section}>
            <Text style={modalStyles.sectionTitle}>ORDENAR POR</Text>
            <View style={modalStyles.sortRow}>
              <TouchableOpacity
                style={[
                  modalStyles.sortChip,
                  activeSortBy === "recent" && modalStyles.sortChipActive,
                ]}
                onPress={onSortRecent}
              >
                <Text
                  style={[
                    modalStyles.sortChipText,
                    activeSortBy === "recent" && modalStyles.sortChipTextActive,
                  ]}
                >
                  Más recientes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  modalStyles.sortChip,
                  activeSection === "recommended" && modalStyles.sortChipActive,
                ]}
                onPress={onSortRecommended}
              >
                <Text
                  style={[
                    modalStyles.sortChipText,
                    activeSection === "recommended" && modalStyles.sortChipTextActive,
                  ]}
                >
                  Recomendados
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Botones de acción en el pie */}
        <View style={modalStyles.footer}>
          <TouchableOpacity style={modalStyles.clearBtn} onPress={onClearFilters}>
            <Text style={modalStyles.clearBtnText}>Limpiar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.applyBtn} onPress={onApply ?? onClose}>
            <Text style={modalStyles.applyBtnText}>Ver resultados</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  panel: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.divider,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.dark,
  },
  closeButton: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 14,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
  },
  // Chips de categoría (layout en wrap)
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.white,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.promoLight,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.dark,
    fontWeight: "600",
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  // Chips de orden
  sortRow: {
    flexDirection: "row",
    gap: 10,
  },
  sortChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.divider,
    alignItems: "center",
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
  // Footer con botones
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: "center",
  },
  clearBtnText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 15,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  applyBtnText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 15,
  },
});
