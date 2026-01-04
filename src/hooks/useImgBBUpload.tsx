import { useState } from "react";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];

interface UseImgBBUploadReturn {
  uploadImage: (file: File, userId: string) => Promise<string>;
  uploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

export const useImgBBUpload = (): UseImgBBUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
  };

  const validateFile = (file: File): { valid: boolean; message?: string } => {
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return { 
        valid: false, 
        message: "Only JPG, PNG, WEBP, or GIF images are allowed." 
      };
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return { 
        valid: false, 
        message: `Image must be under ${MAX_SIZE_MB}MB.` 
      };
    }

    return { valid: true };
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      // Don't compress if already small
      if (file.size < 500 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => resolve(blob || file),
            'image/jpeg',
            0.8
          );
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const blobToBase64 = async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64String = dataUrl.split(',')[1];
        if (!base64String) {
          reject(new Error("Failed to convert to base64"));
          return;
        }
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const uploadImage = async (file: File, userId: string): Promise<string> => {
    reset();
    
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.message || "Invalid file");
    }

    setUploading(true);
    setProgress(10);

    try {
      // Compress image
      const compressedBlob = await compressImage(file);
      setProgress(30);
      
      // Convert to base64
      const base64Image = await blobToBase64(compressedBlob);
      setProgress(50);
      
      // Your ImgBB API key
      const IMGBB_API_KEY = "6136f4b5f3aa641cf6def0325ed0adce";
      
      if (!IMGBB_API_KEY) {
        throw new Error("ImgBB API key is missing.");
      }

      // Create URLSearchParams for ImgBB API
      const params = new URLSearchParams();
      params.append("key", IMGBB_API_KEY);
      params.append("image", base64Image);
      
      // Add metadata
      const timestamp = Date.now();
      params.append("name", `avatar_${userId}_${timestamp}`);
      params.append("expiration", "2592000"); // 30 days

      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      setProgress(70);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ImgBB error:", errorText);
        
        try {
          const errorResult = JSON.parse(errorText);
          throw new Error(errorResult.error?.message || `Upload failed: ${response.status}`);
        } catch {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      }

      const result = await response.json();
      setProgress(90);

      if (!result.success) {
        const errorMsg = result.error?.message || "ImgBB upload failed";
        throw new Error(errorMsg);
      }

      if (!result.data?.url) {
        throw new Error("No image URL returned");
      }

      setProgress(100);
      
      // Return structured data
      return JSON.stringify({
        success: true,
        url: result.data.url || "",
        thumbnail: result.data.thumb?.url || result.data.url || "",
        medium: result.data.medium?.url || result.data.url || "",
        display_url: result.data.display_url || result.data.url || "",
        imageId: result.data.id || "",
        deleteUrl: result.data.delete_url || "",
        width: result.data.width || 800,
        height: result.data.height || 800,
        size: result.data.size || 0,
        uploadedAt: new Date().toISOString(),
      });
      
    } catch (err: any) {
      const errorMessage = err.message || "Upload failed. Please try again.";
      setError(errorMessage);
      setUploading(false);
      console.error("Upload error:", err);
      throw new Error(errorMessage);
    } finally {
      setTimeout(() => reset(), 1000);
    }
  };

  return { uploadImage, uploading, progress, error, reset };
};