import { StyleSheet } from "react-native";

export const makeStyles = (theme) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  panel: {
    backgroundColor: theme.color.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "80%",
    paddingBottom: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.color.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.color.textPrimary,
  },
  closeButton: {
    fontSize: 18,
    color: theme.color.textSecondary,
    fontWeight: "600",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: theme.color.textSecondary,
    letterSpacing: 1,
    marginBottom: 14,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: theme.color.textSecondary,
    fontSize: 14,
  },
  errorText: {
    color: theme.color.error,
    fontSize: 14,
  },
  // Chips de categoría (layout en wrap)
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
  },
  chipActive: {
    borderColor: theme.color.accent,
    backgroundColor: theme.color.accentTint,
  },
  chipText: {
    fontSize: 13,
    color: theme.color.textPrimary,
    fontWeight: "600",
  },
  chipTextActive: {
    color: theme.color.accent,
    fontWeight: "800",
  },
  // Footer con botones
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.color.accent,
    alignItems: "center",
  },
  clearBtnText: {
    color: theme.color.accent,
    fontWeight: "800",
    fontSize: 15,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.color.accent,
    alignItems: "center",
  },
  applyBtnText: {
    color: theme.color.surface,
    fontWeight: "800",
    fontSize: 15,
  },
});