/**
 * Image compression and utility functions
 * Provides client-side image compression using HTML5 Canvas API
 */

interface CompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  outputFormat?: string;
  skipIfSmaller?: number;
}

interface DimensionConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

interface ImageDimensions {
  width: number;
  height: number;
}

const defaultOptions: CompressionOptions = {
  quality: 0.7,
  maxWidth: 1920,
  maxHeight: 1920,
  outputFormat: 'image/jpeg',
  skipIfSmaller: 1024 * 1024, // 1MB
};

/**
 * Compress a single image file
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<Blob>} - Compressed image blob
 */
export function compressImage(file: File, options: CompressionOptions = {}): Promise<Blob> {
  const opts = { ...defaultOptions, ...options };
  
  return new Promise((resolve, reject) => {
    // Skip compression if file is already small enough
    if (file.size <= (opts.skipIfSmaller || defaultOptions.skipIfSmaller!)) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        const ratio = Math.min(
          (opts.maxWidth || defaultOptions.maxWidth!) / img.width, 
          (opts.maxHeight || defaultOptions.maxHeight!) / img.height
        );
        canvas.width = Math.floor(img.width * ratio);
        canvas.height = Math.floor(img.height * ratio);
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          // Clean up
          URL.revokeObjectURL(img.src);
          
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, opts.outputFormat, opts.quality);
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compress multiple image files
 * @param {FileList|File[]} fileList - List of image files to compress
 * @param {Object} options - Compression options
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<FileList>} - New FileList with compressed files
 */
export async function compressFileList(
  fileList: FileList | File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<FileList> {
  const files = Array.from(fileList);
  const compressedFiles = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      if (validateImageFile(file)) {
        const compressedBlob = await compressImage(file, options);
        const compressedFile = new File([compressedBlob], file.name, {
          type: options.outputFormat || defaultOptions.outputFormat!,
          lastModified: Date.now()
        });
        compressedFiles.push(compressedFile);
      } else {
        // Keep non-image files as-is
        compressedFiles.push(file);
      }
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // Keep original file if compression fails
      compressedFiles.push(file);
    }
    
    // Call progress callback if provided
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }
  
  // Convert back to FileList
  const dt = new DataTransfer();
  compressedFiles.forEach(file => dt.items.add(file));
  return dt.files;
}

/**
 * Get image dimensions without loading the full image
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const dimensions = {
        width: img.width,
        height: img.height
      };
      URL.revokeObjectURL(img.src);
      resolve(dimensions);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for dimensions'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate if file is a supported image type
 * @param {File} file - File to validate
 * @returns {boolean} - True if valid image file
 */
export function validateImageFile(file: File): boolean {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return file && supportedTypes.includes(file.type.toLowerCase());
}

/**
 * Format file size for display
 * @param {File|number} file - File object or size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export function getFileSize(file: File | number): string {
  const bytes = typeof file === 'number' ? file : file.size;
  
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Create thumbnail from image file
 * @param {File} file - Image file
 * @param {number} size - Thumbnail size (square)
 * @returns {Promise<Blob>} - Thumbnail blob
 */
export function createThumbnail(file: File, size: number = 150): Promise<Blob> {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.8,
    outputFormat: 'image/jpeg'
  });
}

/**
 * Validate image dimensions against constraints
 * @param {File} file - Image file
 * @param {Object} constraints - Min/max width/height constraints
 * @returns {Promise<boolean>} - True if dimensions are valid
 */
export async function validateImageDimensions(file: File, constraints: DimensionConstraints = {}): Promise<boolean> {
  try {
    const { width, height } = await getImageDimensions(file);
    const minWidth = constraints.minWidth !== undefined ? constraints.minWidth : 0;
    const maxWidth = constraints.maxWidth !== undefined ? constraints.maxWidth : Infinity;
    const minHeight = constraints.minHeight !== undefined ? constraints.minHeight : 0;
    const maxHeight = constraints.maxHeight !== undefined ? constraints.maxHeight : Infinity;
    
    return width >= minWidth && width <= maxWidth && height >= minHeight && height <= maxHeight;
  } catch {
    return false;
  }
}