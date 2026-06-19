import React, { useMemo } from 'react'
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '../../theme/ThemeContext'
import { PRODUCT_IMAGE_PLACEHOLDER } from '../../services/catalog'
import { makeStyles } from '../../styles/profile/profileStyles'

export default function ActiveProductsSummary({
  products,
  loading,
  error,
  onRetry,
  onOpenPublish,
  onGoToSalesTab,
}) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  return (
    <View style={styles.summarySection}>
      <View style={styles.summaryHeader}>
        <Text style={styles.sectionTitle} numberOfLines={1}>Publicaciones activas</Text>

        <TouchableOpacity onPress={onGoToSalesTab} style={styles.summaryActionBtn}>
          <Text style={styles.summaryAction} numberOfLines={1}>Ver publicaciones</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.summaryStatus}>
          <ActivityIndicator size="small" color={theme.color.accent} />
          <Text style={styles.summaryStatusText}>Cargando resumen...</Text>
        </View>
      ) : error ? (
        <View style={styles.summaryMessageCard}>
          <Text style={styles.summaryErrorText}>{error}</Text>

          <TouchableOpacity onPress={onRetry}>
            <Text style={styles.summaryRetryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.summaryMessageCard}>
          <View style={styles.summaryEmptyIcon}>
            <Ionicons name="storefront-outline" size={48} color={theme.color.accent} />
          </View>

          <Text style={styles.summaryEmptyTitle}>
            Todavía no tenés publicaciones activas
          </Text>

          <Text style={styles.summaryEmptyText}>
            Publicá tu primer producto y empezará a aparecer aquí y en el inicio de Bazaar.
          </Text>

          <TouchableOpacity
            style={styles.summaryPublishButton}
            onPress={onOpenPublish}
          >
            <Text style={styles.summaryPublishButtonText}>Publicar ahora</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.summaryList}>
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.summaryRow}
              activeOpacity={0.9}
              onPress={onGoToSalesTab}
            >
              <Image
                source={{
                  uri: product.images?.[0] || PRODUCT_IMAGE_PLACEHOLDER,
                }}
                style={styles.summaryImage}
              />

              <View style={styles.summaryContent}>
                <Text style={styles.summaryProductName} numberOfLines={1}>
                  {product.name}
                </Text>

                <Text style={styles.summaryMeta}>
                  ${Number(product.price).toLocaleString('es-AR')} · Stock{' '}
                  {product.stock}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}