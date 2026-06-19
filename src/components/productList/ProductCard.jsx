import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../theme/ThemeContext";
import AnimatedButton from "../AnimatedButton";
import { formatPrice } from "../../utils/productList/productListHelpers";

const ROW_IMG_SIZE = 88;
const AVATAR_SIZE  = 20;
const HEART_BTN_SIZE = 32;

export default function ProductCard({
  item,
  onOpenProduct,
  onAddToCart,
  onWishlistToggle,
  isWishlisted = false,
  cardStyle,
  layout = "grid",
}) {
  const [liked, setLiked] = useState(isWishlisted);
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const isRow = layout === "row";

  React.useEffect(() => { setLiked(isWishlisted); }, [isWishlisted]);

  if (!item) return null;

  const goToProduct = () => onOpenProduct(item.id);

  const handleLike = async () => {
    if (Platform.OS === "ios") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newLiked = !liked;
    setLiked(newLiked);
    if (onWishlistToggle) onWishlistToggle(item.id, newLiked);
  };

  const sellerInitial = (item.seller || "V")[0].toUpperCase();

  const heartIcon = (
    <Ionicons
      name={liked ? "heart" : "heart-outline"}
      size={20}
      color={liked ? theme.color.like : "#cbd5e1"}
    />
  );

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
              <TouchableOpacity
                style={s.heartBtnInline}
                onPress={handleLike}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={liked ? "Quitar de favoritos" : "Agregar a favoritos"}
                accessibilityRole="button"
                activeOpacity={0.7}
              >
                {heartIcon}
              </TouchableOpacity>
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
      <TouchableOpacity
        style={s.heartBtn}
        onPress={handleLike}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={liked ? "Quitar de favoritos" : "Agregar a favoritos"}
        accessibilityRole="button"
        activeOpacity={0.7}
      >
        {heartIcon}
      </TouchableOpacity>

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

const makeStyles = (theme) => StyleSheet.create({
  // ── Card base ──
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.image,
  },

  // ── Grid: imagen cuadrada arriba ──
  imageBox: {
    width: "100%",
    aspectRatio: 1,
    borderTopLeftRadius: theme.radius.image,
    borderTopRightRadius: theme.radius.image,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.color.surfaceSubtle,
  },
  tagBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: theme.color.like,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.color.onAccent,
    letterSpacing: 0.2,
  },

  // Corazón absolute (grid)
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: HEART_BTN_SIZE,
    height: HEART_BTN_SIZE,
    borderRadius: HEART_BTN_SIZE / 2,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  // ── Contenido texto (grid) ──
  content: {
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.sm,
    paddingBottom: theme.space.xs,
    gap: theme.space.xs,
  },
  name: {
    fontSize: theme.type.name.size,
    fontWeight: theme.type.name.weight,
    lineHeight: theme.type.name.lineHeight,
    color: theme.color.textPrimary,
    minHeight: theme.type.name.lineHeight * 2,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.xs,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: theme.color.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 9,
    fontWeight: "700",
    color: theme.color.textSecondary,
  },
  sellerName: {
    flex: 1,
    fontSize: theme.type.seller.size,
    fontWeight: theme.type.seller.weight,
    color: theme.color.textSecondary,
  },
  ratingText: {
    fontSize: theme.type.meta.size,
    fontWeight: theme.type.meta.weight,
    color: theme.color.textMuted,
  },

  // ── Fila precio (compartida) ──
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.space.md,
    paddingBottom: theme.space.md,
    paddingTop: theme.space.xs,
  },
  price: {
    fontSize: theme.type.price.size,
    fontWeight: theme.type.price.weight,
    color: theme.color.textPrimary,
  },
  // ── Row layout ──
  cardRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  imageAreaRow: {
    width: ROW_IMG_SIZE,
    flexShrink: 0,
    alignSelf: "stretch",
  },
  imageBoxRow: {
    flex: 1,
    overflow: "hidden",
    borderTopLeftRadius: theme.radius.image,
    borderBottomLeftRadius: theme.radius.image,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  rowBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  contentRow: {
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.sm,
    paddingBottom: theme.space.xs,
    gap: theme.space.xs,
  },
  tagBadgeRow: {
    alignSelf: "flex-start",
    backgroundColor: theme.color.like,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.xs,
  },
  heartBtnInline: {
    width: HEART_BTN_SIZE,
    height: HEART_BTN_SIZE,
    borderRadius: HEART_BTN_SIZE / 2,
    backgroundColor: theme.color.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
});
