import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, styles } from './ReviewCard.styles';

// ─── Review image thumbnail with error fallback + lightbox trigger
export function ReviewImage({ uri, onPress }: { uri: string; onPress: () => void }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <View style={[styles.reviewImage, styles.reviewImageError]}>
        <Ionicons name="image-outline" size={24} color={C.charcoal30} />
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="View full image">
      <Image source={{ uri }} style={styles.reviewImage} onError={() => setError(true)} />
    </Pressable>
  );
}

// ─── Full-screen image lightbox modal
export function ImageLightbox({ uri, onClose }: { uri: string; onClose: () => void }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.lightboxOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Image source={{ uri }} style={styles.lightboxImage} resizeMode="contain" />
        <Pressable
          style={styles.lightboxClose}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close image preview"
        >
          <Ionicons name="close" size={22} color={C.white} />
        </Pressable>
      </View>
    </Modal>
  );
}
