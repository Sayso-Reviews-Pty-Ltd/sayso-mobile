import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Text, TextInput } from '../Typography';
import { haptics } from '../../lib/haptics';
import { editProfileStyles } from './editProfileStyles';

export type EditProfileSavePayload = {
  username: string;
  displayName: string;
  avatarAsset: ImagePicker.ImagePickerAsset | null;
  removeAvatar: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: EditProfileSavePayload) => Promise<void>;
  currentUsername?: string | null;
  currentDisplayName?: string | null;
  currentAvatarUrl?: string | null;
  saving?: boolean;
  error?: string | null;
};

export function EditProfileModal({
  isOpen,
  onClose,
  onSave,
  currentUsername,
  currentDisplayName,
  currentAvatarUrl,
  saving = false,
  error,
}: Props) {
  const [username, setUsername] = useState(currentUsername ?? '');
  const [displayName, setDisplayName] = useState(currentDisplayName ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatarUrl ?? null);
  const [avatarAsset, setAvatarAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setUsername(currentUsername ?? '');
    setDisplayName(currentDisplayName ?? '');
    setAvatarPreview(currentAvatarUrl ?? null);
    setAvatarAsset(null);
    setRemoveAvatar(false);
    setLocalError(null);
  }, [currentAvatarUrl, currentDisplayName, currentUsername, isOpen]);

  const mergedError = useMemo(() => error ?? localError, [error, localError]);

  const handlePickFromLibrary = async () => {
    setLocalError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setLocalError('Photo access permission is required to upload an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const picked = result.assets[0];
    if (picked.mimeType && !picked.mimeType.startsWith('image/')) {
      setLocalError('Please choose a valid image file.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if ((picked.fileSize ?? 0) > maxSize) {
      setLocalError('Image file is too large. Maximum size is 5MB.');
      return;
    }

    setAvatarAsset(picked);
    setAvatarPreview(picked.uri);
    setRemoveAvatar(false);
  };

  const handleTakePhoto = async () => {
    setLocalError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setLocalError('Camera permission is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const picked = result.assets[0];
    if (picked.mimeType && !picked.mimeType.startsWith('image/')) {
      setLocalError('Please choose a valid image file.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if ((picked.fileSize ?? 0) > maxSize) {
      setLocalError('Image file is too large. Maximum size is 5MB.');
      return;
    }

    setAvatarAsset(picked);
    setAvatarPreview(picked.uri);
    setRemoveAvatar(false);
  };

  const handleAddPhoto = () => {
    haptics.navigation();
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Library', onPress: handlePickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemoveAvatar = () => {
    haptics.confirm();
    setAvatarAsset(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
  };

  const handleSave = async () => {
    const normalizedUsername = username.trim();
    if (!normalizedUsername) {
      setLocalError('Username is required.');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(normalizedUsername)) {
      setLocalError('Username must be 3-20 characters and only letters, numbers, underscores, or hyphens.');
      return;
    }

    setLocalError(null);
    haptics.complete();
    await onSave({
      username: normalizedUsername,
      displayName: displayName.trim(),
      avatarAsset,
      removeAvatar,
    });
  };

  return (
    <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onClose}>
      <View style={editProfileStyles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={() => !saving && onClose()} />

        <LinearGradient
          colors={['#9DAB9B', '#9DAB9B', 'rgba(157,171,155,0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={editProfileStyles.card}
        >
          <View style={editProfileStyles.headerRow}>
            <Text style={editProfileStyles.title}>Edit Profile</Text>
            <Pressable onPress={() => !saving && onClose()} style={editProfileStyles.closeButton} disabled={saving}>
              <Ionicons name="close-outline" size={18} color="rgba(45,45,45,0.75)" />
            </Pressable>
          </View>

          {mergedError ? <Text style={editProfileStyles.error}>{mergedError}</Text> : null}

          <View style={editProfileStyles.avatarRow}>
            {avatarPreview ? (
              <Image source={{ uri: avatarPreview }} style={editProfileStyles.avatar} contentFit="cover" />
            ) : (
              <View style={[editProfileStyles.avatar, editProfileStyles.avatarFallback]}>
                <Ionicons name="person-outline" size={28} color="rgba(45,45,45,0.55)" />
              </View>
            )}

            <View style={editProfileStyles.avatarActions}>
              <Pressable onPress={handleAddPhoto} style={editProfileStyles.avatarActionButton} disabled={saving}>
                <Ionicons name="cloud-upload-outline" size={14} color="#2D2D2D" />
                <Text style={editProfileStyles.avatarActionText}>Upload</Text>
              </Pressable>
              {avatarPreview ? (
                <Pressable onPress={handleRemoveAvatar} style={editProfileStyles.avatarActionButton} disabled={saving}>
                  <Ionicons name="trash-outline" size={14} color="#7F1D1D" />
                  <Text style={[editProfileStyles.avatarActionText, { color: '#7F1D1D' }]}>Remove</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={editProfileStyles.fieldWrap}>
            <Text style={editProfileStyles.fieldLabel}>Username</Text>
            <TextInput
              value={username}
              onChangeText={(value) => {
                setUsername(value);
                setLocalError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              style={editProfileStyles.input}
              placeholder="Choose a username"
              placeholderTextColor="rgba(45,45,45,0.45)"
            />
            <Text style={editProfileStyles.helper}>3-20 characters, letters/numbers/underscore/hyphen.</Text>
          </View>

          <View style={editProfileStyles.fieldWrap}>
            <Text style={editProfileStyles.fieldLabel}>Display Name</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              style={editProfileStyles.input}
              placeholder="How your name appears"
              placeholderTextColor="rgba(45,45,45,0.45)"
            />
          </View>

          <View style={editProfileStyles.actions}>
            <Pressable onPress={onClose} style={editProfileStyles.secondaryButton} disabled={saving}>
              <Text style={editProfileStyles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={editProfileStyles.primaryButton} disabled={saving}>
              <Text style={editProfileStyles.primaryButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}
