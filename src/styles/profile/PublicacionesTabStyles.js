import { StyleSheet } from "react-native";
import { SPACING, FONT } from "../../constants/theme";

export const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.md, gap: SPACING.sm,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  titulo: { fontSize: FONT.large, fontWeight: '700', color: theme.color.textPrimary, flex: 1 },
  tituloMobile: { fontSize: FONT.medium },

  btnPublicar: {
    backgroundColor: theme.color.accent, paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md, borderRadius: 10,
  },
  btnPublicarText: { color: theme.color.onAccent, fontWeight: '700', fontSize: FONT.small },
  btnPedidos: {
    borderWidth: 1.5, borderColor: theme.color.accent, paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md, borderRadius: 10, backgroundColor: theme.color.surface,
  },
  btnPedidosText: { color: theme.color.accent, fontWeight: '700', fontSize: FONT.small },

  toolbar: {
    backgroundColor: theme.color.surface, borderRadius: 14, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: theme.color.border, gap: SPACING.sm,
  },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.color.border,
    borderRadius: 10, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    gap: SPACING.sm, backgroundColor: theme.color.surface,
  },
  searchIcon: { fontSize: FONT.small, color: theme.color.textMuted },
  searchInput: { flex: 1, fontSize: FONT.small, color: theme.color.textPrimary, outlineStyle: 'none' },
  clearSearch: { fontSize: FONT.small, color: theme.color.textMuted, paddingHorizontal: 4 },
  filtrosRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  chip: {
    borderWidth: 1, borderColor: theme.color.border, borderRadius: 999,
    paddingVertical: 6, paddingHorizontal: SPACING.md, backgroundColor: theme.color.surface,
  },
  chipActivo: { borderColor: theme.color.accent, backgroundColor: theme.color.accentTint },
  chipText: { fontSize: FONT.small, color: theme.color.textSecondary },
  chipTextoActivo: { color: theme.color.accent, fontWeight: '600' },
  conteo: { marginLeft: 'auto', fontSize: FONT.small, color: theme.color.textSecondary },

  errorBanner: {
    backgroundColor: theme.color.warningLight, borderLeftWidth: 3, borderLeftColor: theme.color.accent,
    borderRadius: 10, padding: SPACING.md, marginBottom: SPACING.sm,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: SPACING.md,
  },
  errorBannerText: { flex: 1, fontSize: FONT.small, color: theme.color.textPrimary },
  errorBannerAction: { color: theme.color.accent, fontWeight: '700' },

  // ── Cards mobile ───────────────────────────────────────────────────────────
  pubCardsList: { gap: SPACING.sm, paddingBottom: SPACING.xl },
  pubCard: {
    backgroundColor: theme.color.surface, borderRadius: 14, padding: SPACING.md,
    borderWidth: 1, borderColor: theme.color.border, gap: SPACING.sm,
  },
  pubCardTop: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: SPACING.sm, justifyContent: 'space-between',
  },
  pubCardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  pubCardImage: { width: 52, height: 52, borderRadius: 10, backgroundColor: theme.color.surfaceSubtle },
  pubCardTitulo: { fontSize: FONT.small, fontWeight: '700', color: theme.color.textPrimary, marginBottom: 2 },
  pubCardPrecio: { fontSize: FONT.medium, fontWeight: '900', color: theme.color.textPrimary },
  pubCardStats: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: theme.color.border,
  },
  pubCardStat: { alignItems: 'center', gap: 4 },
  pubCardStatLabel: {
    fontSize: 11, color: theme.color.textMuted, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.3,
  },
  pubCardStatValue: { fontSize: FONT.medium, fontWeight: '700', color: theme.color.textPrimary },
  pubCardBtnEditar: {
    borderWidth: 1, borderColor: theme.color.accent, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  pubCardBtnEditarText: { color: theme.color.accent, fontSize: FONT.small, fontWeight: '700' },

  // ── Tabla desktop ──────────────────────────────────────────────────────────
  lista: {
    width: '100%',
    backgroundColor: theme.color.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.color.border,
    marginBottom: SPACING.md,
  },
  filaHeader: {
    width: '100%', flexDirection: 'row', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: theme.color.border, backgroundColor: theme.color.surfaceSubtle,
  },
  colHeader: { fontSize: 12, fontWeight: '700', color: theme.color.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  fila: {
    width: '100%', flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: theme.color.border,
  },
  filaAlterna: { backgroundColor: theme.color.accentSubtle },
  colTitulo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  pubImage: { width: 44, height: 44, borderRadius: 10, backgroundColor: theme.color.surfaceSubtle },
  pubIcon: { alignItems: 'center', justifyContent: 'center'},
  pubTitulo: { fontSize: FONT.small, color: theme.color.textPrimary, flex: 1, flexShrink: 1 },
  colText: { fontSize: FONT.small, color: theme.color.textSecondary },
  precioText: { fontWeight: '700', color: theme.color.textPrimary },
  estadoCell: { alignItems: 'center' },
  estadoBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  estadoActiva: { backgroundColor: theme.color.accentTint },
  estadoInactiva: { backgroundColor: theme.color.surfaceSubtle },
  estadoBloqueado: { backgroundColor: theme.color.warningLight },
  estadoText: { fontSize: 12, fontWeight: '600' },
  estadoTextActiva: { color: theme.color.success },
  estadoTextInactiva: { color: theme.color.textSecondary },
  estadoTextBloqueado: { color: theme.color.warning },
  bloqueadoContainer: { flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    marginTop: 8, backgroundColor: theme.color.warningLight, borderRadius: 8,
    padding: SPACING.sm, borderLeftWidth: 3, borderLeftColor: theme.color.warning},
    bloqueadoAviso: { flex: 1, fontSize: 12, color: theme.color.warning
  },
  switchCell: { alignItems: 'center', justifyContent: 'center' },
  actionsCell: { alignItems: 'center', justifyContent: 'center' },
  btnEditar: {
    borderWidth: 1, borderColor: theme.color.accent, backgroundColor: theme.color.surface,
    borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12,
  },
  btnEditarText: { color: theme.color.accent, fontSize: 12, fontWeight: '600' },
  switchTrack: { width: 46, height: 24, borderRadius: 999, justifyContent: 'center', paddingHorizontal: 2 },
  switchTrackOn: { backgroundColor: theme.color.accent },
  switchTrackOff: { backgroundColor: theme.color.border },
  switchThumb: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: theme.color.surface,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2,
  },
  switchThumbOn: { alignSelf: 'flex-end' },
  switchThumbOff: { alignSelf: 'flex-start' },

  emptyState: {
    backgroundColor: theme.color.surface, borderRadius: 14, paddingVertical: 60,
    paddingHorizontal: SPACING.lg, alignItems: 'center', borderWidth: 1,
    borderColor: theme.color.border, marginBottom: SPACING.md,
  },
  emptyIcon: { fontSize: 52, color: theme.color.textSecondary, marginBottom: SPACING.md },
  emptyTitulo: { fontSize: 18, fontWeight: '700', color: theme.color.textPrimary, marginBottom: SPACING.xs, textAlign: 'center' },
  emptySubtitulo: { fontSize: FONT.small, color: theme.color.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  btnCrearEmpty: {
    borderWidth: 1, borderColor: theme.color.accent, borderRadius: 10,
    paddingVertical: SPACING.sm, paddingHorizontal: 28, backgroundColor: theme.color.surface,
  },
  btnCrearEmptyText: { color: theme.color.accent, fontWeight: '600', fontSize: FONT.small },

  warningIcon: { size: 18, color: theme.color.warning},

  alignRight: { textAlign: 'right' },
  alignCenter: { textAlign: 'center' },
  stockCell: { alignItems: 'center', justifyContent: 'center', minWidth: 54 },
  colPublicacion: { flex: 2.5, minWidth: 140 },
  colPrecio: { flex: 1, minWidth: 70 },
  colStock: { flex: 1, minWidth: 90 },
  colVendidos: { flex: 0.8, minWidth: 60 },
  colEstado: { flex: 1, minWidth: 70 },
  colVisible: { flex: 0.8, minWidth: 60 },
  colAcciones: { flex: 1, minWidth: 80 },

  // (kept for compatibility, no longer needed for horizontal scroll)
  tableScrollContent: { flexGrow: 1 },
})