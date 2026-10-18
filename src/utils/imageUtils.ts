/**
 * Image Processing Utilities for Logo & Avatar Uploads
 * Converts files to optimized Base64 data URLs with automatic resizing
 * to maintain crisp fidelity while keeping storage lightweight for Supabase & local cache.
 */

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Validates image file type and size
 */
export function validateImageFile(
  file: File,
  maxSizeBytes: number = 8 * 1024 * 1024 // 8MB limit
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'File tidak ditemukan.' };
  }

  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
  ];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format file tidak didukung. Harap gunakan format JPG, PNG, WebP, atau SVG.',
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Ukuran file melebihi batas maksimal ${sizeMb} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Converts an image File to a compressed, resized Base64 string
 */
export function processImageFile(
  file: File,
  options: ResizeOptions = {}
): Promise<{ base64: string; width: number; height: number; sizeBytes: number }> {
  const {
    maxWidth = 600,
    maxHeight = 600,
    quality = 0.88,
    format = file.type === 'image/png' ? 'image/png' : 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    // If it's SVG, keep the raw SVG Data URL directly to maintain vector sharpness
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve({
          base64,
          width: 256,
          height: 256,
          sizeBytes: file.size,
        });
      };
      reader.onerror = () => reject(new Error('Gagal membaca file SVG.'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context tidak tersedia.'));
          return;
        }

        // Handle transparent background for PNG/WebP, white for JPEG
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.clearRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL(format, quality);
        const approxBytes = Math.round((base64.length * 3) / 4);

        resolve({
          base64,
          width,
          height,
          sizeBytes: approxBytes,
        });
      };

      img.onerror = () => reject(new Error('Gagal memuat gambar untuk diproses.'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Human readable file size formatter
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
