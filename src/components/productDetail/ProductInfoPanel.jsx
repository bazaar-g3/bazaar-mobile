import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { makeStyles } from "../../styles/productDetail/productDetailStyles";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import AnimatedButton from "../AnimatedButton";
import AnimatedHeart from "../AnimatedHeart";

export default function ProductInfoPanel({
  product,
  quantity,
  isOwnProduct,
  isAvailable,
  maxAddable = product?.stock ?? 0,
  cartLimitReached = false,
  isWishlisted = false,
  wishlistLoading = false,
  onSellerPress,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onManagePublication,
  onAddToCart,
  onShareProduct,
  onToggleWishlist,
  reputation = null,
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const isOutOfStock = product.stock === 0;
  const sellerInitial = (product.seller || "V")[0].toUpperCase();

  return (
    <View style={styles.rightColumn}>
      <Text style={styles.productTitle}>{product.name}</Text>

      <View style={styles.priceContainer}>
        <Text style={styles.currentPrice}>${product.price}</Text>
      </View>

      <TouchableOpacity style={styles.sellerCard} onPress={onSellerPress} activeOpacity={0.8}>
        <View style={styles.sellerAvatar}>
          <Text style={styles.sellerAvatarText}>{sellerInitial}</Text>
        </View>
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerLabel}>Vendido por</Text>
          <Text style={styles.sellerName} numberOfLines={1}>{product.seller}</Text>
          {reputation && reputation.review_count > 0 ? (
            <Text style={styles.sellerRating}>
              {'★ '}{Number(reputation.average_score).toFixed(1)}{' · '}{reputation.review_count}{reputation.review_count === 1 ? ' reseña' : ' reseñas'}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={16} color={theme.color.textMuted} />
      </TouchableOpacity>

      <View style={styles.descriptionBlock}>
        <Text style={styles.descriptionLabel}>DESCRIPCIÓN</Text>
        <Text style={styles.descriptionText}>{product.description}</Text>
      </View>

      <TouchableOpacity
        onPress={onShareProduct}
        style={styles.shareInline}
        activeOpacity={0.7}
      >
        <Ionicons name="share-outline" size={16} color={theme.color.accent} />
        <Text style={styles.shareInlineText}>Compartir</Text>
      </TouchableOpacity>

      {!isOwnProduct && isAvailable && !isOutOfStock ? (
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>
            Cantidad (Disponible: {product.stock}
            {maxAddable < product.stock ? ` · ${product.stock - maxAddable} en tu carrito` : ''})
          </Text>

          <View style={styles.quantitySelector}>
            <TouchableOpacity onPress={onDecreaseQuantity} style={[styles.qtyBtn, styles.qtyBtnFirst]}>
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{quantity}</Text>

            <TouchableOpacity
              onPress={onIncreaseQuantity}
              style={[styles.qtyBtn, styles.qtyBtnLast]}
              disabled={quantity >= maxAddable}
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
              <Text style={{ color: theme.color.error, marginBottom: 10, fontWeight: 'bold' }}>
                No hay stock disponible
              </Text>
            )}
            {!isOutOfStock && cartLimitReached && (
              <Text style={{ color: theme.color.error, marginBottom: 10, fontWeight: 'bold' }}>
                Ya tenés el máximo disponible en tu carrito
              </Text>
            )}

            <View style={styles.ctaRow}>
              <AnimatedHeart
                liked={isWishlisted}
                onToggle={() => onToggleWishlist?.()}
                size={22}
                style={styles.wishlistBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                inactiveColor={theme.color.textSecondary}
              />

              <View style={styles.cartButtonFlex}>
                <AnimatedButton
                  variant="cta"
                  showSuccess
                  label={
                    isOutOfStock
                      ? "SIN STOCK"
                      : cartLimitReached
                      ? "MÁXIMO EN CARRITO"
                      : "AÑADIR AL CARRITO"
                  }
                  disabled={isOutOfStock || !isAvailable || cartLimitReached}
                  onPress={onAddToCart}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
