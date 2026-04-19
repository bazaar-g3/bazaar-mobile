import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Logo from "../Logo";
import { styles } from "../../styles/productDetail/productDetailStyles";

export default function ProductDetailHeader() {
  const router = useRouter();

  function handleGoHome() {
    router.replace("/home");
  }

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