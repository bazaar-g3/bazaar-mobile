import React, { useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { makeStyles } from "../../styles/profile/profileStyles";

export default function ProfileHeader({ onToggleMenu }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.topHeader}>
      <View style={styles.topHeaderContent}>
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={onToggleMenu}
        >
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
