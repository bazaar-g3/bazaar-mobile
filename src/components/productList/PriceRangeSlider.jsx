import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { PRICE_MIN_LIMIT, PRICE_MAX_LIMIT } from "../../constants/filters";

/**
 * Filtro de rango de precios con dos inputs (mínimo y máximo).
 *
 * Props:
 *   minValue   — precio mínimo seleccionado actualmente
 *   maxValue   — precio máximo seleccionado actualmente
 *   minLimit   — límite inferior del rango
 *   maxLimit   — límite superior del rango
 *   onChange   — callback(minValue, maxValue) al confirmar el valor
 */
export default function PriceRangeSlider({
  minValue,
  maxValue,
  minLimit = PRICE_MIN_LIMIT,
  maxLimit = PRICE_MAX_LIMIT,
  onChange,
}) {
  const { theme } = useTheme();
  const priceStyles = useMemo(() => makeStyles(theme), [theme]);
  const [minText, setMinText] = useState(minValue > minLimit ? String(minValue) : "");
  const [maxText, setMaxText] = useState(maxValue < maxLimit ? String(maxValue) : "");

  // Sincronizar cuando el padre resetea los valores (ej. "Limpiar filtros")
  useEffect(() => {
    setMinText(minValue > minLimit ? String(minValue) : "");
    setMaxText(maxValue < maxLimit ? String(maxValue) : "");
  }, [minValue, maxValue, minLimit, maxLimit]);

  const commit = (rawMin, rawMax) => {
    const parsedMin = rawMin === "" ? minLimit : Math.max(minLimit, Number(rawMin) || minLimit);
    const parsedMax = rawMax === "" ? maxLimit : Math.min(maxLimit, Number(rawMax) || maxLimit);
    const safeMin = Math.min(parsedMin, parsedMax);
    const safeMax = Math.max(parsedMin, parsedMax);
    onChange?.(safeMin, safeMax);
  };

  const handleMinBlur = () => commit(minText, maxText);
  const handleMaxBlur = () => commit(minText, maxText);

  const handleMinSubmit = () => commit(minText, maxText);
  const handleMaxSubmit = () => commit(minText, maxText);

  const formatHint = (val) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  return (
    <View style={priceStyles.container}>
      {/* Indicador de rango activo */}
      {(minValue > minLimit || maxValue < maxLimit) && (
        <View style={priceStyles.activeRange}>
          <Text style={priceStyles.activeRangeText}>
            {formatHint(minValue)} — {formatHint(maxValue)}
          </Text>
        </View>
      )}

      <View style={priceStyles.row}>
        {/* Input mínimo */}
        <View style={priceStyles.inputGroup}>
          <Text style={priceStyles.inputLabel}>Mínimo</Text>
          <View style={priceStyles.inputWrapper}>
            <Text style={priceStyles.currency}>$</Text>
            <TextInput
              style={priceStyles.input}
              value={minText}
              onChangeText={setMinText}
              onBlur={handleMinBlur}
              onSubmitEditing={handleMinSubmit}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.color.textMuted}
              returnKeyType="done"
            />
          </View>
        </View>

        <View style={priceStyles.separator}>
          <Text style={priceStyles.separatorText}>—</Text>
        </View>

        {/* Input máximo */}
        <View style={priceStyles.inputGroup}>
          <Text style={priceStyles.inputLabel}>Máximo</Text>
          <View style={priceStyles.inputWrapper}>
            <Text style={priceStyles.currency}>$</Text>
            <TextInput
              style={priceStyles.input}
              value={maxText}
              onChangeText={setMaxText}
              onBlur={handleMaxBlur}
              onSubmitEditing={handleMaxSubmit}
              keyboardType="numeric"
              placeholder="sin límite"
              placeholderTextColor={theme.color.textMuted}
              returnKeyType="done"
            />
          </View>
        </View>
      </View>

      {/* Accesos rápidos de rango */}
      <View style={priceStyles.quickRow}>
        {[
          { label: "Hasta $10k", max: 10000 },
          { label: "Hasta $50k", max: 50000 },
          { label: "Hasta $100k", max: 100000 },
        ].map((preset) => {
          // Solo activo si el maxValue es exactamente este preset
          const active = maxValue === preset.max;
          return (
            <TouchableOpacity
              key={preset.label}
              style={[priceStyles.quickChip, active && priceStyles.quickChipActive]}
              onPress={() => {
                if (active) {
                  // Toggle: deseleccionar vuelve al límite máximo
                  setMaxText("");
                  setMinText("");
                  onChange?.(minLimit, maxLimit);
                } else {
                  setMaxText(String(preset.max));
                  setMinText("");
                  onChange?.(minLimit, preset.max);
                }
              }}
            >
              <Text style={[priceStyles.quickChipText, active && priceStyles.quickChipTextActive]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: {
    gap: 12,
  },
  activeRange: {
    backgroundColor: theme.color.accentTint,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  activeRangeText: {
    color: theme.color.accent,
    fontWeight: "800",
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    color: theme.color.textSecondary,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.color.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
    backgroundColor: theme.color.surface,
  },
  currency: {
    fontSize: 15,
    color: theme.color.textSecondary,
    marginRight: 2,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.color.textPrimary,
    fontWeight: "700",
    height: "100%",
  },
  separator: {
    paddingTop: 22,
  },
  separatorText: {
    color: theme.color.textMuted,
    fontSize: 16,
    fontWeight: "700",
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
  },
  quickChipActive: {
    borderColor: theme.color.accent,
    backgroundColor: theme.color.accentTint,
  },
  quickChipText: {
    fontSize: 11,
    color: theme.color.textSecondary,
    fontWeight: "600",
  },
  quickChipTextActive: {
    color: theme.color.accent,
    fontWeight: "800",
  },
});
