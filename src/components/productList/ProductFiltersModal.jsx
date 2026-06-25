import React, { useMemo, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "../../theme/ThemeContext";
import PriceRangeSlider from "./PriceRangeSlider";
import { PRICE_MIN_LIMIT, PRICE_MAX_LIMIT } from "../../constants/filters";
import { makeStyles } from "../../styles/productList/productFilterStyles";

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
  // Limpiar
  onClearFilters,
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const modalStyles = useMemo(() => makeStyles(theme), [theme]);
  const priceRef = useRef(null);

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

      {/* Panel de filtros — paddingBottom manual para respetar home indicator */}
      <View style={[modalStyles.panel, { paddingBottom: insets.bottom || 8 }]}>
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
            <Text style={modalStyles.sectionTitle}>Categorías</Text>

            {loadingCategories ? (
              <View style={modalStyles.loadingRow}>
                <ActivityIndicator size="small" color={theme.color.accent} />
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
            <Text style={modalStyles.sectionTitle}>Precio</Text>
            <PriceRangeSlider
              ref={priceRef}
              minValue={minPrice}
              maxValue={maxPrice}
              minLimit={PRICE_MIN_LIMIT}
              maxLimit={PRICE_MAX_LIMIT}
              onChange={onPriceChange}
            />
          </View>

        </ScrollView>

        {/* Botones de acción en el pie */}
        <View style={modalStyles.footer}>
          <TouchableOpacity style={modalStyles.clearBtn} onPress={onClearFilters}>
            <Text style={modalStyles.clearBtnText}>Limpiar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={modalStyles.applyBtn}
            onPress={() => {
              const prices = priceRef.current?.commit();
              (onApply ?? onClose)?.(prices);
            }}
          >
            <Text style={modalStyles.applyBtnText}>Ver resultados</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}