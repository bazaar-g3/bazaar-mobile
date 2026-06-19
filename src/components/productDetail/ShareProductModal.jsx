import React, { useMemo } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { makeStyles } from "../../styles/productDetail/productDetailStyles";

export default function ShareProductModal({
  visible,
  onClose,
  onCopyLink,
  onShareLink,
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.shareModalOverlay}>
        <TouchableOpacity
          style={styles.shareModalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.shareModalContainer}>
          <View style={styles.shareModalHandle} />

          <Text style={styles.shareModalTitle}>Compartir producto</Text>

          <TouchableOpacity
            style={styles.shareModalPrimaryAction}
            onPress={onCopyLink}
            activeOpacity={0.9}
          >
            <Text style={styles.shareModalPrimaryActionText}>Copiar link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareModalSecondaryAction}
            onPress={onShareLink}
            activeOpacity={0.9}
          >
            <Text style={styles.shareModalSecondaryActionText}>Compartir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareModalCancelAction}
            onPress={onClose}
            activeOpacity={0.9}
          >
            <Text style={styles.shareModalCancelActionText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}