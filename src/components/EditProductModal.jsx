import { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useTheme } from '../theme/ThemeContext'
import { SPACING, FONT } from '../constants/theme'
import DraggableImageList from './DraggableImageList'

const PRODUCT_IMAGE_PLACEHOLDER =
  'https://via.placeholder.com/500x350.png?text=Producto'

export default function EditProductModal({
  visible,
  product,
  categories = [],
  loading = false,
  onClose,
  onSave,
}) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [categoria, setCategoria] = useState('')
  const [imagenes, setImagenes] = useState([])

  useEffect(() => {
    if (!visible) return

    if (!product) {
      setNombre('')
      setDescripcion('')
      setPrecio('')
      setStock('')
      setCategoria('')
      setImagenes([])
      return
    }

    setNombre(product.name || product.titulo || '')
    setDescripcion(product.description || product.descripcion || '')
    setPrecio(
      product.price != null
        ? String(product.price)
        : product.precio != null
          ? String(product.precio)
          : ''
    )
    setStock(product.stock != null ? String(product.stock) : '')
    setCategoria(
      product.categorySlug ||
        product.category?.slug ||
        product.categoria ||
        ''
    )

    const currentImages =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.imagen
          ? [product.imagen]
          : []

    setImagenes(currentImages)
  }, [product, visible])

  const categoriasDisponibles = useMemo(() => {
    return categories.length > 0
      ? categories
      : [
          { slug: 'tecnologia', label: 'Tecnología' },
          { slug: 'hogar', label: 'Hogar' },
          { slug: 'ropa', label: 'Ropa' },
          { slug: 'deportes', label: 'Deportes' },
          { slug: 'otros', label: 'Otros' },
        ]
  }, [categories])

  async function handlePickImages() {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a tu galería para agregar imágenes.'
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        allowsEditing: false,
        quality: 0.9,
        selectionLimit: 10,
      })

      if (result.canceled) return

      const nuevasImagenes = (result.assets || [])
        .map((asset) => asset?.uri)
        .filter(Boolean)

      if (nuevasImagenes.length === 0) return

      setImagenes((prev) => [...prev, ...nuevasImagenes])
    } catch (error) {
      console.error('Error al seleccionar imágenes:', error)
      Alert.alert('Error', 'No se pudieron seleccionar las imágenes.')
    }
  }

  function handleRemoveImage(indexToRemove) {
    setImagenes((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  function handleReorderImages(reorderedItems) {
    // DraggableImageList devuelve [{ uri }]; extraemos de vuelta a strings
    setImagenes(reorderedItems.map((item) => item.uri))
  }

  function handleSave() {
    onSave?.({
      ...product,
      id: product?.id,
      name: nombre.trim(),
      titulo: nombre.trim(),
      description: descripcion.trim(),
      descripcion: descripcion.trim(),
      price: precio.trim() === '' ? undefined : Number(precio),
      precio: precio.trim() === '' ? undefined : Number(precio),
      stock: stock.trim() === '' ? undefined : Number(stock),
      categoria,
      categorySlug: categoria,
      images: imagenes,
      imagen: imagenes[0] || '',
    })
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Editar publicación</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.color.accent} />
              <Text style={styles.loadingText}>
                Cargando datos de la publicación...
              </Text>
            </View>
          ) : (
            <>
              {/* Sección imágenes fuera del ScrollView — evita conflicto de gestures en Modal Android APK */}
              <View style={styles.imagesSection}>
                <Text style={styles.label}>Imágenes</Text>

                {imagenes.length > 0 && (
                  <DraggableImageList
                    images={imagenes.map((uri) => ({ uri: uri || PRODUCT_IMAGE_PLACEHOLDER }))}
                    onReorder={handleReorderImages}
                    onRemove={handleRemoveImage}
                  />
                )}

                <TouchableOpacity
                  style={styles.addImageCard}
                  onPress={handlePickImages}
                >
                  <Text style={styles.addImagePlus}>+</Text>
                  <Text style={styles.addImageText}>Agregar foto</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    value={nombre}
                    onChangeText={setNombre}
                    placeholder="Nombre del producto"
                    placeholderTextColor={theme.color.textMuted}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Descripción</Text>
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholder="Descripción del producto"
                    placeholderTextColor={theme.color.textMuted}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.fieldGroup, styles.halfField]}>
                    <Text style={styles.label}>Precio</Text>
                    <TextInput
                      style={styles.input}
                      value={precio}
                      onChangeText={setPrecio}
                      placeholder="Ej: 30000"
                      placeholderTextColor={theme.color.textMuted}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.fieldGroup, styles.halfField]}>
                    <Text style={styles.label}>Stock</Text>
                    <TextInput
                      style={styles.input}
                      value={stock}
                      onChangeText={setStock}
                      placeholder="Ej: 5"
                      placeholderTextColor={theme.color.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Categoría</Text>
                  <View style={styles.categoriesWrap}>
                    {categoriasDisponibles.map((cat) => {
                      const selected = categoria === cat.slug
                      return (
                        <TouchableOpacity
                          key={cat.slug}
                          style={[
                            styles.categoryChip,
                            selected && styles.categoryChipSelected,
                          ]}
                          onPress={() => setCategoria(cat.slug)}
                        >
                          <Text
                            style={[
                              styles.categoryChipText,
                              selected && styles.categoryChipTextSelected,
                            ]}
                          >
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  )
}

const makeStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },

  modalCard: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '90%',
    backgroundColor: theme.color.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.color.border,
  },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.color.textPrimary,
  },

  closeText: {
    fontSize: 18,
    color: theme.color.textSecondary,
    paddingHorizontal: 4,
  },

  loadingContainer: {
    paddingVertical: 48,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },

  loadingText: {
    fontSize: FONT.small,
    color: theme.color.textSecondary,
    textAlign: 'center',
  },

  imagesSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    paddingBottom: SPACING.md,
  },

  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },

  fieldGroup: {
    gap: 8,
  },

  label: {
    fontSize: FONT.small,
    fontWeight: '600',
    color: theme.color.textPrimary,
  },

  addImageCard: {
    width: 130,
    height: 130,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.surface,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },

  addImagePlus: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '500',
    color: theme.color.accent,
  },

  addImageText: {
    marginTop: 4,
    fontSize: FONT.small,
    color: theme.color.accent,
    fontWeight: '600',
    textAlign: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT.small,
    color: theme.color.textPrimary,
    backgroundColor: theme.color.surface,
    outlineStyle: 'none',
  },

  textarea: {
    minHeight: 110,
  },

  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  halfField: {
    flex: 1,
  },

  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  categoryChip: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: theme.color.surface,
  },

  categoryChipSelected: {
    borderColor: theme.color.accent,
    backgroundColor: theme.color.accentTint,
  },

  categoryChipText: {
    color: theme.color.textSecondary,
    fontSize: FONT.small,
  },

  categoryChipTextSelected: {
    color: theme.color.accent,
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
  },

  saveButton: {
    backgroundColor: theme.color.accent,
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },

  saveButtonText: {
    color: theme.color.onAccent,
    fontWeight: '700',
    fontSize: FONT.small,
  },
})