import { StyleSheet } from 'react-native'

export const makeStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.color.surfaceSubtle,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.color.surfaceSubtle,
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: theme.color.accent,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minHeight: theme.button.minHeight,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: theme.color.onAccent,
    fontWeight: '800',
    fontSize: 15,
  },
  backButton: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.color.accent,
    marginBottom: 20,
  },

  // ── Profile header card ──────────────────────────────────────────
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: 20,
    padding: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    flexShrink: 0,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: theme.color.accentBorder,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.color.accentTint,
    borderWidth: 2.5,
    borderColor: theme.color.accentBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.color.accent,
  },
  profileInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.color.textPrimary,
    marginBottom: 6,
  },
  ratingLoader: {
    alignSelf: 'flex-start',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingStar: {
    fontSize: 14,
    color: theme.color.like,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.color.textPrimary,
  },
  ratingCount: {
    fontSize: 13,
    color: theme.color.textSecondary,
  },
  noRating: {
    fontSize: 13,
    color: theme.color.textMuted,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.color.textSecondary,
    marginTop: 14,
  },

  // ── Section header ───────────────────────────────────────────────
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.color.textPrimary,
    marginTop: 28,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: theme.color.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },

  // ── Reviews ──────────────────────────────────────────────────────
  reputationCard: {
    backgroundColor: theme.color.surface,
    borderRadius: 16,
    padding: 16,
  },
  reviewItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewStar: {
    fontSize: 14,
  },
  reviewDate: {
    fontSize: 12,
    color: theme.color.textMuted,
  },
  reviewComment: {
    fontSize: 14,
    color: theme.color.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },

  // ── Product grid (2 columnas) ────────────────────────────────────
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
})