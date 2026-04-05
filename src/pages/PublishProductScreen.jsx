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
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { COLORS } from '../constants/colors'
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  createProduct,
  getCatalogErrorMessage,
  getCatalogValidationErrors,
  listProductCategories,
} from '../services/catalog'

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
    () =>
      !submitting &&
      !checkingSession &&
      !loadingCategories,
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
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        router.replace('/login')
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
  }, [router])

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
            Completa la informacion y subi al menos una foto. La primera imagen sera la principal.
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
              placeholder="Ej: Teclado mecanico"
              placeholderTextColor="#94a3b8"
              maxLength={120}
            />
            {fieldErrors.name ? <Text style={styles.fieldError}>{fieldErrors.name}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Descripcion</Text>
            <TextInput
              style={[styles.input, styles.textArea, fieldErrors.description && styles.inputError]}
              value={description}
              onChangeText={(value) => {
                setDescription(value)
                setFieldErrors((current) => ({ ...current, description: undefined }))
              }}
              placeholder="Conta el estado del producto, detalles y uso"
              placeholderTextColor="#94a3b8"
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
                placeholderTextColor="#94a3b8"
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
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
              />
              {fieldErrors.stock ? <Text style={styles.fieldError}>{fieldErrors.stock}</Text> : null}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Categoria</Text>
            {loadingCategories ? (
              <View style={styles.inlineStatus}>
                <ActivityIndicator color={COLORS.primary} size="small" />
                <Text style={styles.inlineStatusText}>Cargando categorias...</Text>
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
              <View>
                <Text style={styles.label}>Imagenes</Text>
                <Text style={styles.helperText}>Hasta 5 imagenes JPG, PNG o WebP de 10 MB.</Text>
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
                    <Text style={styles.emptyImageText}>Todavia no seleccionaste imagenes.</Text>
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
                <ActivityIndicator color="#fff" size="small" />
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
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: 920,
    marginBottom: 20,
  },
  backButton: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    width: '100%',
    maxWidth: 920,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: {
    flex: 1,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  helperText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbe4ea',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: '#fbfdff',
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
    fontSize: 13,
    marginTop: 6,
  },
  errorText: {
    color: COLORS.error,
    backgroundColor: '#fff1f2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  inlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  inlineStatusText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  inlineErrorBox: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 12,
  },
  inlineErrorText: {
    color: '#b45309',
    fontSize: 14,
  },
  inlineErrorAction: {
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 8,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#d7e3ea',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f8fbfc',
  },
  categoryChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#e4f3f1',
  },
  categoryChipText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: COLORS.primary,
  },
  imagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 14,
  },
  emptyImageState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#dbe4ea',
    borderRadius: 16,
    padding: 14,
    minWidth: 320,
    backgroundColor: '#f8fbfc',
  },
  emptyImageText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  previewCard: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dbe4ea',
    backgroundColor: '#f8fbfc',
  },
  previewImage: {
    width: 170,
    height: 130,
    backgroundColor: COLORS.imagePlaceholder,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  primaryBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15, 46, 53, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 220,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  cancelButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#dbe4ea',
    minWidth: 140,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },
})
