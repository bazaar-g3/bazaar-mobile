import { StyleSheet } from 'react-native'

export const makeStyles = (theme) => StyleSheet.create({
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
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.color.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: theme.color.textSecondary,
    marginBottom: 22,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputWrapper: {
    height: 52,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    borderRadius: 10,
    backgroundColor: theme.color.surface,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: theme.color.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
  },
  button: {
    backgroundColor: theme.color.accent,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 18,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: theme.color.onAccent,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  link: {
    color: theme.color.accent,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  error: {
    color: theme.color.error,
    textAlign: 'center',
    marginBottom: 14,
    fontSize: 14,
  },
  success: {
    color: theme.color.success,
    textAlign: 'center',
    marginBottom: 14,
    fontSize: 14,
  },
})