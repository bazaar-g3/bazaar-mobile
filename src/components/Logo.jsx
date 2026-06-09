import { TouchableOpacity, View, StyleSheet, Text } from 'react-native'
import Svg, { Polygon, Path, Ellipse, Line } from 'react-native-svg'
import { useRouter } from 'expo-router'
import { COLORS } from '../constants/colors'

function BoxIcon({ size = 34 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Flecha llegando desde arriba */}
      <Line x1="32" y1="0" x2="32" y2="8" stroke="#69BDB6" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M27 4 L32 10 L37 4" stroke="#69BDB6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Caja — cara superior */}
      <Polygon points="12,28 32,16 52,28 32,40" fill="#175E72" />
      {/* Caja — cara frontal */}
      <Polygon points="12,28 32,40 32,63 12,51" fill="#0B3A46" />
      {/* Caja — cara derecha */}
      <Polygon points="32,40 52,28 52,51 32,63" fill="#073240" />

      {/* Cinta vertical (centro de la caja) */}
      <Polygon points="30,16 34,16 34,63 30,63" fill="#69BDB6" opacity="0.45" />
      {/* Cinta horizontal — cara frontal */}
      <Polygon points="12,40 32,52 32,56 12,44" fill="#69BDB6" opacity="0.45" />
      {/* Cinta horizontal — cara derecha */}
      <Polygon points="32,52 52,40 52,44 32,56" fill="#69BDB6" opacity="0.45" />

      {/* Moño — lazo izquierdo */}
      <Path d="M 32 28 C 24 17 10 16 18 24 C 20 27 27 29 32 28 Z" fill="#69BDB6" />
      {/* Moño — lazo derecho */}
      <Path d="M 32 28 C 40 17 54 16 46 24 C 44 27 37 29 32 28 Z" fill="#69BDB6" />
      {/* Moño — nudo central */}
      <Ellipse cx="32" cy="28" rx="3.5" ry="2.5" fill="#3FA8A0" />
      {/* Moño — colitas */}
      <Line x1="30" y1="30" x2="28" y2="36" stroke="#3FA8A0" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="34" y1="30" x2="36" y2="36" stroke="#3FA8A0" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  )
}

export default function Logo({
  size = 34,
  textSize = 30,
  spacing = 8,
  showText = true,
  pressable = true,
  style,
}) {
  const router = useRouter()

  const content = (
    <>
      <BoxIcon size={size} />
      {showText && (
        <Text style={[styles.text, { fontSize: textSize, marginLeft: spacing }]}>
          <Text style={{ color: COLORS.primaryLight }}>B</Text>
          <Text style={{ color: COLORS.primary }}>AZAAR</Text>
        </Text>
      )}
    </>
  )

  if (!pressable) {
    return <View style={[styles.container, style]}>{content}</View>
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => router.push('/home')}
      activeOpacity={0.8}
    >
      {content}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '900',
    letterSpacing: 1.5,
  },
})
