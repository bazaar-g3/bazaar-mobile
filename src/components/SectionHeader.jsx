import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const COLORS = {
  text: "#1F1F1F",
  purple: "#6C3BFF",
};

export default function SectionHeader({ title, actionText, onPressAction }) {
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

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.text,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.purple,
  },
});