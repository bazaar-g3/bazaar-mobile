import { StyleSheet } from "react-native";

export const makeStyles = (theme) => StyleSheet.create({
  // ── Raíz ──────────────────────────────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: theme.color.surface,
  },

  mainContainer: {
    flex: 1,
    backgroundColor: theme.color.surface,
  },

  // ── Grid ──────────────────────────────────────────────────────────────────
  gridContainer: {
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.lg,
    paddingBottom: 40,
  },

  gridWrapper: {
    width: "100%",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.space.lg,
  },

  // ── Empty / Error / Loading ────────────────────────────────────────────────
  emptyState: {
    minHeight: 280,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 8,
  },

  emptyIcon: {
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.color.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.color.textSecondary,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    backgroundColor: theme.color.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  retryButtonText: {
    color: theme.color.onAccent,
    fontWeight: "700",
    fontSize: 14,
  },
});
