import { StyleSheet } from 'react-native'

export const makeStyles = (theme) => StyleSheet.create({
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
  loader: {
    marginTop: 16,
  },
  lockoutContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  lockIcon: {
    marginBottom: 12,
  },
  lockoutTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.color.error,
    marginBottom: 8,
  },
  lockoutText: {
    fontSize: 14,
    color: theme.color.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  lockoutTimer: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.color.accent,
    marginBottom: 8,
  },
  emailButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  emailButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emailButtonText: {
    color: theme.color.accent,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
})