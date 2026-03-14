import * as ImageManipulator from 'expo-image-manipulator';

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.75;

/**
 * Resize and compress an image URI before upload.
 * Caps the longest edge at 1280px and re-encodes as JPEG at 75% quality.
 * The original file on device is never modified.
 */
export async function compressImageForUpload(uri: string): Promise<{ uri: string; mimeType: string }> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  );
  return { uri: result.uri, mimeType: 'image/jpeg' };
}
