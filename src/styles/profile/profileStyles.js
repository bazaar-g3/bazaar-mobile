import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { SPACING, FONT } from "../../constants/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#DDEAEA',
  },

  loaderContainer: {
    flex: 1,
    backgroundColor: '#DDEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  topHeader: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
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
    zIndex: 2,
  },

  hamburgerLine: {
    width: 20,
    height: 2,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    marginVertical: 3,
  },

  logoCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },

  homeButton: {
    backgroundColor: '#F4F7F8',
    borderWidth: 1,
    borderColor: '#E4EBEE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    zIndex: 2,
  },

  homeButtonText: {
    color: COLORS.primary,
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
    backgroundColor: COLORS.white,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRightWidth: 1,
    borderRightColor: '#E6ECEC',
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
    color: COLORS.textPrimary,
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
    backgroundColor: '#E7F6F4',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryLight,
  },

  sidebarEmoji: {
    fontSize: 18,
  },

  sidebarText: {
    fontSize: FONT.regular,
    color: COLORS.text,
  },

  sidebarTextActive: {
    color: COLORS.primaryLight,
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
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 22,
    width: '100%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
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
    color: COLORS.text,
  },

  editText: {
    color: COLORS.primaryLight,
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
    backgroundColor: '#D9F4F0',
    borderWidth: 2,
    borderColor: '#BDEAE4',
  },

  changePhotoOverlay: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    borderRadius: 999,
    alignItems: 'center',
  },

  changePhotoText: {
    color: COLORS.white,
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
    color: COLORS.text,
    marginBottom: 4,
  },

  userEmail: {
    fontSize: FONT.regular,
    color: COLORS.textSecondary,
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },

  inputGroup: {
    marginBottom: SPACING.md,
    width: '100%',
  },

  label: {
    fontSize: FONT.small,
    color: COLORS.text,
    marginBottom: 6,
    fontWeight: '500',
  },

  readonlyField: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FCFC',
  },

  valueText: {
    fontSize: FONT.regular,
    color: COLORS.text,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FCFC',
    fontSize: FONT.regular,
    color: COLORS.text,
    width: '100%',
  },

  inputError: {
    borderColor: COLORS.error,
  },

  textArea: {
    minHeight: 86,
    textAlignVertical: 'top',
  },

  charCount: {
    textAlign: 'right',
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 12,
  },

  fieldErrorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },

  successText: {
    color: COLORS.success,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },

  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },

  btnSave: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  btnDisabled: {
    opacity: 0.65,
  },

  btnCancel: {
    backgroundColor: '#EDF5F4',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  btnTextWhite: {
    color: COLORS.white,
    fontWeight: '700',
  },

  btnTextCancel: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  summarySeparator: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.lg,
  },

  summarySection: {
    gap: SPACING.sm,
  },

  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  summaryAction: {
    color: '#C9941A',
    fontWeight: '700',
  },

  summaryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  summaryStatusText: {
    color: COLORS.textSecondary,
  },

  summaryMessageCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
  },

  summaryEmptyTitle: {
    fontSize: FONT.medium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },

  summaryEmptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT.regular,
    marginBottom: 12,
  },

  summaryPublishButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  summaryPublishButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 13,
  },

  summaryErrorText: {
    color: COLORS.error,
    marginBottom: 8,
  },

  summaryRetryText: {
    color: COLORS.primaryLight,
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
    backgroundColor: '#F7FAFA',
  },

  summaryImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: COLORS.imagePlaceholder,
  },

  summaryContent: {
    flex: 1,
  },

  summaryProductName: {
    fontSize: FONT.regular,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },

  summaryMeta: {
    fontSize: FONT.small,
    color: COLORS.textSecondary,
  },

  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT.medium,
    marginTop: 60,
  },
})