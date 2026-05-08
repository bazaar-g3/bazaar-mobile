import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/productDetail/productDetailStyles";

export default function LoginPromptModal({
  visible,
  onClose,
  onLogin,
}) {
  if (!visible) return null;

  return (
    <View style={styles.loginPromptOverlay}>
      <TouchableOpacity
        style={styles.loginPromptBackdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={styles.loginPromptWrapper}>
        <View style={styles.loginPromptBox}>
          <Text style={styles.loginPromptTitle}>⚠️</Text>
          <Text style={styles.loginPromptText}>
            Necesitas loggearte para agregar el producto al carrito.
          </Text>

          <View style={styles.loginPromptButtons}>
            <TouchableOpacity
              style={styles.loginPromptLoginButton}
              onPress={onLogin}
            >
              <Text style={styles.loginPromptLoginButtonText}>
                Iniciar sesión
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginPromptCancelButton}
              onPress={onClose}
            >
              <Text style={styles.loginPromptCancelButtonText}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}