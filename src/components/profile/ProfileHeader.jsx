import React from "react";
import { View, TouchableOpacity } from "react-native";
import Logo from "../Logo";
import { styles } from "../../styles/profile/profileStyles";

export default function ProfileHeader({ onToggleMenu }) {
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

        <View style={styles.logoCenter}>
          <Logo size={30} textSize={28} />
        </View>

        {/* Placeholder para mantener el logo centrado */}
        <View style={styles.hamburgerButton} />
      </View>
    </View>
  );
}
