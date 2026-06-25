import { StyleSheet } from 'react-native'

export const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.surfaceSubtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },
  backButton: {
    padding: 4,
  },
  headerIcon: {
    size: 24,
    color: theme.color.textPrimary,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: theme.color.textPrimary,
    marginLeft: 12,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.color.accent + '15',
  },
  markAllButtonDisabled: {
    backgroundColor: 'transparent',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.color.accent,
  },
  markAllTextDisabled: {
    color: theme.color.textMuted,
  },
  list: {
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.color.surface,
  },
  itemUnread: {
    backgroundColor: theme.color.accent + '08',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  notificationIcon: {
    size: 22,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginBottom: 3,
  },
  itemBody: {
    fontSize: 13,
    color: theme.color.textSecondary,
    lineHeight: 18,
    marginBottom: 5,
  },
  itemDate: {
    fontSize: 11,
    color: theme.color.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.color.accent,
    marginTop: 4,
    marginLeft: 8,
    flexShrink: 0,
  },
  chevron: {
    marginLeft: 4,
    alignSelf: 'center',
    flexShrink: 0,
  },
  chevronIcon: {
    size: 16,
    color: theme.color.textMuted,
  },
  separator: {
    height: 1,
    backgroundColor: theme.color.border,
    marginLeft: 72,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  errorIcon: {
    size: 48,
    color: theme.color.textMuted,
  },
  emptyIcon: {
    size: 56,
    color: theme.color.textMuted,
  },
  errorText: {
    fontSize: 15,
    color: theme.color.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: theme.color.accent,
    borderRadius: 20,
  },
  retryText: {
    color: theme.color.surface,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.color.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.color.textMuted,
    textAlign: 'center',
  },
})

export const makeTypeConfig = (theme) => ({
  ORDER_CONFIRMED: {
    icon: 'checkmark-circle',
    color: theme.color.success,
  },
  ORDER_IN_PREPARATION: {
    icon: 'construct',
    color: theme.color.warning,
  },
  ORDER_SHIPPED: {
    icon: 'car',
    color: theme.color.info || '#3B82F6',
  },
  ORDER_DELIVERED: {
    icon: 'home',
    color: theme.color.success,
  },
  ORDER_CANCELLED: {
    icon: 'close-circle',
    color: theme.color.error,
  },
  PAYMENT_FAILED: {
    icon: 'card',
    color: theme.color.error,
  },
  LOW_STOCK: {
    icon: 'alert-circle',
    color: theme.color.warning,
  },
  OUT_OF_STOCK: {
    icon: 'warning',
    color: theme.color.error,
  },
  NEW_COUPON: {
    icon: 'pricetag',
    color: theme.color.accent,
  },
})

export const makeDefaultConfig = (theme) => ({
  icon: 'notifications',
  color: theme.color.accent,
})