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
import { COLORS } from '../constants/colors'
import { SPACING, FONT } from '../constants/theme'
import removeIcon from '../../assets/removeImg.png'

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
              <ActivityIndicator size="large" color={COLORS.primaryLight} />
              <Text style={styles.loadingText}>
                Cargando datos de la publicación...
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Imágenes</Text>

                  <View style={styles.imagesGrid}>
                    {imagenes.map((imagen, index) => (
                      <View key={`${imagen}-${index}`} style={styles.imageCard}>
                        <TouchableOpacity
                          style={styles.deleteImageButton}
                          onPress={() => handleRemoveImage(index)}
                          activeOpacity={0.7}
                        >
                          <Image source={removeIcon} style={styles.deleteIcon} />
                        </TouchableOpacity>

                        <Image
                          source={{ uri: imagen || PRODUCT_IMAGE_PLACEHOLDER }}
                          style={styles.productImage}
                        />
                      </View>
                    ))}

                    <TouchableOpacity
                      style={styles.addImageCard}
                      onPress={handlePickImages}
                    >
                      <Text style={styles.addImagePlus}>+</Text>
                      <Text style={styles.addImageText}>Agregar foto</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    value={nombre}
                    onChangeText={setNombre}
                    placeholder="Nombre del producto"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Descripción</Text>
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholder="Descripción del producto"
                    placeholderTextColor={COLORS.textMuted}
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
                      placeholderTextColor={COLORS.textMuted}
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
                      placeholderTextColor={COLORS.textMuted}
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

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.white,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  closeText: {
    fontSize: 18,
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
    textAlign: 'center',
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
    color: COLORS.textPrimary,
  },

  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },

  imageCard: {
    width: 130,
    height: 130,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.imagePlaceholder,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  deleteImageButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteIcon: {
    width: 16,
    height: 16,
  },

  addImageCard: {
    width: 130,
    height: 130,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
  },

  addImagePlus: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '500',
    color: COLORS.primaryLight,
  },

  addImageText: {
    marginTop: 4,
    fontSize: FONT.small,
    color: COLORS.primaryLight,
    fontWeight: '600',
    textAlign: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT.small,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
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
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
  },

  categoryChipSelected: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.promoLight,
  },

  categoryChipText: {
    color: COLORS.textSecondary,
    fontSize: FONT.small,
  },

  categoryChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },

  saveButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },

  saveButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT.small,
  },
})