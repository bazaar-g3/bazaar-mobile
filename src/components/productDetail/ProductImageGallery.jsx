import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { styles } from "../../styles/productDetail/productDetailStyles";

export default function ProductImageGallery({
  images,
  selectedImage,
  selectedImageIndex,
  onSelectImage,
}) {
  return (
    <View style={styles.leftColumn}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: selectedImage }} style={styles.productImage} />
      </View>

      <View style={styles.thumbnailRow}>
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
      </View>
    </View>
  );
}