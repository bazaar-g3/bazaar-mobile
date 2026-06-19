import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/ThemeContext'
import { getNotificationsHistory, markAllNotificationsRead } from '../services/notifications'

function formatDate(isoStr) {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Hace ${diffHours} h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `Hace ${diffDays} d`
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const STOCK_TYPES = new Set(['LOW_STOCK', 'OUT_OF_STOCK'])
const ORDER_TYPES = new Set([
  'ORDER_CONFIRMED', 'ORDER_IN_PREPARATION', 'ORDER_SHIPPED',
  'ORDER_DELIVERED', 'ORDER_CANCELLED', 'PAYMENT_FAILED',
])

function getDestination(item) {
  if (STOCK_TYPES.has(item.notification_type)) {
    return '/profile?activeTab=Publicaciones'
  }
  if (ORDER_TYPES.has(item.notification_type) && item.data?.order_id) {
    return `/orders?orderId=${item.data.order_id}`
  }
  return null
}

function NotificationItem({ item, styles, onPress, typeConfig, defaultConfig }) {
  const config = typeConfig[item.notification_type] || defaultConfig
  const destination = getDestination(item)

  return (
    <View style={[styles.item, !item.read && styles.itemUnread]}>
      <View style={[styles.iconCircle, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon} size={22} color={config.color} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemBody}>{item.body}</Text>
        <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
      {destination && (
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.chevron} />
      )}
    </View>
  )

  if (destination) {
    return (
      <TouchableOpacity
        style={[styles.item, !item.read && styles.itemUnread]}
        onPress={() => onPress(destination)}
        activeOpacity={0.7}
      >
        {inner}
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.item, !item.read && styles.itemUnread]}>
      {inner}
    </View>
  )
}

export default function NotificationsScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const TYPE_CONFIG = {
    ORDER_CONFIRMED:      { icon: 'checkmark-circle',   color: theme.color.success },
    ORDER_IN_PREPARATION: { icon: 'construct',           color: '#F59E0B' },
    ORDER_SHIPPED:        { icon: 'car',                 color: '#3B82F6' },
    ORDER_DELIVERED:      { icon: 'home',                color: theme.color.success },
    ORDER_CANCELLED:      { icon: 'close-circle',        color: theme.color.error },
    PAYMENT_FAILED:       { icon: 'card',                color: theme.color.error },
    LOW_STOCK:            { icon: 'alert-circle',        color: '#F59E0B' },
    OUT_OF_STOCK:         { icon: 'warning',             color: theme.color.error },
    NEW_COUPON:           { icon: 'pricetag',            color: theme.color.accent },
  }
  const DEFAULT_CONFIG = { icon: 'notifications', color: theme.color.accent }


  const handleNotificationPress = (destination) => {
    router.push(destination)
  }
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await getNotificationsHistory()
      setNotifications(data.notifications)
      setUnreadCount(data.unread_count)
      setError('')
    } catch {
      setError('No se pudo cargar el historial')
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [load])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return
    await markAllNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.color.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <TouchableOpacity
          onPress={handleMarkAllRead}
          style={[styles.markAllButton, unreadCount === 0 && styles.markAllButtonDisabled]}
          disabled={unreadCount === 0}
        >
          <Text style={[styles.markAllText, unreadCount === 0 && styles.markAllTextDisabled]}>
            Marcar como leído
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.color.accent} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color={theme.color.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="notifications-off-outline" size={56} color={theme.color.textMuted} />
          <Text style={styles.emptyTitle}>Sin notificaciones</Text>
          <Text style={styles.emptySubtitle}>Tus notificaciones aparecerán acá</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <NotificationItem item={item} styles={styles} onPress={handleNotificationPress} typeConfig={TYPE_CONFIG} defaultConfig={DEFAULT_CONFIG} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.color.accent]} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  )
}

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.surfaceSubtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: theme.color.textPrimary,
    marginLeft: 12,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.color.accent + '15',
  },
  markAllButtonDisabled: {
    backgroundColor: 'transparent',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.color.accent,
  },
  markAllTextDisabled: {
    color: theme.color.textMuted,
  },
  list: {
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.color.surface,
  },
  itemUnread: {
    backgroundColor: theme.color.accent + '08',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginBottom: 3,
  },
  itemBody: {
    fontSize: 13,
    color: theme.color.textSecondary,
    lineHeight: 18,
    marginBottom: 5,
  },
  itemDate: {
    fontSize: 11,
    color: theme.color.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.color.accent,
    marginTop: 4,
    marginLeft: 8,
    flexShrink: 0,
  },
  chevron: {
    marginLeft: 4,
    alignSelf: 'center',
    flexShrink: 0,
  },
  separator: {
    height: 1,
    backgroundColor: theme.color.border,
    marginLeft: 72,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 15,
    color: theme.color.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: theme.color.accent,
    borderRadius: 20,
  },
  retryText: {
    color: theme.color.surface,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.color.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.color.textMuted,
    textAlign: 'center',
  },
})
