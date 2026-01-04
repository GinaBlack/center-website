import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROLES } from "../constants/roles";
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  Building,
  Calendar,
  Users,
  BookPlus,
  FileText,
  Bell,
  MessageSquare,
  Settings,
  HelpCircle,
  Home,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
  Plus,
  Book,
  Image,
  RockingChairIcon,
  PaperclipIcon,
  Upload,
  AlertCircle
} from "lucide-react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase_config";
import { useImgBBUpload } from "../hooks/useImgBBUpload";
import { toast } from "react-hot-toast";

// Constants
const AVATAR_ALBUM_ID = "dbpqSf"; // Replace with your ImgBB album ID
const AVATAR_MAX_SIZE_MB = 5;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const defaultAvatarUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNlMGUwZTAiLz48cGF0aCBkPSJNNTAgMzVjLTguMjgzIDAtMTUgNi43MTctMTUgMTVzNi43MTcgMTUgMTUgMTUgMTUtNi43MTcgMTUtMTUtNi43MTctMTUtMTUtMTV6bTAgNDBjLTEzLjgwNyAwLTI1IDExLjE5My0yNSAyNWg1MGMwLTEzLjgwNy0xMS4xOTMtMjUtMjUtMjV6IiBmaWxsPSIjYWFhIi8+PC9zdmc+";

// Navigation data (memoized to prevent re-renders)
const userLinks = [
  { to: "/dashboard", label: "Overview", icon: <LayoutDashboard size={20} /> },
  { to: "/dashboard/projects", label: "My Projects", icon: <FolderKanban size={20} /> },
  { to: "/dashboard/courses", label: "My Courses", icon: <BookOpen size={20} /> },
  { to: "/dashboard/bookings", label: "My Bookings", icon: <Calendar size={20} /> },
  { to: "/dashboard/book-hall", label: "Book Hall", icon: <Building size={20} /> },
  { to: "/dashboard/projects/upload", label: "Submit Projects", icon: <FileText size={20} /> },
];

const instructorLinks = [
  { to: "/dashboard", label: "Overview", icon: <LayoutDashboard size={20} /> },
  { to: "/instructor/courses", label: "My Courses", icon: <BookOpen size={20} /> },
  { to: "/instructor/courses/create", label: "Create Course", icon: <BookPlus size={20} /> },
  { to: "/instructor/students", label: "Students", icon: <Users size={20} /> },
  { to: "/instructor/my-materials", label: "Course Materials", icon: <PaperclipIcon size={20} /> },
];

const adminLinks = [
  { to: "/dashboard", label: "Overview", icon: <LayoutDashboard size={20} /> },
  { to: "/admin/users", label: "User Management", icon: <Users size={20} /> },
  { to: "/admin/projects", label: "Projects Management", icon: <FolderKanban size={20} /> },
  { to: "/admin/gallery", label: "Gallery Management", icon: <Image size={20} /> },
  { to: "/admin/messages", label: "Messages Management", icon: <MessageSquare size={20} /> },
  { to: "/admin/bookings", label: "Booking Management", icon: <Calendar size={20} /> },
  { to: "/admin/courses", label: "Course Management", icon: <Book size={20} /> },
  { to: "/admin/hallmanagement", label: "Hall Management", icon: <RockingChairIcon size={20} /> },
  { to: "/admin/systemsettings", label: "System Settings", icon: <Settings size={20} /> },
];

const quickLinks = [
  { to: "/", label: "Home", icon: <Home size={20} /> },
  { to: "/dashboard/profile", label: "Profile", icon: <User size={20} /> },
  { to: "/dashboard/notifications", label: "Notifications", icon: <Bell size={20} /> },
  { to: "/dashboard/profile/settings", label: "Settings", icon: <Settings size={20} /> },
  { to: "/dashboard/profile/help", label: "Help", icon: <HelpCircle size={20} /> },
];

// Memoized NavItem component
const NavItem = memo(({ link, section, sidebarCollapsed, isActive }: { 
  link: any; 
  section: string; 
  sidebarCollapsed: boolean;
  isActive: boolean;
}) => (
  <NavLink
    to={link.to}
    className={({ isActive: navIsActive }) => `
      flex items-center px-3 py-3 rounded-lg transition-all duration-200 group
      ${(isActive || navIsActive)
        ? section === "admin"
          ? "bg-green-500 text-white shadow-md"
          : "bg-blue-500 text-white shadow-md"
        : "hover:bg-gray-100 hover:text-gray-900 text-gray-700"
      }
      ${sidebarCollapsed ? "justify-center px-2" : ""}
    `}
    title={sidebarCollapsed ? link.label : ""}
  >
    <div className={`transition-transform group-hover:scale-105 ${isActive || isActive ? "scale-105" : ""}`}>
      {link.icon}
    </div>
    {!sidebarCollapsed && (
      <span className="ml-3 font-medium truncate">{link.label}</span>
    )}
  </NavLink>
));

NavItem.displayName = 'NavItem';

// Avatar Upload Component
const AvatarUpload = memo(({ 
  avatar, 
  userName, 
  uploading, 
  progress, 
  error, 
  onAvatarSelect,
  disabled 
}: {
  avatar: string | null;
  userName: string;
  uploading: boolean;
  progress: number;
  error: string | null;
  onAvatarSelect: (file: File) => void;
  disabled: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!ALLOWED_AVATAR_TYPES.includes(file.type.toLowerCase())) {
      toast.error("Only JPG, PNG, or WEBP images are allowed");
      return;
    }

    if (file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${AVATAR_MAX_SIZE_MB}MB`);
      return;
    }

    onAvatarSelect(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="relative w-24 h-24">
          <img
            src={avatar || defaultAvatarUrl}
            alt={`${userName}'s avatar`}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg transition-all duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        </div>
        
        <button
          onClick={() => !disabled && fileInputRef.current?.click()}
          disabled={disabled}
          className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:bg-blue-600 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Upload avatar"
          title="Upload new avatar"
        >
          {uploading ? (
            <Upload size={16} className="animate-pulse" />
          ) : (
            <Plus size={16} />
          )}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_AVATAR_TYPES.join(",")}
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled}
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full max-w-[200px] mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Uploading</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !uploading && (
        <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700 text-xs">
            <AlertCircle size={12} className="mr-1 flex-shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
});

AvatarUpload.displayName = 'AvatarUpload';

// Main Component
const DashboardSidebar = ({ mobileOnly = false }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { uploadImage, uploading, progress, error, reset } = useImgBBUpload();

  /* ================= FETCH USER DATA ================= */
  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        const [userDoc, profileDoc] = await Promise.all([
          getDoc(doc(db, "users", currentUser.uid)),
          getDoc(doc(db, "user_profiles", currentUser.uid))
        ]);

        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          setAvatar(profileData.avatar_url || defaultAvatarUrl);
        } else {
          setAvatar(defaultAvatarUrl);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setAvatar(defaultAvatarUrl);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname]);

  /* ================= AVATAR UPLOAD ================= */
const handleAvatarSelect = useCallback(async (file: File) => {
  if (!currentUser) return;

  try {
    // Upload to ImgBB with enhanced data
    const resultString = await uploadImage(file, currentUser.uid, AVATAR_ALBUM_ID);
    const result = JSON.parse(resultString);
    
    // Debug log to see what's returned
    console.log("ImgBB upload result:", result);
    
    // Prepare enhanced avatar data with fallbacks for all fields
    const avatarData = {
      url: result.url || "",
      thumb_url: result.thumbnail || result.url || "",
      medium_url: result.medium || result.url || "",
      display_url: result.display_url || result.url || "",
      imgbb_id: result.imageId || "",
      delete_url: result.deleteUrl || "",
      album_id: result.albumId || AVATAR_ALBUM_ID || "default_album", // Ensure album_id is never undefined
      uploaded_by: currentUser.uid,
      file_name: file.name || "avatar.jpg",
      file_size: file.size || 0,
      mime_type: file.type || "image/jpeg",
      dimensions: result.dimensions || { width: 800, height: 800 },
      uploaded_at: new Date().toISOString(),
      expires_at: null
    };

    // Log the avatar data to debug
    console.log("Avatar data to save:", avatarData);

    // Get current profile for history
    const profileDoc = await getDoc(doc(db, "user_profiles", currentUser.uid));
    const currentData = profileDoc.exists() ? profileDoc.data() : {};
    
    // Prepare history with safe defaults
    let avatarHistory = currentData.avatar_history || [];
    if (currentData.avatar_data?.url) {
      avatarHistory.unshift({
        url: currentData.avatar_data.url || "",
        thumb_url: currentData.avatar_data.thumb_url || currentData.avatar_data.url || "",
        uploaded_at: currentData.avatar_data.uploaded_at || new Date().toISOString(),
        deleted: false
      });
      
      // Keep only last 5 avatars
      if (avatarHistory.length > 5) {
        avatarHistory = avatarHistory.slice(0, 5);
      }
    }

    // Prepare settings with defaults
    const avatarSettings = {
      auto_compress: true,
      max_size_kb: 1024,
      keep_history: true,
      history_limit: 5,
      last_updated: new Date().toISOString(),
      ...(currentData.avatar_settings || {})
    };

    // Update Firestore with enhanced structure
    const updatePromises = [
      setDoc(
        doc(db, "user_profiles", currentUser.uid),
        {
          avatar_url: result.url || "",
          avatar_data: avatarData,
          avatar_history: avatarHistory,
          avatar_settings: avatarSettings,
          updated_at: serverTimestamp(),
        },
        { merge: true }
      )
    ];

    // Only update users collection if it exists
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        updatePromises.push(
          setDoc(
            doc(db, "users", currentUser.uid),
            {
              avatar_url: result.url || "",
              avatar_updated_at: serverTimestamp(),
              has_avatar: true,
            },
            { merge: true }
          )
        );
      }
    } catch (error) {
      console.warn("Could not update users collection:", error);
    }

    // Execute all updates
    await Promise.all(updatePromises);

    // Update local state
    setAvatar(result.url || defaultAvatarUrl);
    
    // Show success message
    toast.success("Avatar updated successfully!", {
      icon: "✅",
      duration: 3000,
    });

    // Reset upload state after delay
    setTimeout(() => reset(), 1500);

  } catch (err: any) {
    console.error("Avatar upload failed:", err);
    toast.error(err.message || "Failed to upload avatar", {
      icon: "❌",
      duration: 4000,
    });
  }
}, [currentUser, uploadImage, reset]);

  /* ================= LOGOUT ================= */
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  }, [logout, navigate]);

  /* ================= UTILITIES ================= */
  const userName = userData
    ? `${userData.first_name} ${userData.last_name}`
    : "User";

  const getRoleDisplay = useCallback(() => {
    switch (userData?.role) {
      case ROLES.CENTER_ADMIN:
        return "Center Admin";
      case ROLES.SUPER_ADMIN:
        return "Super Admin";
      case ROLES.INSTRUCTOR:
        return "Instructor";
      default:
        return "User";
    }
  }, [userData?.role]);

  const getNavLinks = useCallback(() => {
    if (userData?.role === ROLES.CENTER_ADMIN || userData?.role === ROLES.SUPER_ADMIN) {
      return adminLinks;
    } else if (userData?.role === ROLES.INSTRUCTOR) {
      return instructorLinks;
    } else {
      return userLinks;
    }
  }, [userData?.role]);

  /* ================= LOADING & EARLY RETURNS ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (mobileOnly) {
    return <MobileSidebar />;
  }

  return <DesktopSidebar />;

  /* ================= DESKTOP SIDEBAR ================= */
  function DesktopSidebar() {
    const navLinks = getNavLinks();
    const roleDisplay = getRoleDisplay();
    const currentPath = location.pathname;

    return (
      <aside className="h-screen sticky top-0 flex flex-col bg-white border-r shadow-lg transition-all duration-300">
        {/* HEADER - USER PROFILE */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Award size={24} className="text-blue-500 mr-2" />
              {!sidebarCollapsed && (
                <span className="font-bold text-gray-800 text-lg">Dashboard</span>
              )}
            </div>
            
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={sidebarCollapsed ? "Expand" : "Collapse"}
            >
              {sidebarCollapsed ? (
                <ChevronRight size={20} className="text-gray-600" />
              ) : (
                <ChevronLeft size={20} className="text-gray-600" />
              )}
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="space-y-4">
              <AvatarUpload
                avatar={avatar}
                userName={userName}
                uploading={uploading}
                progress={progress}
                error={error}
                onAvatarSelect={handleAvatarSelect}
                disabled={uploading}
              />
              
              <div className="text-center space-y-1">
                <h3 className="font-bold text-gray-800 text-lg truncate px-2">
                  {userName}
                </h3>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                  {roleDisplay}
                </div>
              </div>
            </div>
          )}

          {sidebarCollapsed && (
            <div className="flex justify-center">
              <AvatarUpload
                avatar={avatar}
                userName={userName}
                uploading={uploading}
                progress={progress}
                error={error}
                onAvatarSelect={handleAvatarSelect}
                disabled={uploading}
              />
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navLinks.map((link) => (
            <NavItem
              key={link.to}
              link={link}
              section={userData?.role === ROLES.CENTER_ADMIN || userData?.role === ROLES.SUPER_ADMIN ? "admin" : "default"}
              sidebarCollapsed={sidebarCollapsed}
              isActive={currentPath === link.to || currentPath.startsWith(link.to + "/")}
            />
          ))}
        </nav>

        {/* FOOTER - QUICK LINKS & LOGOUT */}
        <div className="border-t p-4 space-y-2">
          {!sidebarCollapsed && (
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Links
              </p>
              {quickLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200
                    ${isActive
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }
                  `}
                >
                  {link.icon}
                  <span className="ml-3">{link.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center justify-center px-3 py-2.5 text-sm rounded-lg
              transition-all duration-200 hover:bg-red-50 hover:text-red-700 
              text-gray-700 font-medium active:scale-95
              ${sidebarCollapsed ? "justify-center" : ""}
            `}
            title="Logout"
          >
            <LogOut size={16} className={sidebarCollapsed ? "" : "mr-2"} />
            {!sidebarCollapsed && "Logout"}
          </button>
        </div>
      </aside>
    );
  }

  /* ================= MOBILE SIDEBAR ================= */
  function MobileSidebar() {
    const navLinks = getNavLinks();
    const roleDisplay = getRoleDisplay();
    const currentPath = location.pathname;

    return (
      <>
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          aria-label="Open menu"
        >
          <Menu size={24} className="text-gray-700" />
        </button>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 shadow-2xl
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Mobile Header */}
          <div className="h-16 border-b bg-gradient-to-r from-blue-50 to-white flex items-center justify-between px-4">
            <div className="flex items-center">
              <Award size={28} className="text-blue-500 mr-3" />
              <span className="font-bold text-gray-800 text-xl">Dashboard</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition active:scale-95"
              aria-label="Close menu"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Mobile User Profile */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center mb-4">
              <div className="relative mr-4">
                <img
                  src={avatar || defaultAvatarUrl}
                  alt={userName}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                  loading="lazy"
                />
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = ALLOWED_AVATAR_TYPES.join(',');
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleAvatarSelect(file);
                    };
                    input.click();
                  }}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white text-xs hover:bg-blue-600 active:scale-95 transition"
                  disabled={uploading}
                  aria-label="Upload avatar"
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-lg truncate">{userName}</h3>
                <p className="text-sm text-gray-600">{roleDisplay}</p>
              </div>
            </div>

            {/* Mobile Upload Progress */}
            {uploading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Uploading avatar...</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navLinks.map((link) => (
              <NavItem
                key={link.to}
                link={link}
                section={userData?.role === ROLES.CENTER_ADMIN || userData?.role === ROLES.SUPER_ADMIN ? "admin" : "default"}
                sidebarCollapsed={false}
                isActive={currentPath === link.to || currentPath.startsWith(link.to + "/")}
              />
            ))}
          </div>

          {/* Mobile Quick Links & Logout */}
          <div className="border-t p-4 space-y-2">
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Access
              </p>
              {quickLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="flex items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span className="ml-3">{link.label}</span>
                </NavLink>
              ))}
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setTimeout(() => handleLogout(), 200);
              }}
              className="w-full flex items-center justify-center px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition active:scale-95"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </>
    );
  }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-in-out;
  }
`;
document.head.appendChild(style);

export default memo(DashboardSidebar);