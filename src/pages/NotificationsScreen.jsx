import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '../theme/ThemeContext'
import { getNotificationsHistory, markAllNotificationsRead } from '../services/notifications'
import {
  makeStyles,
  makeTypeConfig,
  makeDefaultConfig,
} from '../styles/notificationsStyles'

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

  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

const STOCK_TYPES = new Set(['LOW_STOCK', 'OUT_OF_STOCK'])

const ORDER_TYPES = new Set([
  'ORDER_CONFIRMED',
  'ORDER_IN_PREPARATION',
  'ORDER_SHIPPED',
  'ORDER_DELIVERED',
  'ORDER_CANCELLED',
  'PAYMENT_FAILED',
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

function NotificationItem({
  item,
  styles,
  onPress,
  typeConfig,
  defaultConfig,
}) {
  const config = typeConfig[item.notification_type] || defaultConfig
  const destination = getDestination(item)

  const inner = (
    <>
      <View style={[styles.iconCircle, { backgroundColor: config.color + '20' }]}>
        <Ionicons
          name={config.icon}
          size={styles.notificationIcon.size}
          color={config.color}
        />
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemBody}>{item.body}</Text>
        <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
      </View>

      {!item.read && <View style={styles.unreadDot} />}

      {destination && (
        <Ionicons
          name="chevron-forward"
          size={styles.chevronIcon.size}
          color={styles.chevronIcon.color}
          style={styles.chevron}
        />
      )}
    </>
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
  const typeConfig = useMemo(() => makeTypeConfig(theme), [theme])
  const defaultConfig = useMemo(() => makeDefaultConfig(theme), [theme])

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
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleNotificationPress = (destination) => {
    router.push(destination)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={styles.headerIcon.size}
            color={styles.headerIcon.color}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notificaciones</Text>

        <TouchableOpacity
          onPress={handleMarkAllRead}
          style={[
            styles.markAllButton,
            unreadCount === 0 && styles.markAllButtonDisabled,
          ]}
          disabled={unreadCount === 0}
        >
          <Text
            style={[
              styles.markAllText,
              unreadCount === 0 && styles.markAllTextDisabled,
            ]}
          >
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
          <Ionicons
            name="cloud-offline-outline"
            size={styles.errorIcon.size}
            color={styles.errorIcon.color}
          />

          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons
            name="notifications-off-outline"
            size={styles.emptyIcon.size}
            color={styles.emptyIcon.color}
          />

          <Text style={styles.emptyTitle}>Sin notificaciones</Text>
          <Text style={styles.emptySubtitle}>Tus notificaciones aparecerán acá</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              item={item}
              styles={styles}
              onPress={handleNotificationPress}
              typeConfig={typeConfig}
              defaultConfig={defaultConfig}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.color.accent]}
            />
          }
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  )
}