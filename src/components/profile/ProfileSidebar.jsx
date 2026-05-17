import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/profile/profileStyles";

export const PROFILE_MENU_ITEMS = [
  { key: "Perfil", emoji: "👤" },
  { key: "Compras", emoji: "🛍️" },
  { key: "Publicaciones", emoji: "📌" },
  { key: "Ventas", emoji: "🏷️" },
  { key: "Wishlist", emoji: "❤️" },
  { key: "Cupones", emoji: "🎟️" },
];

export default function ProfileSidebar({
  activeTab,
  onSelectTab,
}) {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>Mi cuenta</Text>

      {PROFILE_MENU_ITEMS.map(({ key, emoji }) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.sidebarItem,
            activeTab === key && styles.sidebarItemActive,
          ]}
          onPress={() => onSelectTab(key)}
        >
          <Text style={styles.sidebarEmoji}>{emoji}</Text>

          <Text
            style={[
              styles.sidebarText,
              activeTab === key && styles.sidebarTextActive,
            ]}
          >
            {key}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}