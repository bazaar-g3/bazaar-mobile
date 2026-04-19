import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { FONT } from "../../constants/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  header: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    minHeight: 132,
  },

  backButton: {
    fontSize: FONT.medium,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 10,
    zIndex: 2,
  },

  logoCenter: {
    position: "absolute",
    top: 14,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },

  logoNoMargin: {
    marginBottom: 0,
  },

  searchBarContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.dark,
    borderRadius: 10,
    padding: 5,
    width: "100%",
    marginTop: 26,
  },

  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    paddingHorizontal: 14,
    marginRight: 6,
    height: 42,
  },

  searchButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 18,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  searchButtonText: {
    color: COLORS.white,
    fontWeight: "800",
  },

  mainContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.background,
  },

  sidebar: {
    width: "25%",
    backgroundColor: COLORS.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.divider,
    padding: 15,
  },

  filterSection: {
    marginBottom: 24,
  },

  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.dark,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },

  filterTitle: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },

  filterIcon: {
    color: COLORS.white,
    fontWeight: "900",
  },

  sidebarStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },

  sidebarStatusText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  sidebarErrorText: {
    color: COLORS.error,
    fontSize: 13,
    lineHeight: 18,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: COLORS.white,
  },

  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterItem: {
    fontSize: 14,
    color: COLORS.dark,
  },

  filterItemActive: {
    fontWeight: "800",
    color: COLORS.primary,
  },

  filterAction: {
    paddingVertical: 8,
  },

  filterActionText: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: "700",
  },

  clearButton: {
    marginTop: 10,
    backgroundColor: COLORS.promoLight,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },

  clearButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 12,
  },

  gridContainer: {
    padding: 20,
    width: "75%",
    paddingBottom: 30,
  },

  sectionHeading: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.sectionTitle,
    textAlign: "center",
    marginBottom: 6,
  },

  sectionSubheading: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
    overflow: "hidden",
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  productImage: {
    width: "100%",
    height: 160,
    backgroundColor: COLORS.imagePlaceholder,
  },

  cardContent: {
    padding: 12,
  },

  tagBadge: {
    backgroundColor: COLORS.secondary,
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },

  tagText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.white,
  },

  cardName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },

  cardOldPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: COLORS.textSecondary,
  },

  cardPrice: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.secondary,
    marginBottom: 4,
  },

  cardSeller: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  cardStock: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
    marginVertical: 6,
  },

  cardActions: {
    gap: 6,
    marginTop: 10,
  },

  btnCart: {
    backgroundColor: COLORS.dark,
    padding: 9,
    borderRadius: 6,
    alignItems: "center",
  },

  btnBuy: {
    backgroundColor: COLORS.secondary,
    padding: 9,
    borderRadius: 6,
    alignItems: "center",
  },

  btnText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },

  emptyState: {
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 10,
  },

  emptyEmoji: {
    fontSize: 44,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  retryButtonText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 13,
  },

  loadMoreButton: {
    marginTop: 8,
    alignSelf: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },

  loadMoreText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 14,
  },
});