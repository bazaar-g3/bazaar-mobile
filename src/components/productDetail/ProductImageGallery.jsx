import React, { useMemo } from "react";
import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { makeStyles } from "../../styles/productDetail/productDetailStyles";

export default function ProductImageGallery({
  images,
  selectedImage,
  selectedImageIndex,
  onSelectImage,
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.leftColumn}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: selectedImage }} style={styles.productImage} />
      </View>

      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailRow}
        >
          {images.slice(0, 5).map((imageUri, index) => (
            <TouchableOpacity
              key={`${imageUri}-${index}`}
              style={[
                styles.thumbnail,
                index === selectedImageIndex ? styles.activeThumbnail : null,
              ]}
              activeOpacity={0.85}
              onPress={() => onSelectImage(index)}
            >
              <Image source={{ uri: imageUri }} style={styles.thumbnailImg} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}