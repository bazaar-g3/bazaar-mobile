import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Logo from "../Logo";
import { styles } from "../../styles/productDetail/productDetailStyles";

export default function ProductDetailHeader({ onBack }) {
  return (
    <View style={styles.topHeader}>
      <View style={styles.topHeaderContent}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.headerBack}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.logoCenter}>
          <Logo size={32} textSize={30} />
        </View>
      </View>
    </View>
  );
}