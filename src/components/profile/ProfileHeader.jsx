import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Logo from "../Logo";
import { styles } from "../../styles/profile/profileStyles";

export default function ProfileHeader({ onToggleMenu, onGoHome }) {
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

        <TouchableOpacity style={styles.homeButton} onPress={onGoHome}>
          <Text style={styles.homeButtonText}>Inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}