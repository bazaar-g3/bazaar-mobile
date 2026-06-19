import React, { useMemo } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

export default function SearchBar({ value, onChangeText, onSearch, style }) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={[s.wrapper, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar productos..."
        placeholderTextColor={theme.color.textMuted}
        style={s.input}
        onSubmitEditing={onSearch}
        returnKeyType="search"
      />
      <TouchableOpacity style={s.button} onPress={onSearch} accessibilityLabel="Buscar">
        <Ionicons name="search" size={20} color={theme.color.onAccent} />
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: 6,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: theme.space.lg,
    color: theme.color.textPrimary,
    fontSize: theme.type.body.size,
  },
  button: {
    backgroundColor: theme.color.accent,
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
});
