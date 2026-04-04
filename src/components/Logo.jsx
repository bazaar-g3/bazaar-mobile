import { View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { COLORS } from '../constants/colors'

export default function Logo({ size = 34, textSize = 30 }) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="storefront-outline"
        size={size}
        color={COLORS.primaryLight}
      />

      <Text style={[styles.text, { fontSize: textSize }]}>
        <Text style={{ color: COLORS.logoB }}>B</Text>
        <Text style={{ color: COLORS.logoA }}>A</Text>
        <Text style={{ color: COLORS.logoZ }}>Z</Text>
        <Text style={{ color: COLORS.logoA2 }}>A</Text>
        <Text style={{ color: COLORS.logoA3 }}>A</Text>
        <Text style={{ color: COLORS.logoR }}>R</Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  text: {
    fontWeight: '900',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
})