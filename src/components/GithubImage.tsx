// components/GitHubImage.tsx
import React, { useState, useEffect } from 'react';
import { GitHubImageService } from '../services/githubImageService';

interface GitHubImageProps {
  hallId: string | number;
  imageName: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  useProxy?: boolean;
}

const GitHubImage: React.FC<GitHubImageProps> = ({
  hallId,
  imageName,
  alt,
  className = '',
  width = 400,
  height = 300,
  useProxy = true
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);

        // Get GitHub URL
        let url = GitHubImageService.getHallImageUrl(hallId, imageName);
        
        // Apply proxy for optimization if requested
        if (useProxy) {
          url = GitHubImageService.getOptimizedImageUrl(url, width);
        }

        // Verify image exists
        const response = await fetch(url, { method: 'HEAD' });
        
        if (!response.ok) {
          throw new Error('Image not found');
        }

        setImageUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error loading GitHub image:', err);
        setError(true);
        setLoading(false);
        // Fallback to a placeholder
        setImageUrl(`https://via.placeholder.com/${width}x${height}?text=Image+Not+Found`);
      }
    };

    loadImage();
  }, [hallId, imageName, width, height, useProxy]);

  if (loading) {
    return (
      <div 
        className={`${className} bg-gray-200 animate-pulse rounded-lg`}
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    );
  }

  if (error) {
    return (
      <div 
        className={`${className} bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`${className} rounded-lg`}
      style={{ width: `${width}px`, height: `${height}px` }}
      loading="lazy"
      decoding="async"
    />
  );
};

export default GitHubImage;