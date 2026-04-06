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
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { COLORS } from '../constants/colors'
import { SPACING, FONT } from '../constants/theme'

const PRODUCT_IMAGE_PLACEHOLDER =
  'https://via.placeholder.com/500x350.png?text=Producto'

export default function EditProductModal({
  visible,
  product,
  categories = [],
  onClose,
  onSave,
}) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [categoria, setCategoria] = useState('')
  const [imagen, setImagen] = useState('')

  useEffect(() => {
    if (!product || !visible) return

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
    setImagen(product.images?.[0] || product.imagen || '')
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

  async function handlePickImage() {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a tu galería para cambiar la imagen.'
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      })

      if (result.canceled) return

      const asset = result.assets?.[0]
      if (!asset?.uri) return

      setImagen(asset.uri)
    } catch (error) {
      console.error('Error al seleccionar imagen:', error)
      Alert.alert('Error', 'No se pudo seleccionar la imagen.')
    }
  }

  function handleSave() {
    onSave?.({
      ...product,
      id: product?.id,
      name: nombre.trim(),
      titulo: nombre.trim(),
      description: descripcion.trim(),
      descripcion: descripcion.trim(),
      price: Number(precio),
      precio: Number(precio),
      stock: Number(stock),
      categoria: categoria,
      categorySlug: categoria,
      images: imagen ? [imagen] : [],
      imagen: imagen || '',
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

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.imageHeader}>
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri:
                      imagen ||
                      PRODUCT_IMAGE_PLACEHOLDER,
                  }}
                  style={styles.productImageLarge}
                />
                <TouchableOpacity
                  style={styles.changePhotoOverlay}
                  onPress={handlePickImage}
                >
                  <Text style={styles.changePhotoText}>Cambiar foto</Text>
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
                      style={[styles.categoryChip, selected && styles.categoryChipSelected]}
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
    maxWidth: 720,
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

  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },

  imageHeader: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  productImageLarge: {
    width: 180,
    height: 180,
    borderRadius: 18,
    backgroundColor: COLORS.imagePlaceholder,
  },

  changePhotoOverlay: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },

  changePhotoText: {
    color: COLORS.white,
    fontSize: FONT.small,
    fontWeight: '600',
  },

  fieldGroup: {
    gap: 8,
  },

  label: {
    fontSize: FONT.small,
    fontWeight: '600',
    color: COLORS.textPrimary,
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

  cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },

  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: FONT.small,
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