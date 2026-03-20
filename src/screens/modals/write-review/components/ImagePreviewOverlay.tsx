import { Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants';

type Props = {
  previewUri: string | null;
  onClose: () => void;
};

export function ImagePreviewOverlay({ previewUri, onClose }: Props) {
  if (!previewUri) return null;

  return (
    <Pressable style={styles.imagePreviewOverlay} onPress={onClose}>
      <Image source={{ uri: previewUri }} style={styles.imagePreviewFull} resizeMode="contain" />
      <Pressable style={styles.imagePreviewClose} onPress={onClose}>
        <Ionicons name="close" size={22} color={C.white} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imagePreviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.92)',
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewFull: { width: '100%', height: '80%' },
  imagePreviewClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
