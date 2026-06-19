import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../theme/ThemeContext";

export default function SectionHeader({ title, actionText, onPressAction }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {actionText ? (
        <TouchableOpacity onPress={onPressAction}>
          <Text style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: theme.color.textPrimary,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.color.accent,
  },
});