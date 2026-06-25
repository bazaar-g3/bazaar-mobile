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
    maxWidth: 360,
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
    marginBottom: 24,
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
  rightIconButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  button: {
    backgroundColor: theme.color.accent,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  registerText: {
    textAlign: 'center',
    color: theme.color.textPrimary,
    fontSize: 14,
  },
  registerLink: {
    color: theme.color.accent,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  error: {
    color: theme.color.error,
    textAlign: 'center',
    marginBottom: 14,
    fontSize: 14,
  },
})