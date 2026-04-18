import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/productDetail/productDetailStyles";

export default function ProductInfoPanel({
  product,
  safeFeatures,
  oldPrice,
  discountPercent,
  quantity,
  isOwnProduct,
  onSellerPress,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onManagePublication,
  onAddToCart,
}) {
  return (
    <View style={styles.rightColumn}>
      <Text style={styles.productTitle}>{product.name}</Text>

      <View style={styles.metaRow}>
        <View style={styles.promoBadge}>
          <Text style={styles.promoBadgeText}>OFERTA DESTACADA</Text>
        </View>
        <Text style={styles.ratingText}>
          ⭐ {product.rating} ({product.reviews})
        </Text>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.oldPrice}>${oldPrice}</Text>
        <Text style={styles.currentPrice}>${product.price}</Text>
        <Text style={styles.savings}>
          Ahorrá ${Number((oldPrice - product.price).toFixed(2))} ({discountPercent}% DTO)
        </Text>
      </View>

      <TouchableOpacity onPress={onSellerPress}>
        <Text style={[styles.sellerText, { textDecorationLine: "underline" }]}>
          Vendido por {product.seller}
        </Text>
      </TouchableOpacity>

      <View style={styles.stockRow}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{product.categoryName}</Text>
        </View>
        <Text style={styles.stockText}>Stock disponible: {product.stock}</Text>
      </View>

      <Text style={styles.descriptionText}>{product.description}</Text>

      <View style={styles.featuresBox}>
        {safeFeatures.map((feature, index) => (
          <Text key={index} style={styles.featureItem}>
            • {feature}
          </Text>
        ))}
      </View>

      {!isOwnProduct ? (
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Cantidad</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              onPress={onDecreaseQuantity}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{quantity}</Text>

            <TouchableOpacity
              onPress={onIncreaseQuantity}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        {isOwnProduct ? (
          <TouchableOpacity
            style={styles.manageButton}
            onPress={onManagePublication}
            activeOpacity={0.9}
          >
            <Text style={styles.manageButtonText}>GESTIONAR PUBLICACIÓN</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={onAddToCart}
            activeOpacity={0.9}
          >
            <Text style={styles.cartButtonText}>AÑADIR AL CARRITO</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}