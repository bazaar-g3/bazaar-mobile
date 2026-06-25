import { StyleSheet } from 'react-native'
import { FONT, SPACING } from '../constants/theme'

export const makeStyles = (theme) => StyleSheet.create({
  fullCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.surface,
  },
  container: {
    flex: 1,
    backgroundColor: theme.color.surface,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  containerTablet: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontWeight: '900',
    color: theme.color.textPrimary,
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  listContent: {
    paddingBottom: SPACING.lg,
  },
  itemCard: {
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: theme.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemCardSmall: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  itemCardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  itemCardDisabled: {
    opacity: 0.7,
    borderColor: theme.color.error,
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: FONT.medium,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginBottom: 2,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: theme.color.textSecondary,
  },
  itemDetail: {
    fontSize: FONT.small,
    color: theme.color.textSecondary,
  },
  subtotal: {
    fontSize: FONT.regular,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginTop: 2,
  },
  unavailableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.color.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    marginTop: 6,
    gap: 4,
  },
  unavailableTagText: {
    color: theme.color.onAccent,
    fontSize: 11,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  stepperBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: theme.color.surface,
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperText: {
    fontSize: FONT.large,
    fontWeight: '800',
    color: theme.color.textSecondary,
    lineHeight: FONT.large + 2,
  },
  qtyValue: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: FONT.medium,
    fontWeight: '700',
    color: theme.color.textPrimary,
  },
  trashBtn: {
    padding: 8,
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
  warnText: {
    color: theme.color.error,
    fontSize: FONT.small,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: theme.color.accent,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    minHeight: theme.button.minHeight,
    justifyContent: 'center',
  },
  checkoutDisabled: {
    backgroundColor: theme.color.textMuted,
  },
  checkoutButtonText: {
    color: theme.color.onAccent,
    fontSize: FONT.medium,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: FONT.regular,
    color: theme.color.textSecondary,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: theme.color.accent,
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: theme.radius.md,
    minHeight: theme.button.minHeight,
    justifyContent: 'center',
  },
  shopButtonText: {
    color: theme.color.onAccent,
    fontWeight: '800',
    fontSize: FONT.regular,
  },
  itemImage: {
    borderRadius: theme.radius.image,
    overflow: 'hidden',
    flexShrink: 0,
  },
  itemImageInner: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.color.surfaceSubtle,
  },
})