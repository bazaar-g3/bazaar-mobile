import { StyleSheet, Platform } from 'react-native'
import { SPACING, FONT } from '../constants/theme'

export const makeStyles = (theme) => StyleSheet.create({
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: theme.color.error,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  cancelBtnText: {
    color: theme.color.error,
    fontWeight: '700',
    fontSize: 15,
  },
  cancelOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cancelDialog: {
    backgroundColor: theme.color.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  cancelDialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.color.textPrimary,
  },
  cancelDialogText: {
    fontSize: 14,
    color: theme.color.textSecondary,
    lineHeight: 20,
  },
  cancelReasonInput: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: theme.color.textPrimary,
  },
  cancelErrorText: {
    color: theme.color.error,
    fontSize: 13,
    fontWeight: '600',
  },
  cancelDialogBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelDialogBtnSecondary: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelDialogBtnSecondaryText: {
    color: theme.color.textSecondary,
    fontWeight: '700',
    fontSize: 15,
  },
  cancelDialogBtnPrimary: {
    flex: 1,
    backgroundColor: theme.color.error,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelDialogBtnPrimaryText: {
    color: theme.color.onAccent,
    fontWeight: '700',
    fontSize: 15,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.color.surface,
  },
  fullCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.surface,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontWeight: '900',
    color: theme.color.textPrimary,
  },

  // Filtros — full width, padding dentro del contentContainer
  filterScroll: {
    flexGrow: 0,
    marginBottom: SPACING.sm,
  },
  filterContent: {
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.color.textSecondary,
  },
  filterChipTextActive: {
    color: theme.color.onAccent,
    fontWeight: '700',
  },

  // Lista
  listContainer: {
    flex: 1,
  },
  listContainerTablet: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  listContent: {
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.xs,
  },

  // Tarjetas de orden
  orderCard: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.image,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: 4,
  },
  orderCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  orderId: {
    fontSize: FONT.small,
    color: theme.color.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  orderDate: {
    fontSize: 12,
    color: theme.color.textMuted,
    fontWeight: '500',
  },
  orderTotal: {
    fontSize: FONT.medium,
    fontWeight: '900',
    color: theme.color.textPrimary,
  },

  // Badge de estado (pastel bg + dot + textPrimary — contraste WCAG garantizado)
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    flexShrink: 0,
  },
  badgeText: {
    color: theme.color.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextSmall: {
    fontSize: 11,
  },

  // Estados vacíos
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: theme.color.textPrimary,
  },
  emptyText: {
    fontSize: FONT.regular,
    color: theme.color.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: theme.color.accent,
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: theme.radius.md,
    marginTop: SPACING.xs,
    minHeight: theme.button.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: theme.color.onAccent,
    fontWeight: '800',
    fontSize: FONT.regular,
  },

  // Modal de detalle
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },
  modalCloseBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.surfaceSubtle,
  },
  modalTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: theme.color.textPrimary,
  },
  modalBody: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  // Detalle
  detailHero: {
    alignItems: 'flex-start',
    gap: SPACING.xs,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },
  detailOrderId: {
    fontSize: FONT.large,
    fontWeight: '900',
    color: theme.color.textPrimary,
    letterSpacing: 0.5,
  },
  detailMeta: {
    fontSize: FONT.small,
    color: theme.color.textMuted,
    fontWeight: '500',
  },
  detailSection: {
    gap: SPACING.xs,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.color.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  detailSectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: 10,
    padding: SPACING.sm,
  },
  detailText: {
    flex: 1,
    fontSize: FONT.regular,
    color: theme.color.textPrimary,
    lineHeight: 20,
  },
  detailItem: {
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: 12,
    padding: SPACING.sm,
    gap: 6,
  },
  detailItemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  detailItemName: {
    flex: 1,
    fontSize: FONT.regular,
    fontWeight: '700',
    color: theme.color.accent,        // azul = indica que es tappable
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: theme.color.accent,
  },
  detailItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItemMeta: {
    fontSize: FONT.small,
    color: theme.color.textSecondary,
  },
  detailItemSubtotal: {
    fontSize: FONT.regular,
    fontWeight: '800',
    color: theme.color.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    paddingVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT.medium,
    color: theme.color.textSecondary,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: FONT.large,
    fontWeight: '900',
    color: theme.color.textPrimary,
  },

  // Historial
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    flexShrink: 0,
  },
  historyStatus: {
    fontSize: FONT.regular,
    fontWeight: '700',
    color: theme.color.textPrimary,
  },
  historyDate: {
    fontSize: 12,
    color: theme.color.textMuted,
    marginTop: 2,
  },

  // Tarjeta con pago rechazado
  orderCardRejected: {
    borderWidth: 1.5,
    borderColor: theme.color.errorBorder,
    backgroundColor: theme.color.errorLight,
  },
  orderCardRejectedHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: theme.color.errorBorder,
  },
  orderCardRejectedHintText: {
    fontSize: 12,
    color: theme.color.error,
    fontWeight: '600',
  },

  // Banner de pago rechazado en el modal
  rejectedBanner: {
    backgroundColor: theme.color.errorLight,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.color.errorBorder,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  rejectedBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rejectedBannerTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: theme.color.error,
  },
  rejectedBannerText: {
    fontSize: FONT.small,
    color: theme.color.error,
    lineHeight: 20,
  },
  rejectedBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 1.5,
    borderColor: theme.color.error,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    backgroundColor: theme.color.surface,
  },
  rejectedBannerBtnText: {
    fontSize: FONT.small,
    fontWeight: '800',
    color: theme.color.error,
  },

  // Código de seguimiento
  trackingCode: {
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Confirmar entrega
  confirmDeliveryBox: {
    backgroundColor: theme.color.successLight,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.color.successBorder,
    padding: SPACING.md,
    gap: SPACING.xs,
    alignItems: 'flex-start',
  },
  confirmDeliveryTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: theme.color.success,
  },
  confirmDeliveryText: {
    fontSize: FONT.small,
    color: theme.color.success,
    lineHeight: 20,
  },
  confirmDeliveryError: {
    fontSize: FONT.small,
    color: theme.color.error,
    fontWeight: '600',
  },
  confirmDeliveryBtn: {
    backgroundColor: theme.color.success,
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: SPACING.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  confirmDeliveryBtnDisabled: {
    opacity: 0.6,
  },
  confirmDeliveryBtnText: {
    color: theme.color.onAccent,
    fontSize: FONT.regular,
    fontWeight: '800',
  },

  // Sección de calificaciones
  reviewSection: {
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  reviewSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 2,
  },
  reviewSectionTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: theme.color.textPrimary,
  },
  reviewCard: {
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: 12,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  reviewEntityName: {
    fontSize: FONT.regular,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginBottom: 2,
  },
  starRow: {
    flexDirection: 'row',
    gap: 4,
  },
  starPickerItem: {
    fontSize: 28,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontSize: FONT.regular,
    color: theme.color.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: theme.color.surface,
  },
  reviewSubmitBtn: {
    backgroundColor: theme.color.accent,
    paddingVertical: 11,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    minHeight: theme.button.minHeight,
    justifyContent: 'center',
    marginTop: 2,
  },
  reviewSubmitBtnDisabled: {
    opacity: 0.45,
  },
  reviewSubmitBtnText: {
    color: theme.color.onAccent,
    fontWeight: '800',
    fontSize: FONT.regular,
  },
  reviewDoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  reviewDoneText: {
    fontSize: FONT.regular,
    fontWeight: '700',
    color: theme.color.success,
  },
  reviewAlreadyText: {
    fontSize: FONT.regular,
    color: theme.color.textMuted,
    fontWeight: '500',
  },
  reviewError: {
    fontSize: FONT.small,
    color: theme.color.error,
    fontWeight: '600',
  },

  // Estilos de los paquetes
  packageCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: theme.radius.md,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  packageTitle: {
    fontWeight: 'bold',
    fontSize: FONT.medium,
    color: theme.color.textPrimary,
  },
})