import { StyleSheet } from 'react-native'

export const makeStyles = (theme) => StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.color.surfaceSubtle,
  },
  scrollContent: {
    flexGrow: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.color.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: theme.color.surface,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.color.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.color.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  error: {
    color: theme.color.error,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 24,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.color.accent,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: theme.color.accent,
  },
  button: {
    width: '100%',
    backgroundColor: theme.color.accent,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: theme.color.onAccent,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  backButton: {
    marginBottom: 4,
    paddingVertical: 8,
  },
  backButtonText: {
    color: theme.color.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  invisible: {
    opacity: 0,
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipButtonText: {
    color: theme.color.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
})