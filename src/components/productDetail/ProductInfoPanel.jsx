import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/productDetail/productDetailStyles";
import { Ionicons } from "@expo/vector-icons";

export default function ProductInfoPanel({
  product,
  quantity,
  isOwnProduct,
  isAvailable,
  onSellerPress,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onManagePublication,
  onAddToCart,
  onShareProduct,
}) {

  const isOutOfStock = product.stock === 0;

  return (
    <View style={styles.rightColumn}>
      <Text style={styles.productTitle}>{product.name}</Text>

      <View style={styles.priceContainer}>
        <Text style={styles.currentPrice}>${product.price}</Text>
      </View>

      <TouchableOpacity onPress={onSellerPress}>
        <Text style={[styles.sellerText, { textDecorationLine: "underline" }]}>
          Vendido por {product.seller}
        </Text>
      </TouchableOpacity>

      <Text style={styles.descriptionText}>{product.description}</Text>

      <TouchableOpacity
        onPress={onShareProduct}
        style={styles.shareInline}
        activeOpacity={0.7}
      >
        <Ionicons name="share-outline" style={styles.shareIcon} />
        <Text style={styles.shareInlineText}>Compartir</Text>
      </TouchableOpacity>

      {!isOwnProduct && isAvailable && !isOutOfStock ? (
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Cantidad (Stock: {product.stock})</Text>

          <View style={styles.quantitySelector}>
            <TouchableOpacity onPress={onDecreaseQuantity} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{quantity}</Text>

            <TouchableOpacity 
              onPress={onIncreaseQuantity} 
              style={styles.qtyBtn}
              disabled={quantity >= product.stock} 
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
          <View>
            {isOutOfStock && (
              <Text style={{ color: 'red', marginBottom: 10, fontWeight: 'bold' }}>
                No hay stock disponible
              </Text>
            )}
            
            <TouchableOpacity
              style={[styles.cartButton, isOutOfStock && { backgroundColor: '#ccc' }]}
              onPress={onAddToCart}
              activeOpacity={0.9}
              disabled={isOutOfStock || !isAvailable} // Se deshabilita la acción
            >
              <Text style={styles.cartButtonText}>
                {isOutOfStock ? "SIN STOCK" : "AÑADIR AL CARRITO"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}