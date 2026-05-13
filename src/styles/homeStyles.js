import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { SPACING, FONT } from "../constants/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  header: {
    backgroundColor: COLORS.white,
  },

  topBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
  },

  topBarSmall: {
    paddingHorizontal: 8,
  },

  topBarContent: {
    width: "100%",
    maxWidth: 1280,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },

  leftPlaceholder: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  publishButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#B9D8D4",
    backgroundColor: "#F2FBFA",
    alignItems: 'center',
    justifyContent: 'center',
  },

  publishButtonCircleText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    lineHeight: 26,
  },

  logoCenter: {
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },

  logoNoMargin: {
    marginBottom: 0,
  },

  iconsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 2,
  },

  publishButton: {
    borderWidth: 1,
    borderColor: "#B9D8D4",
    backgroundColor: "#F2FBFA",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 4,
    flexShrink: 1,
  },

  publishButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: FONT.small,
  },

  loginButton: {
    borderWidth: 1,
    borderColor: "#B9D8D4",
    backgroundColor: "#F2FBFA",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginLeft: 8,
    marginRight: 4,
  },

  loginButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: FONT.small,
  },

  iconButton: {
    marginLeft: 12,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    fontSize: 22,
  },

  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D9F4F0",
    borderWidth: 1.5,
    borderColor: "#BDEAE4",
  },

  profileAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2FBFA",
    borderWidth: 1.5,
    borderColor: "#B9D8D4",
    justifyContent: "center",
    alignItems: "center",
  },

  searchContainer: {
    backgroundColor: COLORS.dark,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchBarWrapper: {
    flex: 1,
  },

  customSearchBar: {
    marginBottom: 0,
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    backgroundColor: "rgba(255,255,255,0.12)",
    height: 46,
  },

  filterButtonActive: {
    borderColor: COLORS.secondary,
    backgroundColor: "rgba(255,152,0,0.15)",
  },

  filterButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.white,
  },

  filterButtonTextActive: {
    color: COLORS.secondary,
  },

  filterBadge: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  filterBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  categoriesBar: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 15,
  },

  categoriesStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
  },

  categoriesStatusText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },

  categoriesErrorText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },

  categoryItem: {
    alignItems: "center",
    marginHorizontal: 15,
  },

  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },

  categoryEmoji: {
    fontSize: 24,
  },

  categoryLabel: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },

  content: {
    padding: 16,
  },

  section: {
    marginBottom: 10,
    width: "100%",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 15,
    color: COLORS.sectionTitle,
  },

  sectionAccent: {
    color: COLORS.third,
  },

  recommendedList: {
    paddingBottom: 10,
    flexDirection: "row",
  },

  recentList: {
    paddingBottom: 10,
    flexDirection: "row",
  },

  sectionStatusCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#DCE7EA",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 10,
  },

  sectionStatusText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },

  sectionErrorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: "center",
  },

  sectionRetryText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },

  dropdownOverlay: {
    flex: 1,
  },

  dropdownMenu: {
    position: "absolute",
    width: 220,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },

  dropdownArrow: {
    position: "absolute",
    top: -8,
    right: 18,
    width: 16,
    height: 16,
    backgroundColor: COLORS.white,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: COLORS.divider,
    transform: [{ rotate: "45deg" }],
  },

  modalTitle: {
    fontSize: FONT.large,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.md,
  },

  modalPrimaryButton: {
    backgroundColor: COLORS.logoA2,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },

  modalPrimaryButtonText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: FONT.regular,
  },

  modalSecondaryButton: {
    backgroundColor: COLORS.lightPink,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
  },

  modalSecondaryButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: FONT.regular,
  },
});
