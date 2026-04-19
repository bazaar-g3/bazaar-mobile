import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { FONT } from "../../constants/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 16,
    paddingBottom: 28,
  },

  breadcrumb: {
    marginBottom: 14,
  },

  breadcrumbText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
  },

  mainCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },

  leftColumn: {
    width: "44%",
    paddingRight: 16,
  },

  imageWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  productImage: {
    width: "100%",
    height: 260,
    resizeMode: "contain",
  },

  thumbnailRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
    gap: 10,
  },

  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    padding: 5,
    backgroundColor: COLORS.white,
  },

  activeThumbnail: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },

  thumbnailImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  rightColumn: {
    width: "56%",
  },

  productTitle: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },

  promoBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },

  promoBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.white,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },

  priceContainer: {
    marginBottom: 12,
  },

  currentPrice: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.secondary,
    marginBottom: 2,
  },

  sellerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text,
    marginBottom: 12,
  },

  quantitySection: {
    marginBottom: 18,
  },

  quantityLabel: {
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    width: 118,
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },

  qtyBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },

  qtyBtnText: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },

  qtyValue: {
    flex: 1,
    textAlign: "center",
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  actions: {
    gap: 12,
  },

  cartButton: {
    backgroundColor: COLORS.dark,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  cartButtonText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 15,
  },

  manageButton: {
    backgroundColor: COLORS.logoA2,
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignSelf: "flex-start",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightPurple,
  },

  manageButtonText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 15,
  },

  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },

  notFoundEmoji: {
    fontSize: 42,
    marginBottom: 16,
  },

  notFoundTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  notFoundText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },

  backHomeButton: {
    backgroundColor: COLORS.dark,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
  },

  backHomeButtonText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 15,
  },

  topHeader: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },

  topHeaderContent: {
    alignItems: "center",
    justifyContent: "center",
  },

  logoCenter: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  iconButton: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: [{ translateY: -18 }],
    padding: 6,
  },

  headerHomeIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },

  shareInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },

  shareIcon: {
    fontSize: 20,
    color: COLORS.textMuted,
  },

  shareInlineText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
});