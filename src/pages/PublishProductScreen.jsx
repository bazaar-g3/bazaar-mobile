import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Logo from '../components/Logo'
import { COLORS } from '../constants/colors'
import { SPACING, FONT } from '../constants/theme'
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  createProduct,
  getCatalogErrorMessage,
  getCatalogValidationErrors,
  listProductCategories,
} from '../services/catalog'
import { getSessionStatus } from '../services/session'
import { buildLoginRedirect } from '../utils/authRedirect'

const MAX_IMAGES = 5

function normalizeRouteParam(value) {
  return Array.isArray(value) ? value[0] : value
}

function validateForm({ name, description, price, stock, categorySlug, images }) {
  const errors = {}
  const normalizedPrice = String(price).trim().replace(',', '.')
  const normalizedStock = String(stock).trim()

  if (!name.trim()) {
    errors.name = 'El nombre es obligatorio'
  }

  if (!description.trim()) {
    errors.description = 'La descripcion es obligatoria'
  }

  if (!normalizedPrice) {
    errors.price = 'El precio es obligatorio'
  } else if (Number.isNaN(Number(normalizedPrice))) {
    errors.price = 'El precio debe ser un numero valido'
  } else if (Number(normalizedPrice) <= 0) {
    errors.price = 'El precio debe ser mayor a cero'
  }

  if (!normalizedStock) {
    errors.stock = 'El stock inicial es obligatorio'
  } else if (!/^-?\d+$/.test(normalizedStock)) {
    errors.stock = 'El stock inicial debe ser un numero entero valido'
  } else if (Number.parseInt(normalizedStock, 10) < 0) {
    errors.stock = 'El stock inicial no puede ser negativo'
  }

  if (!categorySlug) {
    errors.categorySlug = 'La categoria es obligatoria'
  }

  if (!images.length) {
    errors.images = 'Debes subir al menos una imagen'
  }

  return errors
}

export default function PublishProductScreen() {
  const router = useRouter()
  const { from } = useLocalSearchParams()
  const origin = normalizeRouteParam(from) === 'profile' ? 'profile' : 'home'

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [selectedImages, setSelectedImages] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoriesError, setCategoriesError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const canSubmit = useMemo(
    () => !submitting && !checkingSession && !loadingCategories,
    [submitting, checkingSession, loadingCategories]
  )

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true)
    setCategoriesError('')

    try {
      const nextCategories = await listProductCategories()
      setCategories(nextCategories)
      setCategorySlug((current) => current || nextCategories[0]?.slug || '')
    } catch (error) {
      setCategoriesError(
        getCatalogErrorMessage(error, 'No pudimos cargar las categorias disponibles')
      )
    } finally {
      setLoadingCategories(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function checkSession() {
      const session = await getSessionStatus()

      if (!session.isAuthenticated) {
        router.replace(
          buildLoginRedirect({
            redirectPath: '/publish-product',
            redirectFrom: origin,
          })
        )
        return
      }

      if (!cancelled) {
        setCheckingSession(false)
      }
    }

    checkSession()

    return () => {
      cancelled = true
    }
  }, [origin, router])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  async function handlePickImages() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galeria para subir fotos.')
      return
    }

    const remainingSlots = MAX_IMAGES - selectedImages.length
    if (remainingSlots <= 0) {
      Alert.alert('Limite alcanzado', `Solo podes subir hasta ${MAX_IMAGES} imagenes.`)
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.8,
    })

    if (result.canceled || !result.assets?.length) return

    const mergedImages = [...selectedImages, ...result.assets].slice(0, MAX_IMAGES)
    setSelectedImages(mergedImages)
    setFieldErrors((current) => ({ ...current, images: undefined }))
    setSubmitError('')
  }

  function handleRemoveImage(indexToRemove) {
    setSelectedImages((current) => current.filter((_, index) => index !== indexToRemove))
  }

  function navigateAfterSuccess() {
    const refreshCatalog = String(Date.now())

    if (origin === 'profile') {
      router.replace({
        pathname: '/profile',
        params: {
          activeTab: 'Ventas',
          refreshCatalog,
        },
      })
      return
    }

    router.replace({
      pathname: '/home',
      params: { refreshCatalog },
    })
  }

  async function handleSubmit() {
    setSubmitError('')
    const clientErrors = validateForm({
      name,
      description,
      price,
      stock,
      categorySlug,
      images: selectedImages,
    })

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      return
    }

    setFieldErrors({})
    setSubmitting(true)

    try {
      await createProduct({
        name: name.trim(),
        description: description.trim(),
        price: String(price).trim().replace(',', '.'),
        stock: String(stock).trim(),
        categorySlug,
        images: selectedImages,
      })

      navigateAfterSuccess()
    } catch (error) {
      if (error.status === 401) {
        router.replace('/login')
        return
      }

      const validationErrors = getCatalogValidationErrors(error)
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors)
      } else {
        setSubmitError(getCatalogErrorMessage(error, 'No se pudo publicar el producto'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <View style={styles.topHeaderContent}>
          <View style={styles.headerSidePlaceholder} />

          <View style={styles.logoCenter}>
            <Logo size={30} textSize={28} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.backButton}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Publicar producto</Text>
          <Text style={styles.subtitle}>
            Completá la información y subí al menos una foto. La primera imagen será la principal.
          </Text>
        </View>

        <View style={styles.card}>
          {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={[styles.input, fieldErrors.name && styles.inputError]}
              value={name}
              onChangeText={(value) => {
                setName(value)
                setFieldErrors((current) => ({ ...current, name: undefined }))
              }}
              placeholder="Ej: Teclado mecánico"
              placeholderTextColor={COLORS.textMuted}
              maxLength={120}
            />
            {fieldErrors.name ? <Text style={styles.fieldError}>{fieldErrors.name}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea, fieldErrors.description && styles.inputError]}
              value={description}
              onChangeText={(value) => {
                setDescription(value)
                setFieldErrors((current) => ({ ...current, description: undefined }))
              }}
              placeholder="Contá el estado del producto, detalles y uso"
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={4000}
            />
            {fieldErrors.description ? (
              <Text style={styles.fieldError}>{fieldErrors.description}</Text>
            ) : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Precio</Text>
              <TextInput
                style={[styles.input, fieldErrors.price && styles.inputError]}
                value={price}
                onChangeText={(value) => {
                  setPrice(value)
                  setFieldErrors((current) => ({ ...current, price: undefined }))
                }}
                placeholder="25000"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
              />
              {fieldErrors.price ? <Text style={styles.fieldError}>{fieldErrors.price}</Text> : null}
            </View>

            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Stock inicial</Text>
              <TextInput
                style={[styles.input, fieldErrors.stock && styles.inputError]}
                value={stock}
                onChangeText={(value) => {
                  setStock(value)
                  setFieldErrors((current) => ({ ...current, stock: undefined }))
                }}
                placeholder="1"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
              />
              {fieldErrors.stock ? <Text style={styles.fieldError}>{fieldErrors.stock}</Text> : null}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Categoría</Text>

            {loadingCategories ? (
              <View style={styles.inlineStatus}>
                <ActivityIndicator color={COLORS.primaryLight} size="small" />
                <Text style={styles.inlineStatusText}>Cargando categorías...</Text>
              </View>
            ) : categoriesError ? (
              <View style={styles.inlineErrorBox}>
                <Text style={styles.inlineErrorText}>{categoriesError}</Text>
                <TouchableOpacity onPress={loadCategories}>
                  <Text style={styles.inlineErrorAction}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.categoryChips}>
                {categories.map((category) => {
                  const isSelected = category.slug === categorySlug
                  return (
                    <TouchableOpacity
                      key={category.slug}
                      style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                      onPress={() => {
                        setCategorySlug(category.slug)
                        setFieldErrors((current) => ({ ...current, categorySlug: undefined }))
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextSelected,
                        ]}
                      >
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}

            {fieldErrors.categorySlug ? (
              <Text style={styles.fieldError}>{fieldErrors.categorySlug}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.imagesHeader}>
              <View style={styles.imagesHeaderText}>
                <Text style={styles.label}>Imágenes</Text>
                <Text style={styles.helperText}>Hasta 5 imágenes JPG, PNG o WebP de 10 MB.</Text>
              </View>

              <TouchableOpacity style={styles.secondaryButton} onPress={handlePickImages}>
                <Text style={styles.secondaryButtonText}>Agregar fotos</Text>
              </TouchableOpacity>
            </View>

            {fieldErrors.images ? <Text style={styles.fieldError}>{fieldErrors.images}</Text> : null}

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imagesRow}>
                {selectedImages.length === 0 ? (
                  <View style={styles.emptyImageState}>
                    <Image
                      source={{ uri: PRODUCT_IMAGE_PLACEHOLDER }}
                      style={styles.previewImage}
                    />
                    <Text style={styles.emptyImageText}>Todavía no seleccionaste imágenes.</Text>
                  </View>
                ) : (
                  selectedImages.map((image, index) => (
                    <View key={`${image.uri}-${index}`} style={styles.previewCard}>
                      <Image source={{ uri: image.uri }} style={styles.previewImage} />
                      {index === 0 ? (
                        <View style={styles.primaryBadge}>
                          <Text style={styles.primaryBadgeText}>Principal</Text>
                        </View>
                      ) : null}
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Text style={styles.removeImageButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, !canSubmit && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Publicar producto</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#DDEAEA',
  },

  screen: {
    flex: 1,
    backgroundColor: '#DDEAEA',
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
    minHeight: 44,
  },

  headerSidePlaceholder: {
    flex: 1,
  },

  logoCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  content: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },

  header: {
    width: '100%',
    maxWidth: 920,
    marginBottom: SPACING.md,
  },

  backButton: {
    color: COLORS.primary,
    fontSize: FONT.medium,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },

  title: {
    color: COLORS.textPrimary,
    fontSize: FONT.title,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT.regular,
    lineHeight: 22,
  },

  card: {
    width: '100%',
    maxWidth: 920,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.divider,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  fieldGroup: {
    marginBottom: SPACING.md,
  },

  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  halfField: {
    flex: 1,
  },

  label: {
    color: COLORS.textPrimary,
    fontSize: FONT.regular,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },

  helperText: {
    color: COLORS.textMuted,
    fontSize: FONT.small,
    lineHeight: 18,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: FONT.regular,
    color: COLORS.textPrimary,
    backgroundColor: '#F8FCFC',
  },

  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },

  inputError: {
    borderColor: COLORS.error,
  },

  fieldError: {
    color: COLORS.error,
    fontSize: FONT.small,
    marginTop: SPACING.xs,
  },

  errorText: {
    color: COLORS.error,
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: SPACING.md,
    fontSize: FONT.small,
  },

  inlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },

  inlineStatusText: {
    color: COLORS.textSecondary,
    fontSize: FONT.small,
  },

  inlineErrorBox: {
    backgroundColor: '#FFF9E8',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
    borderRadius: 10,
    padding: SPACING.md,
  },

  inlineErrorText: {
    color: COLORS.dark,
    fontSize: FONT.small,
  },

  inlineErrorAction: {
    color: COLORS.primaryLight,
    fontWeight: '700',
    marginTop: SPACING.sm,
    fontSize: FONT.small,
  },

  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  categoryChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F8FCFC',
  },

  categoryChipSelected: {
    borderColor: COLORS.primaryLight,
    backgroundColor: '#E7F6F4',
  },

  categoryChipText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: FONT.small,
  },

  categoryChipTextSelected: {
    color: COLORS.primary,
  },

  imagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },

  imagesHeaderText: {
    flex: 1,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },

  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONT.small,
  },

  emptyImageState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#F8FCFC',
  },

  emptyImageText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: FONT.small,
  },

  emptyPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: COLORS.imagePlaceholder,
  },

  actions: {
    flexDirection: 'column',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },

  primaryButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: FONT.regular,
  },

  cancelButton: {
    backgroundColor: '#EDF5F4',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONT.regular,
  },

  disabledButton: {
    opacity: 0.6,
  },
})