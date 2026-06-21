import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { makeStyles } from "../../styles/productList/productListStyles";
import { Ionicons } from "@expo/vector-icons";

export default function ProductListEmptyState({
  loading = false,
  icon,
  title,
  text,
  buttonText,
  onPress,
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.emptyState}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color={theme.color.accent} />
          <Text style={styles.emptyText}>{text}</Text>
        </>
      ) : (
        <>
          {icon ? (<Ionicons name={icon} size={48} color={theme.color.textSecondary} style={styles.emptyIcon}/>) : null}
          <Text style={styles.emptyTitle}>{title}</Text>
          <Text style={styles.emptyText}>{text}</Text>

          {buttonText && onPress ? (
            <TouchableOpacity style={styles.retryButton} onPress={onPress}>
              <Text style={styles.retryButtonText}>{buttonText}</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}
    </View>
  );
}