// services/githubImageService.ts
export class GitHubImageService {
  // Configuration
  private static readonly GITHUB_USERNAME = 'GinaBlack';
  private static readonly REPO_NAME = 'center-website';
  private static readonly BRANCH = 'main';
  
  // Base URL for raw GitHub content
  private static readonly BASE_URL = `https://raw.githubusercontent.com/${this.GITHUB_USERNAME}/${this.REPO_NAME}/${this.BRANCH}`;

  // Get URL for any image
  static getImageUrl(path: string): string {
    return `${this.BASE_URL}/${path}`;
  }

  // Get hall image URL
  static getHallImageUrl(hallId: string | number, imageName: string): string {
    return this.getImageUrl(`halls/hall-${hallId}/${imageName}`);
  }

  // Get optimized image URL with CDN proxy
  static getOptimizedImageUrl(
    imageUrl: string, 
    width: number = 400, 
    quality: number = 80
  ): string {
    // Use a free CDN proxy for optimization
    // Images.weserv.nl supports resizing, compression, and caching
    return `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=${width}&q=${quality}&output=webp&fit=cover`;
  }

  // Get all images for a hall with optimization
  static getHallImages(
    hallId: string | number, 
    imageNames: string[], 
    width: number = 400
  ): string[] {
    return imageNames.map(imageName => {
      const originalUrl = this.getHallImageUrl(hallId, imageName);
      return this.getOptimizedImageUrl(originalUrl, width);
    });
  }

  // Get thumbnail URL
  static getThumbnailUrl(hallId: string | number, imageName: string): string {
    const originalUrl = this.getHallImageUrl(hallId, imageName);
    return this.getOptimizedImageUrl(originalUrl, 150, 60);
  }

  // Get placeholder image (for fallback)
  static getPlaceholderUrl(width: number = 400, height: number = 300): string {
    return `https://via.placeholder.com/${width}x${height}/f3f4f6/9ca3af?text=No+Image`;
  }

  // Check if image exists
  static async checkImageExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Extract filename from path
  static getFilenameFromPath(path: string): string {
    return path.split('/').pop() || 'image.jpg';
  }

  // Generate next available filename
  static generateNextFilename(existingFiles: string[]): string {
    const imageNumbers = existingFiles
      .map(file => {
        const match = file.match(/image(\d+)\./);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);
    
    const nextNumber = imageNumbers.length > 0 ? Math.max(...imageNumbers) + 1 : 1;
    return `image${nextNumber}.jpg`;
  }
}