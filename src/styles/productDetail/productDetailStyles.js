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

  backButton: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 10,
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

  oldPrice: {
    fontSize: 15,
    textDecorationLine: "line-through",
    color: COLORS.textSecondary,
    marginBottom: 2,
  },

  currentPrice: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.secondary,
    marginBottom: 2,
  },

  savings: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  sellerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },

  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },

  categoryPill: {
    backgroundColor: COLORS.promoLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  categoryPillText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 12,
  },

  stockText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.success,
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text,
    marginBottom: 12,
  },

  featuresBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 18,
  },

  featureItem: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "600",
    marginBottom: 5,
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
    color: COLORS.lightPurple,
    fontWeight: "900",
    fontSize: 15,
  },

  shippingInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 18,
    gap: 10,
  },

  shippingText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.dark,
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

  loginPromptOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  loginPromptBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
  },

  loginPromptWrapper: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  loginPromptBox: {
    width: 320,
    maxWidth: "92%",
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
    alignItems: "center",
  },

  loginPromptTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 28,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  loginPromptText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },

  loginPromptButtons: {
    width: "100%",
    gap: 10,
  },

  loginPromptLoginButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  loginPromptLoginButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
  },

  loginPromptCancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  loginPromptCancelButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
  },

  loginPromptArrow: {
    position: "absolute",
    bottom: -12,
    width: 22,
    height: 22,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: "45deg" }],
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.primaryLight,
  },

  topHeader: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingHorizontal: 16,
    paddingVertical: 25,
  },

  topHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },

  logoCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "none",
  },

  headerBack: {
    fontSize: FONT.medium,
    fontWeight: "700",
    color: COLORS.primary,
    zIndex: 2,
  },

  shareButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  shareButtonText: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 15,
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

  shareModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  shareModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },

  shareModalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },

  shareModalHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: COLORS.divider,
    alignSelf: "center",
    marginBottom: 16,
  },

  shareModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },

  shareModalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },

  shareModalPrimaryAction: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  shareModalPrimaryActionText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },

  shareModalSecondaryAction: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  shareModalSecondaryActionText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
  },

  shareModalCancelAction: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  shareModalCancelActionText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },

});