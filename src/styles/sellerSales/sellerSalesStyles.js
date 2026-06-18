import { StyleSheet } from 'react-native'

import { COLORS } from '../../constants/colors'
import { FONT, SPACING } from '../../constants/theme'

export const styles = StyleSheet.create({
  screen: {
    width: '100%',
    gap: SPACING.md,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },

  subtitle: {
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#BDEAE4',
  },

  filterChipActive: {
    backgroundColor: '#DDF5F1',
    borderColor: COLORS.primaryLight,
  },

  filterText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: FONT.small,
  },

  filterTextActive: {
    color: COLORS.primary,
  },

  centerState: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 10,
  },

  stateText: {
    color: COLORS.textSecondary,
  },

  messageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
  },

  emptyTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },

  emptyText: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  errorText: {
    color: COLORS.error,
    marginBottom: 8,
  },

  retryText: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },

  list: {
    gap: 12,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusBadge: {
    backgroundColor: '#E8F6F2',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  statusText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },

  total: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  productName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 14,
  },

  productMeta: {
    color: COLORS.textSecondary,
    marginTop: 4,
    fontSize: FONT.regular,
  },

  infoBlock: {
    marginTop: 12,
  },

  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  infoValue: {
    color: COLORS.text,
    fontSize: FONT.regular,
  },

  date: {
    marginTop: 12,
    color: COLORS.textMuted,
    fontSize: FONT.small,
  },

  primaryButton: {
    marginTop: 14,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    },

    primaryButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: FONT.regular,
    },

    buttonDisabled: {
    opacity: 0.65,
    },

    secondaryButton: {
    backgroundColor: '#EEF5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    },

    secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: FONT.regular,
    },

    trackingContainer: {
    marginTop: 14,
    backgroundColor: '#F7FAFA',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3EEEE',
    },

    trackingLabel: {
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: 8,
    },

    trackingInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: COLORS.text,
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
    color: COLORS.error,
    marginTop: 8,
    fontSize: FONT.small,
    fontWeight: '600',
    },

    statusBadgeDelivered: {
    backgroundColor: '#EEF2F4',
    },

    statusTextDelivered: {
    color: COLORS.textSecondary,
    },

    statusBadgeCancelled: {
    backgroundColor: '#FEE2E2',
    },

    statusTextCancelled: {
    color: '#B91C1C',
    },
})