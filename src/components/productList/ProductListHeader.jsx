import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";
import AnimatedPressable from "../AnimatedPressable";
import { makeStyles } from "../../styles/productList/headerStyles";

const SORT_OPTIONS = [
  { value: "newest",     label: "Recientes"    },
  { value: "price_asc",  label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "relevance",  label: "Relevancia"   },
];

export default function ProductListHeader({
  screenTitle,
  screenSubtitle,
  searchText,
  setSearchText,
  onSearch,
  onOpenFilters,
  onGoHome,
  activeFiltersCount = 0,
  activeSortBy,
  onSortChange,
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={[s.header, { paddingTop: insets.top + theme.space.md }]}>
      {/* Título + filtros */}
      <View style={s.titleRow}>
        {/* Botón explícito para volver al inicio (no hay header nativo en el Stack) */}
        <TouchableOpacity
          onPress={onGoHome}
          style={s.backBtn}
          activeOpacity={0.8}
          accessibilityLabel="Volver al inicio"
        >
          <Ionicons name="arrow-back" size={26} color={theme.color.accent} />
        </TouchableOpacity>

        <View style={s.titleBlock}>
          <Text style={s.title} numberOfLines={1}>{screenTitle}</Text>
          {screenSubtitle ? (
            <Text style={s.subtitle}>{screenSubtitle}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[s.filterBtn, activeFiltersCount > 0 && s.filterBtnActive]}
          onPress={onOpenFilters}
          activeOpacity={0.8}
          accessibilityLabel={`Filtros${activeFiltersCount > 0 ? `, ${activeFiltersCount} activos` : ""}`}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={activeFiltersCount > 0 ? theme.color.onAccent : theme.color.textPrimary}
          />
          {activeFiltersCount > 0 && (
            <Text style={s.filterBtnCount}>{activeFiltersCount}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      <View style={s.searchBar}>
        <Ionicons name="search-outline" size={16} color={theme.color.textMuted} style={s.searchIcon} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar productos..."
          placeholderTextColor={theme.color.textMuted}
          style={s.searchInput}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={theme.color.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Chips de orden */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chipsRow}
      >
        {SORT_OPTIONS.map(({ value, label }) => {
          const active = activeSortBy === value;
          return (
            <AnimatedPressable
              key={value}
              style={[s.chip, active && s.chipActive]}
              onPress={() => onSortChange(active ? null : value)}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>
                {label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </View>
  );
}