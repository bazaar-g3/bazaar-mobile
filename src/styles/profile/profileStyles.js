import { StyleSheet } from "react-native";
import { SPACING, FONT } from "../../constants/theme";

export const makeStyles = (theme) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.color.surfaceSubtle,
  },

  loaderContainer: {
    flex: 1,
    backgroundColor: theme.color.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },

  topHeader: {
    backgroundColor: theme.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
  },

  topHeaderContent: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    minHeight: 44,
  },

  hamburgerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    marginTop: SPACING.sm,
    zIndex: 2,
  },

  hamburgerLine: {
    width: 20,
    height: 2,
    borderRadius: 999,
    backgroundColor: theme.color.accent,
    marginVertical: 3,
  },

  homeButton: {
    backgroundColor: theme.color.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.color.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    zIndex: 2,
  },

  homeButtonText: {
    color: theme.color.accent,
    fontSize: FONT.small,
    fontWeight: '700',
  },

  mainWrapper: {
    flex: 1,
  },

  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 10,
  },

  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 200,
    backgroundColor: theme.color.surface,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRightWidth: 1,
    borderRightColor: theme.color.border,
    zIndex: 11,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },

  sidebarTitle: {
    fontSize: FONT.medium,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginBottom: SPACING.md,
  },

  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  sidebarItemActive: {
    backgroundColor: theme.color.accentTint,
    borderLeftWidth: 4,
    borderLeftColor: theme.color.accentBorder,
  },

  sidebarEmoji: {
    fontSize: 18,
  },

  sidebarText: {
    fontSize: FONT.regular,
    color: theme.color.textPrimary,
  },

  sidebarTextActive: {
    color: theme.color.accent,
    fontWeight: '700',
  },

  contentArea: {
    flex: 1,
  },

  contentContainer: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },

  containerCenter: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },

  card: {
    backgroundColor: theme.color.surface,
    borderRadius: 22,
    padding: 22,
    width: '100%',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.color.textPrimary,
  },

  editText: {
    color: theme.color.accent,
    fontWeight: '700',
    fontSize: FONT.regular,
    textAlign: 'right',
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap', // Permite que si no hay espacio, baje a la siguiente fila
    gap: SPACING.md,   // Espaciado consistente
  },

  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },

  avatarLarge: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: theme.color.accentTint,
    borderWidth: 3,
    borderColor: theme.color.accentBorder,
  },

  changePhotoOverlay: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    backgroundColor: theme.color.accent,
    paddingVertical: 5,
    borderRadius: 999,
    alignItems: 'center',
  },

  changePhotoText: {
    color: theme.color.onAccent,
    fontSize: 11,
    fontWeight: '600',
  },

  profileInfoText: {
    flex: 1,
    minWidth: 200,
  },

  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginBottom: 4,
  },

  userEmail: {
    fontSize: FONT.regular,
    color: theme.color.textSecondary,
  },

  separator: {
    height: 1,
    backgroundColor: theme.color.border,
    marginVertical: SPACING.md,
  },

  inputGroup: {
    marginBottom: SPACING.md,
    width: '100%',
  },

  label: {
    fontSize: FONT.small,
    color: theme.color.textPrimary,
    marginBottom: 6,
    fontWeight: '500',
  },

  readonlyField: {
    borderWidth: 1.5,
    borderColor: theme.color.accentBorder,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.color.accentSubtle,
  },

  valueText: {
    fontSize: FONT.regular,
    color: theme.color.textPrimary,
  },

  input: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.color.surfaceSubtle,
    fontSize: FONT.regular,
    color: theme.color.textPrimary,
    width: '100%',
  },

  inputError: {
    borderColor: theme.color.error,
  },

  textArea: {
    minHeight: 86,
    textAlignVertical: 'top',
  },

  charCount: {
    textAlign: 'right',
    marginTop: 4,
    color: theme.color.textMuted,
    fontSize: 12,
  },

  fieldErrorText: {
    color: theme.color.error,
    fontSize: 12,
    marginTop: 4,
  },

  successText: {
    color: theme.color.success,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },

  errorText: {
    color: theme.color.error,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },

  btnSave: {
    backgroundColor: theme.color.accent,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  btnDisabled: {
    opacity: 0.65,
  },

  btnCancel: {
    backgroundColor: theme.color.accentTint,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  btnTextWhite: {
    color: theme.color.onAccent,
    fontWeight: '700',
  },

  btnTextCancel: {
    color: theme.color.accent,
    fontWeight: '700',
  },

  summarySeparator: {
    height: 1,
    backgroundColor: theme.color.border,
    marginVertical: SPACING.lg,
  },

  summarySection: {
    gap: SPACING.sm,
  },

  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.color.textPrimary,
    flexShrink: 1,
  },

  summaryActionBtn: {
    flexShrink: 0,
  },

  summaryAction: {
    color: theme.color.warning,
    fontWeight: '700',
  },

  summaryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  summaryStatusText: {
    color: theme.color.textSecondary,
  },

  summaryMessageCard: {
    backgroundColor: theme.color.accentSubtle,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  summaryEmptyIcon: {
    marginBottom: 12,
    opacity: 0.6,
  },

  summaryEmptyTitle: {
    fontSize: FONT.medium,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },

  summaryEmptyText: {
    color: theme.color.textSecondary,
    fontSize: FONT.regular,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },

  summaryPublishButton: {
    alignSelf: 'center',
    backgroundColor: theme.color.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  summaryPublishButtonText: {
    color: theme.color.onAccent,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  summaryErrorText: {
    color: theme.color.error,
    marginBottom: 8,
  },

  summaryRetryText: {
    color: theme.color.accent,
    fontWeight: '700',
  },

  summaryList: {
    gap: 10,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.color.surfaceSubtle,
  },

  summaryImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: theme.color.surfaceSubtle,
  },

  summaryContent: {
    flex: 1,
  },

  summaryProductName: {
    fontSize: FONT.regular,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginBottom: 4,
  },

  summaryMeta: {
    fontSize: FONT.small,
    color: theme.color.textSecondary,
  },

  emptyText: {
    textAlign: 'center',
    color: theme.color.textSecondary,
    fontSize: FONT.medium,
    marginTop: 60,
  },
})
