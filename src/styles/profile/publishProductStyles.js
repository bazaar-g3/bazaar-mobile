import { StyleSheet } from 'react-native'
import { SPACING, FONT } from '../../constants/theme'

export const makeStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#DDEAEA',
  },

  screen: {
    flex: 1,
    backgroundColor: '#DDEAEA',
  },

  content: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },

  header: {
    width: '100%',
    maxWidth: 920,
    marginBottom: SPACING.md,
  },

  backButton: {
    color: theme.color.accent,
    fontSize: FONT.medium,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },

  title: {
    color: theme.color.textPrimary,
    fontSize: FONT.title,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },

  subtitle: {
    color: theme.color.textSecondary,
    fontSize: FONT.regular,
    lineHeight: 22,
  },

  card: {
    width: '100%',
    maxWidth: 920,
    backgroundColor: theme.color.surface,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.color.border,
  },

  fieldGroup: {
    marginBottom: SPACING.md,
  },

  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  halfField: {
    flex: 1,
  },

  label: {
    color: theme.color.textPrimary,
    fontSize: FONT.regular,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },

  helperText: {
    color: theme.color.textMuted,
    fontSize: FONT.small,
    lineHeight: 18,
  },

  input: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: FONT.regular,
    color: theme.color.textPrimary,
    backgroundColor: '#F8FCFC',
  },

  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },

  inputError: {
    borderColor: theme.color.error,
  },

  fieldError: {
    color: theme.color.error,
    fontSize: FONT.small,
    marginTop: SPACING.xs,
  },

  errorText: {
    color: theme.color.error,
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: SPACING.md,
    fontSize: FONT.small,
  },

  inlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },

  inlineStatusText: {
    color: theme.color.textSecondary,
    fontSize: FONT.small,
  },

  inlineErrorBox: {
    backgroundColor: '#FFF9E8',
    borderLeftWidth: 3,
    borderLeftColor: theme.color.accent,
    borderRadius: 10,
    padding: SPACING.md,
  },

  inlineErrorText: {
    color: theme.color.textPrimary,
    fontSize: FONT.small,
  },

  inlineErrorAction: {
    color: theme.color.accent,
    fontWeight: '700',
    marginTop: SPACING.sm,
    fontSize: FONT.small,
  },

  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  categoryChip: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F8FCFC',
  },

  categoryChipSelected: {
    borderColor: theme.color.accent,
    backgroundColor: '#E7F6F4',
  },

  categoryChipText: {
    color: theme.color.textSecondary,
    fontWeight: '600',
    fontSize: FONT.small,
  },

  categoryChipTextSelected: {
    color: theme.color.accent,
  },

  imagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },

  imagesHeaderText: {
    flex: 1,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.color.accent,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: theme.color.surface,
  },

  secondaryButtonText: {
    color: theme.color.accent,
    fontWeight: '700',
    fontSize: FONT.small,
  },

  emptyImageState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#F8FCFC',
  },

  emptyImageText: {
    flex: 1,
    color: theme.color.textSecondary,
    fontSize: FONT.small,
  },

  emptyPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: theme.color.surfaceSubtle,
  },

  previewCard: {
    position: 'relative',
    marginRight: 10,
  },

  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surfaceSubtle,
    resizeMode: 'cover',
  },

  primaryBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  primaryBadgeText: {
    color: theme.color.onAccent,
    fontSize: 10,
    fontWeight: '700',
  },

  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeImageButtonText: {
    color: theme.color.onAccent,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
  },

  actions: {
    flexDirection: 'column',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },

  primaryButton: {
    backgroundColor: theme.color.accent,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    minHeight: theme.button.minHeight,
  },

  primaryButtonText: {
    color: theme.color.onAccent,
    fontWeight: '800',
    fontSize: FONT.regular,
  },

  cancelButton: {
    backgroundColor: '#EDF5F4',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: theme.color.accent,
    fontWeight: '700',
    fontSize: FONT.regular,
  },

  disabledButton: {
    opacity: 0.6,
  },
})