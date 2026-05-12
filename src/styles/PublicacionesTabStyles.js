import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { SPACING, FONT } from "../constants/theme";

export const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.md, gap: SPACING.sm,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  titulo: { fontSize: FONT.large, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  tituloMobile: { fontSize: FONT.medium },

  btnPublicar: {
    backgroundColor: COLORS.secondary, paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md, borderRadius: 10,
  },
  btnPublicarText: { color: COLORS.white, fontWeight: '700', fontSize: FONT.small },
  btnPedidos: {
    borderWidth: 1.5, borderColor: COLORS.primaryLight, paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md, borderRadius: 10, backgroundColor: COLORS.white,
  },
  btnPedidosText: { color: COLORS.primaryLight, fontWeight: '700', fontSize: FONT.small },

  toolbar: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.divider, gap: SPACING.sm,
  },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    gap: SPACING.sm, backgroundColor: COLORS.white,
  },
  searchIcon: { fontSize: FONT.small, color: COLORS.textMuted },
  searchInput: { flex: 1, fontSize: FONT.small, color: COLORS.textPrimary, outlineStyle: 'none' },
  clearSearch: { fontSize: FONT.small, color: COLORS.textMuted, paddingHorizontal: 4 },
  filtrosRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  chip: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 999,
    paddingVertical: 6, paddingHorizontal: SPACING.md, backgroundColor: COLORS.white,
  },
  chipActivo: { borderColor: COLORS.primaryLight, backgroundColor: COLORS.promoLight },
  chipText: { fontSize: FONT.small, color: COLORS.textSecondary },
  chipTextoActivo: { color: COLORS.primary, fontWeight: '600' },
  conteo: { marginLeft: 'auto', fontSize: FONT.small, color: COLORS.textSecondary },

  errorBanner: {
    backgroundColor: '#FFF7ED', borderLeftWidth: 3, borderLeftColor: COLORS.secondary,
    borderRadius: 10, padding: SPACING.md, marginBottom: SPACING.sm,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: SPACING.md,
  },
  errorBannerText: { flex: 1, fontSize: FONT.small, color: COLORS.dark },
  errorBannerAction: { color: COLORS.secondary, fontWeight: '700' },

  // ── Cards mobile ───────────────────────────────────────────────────────────
  pubCardsList: { gap: SPACING.sm, paddingBottom: SPACING.xl },
  pubCard: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.divider, gap: SPACING.sm,
  },
  pubCardTop: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: SPACING.sm, justifyContent: 'space-between',
  },
  pubCardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  pubCardImage: { width: 52, height: 52, borderRadius: 10, backgroundColor: COLORS.background },
  pubCardTitulo: { fontSize: FONT.small, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  pubCardPrecio: { fontSize: FONT.medium, fontWeight: '900', color: COLORS.textPrimary },
  pubCardStats: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider,
  },
  pubCardStat: { alignItems: 'center', gap: 4 },
  pubCardStatLabel: {
    fontSize: 11, color: COLORS.textMuted, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.3,
  },
  pubCardStatValue: { fontSize: FONT.medium, fontWeight: '700', color: COLORS.textPrimary },
  pubCardBtnEditar: {
    borderWidth: 1, borderColor: COLORS.primaryLight, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  pubCardBtnEditarText: { color: COLORS.primaryLight, fontSize: FONT.small, fontWeight: '700' },

  // ── Tabla desktop ──────────────────────────────────────────────────────────
  lista: {
    flex: 1,
    minWidth: 820,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: SPACING.md,
  },
  filaHeader: {
    width: '100%', flexDirection: 'row', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider, backgroundColor: COLORS.background,
  },
  colHeader: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  fila: {
    width: '100%', flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  filaAlterna: { backgroundColor: '#FAFCFC' },
  colTitulo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  pubEmoji: { fontSize: 24 },
  pubImage: { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.background },
  pubTitulo: { fontSize: FONT.small, color: COLORS.textPrimary, flex: 1, flexShrink: 1 },
  colText: { fontSize: FONT.small, color: COLORS.textSecondary },
  precioText: { fontWeight: '700', color: COLORS.textPrimary },
  estadoCell: { alignItems: 'center' },
  estadoBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  estadoActiva: { backgroundColor: COLORS.promoLight },
  estadoInactiva: { backgroundColor: COLORS.background },
  estadoText: { fontSize: 12, fontWeight: '600' },
  estadoTextActiva: { color: COLORS.success },
  estadoTextInactiva: { color: COLORS.textSecondary },
  switchCell: { alignItems: 'center', justifyContent: 'center' },
  actionsCell: { alignItems: 'center', justifyContent: 'center' },
  btnEditar: {
    borderWidth: 1, borderColor: COLORS.primaryLight, backgroundColor: COLORS.white,
    borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12,
  },
  btnEditarText: { color: COLORS.primaryLight, fontSize: 12, fontWeight: '600' },
  switchTrack: { width: 46, height: 24, borderRadius: 999, justifyContent: 'center', paddingHorizontal: 2 },
  switchTrackOn: { backgroundColor: COLORS.secondary },
  switchTrackOff: { backgroundColor: '#D9D9D9' },
  switchThumb: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2,
  },
  switchThumbOn: { alignSelf: 'flex-end' },
  switchThumbOff: { alignSelf: 'flex-start' },

  emptyState: {
    backgroundColor: COLORS.white, borderRadius: 14, paddingVertical: 60,
    paddingHorizontal: SPACING.lg, alignItems: 'center', borderWidth: 1,
    borderColor: COLORS.divider, marginBottom: SPACING.md,
  },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitulo: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs, textAlign: 'center' },
  emptySubtitulo: { fontSize: FONT.small, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  btnCrearEmpty: {
    borderWidth: 1, borderColor: COLORS.primaryLight, borderRadius: 10,
    paddingVertical: SPACING.sm, paddingHorizontal: 28, backgroundColor: COLORS.white,
  },
  btnCrearEmptyText: { color: COLORS.primaryLight, fontWeight: '600', fontSize: FONT.small },

  alignRight: { textAlign: 'right' },
  alignCenter: { textAlign: 'center' },
  stockCell: { alignItems: 'center', justifyContent: 'center', minWidth: 54 },
  colPublicacion: { flex: 2.2, minWidth: 180 },
  colPrecio: { flex: 1, minWidth: 90 },
  colStock: { flex: 1, minWidth: 90 },
  colVendidos: { flex: 1, minWidth: 90 },
  colEstado: { flex: 1, minWidth: 100 },
  colVisible: { flex: 1, minWidth: 90 },
  colAcciones: { flex: 1, minWidth: 120 },

  tableScrollContent: {
    flexGrow: 1,
    minWidth: '100%',
  },
})