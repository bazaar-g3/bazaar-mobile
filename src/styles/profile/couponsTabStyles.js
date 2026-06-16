import { StyleSheet } from 'react-native'

import { FONT, SPACING } from '../../constants/theme'

export const makeStyles = (theme) => StyleSheet.create({
    couponsContainer: {
        width: '100%',
        backgroundColor: theme.color.surface,
        borderRadius: 22,
        padding: 32,
        gap: SPACING.lg,
    },

    couponsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: SPACING.md,
    },

    couponsHeaderMobile: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: SPACING.sm,
    },

    cardTitle: {
        fontSize: FONT.xlarge ?? 26,
        fontWeight: '900',
        color: theme.color.textPrimary,
        letterSpacing: -0.3,
        flexShrink: 1,
    },

    couponsSubtitle: {
        marginTop: 6,
        color: theme.color.textMuted,
        fontSize: FONT.medium ?? 16,
        lineHeight: 22,
        flexShrink: 1,
    },

    couponCreateButton: {
        backgroundColor: theme.color.accent,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
        alignSelf: 'flex-start',
    },

    couponCreateButtonText: {
        color: theme.color.onAccent,
        fontWeight: '800',
        fontSize: FONT.medium ?? 16,
    },

    couponsList: {
        gap: SPACING.md,
    },

    couponCard: {
        borderWidth: 1,
        borderColor: theme.color.accent,
        borderRadius: 18,
        padding: SPACING.lg,
        backgroundColor: theme.color.surfaceSubtle,
        gap: SPACING.sm,
    },

    couponCardMobile: {
        padding: 18,
        gap: 12,
    },

    couponCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: SPACING.sm,
    },

    couponCardHeaderMobile: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },

    couponCodeBox: {
        flex: 1,
    },

    couponCode: {
        fontSize: 26,
        fontWeight: '900',
        color: theme.color.textPrimary,
        letterSpacing: 0.3,
        flexShrink: 1,
    },

    couponDiscount: {
        marginTop: 4,
        fontSize: FONT.medium ?? 16,
        fontWeight: '800',
        color: theme.color.accent,
    },

    couponMeta: {
        color: theme.color.textMuted,
        fontSize: FONT.small,
        fontWeight: '600',
    },

    couponStatusBadge: {
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: theme.color.border,
    },

    couponStatusBadgeMobile: {
        alignSelf: 'flex-start',
    },

    couponStatusActive: {
        backgroundColor: theme.color.successLight,
    },

    couponStatusInactive: {
        backgroundColor: theme.color.surfaceSubtle,
    },

    couponStatusExpired: {
        backgroundColor: theme.color.errorLight,
    },

    couponStatusText: {
        fontSize: FONT.small ?? 14,
        fontWeight: '800',
        color: theme.color.textPrimary,
    },

    couponActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: SPACING.sm,
    },

    couponToggleButton: {
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: 999,
        alignSelf: 'flex-start',
        borderWidth: 1,
    },

    couponDisableButton: {
        backgroundColor: theme.color.errorLight,
        borderColor: theme.color.errorBorder,
    },

    couponEnableButton: {
        backgroundColor: theme.color.successLight,
        borderColor: theme.color.successBorder,
    },

    couponActionText: {
        fontWeight: '800',
        color: theme.color.textPrimary,
        fontSize: 13,
    },

    couponModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.38)',
    },

    couponModalScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: SPACING.md,
    },

    couponModalCard: {
        width: '100%',
        maxWidth: 460,
        backgroundColor: theme.color.surface,
        borderRadius: 22,
        padding: 28,
        gap: SPACING.md,
    },

    couponModalTitle: {
        fontSize: FONT.xlarge ?? 26,
        fontWeight: '900',
        color: theme.color.textPrimary,
        marginBottom: SPACING.xs,
    },

    couponModalSubtitle: {
        color: theme.color.textMuted,
        fontSize: FONT.small,
        lineHeight: 20,
    },

    couponInputGroup: {
        gap: 8,
    },

    couponInputLabel: {
        fontSize: FONT.small,
        fontWeight: '700',
        color: theme.color.textPrimary,
    },

    couponInput: {
        borderWidth: 1,
        borderColor: theme.color.accent,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontSize: FONT.medium ?? 16,
        color: theme.color.textPrimary,
        backgroundColor: theme.color.surfaceSubtle,
    },

    couponModalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: SPACING.sm,
        marginTop: SPACING.md,
    },

    couponModalCancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,
        backgroundColor: theme.color.surfaceSubtle,
    },

    couponModalCancelText: {
        color: theme.color.textPrimary,
        fontWeight: '700',
        fontSize: FONT.medium ?? 16,
    },

    couponModalSubmitButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: theme.color.accent,
    },

    couponModalSubmitText: {
        color: theme.color.onAccent,
        fontWeight: '800',
        fontSize: FONT.medium ?? 16,
    },

    btnDisabled: {
        opacity: 0.6,
    },

    summaryStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.md,
    },

    summaryStatusText: {
        color: theme.color.textMuted,
        fontSize: FONT.small,
    },

    summaryMessageCard: {
        backgroundColor: theme.color.surfaceSubtle,
        borderRadius: 16,
        padding: SPACING.lg,
        gap: SPACING.xs,
    },

    summaryEmptyTitle: {
        fontSize: FONT.medium,
        fontWeight: '800',
        color: theme.color.textPrimary,
    },

    summaryEmptyText: {
        color: theme.color.textMuted,
        fontSize: FONT.small,
        lineHeight: 20,
    },

    summaryErrorText: {
        color: theme.color.error,
        fontWeight: '700',
    },

    summaryRetryText: {
        color: theme.color.accent,
        fontWeight: '800',
    },

    couponCreateButtonMobile: {
        width: 52,
        height: 52,
        borderRadius: 999,
        paddingVertical: 0,
        paddingHorizontal: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },

    couponCreateButtonTextMobile: {
        fontSize: 28,
        lineHeight: 30,
        fontWeight: '900',
    },

    couponsTitleBox: {
        flex: 1,
        minWidth: 0,
    },

    couponMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
})
