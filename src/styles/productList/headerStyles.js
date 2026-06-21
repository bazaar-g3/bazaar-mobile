export const makeStyles = (theme) => StyleSheet.create({
  header: {
    backgroundColor: theme.color.surface,
    paddingHorizontal: theme.space.lg,
    paddingBottom: theme.space.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    gap: theme.space.md,
  },

  // ── Fila título ──
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.space.sm,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: theme.type.title.size,
    fontWeight: theme.type.title.weight,
    letterSpacing: theme.type.title.letterSpacing,
    color: theme.color.textPrimary,
  },
  subtitle: {
    fontSize: theme.type.meta.size,
    fontWeight: theme.type.meta.weight,
    color: theme.color.textMuted,
    marginTop: 2,
  },

  // Botón "volver al inicio": flecha a la izquierda del título, área táctil 44×44 centrada
  backBtn: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },

  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: theme.color.accent,
    borderColor: theme.color.accent,
  },
  filterBtnCount: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.color.onAccent,
  },

  // ── Búsqueda ──
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space.md,
    height: 44,
    gap: theme.space.sm,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.color.textPrimary,
  },

  // ── Chips de orden ──
  chipsRow: {
    flexDirection: "row",
    gap: theme.space.sm,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm - 2,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.surfaceSubtle,
    minHeight: 32,
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: theme.color.accent,
  },
  chipText: {
    fontSize: theme.type.chip.size,
    fontWeight: theme.type.chip.weight,
    color: theme.color.textSecondary,
  },
  chipTextActive: {
    color: theme.color.onAccent,
  },
});