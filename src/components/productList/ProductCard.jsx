import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { styles } from "../../styles/productList/productListStyles";
import { formatPrice } from "../../utils/productList/productListHelpers";

export default function ProductCard({
  item,
  onOpenProduct,
  onAddToCart,
  cardStyle,
  imageStyle,
}) {
  return (
    <View style={[styles.card, cardStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onOpenProduct(item.id)}
      >
        <Image source={{ uri: item.image }} style={[styles.productImage, imageStyle]} />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        {item.tag ? (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        ) : null}

        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.btnCart}
            onPress={() => onAddToCart(item.id)}
          >
            <Text style={styles.btnText}>AÑADIR AL CARRITO</Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}