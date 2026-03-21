import { useRef } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { compressImageForUpload } from '../../../lib/compressImage';

type SelectedImage = { uri: string; name: string; mimeType: string };

type Params = {
  selectedImages: SelectedImage[];
  setSelectedImages: React.Dispatch<React.SetStateAction<SelectedImage[]>>;
  maxPhotos: number;
};

export function useWriteReviewImages({ selectedImages, setSelectedImages, maxPhotos }: Params) {
  const imagePickingRef = useRef(false);

  const processPickedAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    const compressed = await compressImageForUpload(asset.uri);
    const filename = asset.fileName ?? `photo_${Date.now()}.jpg`;
    setSelectedImages((prev) => [...prev, { uri: compressed.uri, name: filename, mimeType: compressed.mimeType }]);
  };

  const handlePickFromLibrary = async () => {
    imagePickingRef.current = true;
    try {
      if (selectedImages.length >= maxPhotos) return;
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Photo library access is needed to attach images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
      if (result.canceled || !result.assets?.[0]) return;
      try {
        await processPickedAsset(result.assets[0]);
      } catch {
        Alert.alert('Unable to process image', 'Please try a different photo.');
      }
    } finally {
      imagePickingRef.current = false;
    }
  };

  const handleTakePhoto = async () => {
    imagePickingRef.current = true;
    try {
      if (selectedImages.length >= maxPhotos) return;
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Camera access is needed to take a photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
      if (result.canceled || !result.assets?.[0]) return;
      try {
        await processPickedAsset(result.assets[0]);
      } catch {
        Alert.alert('Unable to process image', 'Please try a different photo.');
      }
    } finally {
      imagePickingRef.current = false;
    }
  };

  const handleAddPhoto = () => {
    if (imagePickingRef.current) return;
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Library', onPress: handlePickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return { handleAddPhoto, handleRemoveImage };
}
