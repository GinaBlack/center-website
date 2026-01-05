import { doc, getDoc, setDoc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/firebase_config";

export interface AvatarData {
  url: string;
  thumb_url?: string;
  medium_url?: string;
  display_url?: string;
  imgbb_id?: string;
  delete_url?: string;
  album_id?: string;
  uploaded_by: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  dimensions?: { width: number; height: number };
  uploaded_at: any;
  expires_at?: string | null;
}

export interface UserProfile {
  avatar_url: string;
  avatar_data: AvatarData;
  avatar_history: Array<{
    url: string;
    thumb_url?: string;
    uploaded_at: any;
    deleted: boolean;
    deleted_at?: any;
  }>;
  avatar_settings: {
    auto_compress: boolean;
    max_size_kb: number;
    keep_history: boolean;
    history_limit: number;
    last_updated: string;
  };
  updated_at: any;
}

/**
 * Get user's avatar profile
 */
export const getUserAvatarProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const profileDoc = await getDoc(doc(db, "user_profiles", userId));
    
    if (profileDoc.exists()) {
      return profileDoc.data() as UserProfile;
    }
    
    // Return default structure if no profile exists
    return {
      avatar_url: "",
      avatar_data: null as any,
      avatar_history: [],
      avatar_settings: {
        auto_compress: true,
        max_size_kb: 1024,
        keep_history: true,
        history_limit: 5,
        last_updated: new Date().toISOString()
      },
      updated_at: null
    };
  } catch (error) {
    console.error("Error getting avatar profile:", error);
    return null;
  }
};

/**
 * Update avatar with new data model
 */
export const updateUserAvatar = async (
  userId: string, 
  avatarData: AvatarData,
  oldAvatarUrl?: string
): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    
    // Get current profile
    const currentProfile = await getUserAvatarProfile(userId);
    
    // Prepare history
    let avatarHistory = currentProfile?.avatar_history || [];
    
    // Add old avatar to history if it exists
    if (oldAvatarUrl && currentProfile?.avatar_data?.url) {
      avatarHistory.unshift({
        url: currentProfile.avatar_data.url,
        thumb_url: currentProfile.avatar_data.thumb_url || currentProfile.avatar_data.url,
        uploaded_at: currentProfile.avatar_data.uploaded_at,
        deleted: false
      });
      
      // Trim history to limit
      const historyLimit = currentProfile?.avatar_settings?.history_limit || 5;
      if (avatarHistory.length > historyLimit) {
        avatarHistory = avatarHistory.slice(0, historyLimit);
      }
    }
    
    // Update profile
    await setDoc(
      doc(db, "user_profiles", userId),
      {
        avatar_url: avatarData.url,
        avatar_data: avatarData,
        avatar_history: avatarHistory,
        avatar_settings: {
          ...currentProfile?.avatar_settings,
          last_updated: now
        },
        updated_at: new Date().toISOString()
      },
      { merge: true }
    );
    
    // Also update users collection
    await setDoc(
      doc(db, "users", userId),
      {
        avatar_url: avatarData.url,
        avatar_updated_at: new Date().toISOString(),
        has_avatar: true
      },
      { merge: true }
    );
    
    return true;
  } catch (error) {
    console.error("Error updating avatar:", error);
    return false;
  }
};

/**
 * Delete old avatar from history
 */
export const deleteOldAvatar = async (
  userId: string,
  avatarUrl: string
): Promise<boolean> => {
  try {
    const profileDoc = await getDoc(doc(db, "user_profiles", userId));
    
    if (profileDoc.exists()) {
      const data = profileDoc.data();
      const avatarHistory = data.avatar_history || [];
      
      // Mark as deleted in history
      const updatedHistory = avatarHistory.map((item: any) => 
        item.url === avatarUrl ? { ...item, deleted: true, deleted_at: new Date().toISOString() } : item
      );
      
      await updateDoc(doc(db, "user_profiles", userId), {
        avatar_history: updatedHistory
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting old avatar:", error);
    return false;
  }
};

/**
 * Get avatar statistics
 */
export const getAvatarStats = async (userId: string) => {
  const profile = await getUserAvatarProfile(userId);
  
  if (!profile) {
    return null;
  }
  
  return {
    current_avatar: profile.avatar_data ? {
      url: profile.avatar_data.url,
      uploaded: profile.avatar_data.uploaded_at,
      size: profile.avatar_data.file_size,
      dimensions: profile.avatar_data.dimensions
    } : null,
    history_count: profile.avatar_history.length,
    settings: profile.avatar_settings,
    last_updated: profile.updated_at
  };
};