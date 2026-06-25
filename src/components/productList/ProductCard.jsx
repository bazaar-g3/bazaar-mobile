import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import AnimatedButton from "../AnimatedButton";
import AnimatedHeart from "../AnimatedHeart";
import { formatPrice } from "../../utils/productList/productListHelpers";
import { makeStyles } from "../../styles/productList/productCardStyles";

export default function ProductCard({
  item,
  onOpenProduct,
  onAddToCart,
  onWishlistToggle,
  isWishlisted = false,
  cardStyle,
  layout = "grid",
}) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const isRow = layout === "row";

  if (!item) return null;

  const goToProduct = () => onOpenProduct(item.id);

  const handleWishlist = (next) => {
    if (onWishlistToggle) onWishlistToggle(item.id, next);
  };

  const sellerInitial = (item.seller || "V")[0].toUpperCase();

  const sellerRow = item.seller ? (
    <View style={s.sellerRow}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{sellerInitial}</Text>
      </View>
      <Text style={s.sellerName} numberOfLines={1} ellipsizeMode="tail">
        {item.seller}
      </Text>
      {item.rating != null && (
        <>
          <Ionicons name="star" size={10} color={theme.color.rating} />
          <Text style={s.ratingText}>{Number(item.rating).toFixed(1)}</Text>
        </>
      )}
    </View>
  ) : null;

  // ── Row layout ────────────────────────────────────────────────────────────
  if (isRow) {
    return (
      <View style={[s.card, s.cardRow, cardStyle]}>

        {/* Image — left column */}
        <TouchableOpacity
          style={s.imageAreaRow}
          activeOpacity={0.9}
          onPress={goToProduct}
          accessibilityRole="button"
          accessibilityLabel={`Ver ${item.name}`}
        >
          <View style={s.imageBoxRow}>
            <Image source={{ uri: item.image }} style={s.image} resizeMode="cover" />
          </View>
        </TouchableOpacity>

        {/* Right body */}
        <View style={s.rowBody}>

          {/* Text zone */}
          <TouchableOpacity activeOpacity={0.7} onPress={goToProduct} accessibilityLabel={item.name}>
            <View style={s.contentRow}>
              <Text style={s.name} numberOfLines={2}>{item.name}</Text>
              {sellerRow}
              {item.tag ? (
                <View style={s.tagBadgeRow}>
                  <Text style={s.tagText}>{item.tag}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>

          {/* Price + actions */}
          <View style={s.priceRow}>
            <Text style={s.price}>{formatPrice(item.price)}</Text>
            <View style={s.rowActions}>
              <AnimatedHeart
                liked={isWishlisted}
                onToggle={handleWishlist}
                size={20}
                style={s.heartBtnInline}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              />
              <AnimatedButton
                compact
                variant="cta"
                showSuccess
                label="Agregar al carrito"
                icon={<Ionicons name="add" size={20} color={theme.color.onAccent} />}
                onPress={() => onAddToCart(item.id)}
              />
            </View>
          </View>

        </View>
      </View>
    );
  }

  // ── Grid layout (default) ─────────────────────────────────────────────────
  return (
    <View style={[s.card, cardStyle]}>

      {/* Image zone */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={goToProduct}
        accessibilityRole="button"
        accessibilityLabel={`Ver ${item.name}`}
      >
        <View style={s.imageBox}>
          <Image source={{ uri: item.image }} style={s.image} resizeMode="cover" />
          {item.tag ? (
            <View style={s.tagBadge}>
              <Text style={s.tagText}>{item.tag}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Corazón — absolute, sibling de los Touchables */}
      <AnimatedHeart
        liked={isWishlisted}
        onToggle={handleWishlist}
        size={20}
        style={s.heartBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      />

      {/* Texto */}
      <TouchableOpacity activeOpacity={0.7} onPress={goToProduct} accessibilityLabel={item.name}>
        <View style={s.content}>
          <Text style={s.name} numberOfLines={2}>{item.name}</Text>
          {sellerRow}
        </View>
      </TouchableOpacity>

      {/* Precio + botón + */}
      <View style={s.priceRow}>
        <Text style={s.price}>{formatPrice(item.price)}</Text>
        <AnimatedButton
          compact
          variant="cta"
          showSuccess
          label="Agregar al carrito"
          icon={<Ionicons name="add" size={20} color={theme.color.onAccent} />}
          onPress={() => onAddToCart(item.id)}
        />
      </View>

    </View>
  );
}