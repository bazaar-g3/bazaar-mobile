/*
Componente para poder mover las imagenes al cargar un producto y cambairlas de orden
*/

import { useEffect, useRef, useState } from 'react'
import {
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { COLORS } from '../constants/colors'

const MAX_ITEM_W = 100
const GAP = 10
const ITEM_H = 100

export default function DraggableImageList({ images, onReorder, onRemove }) {

  const [containerWidth, setContainerWidth] = useState(0)

  const itemW =
    containerWidth > 0 && images.length > 0
      ? Math.min(
        MAX_ITEM_W,
        Math.floor((containerWidth - (images.length - 1) * GAP) / images.length)
      )
      : MAX_ITEM_W
  const slot = itemW + GAP

  const isDraggingRef = useRef(false)
  const activeDragRef = useRef(-1)
  const placeholderRef = useRef(-1)
  const imagesRef = useRef(images)
  const touchedIdxRef = useRef(-1)
  const itemWRef = useRef(itemW)
  const slotRef = useRef(slot)

  useEffect(() => { imagesRef.current = images }, [images])
  useEffect(() => { itemWRef.current = itemW; slotRef.current = slot }, [itemW, slot])

  const [drag, setDrag] = useState({ active: -1, placeholder: -1, ghostLeft: 0 })

  //PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5,
      onMoveShouldSetPanResponderCapture: (_, gs) => Math.abs(gs.dx) > 5,

      onPanResponderGrant: () => {
        const idx = touchedIdxRef.current
        if (idx < 0 || idx >= imagesRef.current.length) return
        isDraggingRef.current = true
        activeDragRef.current = idx
        placeholderRef.current = idx
        setDrag({ active: idx, placeholder: idx, ghostLeft: idx * slotRef.current })
      },

      onPanResponderMove: (_, gs) => {
        if (!isDraggingRef.current) return
        const startLeft = activeDragRef.current * slotRef.current
        const maxLeft = (imagesRef.current.length - 1) * slotRef.current
        const newLeft = Math.max(0, Math.min(startLeft + gs.dx, maxLeft))
        const newPlaceholder = Math.max(
          0,
          Math.min(imagesRef.current.length - 1, Math.round(newLeft / slotRef.current))
        )
        placeholderRef.current = newPlaceholder
        setDrag({ active: activeDragRef.current, placeholder: newPlaceholder, ghostLeft: newLeft })
      },

      onPanResponderRelease: () => {
        if (isDraggingRef.current) {
          const from = activeDragRef.current
          const to = placeholderRef.current
          if (from !== to) {
            const arr = [...imagesRef.current]
            const [moved] = arr.splice(from, 1)
            arr.splice(to, 0, moved)
            onReorder(arr)
          }
        }
        isDraggingRef.current = false
        activeDragRef.current = -1
        placeholderRef.current = -1
        setDrag({ active: -1, placeholder: -1, ghostLeft: 0 })
      },

      onPanResponderTerminate: () => {
        isDraggingRef.current = false
        activeDragRef.current = -1
        placeholderRef.current = -1
        setDrag({ active: -1, placeholder: -1, ghostLeft: 0 })
      },
    })
  ).current

  //helpers
  function getDisplayLeft(itemIdx) {
    const { active, placeholder } = drag
    if (active < 0) return itemIdx * slot
    if (itemIdx === active) return -9999

    let s = itemIdx
    if (active < placeholder) {
      if (itemIdx > active && itemIdx <= placeholder) s = itemIdx - 1
    } else {
      if (itemIdx >= placeholder && itemIdx < active) s = itemIdx + 1
    }
    return s * slot
  }

  function getDisplaySlot(itemIdx) {
    return Math.round(getDisplayLeft(itemIdx) / slot)
  }

  const { active, ghostLeft } = drag

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* touch-target + panResponder container */}
      <View
        style={{ height: ITEM_H, position: 'relative' }}
        {...panResponder.panHandlers}
      >
        {images.map((image, idx) => (
          <View
            key={`img-${idx}-${image.uri}`}
            onStartShouldSetResponder={() => {
              touchedIdxRef.current = idx
              return false
            }}
            style={[
              styles.card,
              { left: getDisplayLeft(idx), width: itemW, height: ITEM_H },
              active === idx && styles.hidden,
            ]}
          >
            <Image source={{ uri: image.uri }} style={[styles.img, { width: itemW, height: ITEM_H }]} />

            {getDisplaySlot(idx) === 0 && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Principal</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemove(idx)}
              hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Floating ghost (dragged item) */}
        {active >= 0 && (
          <View
            style={[
              styles.card,
              styles.ghost,
              { left: ghostLeft, width: itemW, height: ITEM_H },
            ]}
          >
            <Image source={{ uri: images[active].uri }} style={[styles.img, { width: itemW, height: ITEM_H }]} />
          </View>
        )}
      </View>

      {/* Hint */}
      {images.length > 1 && (
        <Text style={styles.hint}>
          {active >= 0 ? 'Soltá para confirmar el orden' : 'Arrastrá para reordenar · la primera es la principal'}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: 0,
  },

  hidden: {
    opacity: 0,
  },

  ghost: {
    zIndex: 10,
    opacity: 0.92,
    transform: [{ scale: 1.07 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  img: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.imagePlaceholder,
    resizeMode: 'cover',
  },

  primaryBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  primaryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
  },

  hint: {
    marginTop: 8,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
})