import { StyleSheet } from 'react-native'
import { FONT, SPACING } from "../constants/theme";

export const makeReviewStyles = (theme) => StyleSheet.create({
  sectionTitle: {
    fontSize: FONT.medium,
    fontWeight: '800',
    color: theme.color.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  reputationCard: {
    backgroundColor: theme.color.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  reputationSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  reputationScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  reputationScoreValue: {
    fontSize: FONT.title,
    fontWeight: '800',
    color: theme.color.textPrimary,
    lineHeight: 34,
  },
  reputationStarIcon: {
    fontSize: FONT.large,
    color: theme.color.like,
  },
  reputationCount: {
    fontSize: FONT.small,
    color: theme.color.textSecondary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: theme.color.border,
    marginBottom: SPACING.sm,
  },
  reviewItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewStar: {
    fontSize: FONT.regular,
  },
  reviewDate: {
    fontSize: 11,
    color: theme.color.textMuted,
  },
  reviewComment: {
    fontSize: FONT.small,
    color: theme.color.textSecondary,
    lineHeight: 19,
    marginTop: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT.small,
    color: theme.color.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
});

export const makeHeaderStyles = (theme) => StyleSheet.create({
  topHeader: {
    backgroundColor: theme.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    paddingHorizontal: 16,
    paddingVertical: 25,
  },

  topHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },

  headerBack: {
    fontSize: FONT.medium,
    fontWeight: "700",
    color: theme.color.accent,
    zIndex: 2,
  },

  placeholder: {
    width: 26,
  },

  wishlistIcon: {
    fontSize: 26,
    color: theme.color.textMuted,
    zIndex: 2,
  },

  wishlistIconActive: {
    color: theme.color.like,
  },

  wishlistIconLoading: {
    opacity: 0.4,
  },
});
