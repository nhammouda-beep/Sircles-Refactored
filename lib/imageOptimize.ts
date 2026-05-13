import * as ImageManipulator from "expo-image-manipulator";

const MAX_WIDTH = 1080;
const JPEG_QUALITY = 0.8;

/**
 * Resize and compress an image before upload.
 *
 * Why: phone cameras shoot 3000-4000px photos (3-5MB). Most app feed views
 * display them at ~400-500px. Uploading the full original wastes bandwidth
 * (slow on mobile) and storage. Resizing client-side to 1080px keeps quality
 * while typically cutting file size by ~10x.
 *
 * Returns a new ImagePickerAsset-shaped object with the optimized URI.
 * Pass that to your upload function instead of the raw picker result.
 */
export async function optimizeImageForUpload(
  asset: { uri: string; width?: number; height?: number; mimeType?: string; fileSize?: number }
): Promise<{ uri: string; width: number; height: number; mimeType: string; fileSize?: number }> {
  // Skip if already small (<400KB) — re-encoding tiny images can make them larger
  if (asset.fileSize && asset.fileSize < 400_000 && (asset.width || 0) <= MAX_WIDTH) {
    return {
      uri: asset.uri,
      width: asset.width || 0,
      height: asset.height || 0,
      mimeType: asset.mimeType || "image/jpeg",
      fileSize: asset.fileSize,
    };
  }

  // Resize only if image is larger than MAX_WIDTH
  const actions: ImageManipulator.Action[] =
    (asset.width || 0) > MAX_WIDTH ? [{ resize: { width: MAX_WIDTH } }] : [];

  const result = await ImageManipulator.manipulateAsync(asset.uri, actions, {
    compress: JPEG_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    mimeType: "image/jpeg",
  };
}
