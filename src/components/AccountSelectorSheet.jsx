import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { useMemo } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/ThemeContext'

/**
 * Modal que aparece cuando hay más de una cuenta vinculada al PIN o la biometría
 * en este dispositivo. Permite al usuario seleccionar con qué cuenta continuar.
 *
 * @param {boolean} visible
 * @param {Array<{email: string, name: string, avatarUrl: string|null}>} accounts
 * @param {Function} onSelect - Recibe el objeto de cuenta seleccionado.
 * @param {Function} onCancel
 */
export default function AccountSelectorSheet({ visible, accounts = [], onSelect, onCancel }) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Seleccioná tu cuenta</Text>
          <Text style={styles.subtitle}>¿Con qué cuenta querés ingresar?</Text>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {accounts.map((account, index) => (
              <View key={account.email}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.accountRow}
                  onPress={() => onSelect(account)}
                  activeOpacity={0.7}
                >
                  {account.avatarUrl ? (
                    <Image source={{ uri: account.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Ionicons name="person" size={20} color={theme.color.onAccent} />
                    </View>
                  )}
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName} numberOfLines={1}>{account.name}</Text>
                    <Text style={styles.accountEmail} numberOfLines={1}>{account.email}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.color.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const makeStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.color.surface,
    borderRadius: 16,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 8,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.color.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: theme.color.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    maxHeight: 280,
  },
  listContent: {
    paddingBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.color.border,
    marginHorizontal: 4,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarFallback: {
    backgroundColor: theme.color.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 12,
    color: theme.color.textMuted,
  },
  cancelButton: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
  },
  cancelButtonText: {
    color: theme.color.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
})
