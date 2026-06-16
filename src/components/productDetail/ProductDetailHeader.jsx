import React, { useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Logo from "../Logo";
import { useTheme } from "../../theme/ThemeContext";
import { makeStyles } from "../../styles/productDetail/productDetailStyles";

export default function ProductDetailHeader() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.topHeader}>
      <View style={styles.topHeaderContent}>
        <View style={styles.leftPlaceholder} />

        <View style={styles.logoCenter}>
          <Logo size={34} textSize={32} style={styles.logoNoMargin} />
        </View>
      </View>
    </View>
  );
}