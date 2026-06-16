import { StyleSheet } from "react-native";
import { FONT } from "../../constants/theme";

export const makeStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.color.surface,
  },

  container: {
    flex: 1,
    backgroundColor: theme.color.surfaceSubtle,
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
    color: theme.color.textMuted,
    letterSpacing: 0.5,
  },

  mainCard: {
    flexDirection: "column",
    backgroundColor: theme.color.surface,
    borderRadius: 22,
    padding: 18,
    // no shadow — Social/P2P direction
  },

  leftColumn: {
    width: "100%",
    marginBottom: 18,
  },

  imageWrapper: {
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: 16,
    overflow: "hidden",
  },

  productImage: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
  },

  thumbnailRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },

  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: 5,
    backgroundColor: theme.color.surface,
    flexShrink: 0,
  },

  activeThumbnail: {
    borderColor: theme.color.accent,
    borderWidth: 2,
  },

  thumbnailImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  rightColumn: {
    width: "100%",
  },

  productTitle: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    color: theme.color.textPrimary,
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
    backgroundColor: theme.color.like,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },

  promoBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: theme.color.onAccent,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.color.textSecondary,
  },

  priceContainer: {
    marginBottom: 12,
  },

  currentPrice: {
    fontSize: 32,
    fontWeight: "900",
    color: theme.color.textPrimary,
    marginBottom: 2,
  },

  sellerText: {
    fontSize: 14,
    color: theme.color.textSecondary,
    marginBottom: 12,
  },

  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.color.textPrimary,
    marginBottom: 12,
  },

  featuresBox: {
    backgroundColor: theme.color.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.color.border,
    marginBottom: 18,
  },

  featureItem: {
    fontSize: 14,
    color: theme.color.textPrimary,
    fontWeight: "600",
    marginBottom: 5,
  },

  quantitySection: {
    marginBottom: 18,
  },

  quantityLabel: {
    fontWeight: "800",
    color: theme.color.textPrimary,
    marginBottom: 8,
  },

  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 10,
    width: 118,
    backgroundColor: theme.color.surface,
  },

  qtyBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: theme.color.surfaceSubtle,
  },

  qtyBtnFirst: {
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
  },

  qtyBtnLast: {
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
  },

  qtyBtnText: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.color.accent,
  },

  qtyValue: {
    flex: 1,
    textAlign: "center",
    fontWeight: "800",
    color: theme.color.textPrimary,
  },

  actions: {
    gap: 12,
  },

  cartButton: {
    backgroundColor: theme.color.accent,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    minHeight: theme.button.minHeight,
    justifyContent: "center",
  },

  cartButtonText: {
    color: theme.color.onAccent,
    fontWeight: "900",
    fontSize: 15,
  },

  manageButton: {
    backgroundColor: theme.color.accent,
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignSelf: "flex-start",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.color.accentBorder,
    minHeight: theme.button.minHeight,
    justifyContent: "center",
  },

  manageButtonText: {
    color: theme.color.onAccent,
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
    color: theme.color.accent,
  },

  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: theme.color.surfaceSubtle,
  },

  notFoundEmoji: {
    fontSize: 42,
    marginBottom: 16,
  },

  notFoundTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.color.textPrimary,
    marginBottom: 8,
  },

  notFoundText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.color.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },

  backHomeButton: {
    backgroundColor: theme.color.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    minHeight: theme.button.minHeight,
    justifyContent: "center",
  },

  backHomeButtonText: {
    color: theme.color.onAccent,
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
    backgroundColor: theme.color.accent,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: theme.color.accentBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
    alignItems: "center",
  },

  loginPromptTitle: {
    color: theme.color.onAccent,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 28,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  loginPromptText: {
    color: theme.color.onAccent,
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
    backgroundColor: theme.color.like,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    minHeight: theme.button.minHeight,
    justifyContent: "center",
  },

  loginPromptLoginButtonText: {
    color: theme.color.onAccent,
    fontSize: 15,
    fontWeight: "900",
  },

  loginPromptCancelButton: {
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.accentBorder,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    minHeight: theme.button.minHeight,
    justifyContent: "center",
  },

  loginPromptCancelButtonText: {
    color: theme.color.accent,
    fontSize: 15,
    fontWeight: "800",
  },

  loginPromptArrow: {
    position: "absolute",
    bottom: -12,
    width: 22,
    height: 22,
    backgroundColor: theme.color.accent,
    transform: [{ rotate: "45deg" }],
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.color.accentBorder,
  },

  topHeader: {
    width: "100%",
    backgroundColor: theme.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },

  topHeaderContent: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  logoCenter: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },

  headerBack: {
    fontSize: FONT.medium,
    fontWeight: "700",
    color: theme.color.accent,
    zIndex: 2,
  },

  shareButton: {
    backgroundColor: theme.color.surface,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.color.accent,
    minHeight: theme.button.minHeight,
    justifyContent: "center",
  },

  shareButtonText: {
    color: theme.color.accent,
    fontWeight: "900",
    fontSize: 15,
  },

  shareInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    marginBottom: 14,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.color.accentBorder,
    borderRadius: 10,
    backgroundColor: theme.color.accentSubtle,
  },

  shareIcon: {
    fontSize: 20,
    color: theme.color.textMuted,
  },

  shareInlineText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.color.accent,
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
    backgroundColor: theme.color.surface,
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
    backgroundColor: theme.color.border,
    alignSelf: "center",
    marginBottom: 16,
  },

  shareModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.color.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },

  shareModalPrimaryAction: {
    backgroundColor: theme.color.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
    minHeight: theme.button.minHeight,
    justifyContent: "center",
  },

  shareModalPrimaryActionText: {
    color: theme.color.onAccent,
    fontSize: 15,
    fontWeight: "800",
  },

  shareModalSecondaryAction: {
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.accentBorder,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
    minHeight: theme.button.minHeight,
    justifyContent: "center",
  },

  shareModalSecondaryActionText: {
    color: theme.color.accent,
    fontSize: 15,
    fontWeight: "800",
  },

  shareModalCancelAction: {
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: theme.button.minHeight,
    justifyContent: "center",
  },

  shareModalCancelActionText: {
    color: theme.color.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },

  headerHomeIcon: {
    fontSize: 24,
    color: theme.color.textPrimary,
  },

  iconButton: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: [{ translateY: -18 }],
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Seller chip ──────────────────────────────────────────────────
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: 12,
    marginBottom: 14,
  },
  sellerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.color.accentTint,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sellerAvatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.color.accent,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.color.textMuted,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.color.textPrimary,
  },
  sellerRating: {
    fontSize: 12,
    color: theme.color.textSecondary,
    marginTop: 2,
  },

  // ── Description block ────────────────────────────────────────────
  descriptionBlock: {
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  descriptionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.color.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },

  // ── CTA row (heart + cart) ───────────────────────────────────────
  ctaRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  cartButtonFlex: {
    flex: 1,
  },
  wishlistBtn: {
    width: theme.button.minHeight,
    height: theme.button.minHeight,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.color.surfaceSubtle,
    flexShrink: 0,
  },
});
