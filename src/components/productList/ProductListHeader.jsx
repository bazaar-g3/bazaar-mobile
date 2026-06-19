import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";

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
            <TouchableOpacity
              key={value}
              style={[s.chip, active && s.chipActive]}
              onPress={() => onSortChange(active ? null : value)}
              activeOpacity={0.8}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  header: {
    backgroundColor: theme.color.surface,
    paddingHorizontal: theme.space.lg,
    paddingBottom: theme.space.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    gap: theme.space.md,
  },

  // ── Fila título ──
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.space.sm,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: theme.type.title.size,
    fontWeight: theme.type.title.weight,
    letterSpacing: theme.type.title.letterSpacing,
    color: theme.color.textPrimary,
  },
  subtitle: {
    fontSize: theme.type.meta.size,
    fontWeight: theme.type.meta.weight,
    color: theme.color.textMuted,
    marginTop: 2,
  },

  // Botón "volver al inicio": flecha a la izquierda del título, área táctil 44×44 centrada
  backBtn: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },

  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: theme.color.accent,
    borderColor: theme.color.accent,
  },
  filterBtnCount: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.color.onAccent,
  },

  // ── Búsqueda ──
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space.md,
    height: 44,
    gap: theme.space.sm,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.color.textPrimary,
  },

  // ── Chips de orden ──
  chipsRow: {
    flexDirection: "row",
    gap: theme.space.sm,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm - 2,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.surfaceSubtle,
    minHeight: 32,
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: theme.color.accent,
  },
  chipText: {
    fontSize: theme.type.chip.size,
    fontWeight: theme.type.chip.weight,
    color: theme.color.textSecondary,
  },
  chipTextActive: {
    color: theme.color.onAccent,
  },
});
