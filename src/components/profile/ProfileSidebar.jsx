import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { styles } from "../../styles/profile/profileStyles";

export const PROFILE_MENU_ITEMS = [
  { key: "Perfil",        icon: "person-outline",      activeIcon: "person",       color: "#4A90D9" }, // azul
  { key: "Publicaciones", icon: "pricetag-outline",     activeIcon: "pricetag",     color: "#69BDB6" }, // teal
  { key: "Ventas",        icon: "trending-up-outline",  activeIcon: "trending-up",  color: "#2E7D32" }, // verde
  { key: "Wishlist",      icon: "heart-outline",        activeIcon: "heart",        color: "#D14B79" }, // rosa
  { key: "Cupones",       icon: "ticket-outline",       activeIcon: "ticket",       color: "#7C5ACB" }, // violeta
];

export default function ProfileSidebar({
  activeTab,
  onSelectTab,
}) {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>Mi cuenta</Text>

      {PROFILE_MENU_ITEMS.map(({ key, icon, activeIcon, color }) => {
        const isActive = activeTab === key;
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.sidebarItem,
              isActive && styles.sidebarItemActive,
            ]}
            onPress={() => onSelectTab(key)}
          >
            <Ionicons
              name={isActive ? activeIcon : icon}
              size={20}
              color={isActive ? color : COLORS.textMuted}
            />

            <Text
              style={[
                styles.sidebarText,
                isActive && styles.sidebarTextActive,
              ]}
            >
              {key}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
