import { useState } from "react";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];

interface UseImgBBUploadReturn {
  uploadImage: (file: File, userId: string, albumId?: string) => Promise<string>;
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
      if (file.size < 500 * 1024) { // Less than 500KB
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 800; // Max width/height
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions
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
          
          // Convert to JPEG with 80% quality
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

  const uploadImage = async (file: File, userId: string, albumId?: string): Promise<string> => {
    reset();
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.message || "Invalid file");
    }

    setUploading(true);
    setProgress(10);

    try {
      // Compress image first
      console.log("Compressing image...");
      const compressedBlob = await compressImage(file);
      setProgress(30);

      // Convert compressed blob to base64
      const base64Image = await blobToBase64(compressedBlob);
      setProgress(50);
      
      console.log("Base64 image size:", base64Image.length, "bytes");

      // Your ImgBB API key
      const IMGBB_API_KEY = "6136f4b5f3aa641cf6def0325ed0adce";
      
      if (!IMGBB_API_KEY) {
        throw new Error("ImgBB API key is missing.");
      }

      // Create form data
      const formData = new FormData();
      formData.append("key", IMGBB_API_KEY);
      formData.append("image", base64Image);
      
      // Organize by user and timestamp
      const timestamp = Date.now();
      const fileName = `avatar_${userId}_${timestamp}`;
      formData.append("name", fileName);
      
      // Optional: Add to album if albumId is provided
      if (albumId) {
        formData.append("album", albumId);
      }
      
      // Add user ID as a tag for organization
      formData.append("tags", `user_${userId},avatar`);
      
      formData.append("expiration", "2592000"); // 30 days

      console.log("Uploading to ImgBB...");
      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ImgBB error response:", errorText);
        
        // Try to parse error from response
        try {
          const errorResult = JSON.parse(errorText);
          throw new Error(errorResult.error?.message || `Upload failed: ${response.status}`);
        } catch {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      }

      const result = await response.json();
      setProgress(90);

      console.log("ImgBB response:", result);

      if (!result.success) {
        const errorMsg = result.error?.message || "ImgBB upload failed";
        console.error("ImgBB upload failed:", result);
        throw new Error(errorMsg);
      }

      if (!result.data?.url) {
        throw new Error("No image URL returned");
      }

      setProgress(100);
      
      // Reset after delay
      setTimeout(() => reset(), 1000);

      console.log("✅ Upload successful! URL:", result.data.url);
      console.log("Album ID:", result.data.album_id || "No album");
      console.log("Delete URL:", result.data.delete_url);
      
      // Return additional info along with URL
      return JSON.stringify({
      url: result.data.url || "",
      thumbnail: result.data.thumb?.url || result.data.url || "",
      medium: result.data.medium?.url || result.data.url || "",
      display_url: result.data.display_url || result.data.url || "",
      imageId: result.data.id || "",
      deleteUrl: result.data.delete_url || "",
      albumId: result.data.album_id || albumId || "default_album", // Never undefined
      dimensions: {
        width: 800,
        height: 800
      }
      });
      
    } catch (err: any) {
      const errorMessage = err.message || "Upload failed. Please try again.";
      setError(errorMessage);
      setUploading(false);
      console.error("❌ Upload error:", err);
      throw new Error(errorMessage);
    }
  };

  return { uploadImage, uploading, progress, error, reset };
};

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1];
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