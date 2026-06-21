import { StyleSheet } from 'react-native'
import { SPACING, FONT } from '../../constants/theme'

export const makeStyles = (theme) => StyleSheet.create({
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