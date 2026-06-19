import { StyleSheet } from 'react-native'

import { FONT, SPACING } from '../../constants/theme'

export const makeStyles = (theme) => StyleSheet.create({
  screen: {
    width: '100%',
    gap: SPACING.md,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.color.textPrimary,
  },

  subtitle: {
    color: theme.color.textSecondary,
    fontSize: FONT.regular,
    marginTop: -8,
  },

  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },

  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.accentBorder,
  },

  filterChipActive: {
    backgroundColor: theme.color.accentTint,
    borderColor: theme.color.accent,
  },

  filterText: {
    color: theme.color.textSecondary,
    fontWeight: '700',
    fontSize: FONT.small,
  },

  filterTextActive: {
    color: theme.color.accent,
  },

  centerState: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 10,
  },

  stateText: {
    color: theme.color.textSecondary,
  },

  messageCard: {
    backgroundColor: theme.color.surface,
    borderRadius: 18,
    padding: 18,
  },

  emptyTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: theme.color.textPrimary,
    marginBottom: 6,
  },

  emptyText: {
    color: theme.color.textSecondary,
    lineHeight: 20,
  },

  errorText: {
    color: theme.color.error,
    marginBottom: 8,
  },

  retryText: {
    color: theme.color.accent,
    fontWeight: '700',
  },

  list: {
    gap: 12,
  },

  card: {
    backgroundColor: theme.color.surface,
    borderRadius: 20,
    padding: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusBadge: {
    backgroundColor: theme.color.accentTint,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  statusText: {
    color: theme.color.accent,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },

  total: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.color.textPrimary,
  },

  productName: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.color.textPrimary,
    marginTop: 14,
  },

  productMeta: {
    color: theme.color.textSecondary,
    marginTop: 4,
    fontSize: FONT.regular,
  },

  infoBlock: {
    marginTop: 12,
  },

  infoLabel: {
    color: theme.color.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  infoValue: {
    color: theme.color.textPrimary,
    fontSize: FONT.regular,
  },

  date: {
    marginTop: 12,
    color: theme.color.textMuted,
    fontSize: FONT.small,
  },

  primaryButton: {
    marginTop: 14,
    backgroundColor: theme.color.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.button.minHeight,
    },

    primaryButtonText: {
    color: theme.color.onAccent,
    fontWeight: '800',
    fontSize: FONT.regular,
    },

    buttonDisabled: {
    opacity: 0.65,
    },

    secondaryButton: {
    backgroundColor: theme.color.accentTint,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    },

    secondaryButtonText: {
    color: theme.color.accent,
    fontWeight: '800',
    fontSize: FONT.regular,
    },

    trackingContainer: {
    marginTop: 14,
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.color.border,
    },

    trackingLabel: {
    color: theme.color.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
    },

    trackingInput: {
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: theme.color.textPrimary,
    fontSize: FONT.regular,
    },

    trackingActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    },

    trackingConfirmButton: {
    flex: 1,
    marginTop: 0,
    },

    updateErrorText: {
    color: theme.color.error,
    marginTop: 8,
    fontSize: FONT.small,
    fontWeight: '600',
    },

    statusBadgeDelivered: {
    backgroundColor: theme.color.surfaceSubtle,
    },

    statusTextDelivered: {
    color: theme.color.textSecondary,
    },

    statusBadgeCancelled: {
    backgroundColor: '#FEE2E2',
    },

    statusTextCancelled: {
    color: '#B91C1C',
    },
})
