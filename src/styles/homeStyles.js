import { StyleSheet } from "react-native";

export const makeStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.color.surface,
  },

  // ── Top bar (logo + íconos) ──────────────────────────────────────
  header: {
    backgroundColor: theme.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },

  topBar: {
    backgroundColor: theme.color.surface,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
  },

  topBarSmall: {
    paddingHorizontal: theme.space.sm,
  },

  topBarContent: {
    width: "100%",
    maxWidth: 1280,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    minHeight: theme.button.minHeight,
  },

  leftPlaceholder: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  // Botón circular "+" (mobile)
  publishButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.color.accentBorder,
    backgroundColor: theme.color.accentSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  publishButtonCircleText: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.color.accent,
    lineHeight: 26,
    // Centra ópticamente el glifo "+" dentro del círculo: textAlign lo centra
    // en horizontal e includeFontPadding:false elimina el padding asimétrico
    // que Android agrega por las métricas de la fuente (lo desplazaba hacia abajo).
    textAlign: "center",
    includeFontPadding: false,
  },

  // Íconos y botones a la derecha
  iconsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 2,
  },

  // Botón "+ Publicar producto" (desktop)
  publishButton: {
    borderWidth: 1,
    borderColor: theme.color.accentBorder,
    backgroundColor: theme.color.accentSubtle,
    borderRadius: theme.radius.pill,
    paddingVertical: 10,
    paddingHorizontal: theme.space.lg,
    marginRight: theme.space.xs,
    flexShrink: 1,
  },
  publishButtonText: {
    color: theme.color.accent,
    fontWeight: "700",
    fontSize: theme.type.label.size,
  },

  // Botón de login (no autenticado)
  loginButton: {
    borderWidth: 1.5,
    borderColor: theme.color.accentBorder,
    backgroundColor: theme.color.accentSubtle,
    borderRadius: theme.radius.pill,
    width: 38,
    height: 38,
    marginLeft: theme.space.sm,
    marginRight: theme.space.xs,
    alignItems: "center",
    justifyContent: "center",
  },

  iconButton: {
    marginLeft: theme.space.md,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 22,
  },

  // Badge de notificaciones
  notifBadge: {
    position: "absolute",
    top: -5,
    right: -6,
    backgroundColor: theme.color.error,
    borderRadius: theme.radius.pill,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: theme.color.onAccent,
    fontSize: 9,
    fontWeight: "800",
  },

  // Avatar de perfil
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.accentTint,
    borderWidth: 1.5,
    borderColor: theme.color.accentBorder,
  },
  profileAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.accentSubtle,
    borderWidth: 1.5,
    borderColor: theme.color.accentBorder,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Search + filtros ─────────────────────────────────────────────
  searchContainer: {
    backgroundColor: theme.color.surface,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
  },
  searchBarWrapper: {
    flex: 1,
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.xs,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surfaceSubtle,
    height: theme.button.minHeight + 2,
    flexShrink: 0,
    minWidth: 44,
  },
  filterButtonActive: {
    borderColor: theme.color.accent,
    backgroundColor: theme.color.accentTint,
  },
  filterBadge: {
    backgroundColor: theme.color.like,
    borderRadius: theme.radius.pill,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: theme.color.onAccent,
    fontSize: 10,
    fontWeight: "900",
  },

  // ── Contenido principal ──────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: theme.color.surfaceSubtle,
  },

  // ── Barra de categorías ──────────────────────────────────────────
  categoriesBar: {
    backgroundColor: theme.color.surface,
    paddingVertical: theme.space.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },
  categoriesStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.space.lg,
    gap: theme.space.sm,
  },
  categoriesStatusText: {
    color: theme.color.textSecondary,
    fontSize: theme.type.label.size,
    fontWeight: "600",
  },
  categoriesErrorText: {
    color: theme.color.error,
    fontSize: theme.type.label.size,
    fontWeight: "700",
  },
  categoryItem: {
    alignItems: "center",
    marginHorizontal: theme.space.md,
  },
  categoryCircle: {
    width: 62,
    height: 62,
    borderRadius: theme.radius.pill,
    // backgroundColor inyectado dinámicamente por HomeScreen (uno por categoría)
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.space.xs,
  },
  categoryLabel: {
    color: theme.color.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },

  // ── Secciones de productos ───────────────────────────────────────
  content: {
    padding: theme.space.lg,
    paddingTop: theme.space.sm,
  },
  section: {
    marginBottom: theme.space.xxl + 4,
    width: "100%",
  },
  sectionTitle: {
    fontSize: theme.type.subtitle.size,
    fontWeight: theme.type.subtitle.weight,
    textAlign: "left",
    marginTop: theme.space.sm,
    marginBottom: theme.space.lg,
    color: theme.color.sectionTitle,
  },
  sectionAccent: {
    color: theme.color.accent,
  },
  recommendedList: {
    paddingBottom: theme.space.sm,
    flexDirection: "row",
  },
  recentList: {
    paddingBottom: theme.space.sm,
    flexDirection: "row",
  },

  // Estado de sección (loading / error / vacío)
  sectionStatusCard: {
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.space.xl,
    paddingHorizontal: theme.space.lg,
    alignItems: "center",
    gap: theme.space.sm,
  },
  sectionStatusText: {
    color: theme.color.textSecondary,
    fontSize: theme.type.body.size,
    textAlign: "center",
  },
  sectionErrorText: {
    color: theme.color.error,
    fontSize: theme.type.body.size,
    textAlign: "center",
  },
  sectionRetryText: {
    color: theme.color.accent,
    fontWeight: "700",
    fontSize: theme.type.body.size,
  },

  // ── Dropdown de perfil ───────────────────────────────────────────
  dropdownOverlay: {
    flex: 1,
  },
  dropdownMenu: {
    position: "absolute",
    width: 220,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    shadowColor: "#000",
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
    backgroundColor: theme.color.surface,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: theme.color.border,
    transform: [{ rotate: "45deg" }],
  },
  modalTitle: {
    fontSize: theme.type.subtitle.size,
    fontWeight: "800",
    color: theme.color.textPrimary,
    textAlign: "center",
    marginBottom: theme.space.md,
  },
  modalPrimaryButton: {
    backgroundColor: theme.color.accent,
    borderRadius: theme.radius.md,
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.xl,
    alignItems: "center",
    marginBottom: theme.space.sm,
    minHeight: theme.button.minHeight,
    justifyContent: "center",
  },
  modalPrimaryButtonText: {
    color: theme.color.onAccent,
    fontWeight: "800",
    fontSize: theme.type.body.size,
  },
  modalSecondaryButton: {
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: theme.radius.md,
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.xl,
    alignItems: "center",
    minHeight: theme.button.minHeight,
    justifyContent: "center",
  },
  modalSecondaryButtonText: {
    color: theme.color.textPrimary,
    fontWeight: "700",
    fontSize: theme.type.body.size,
  },
});
