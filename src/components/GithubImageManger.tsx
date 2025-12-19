// components/GithubImageManager.tsx
import React, { useState, useRef } from 'react';
import { Upload, X, Check, ExternalLink } from 'lucide-react';

interface GitHubImageManagerProps {
  hallId: string | number;
  onImagesUpdated: (imageUrls: string[]) => void;
  existingImages?: string[];
}

const GitHubImageManager: React.FC<GitHubImageManagerProps> = ({
  hallId,
  onImagesUpdated,
  existingImages = []
}) => {
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isSizeValid = file.size <= 5 * 1024 * 1024; // 5MB max
      return isImage && isSizeValid;
    });

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedImage = (index: number) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    setUploadedUrls(newUrls);
    onImagesUpdated(newUrls);
  };

  const generateImageInstructions = () => {
    if (images.length === 0) return null;

    const instructions = images.map((file, index) => {
      const filename = `image${uploadedUrls.length + index + 1}.jpg`;
      const path = `halls/hall-${hallId}/${filename}`;
      
      return {
        filename,
        path,
        originalName: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
      };
    });

    return instructions;
  };

  const copyInstructionsToClipboard = () => {
    const instructions = generateImageInstructions();
    if (!instructions) return;

    const text = instructions.map(inst => 
      `File: ${inst.originalName}\nSave as: ${inst.filename}\nUpload to: ${inst.path}\n`
    ).join('\n');

    navigator.clipboard.writeText(text);
    alert('Instructions copied to clipboard!');
  };

  const getGitHubUploadUrl = () => {
    return `https://github.com/GinaBlack/center-website/blob/System_images/Halls/hall-${hallId}`;

  };

  const handleManualUploadComplete = () => {
    // After manual upload to GitHub, update the URLs
    const newUrls = images.map((_, index) => 
      `https://github.com/GinaBlack/center-website/blob/System_images/Halls/hall-${hallId}/image${uploadedUrls.length + index + 1}.jpg`
    );

    const allUrls = [...uploadedUrls, ...newUrls];
    setUploadedUrls(allUrls);
    setImages([]);
    onImagesUpdated(allUrls);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Hall Images</h3>
        <a
          href={getGitHubUploadUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          Open GitHub Upload
        </a>
      </div>

      {/* Existing Images */}
      {uploadedUrls.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Current Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Hall ${hallId} - ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                title='button'
                  type="button"
                  onClick={() => removeUploadedImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Select New Images (max 5MB each)
        </label>
        <input
        title='button'
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Supported: JPG, PNG, WebP. Max 5MB per image
        </p>
      </div>

      {/* Selected Images Preview */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Selected Images ({images.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((file, index) => (
              <div key={index} className="relative group border rounded-lg p-2">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-24 object-cover rounded"
                />
                <div className="text-xs mt-2 truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(0)}KB
                </div>
                <button
                title='button'
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      {images.length > 0 && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Upload Instructions</h4>
            <button
              type="button"
              onClick={copyInstructionsToClipboard}
              className="text-sm text-primary hover:underline"
            >
              Copy Instructions
            </button>
          </div>
          
          <ol className="space-y-2 text-sm">
            <li>1. Click "Open GitHub Upload" link above</li>
            <li>2. Drag and drop your images or click "choose your files"</li>
            <li>3. <strong>Important:</strong> Rename files as follows:</li>
            
            <div className="ml-4 mt-2 space-y-1">
              {generateImageInstructions()?.map((inst, index) => (
                <div key={index} className="text-xs">
                  <code>{inst.originalName}</code> → <code>{inst.filename}</code>
                </div>
              ))}
            </div>
            
            <li>4. Add commit message: "Add images for hall {hallId}"</li>
            <li>5. Click "Commit changes"</li>
            <li>6. Come back here and click "Mark as Uploaded"</li>
          </ol>

          <button
            type="button"
            onClick={handleManualUploadComplete}
            disabled={uploading}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Mark as Uploaded to GitHub
          </button>
        </div>
      )}

      {/* GitHub Info */}
      <div className="text-sm text-muted-foreground border-t pt-4">
        <p className="font-medium">GitHub Repository Information:</p>
        <code className="block mt-1 p-2 bg-background rounded text-xs">
          Repository: https://github.com/GinaBlack/center-website/blob/main/System_images/Halls/
        </code>
        <code className="block mt-1 p-2 bg-background rounded text-xs">
          Image Path: halls/hall-{hallId}/
        </code>
      </div>
    </div>
  );
};

export default GitHubImageManager;