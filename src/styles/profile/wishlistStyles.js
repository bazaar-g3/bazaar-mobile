import { StyleSheet } from 'react-native'

export const makeStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.color.surfaceSubtle,
  },
  mainWrapper: {
    flex: 1,
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 5,
  },
  fullLoader: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.md,
    paddingBottom: theme.space.sm,
  },
  itemCount: {
    fontSize: theme.type.meta.size,
    fontWeight: theme.type.meta.weight,
    color: theme.color.textSecondary,
  },
  listContent: {
    paddingHorizontal: theme.space.md,
    paddingBottom: theme.space.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.space.xl,
  },
  loadingText: {
    marginTop: theme.space.sm,
    color: theme.color.textSecondary,
    fontSize: theme.type.body.size,
  },
  errorIcon: {
    marginBottom: theme.space.md,
  },
  errorText: {
    fontSize: theme.type.body.size,
    color: theme.color.textSecondary,
    textAlign: 'center',
    marginBottom: theme.space.md,
  },
  retryButton: {
    backgroundColor: theme.color.accent,
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space.lg,
    borderRadius: theme.radius.md,
    minHeight: theme.button.minHeight,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: theme.color.onAccent,
    fontWeight: '700',
    fontSize: theme.type.body.size,
  },
  emptyIcon: {
    marginBottom: theme.space.md,
  },
  emptyTitle: {
    fontSize: theme.type.title.size,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginBottom: theme.space.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.type.body.size,
    color: theme.color.textSecondary,
    textAlign: 'center',
    marginBottom: theme.space.lg,
  },
  exploreCatalogButton: {
    backgroundColor: theme.color.accent,
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space.lg,
    borderRadius: theme.radius.md,
    minHeight: theme.button.minHeight,
    justifyContent: 'center',
  },
  exploreCatalogButtonText: {
    color: theme.color.onAccent,
    fontWeight: '700',
    fontSize: theme.type.body.size,
  },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.image,
    marginBottom: theme.space.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardUnavailable: {
    opacity: 0.6,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: 90,
    height: 90,
    borderTopLeftRadius: theme.radius.image,
    borderBottomLeftRadius: theme.radius.image,
    overflow: 'hidden',
  },
  productImage: {
    width: 90,
    height: 90,
    backgroundColor: theme.color.surfaceSubtle,
  },
  overlayBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: 'rgba(198,40,40,0.75)',
  },
  overlayBadgeText: {
    color: theme.color.onAccent,
    fontSize: theme.type.meta.size,
    fontWeight: '700',
  },
  productInfo: {
    flex: 1,
    padding: theme.space.sm,
  },
  productName: {
    fontSize: theme.type.body.size,
    fontWeight: '600',
    color: theme.color.textPrimary,
    marginBottom: theme.space.xs,
  },
  productPrice: {
    fontSize: theme.type.price.size,
    fontWeight: theme.type.price.weight,
    color: theme.color.textPrimary,
  },
  priceUnavailable: {
    color: theme.color.textMuted,
  },
  statusLabel: {
    fontSize: theme.type.meta.size,
    color: theme.color.textMuted,
    marginTop: 2,
  },
  removeButton: {
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.button.minHeight,
  },
  removeButtonText: {
    fontSize: 24,
    color: theme.color.like,
  },
})