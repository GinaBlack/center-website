
interface AlbumImage {
  id: string;
  url: string;
  delete_url: string;
  thumb_url: string;
  user_id: string;
  uploaded_at: string;
  file_name: string;
}

interface AlbumStats {
  total_images: number;
  users_count: number;
  total_size: number;
  last_updated: string;
}

class ImgBBAlbumManager {
  private apiKey: string;
  private albumId: string;

  constructor(apiKey: string, albumId: string) {
    this.apiKey = apiKey;
    this.albumId = albumId;
  }

  // Get all images from the album (via your own database)
  async getUserImages(userId: string): Promise<AlbumImage[]> {
    // Store image metadata in your own database (Firestore)
    // Query: where('user_id', '==', userId)
    // This requires you to save image data when uploading
    return [];
  }

  // Delete old avatars when user uploads new one
  async deleteOldUserAvatars(userId: string, keepLatest: number = 1): Promise<void> {
    // Get user's images from your database
    const userImages = await this.getUserImages(userId);
    
    // Sort by upload date (newest first)
    const sortedImages = userImages.sort((a, b) => 
      new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
    
    // Delete old images (keep the latest N)
    for (let i = keepLatest; i < sortedImages.length; i++) {
      await this.deleteImage(sortedImages[i].delete_url);
      // Also remove from your database
    }
  }

  // Delete image from ImgBB
  async deleteImage(deleteUrl: string): Promise<boolean> {
    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to delete image:', error);
      return false;
    }
  }

  // Get album statistics
  async getAlbumStats(): Promise<AlbumStats> {
    // You need to track this in your own database
    // Since ImgBB API doesn't provide album stats directly
    return {
      total_images: 0,
      users_count: 0,
      total_size: 0,
      last_updated: new Date().toISOString()
    };
  }

  // Create a user-specific folder structure in description
  generateImageDescription(userId: string, userName: string): string {
    return `User: ${userName} (ID: ${userId})\nUploaded: ${new Date().toISOString()}\nType: Avatar`;
  }
}

export default ImgBBAlbumManager;