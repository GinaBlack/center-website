import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom'; // Removed useNavigate since not used
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../constants/roles';
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
  PaperclipIcon
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { storage, db } from "../firebase/firebase_config";

const DashboardSidebar = ({ mobileOnly = false }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

  // Default avatar as base64 SVG
  const defaultAvatarUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNlMGUwZTAiLz48cGF0aCBkPSJNNTAgMzVjLTguMjgzIDAtMTUgNi43MTctMTUgMTVzNi43MTcgMTUgMTUgMTUgMTUtNi43MTcgMTUtMTUtNi43MTctMTUtMTUtMTV6bTAgNDBjLTEzLjgwNyAwLTI1IDExLjE5My0yNSAyNWg1MGMwLTEzLjgwNy0xMS4xOTMtMjUtMjUtMjV6IiBmaWxsPSIjYWFhIi8+PC9zdmc+";

  // Fetch user data from Firestore - from user_profiles collection
  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        // Fetch user data from users collection
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        
        // Fetch avatar/profile data from user_profiles collection
        const userProfileDoc = await getDoc(doc(db, "user_profiles", currentUser.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
          // Get avatar from user_profiles collection if exists
          if (userProfileDoc.exists()) {
            const profileData = userProfileDoc.data();
            setAvatar(profileData.avatar_url || defaultAvatarUrl);
          } else {
            // If no user_profiles document, use default avatar
            setAvatar(defaultAvatarUrl);
          }
        } else {
          // If no user document, use default avatar
          setAvatar(defaultAvatarUrl);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setAvatar(defaultAvatarUrl); // Fallback to default avatar
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
  }, [location.pathname]);

  const userName = userData ? `${userData.first_name} ${userData.last_name}` : 'User';

  /* ================= NAVIGATION DATA ================= */
  const userLinks = [
    { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { to: '/dashboard/projects', label: 'My Projects', icon: <FolderKanban size={20} /> },
    { to: '/dashboard/courses', label: 'My Courses', icon: <BookOpen size={20} /> },
    { to: '/dashboard/bookings', label: 'My Bookings', icon: <Calendar size={20} /> },
    { to: '/dashboard/book-hall', label: 'Book Hall', icon: <Building size={20} /> },
    { to: '/dashboard/projects/upload', label: 'Submit Projects', icon: <FileText size={20} /> },
  ];

  const instructorLinks = [
    { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { to: '/instructor/courses', label: 'My Courses', icon: <BookOpen size={20} /> },
    { to: '/instructor/courses/create', label: 'Create Course', icon: <BookPlus size={20} /> },
    { to: '/instructor/students', label: 'Students', icon: <Users size={20} /> },
    { to: '/instructor/my-materials', label: 'Course Materials', icon: <PaperclipIcon size={20} /> },
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { to: '/admin/users', label: 'User Management', icon: <Users size={20} /> },
    { to: '/admin/projects', label: 'Projects Management', icon: <FolderKanban size={20} /> },
    { to: '/admin/gallery', label: 'Gallery Management', icon: <Image size={20} /> },
    { to: '/admin/messages', label: 'Messages Management', icon: <MessageSquare size={20} /> },
    { to: '/admin/bookings', label: 'Booking Management', icon: <Calendar size={20} /> },
    { to: '/admin/courses', label: 'Course Management', icon: <Book size={20} /> },
    { to: '/admin/hallmanagement', label: 'Hall Management', icon: <RockingChairIcon size={20} /> },
    { to: '/admin/systemsettings', label: 'System Settings', icon: <Settings size={20} /> },
  ];

  const quickLinks = [
    { to: '/', label: 'Home', icon: <Home size={20} /> },
    { to: '/dashboard/profile', label: 'Profile', icon: <User size={20} /> },
    { to: '/dashboard/notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { to: '/dashboard/profile/settings', label: 'Settings', icon: <Settings size={20} /> },
    { to: '/dashboard/profile/help', label: 'Help', icon: <HelpCircle size={20} /> },
  ];

  /* ================= HANDLERS ================= */
  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    const storageRef = ref(storage, `avatars/${currentUser.uid}`);
    try {
      // Upload to Firebase Storage
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setAvatar(url);

      // Update avatar_url in user_profiles collection
      await setDoc(
        doc(db, "user_profiles", currentUser.uid), 
        { 
          avatar_url: url,
          updated_at: new Date().toISOString()
        }, 
        { merge: true }
      );
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  // Helper function to get role display text
  const getRoleDisplay = () => {
    switch (userData?.role) {
      case ROLES.CENTER_ADMIN:
        return 'Cnter Admin';
      case ROLES.SUPER_ADMIN:
        return 'Super Admin';
      case ROLES.INSTRUCTOR:
        return 'Instructor';
      case ROLES.USER:
        return 'User';
      default:
        //navigate("/");
        'user';
    }
  };

  /* ================= NAV ITEM COMPONENT ================= */
  const NavItem = ({ link, section }) => {
    const isActive = location.pathname === link.to;
    const sectionActive = {
      user: 'bg-blue-500 text-gray-200 gap-2',
      instructor: 'bg-blue-500 text-white ',
      admin: 'bg-green-500 text-white ',
    };

    return (
      <NavLink
        to={link.to}
        className={`
          flex items-center px-3 py-3 rounded-lg transition-all duration-200
          ${isActive ? sectionActive[section] : 'text-black hover:bg-muted gap-2'}
          ${sidebarCollapsed ? 'justify-center' : ''}
        `}
      >
        {link.icon}
        {!sidebarCollapsed && (
          <span className="ml-3 font-medium flex-1">{link.label}</span>
        )}
      </NavLink>
    );
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (mobileOnly) return <MobileSidebar />;
  return <DesktopSidebar />;

  /* ================= SIDEBAR COMPONENTS ================= */
  function DesktopSidebar() {
    return (
      <div className="pt-12 shadow-lg ">
        <div className="min-h-screen bg-muted/30 border border-gray-100 flex flex-col">
          {/* HEADER */}
          <div className="h-40 py-20 pt-32 border-b border-gray-200 flex items-center justify-between px-4">
            {!sidebarCollapsed ? (
              <>
                <div className="p-8 mb-4 rounded-lg">
                  <div className="grid flex items-center">
                    <div className="relative w-25 h-25 mx-auto">
                      <img
                        src={avatar || defaultAvatarUrl}
                        alt="User avatar"
                        className="w-25 h-25 rounded-full object-cover border"
                      />
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-0 left-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white"
                        title="Change photo"
                      >
                        <Plus size={14} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarSelect}
                      />
                    </div>
                    <div className="grid flex items-center justify-center mt-3">
                      <h3 className="font-semibold text-gray-900 text-md">{userName}</h3>
                      <p className="text-sm text-gray-600">
                        {getRoleDisplay()}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft size={25} />
                </button>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight size={25} />
                </button>
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {/* Show admin links for both CENTER_ADMIN and SUPER_ADMIN */}
            {(userData?.role === ROLES.CENTER_ADMIN || userData?.role === ROLES.SUPER_ADMIN) &&
              adminLinks.map(link => (
                <NavItem key={link.to} link={link} section="admin" />
              ))}
            
            {userData?.role === ROLES.INSTRUCTOR &&
              instructorLinks.map(link => (
                <NavItem key={link.to} link={link} section="instructor" />
              ))}
            
            {userData?.role === ROLES.USER &&
              userLinks.map(link => (
                <NavItem key={link.to} link={link} section="user" />
              ))}
          </div>

          {/* FOOTER */}
          <div className="border-t border-gray-300 p-4">
            {!sidebarCollapsed &&
              quickLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  {link.icon}
                  <span className="ml-3">{link.label}</span>
                </NavLink>
              ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white"
            >
              <LogOut size={16} />
              {!sidebarCollapsed && <span className="ml-2">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function MobileSidebar() {
    return (
      <>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        >
          <Menu size={24} />
        </button>

        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div
          className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="h-16 border-b flex items-center justify-between px-4">
            <Award size={20} />
            <button onClick={() => setMobileMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-1">
            {/* Show admin links for both CENTER_ADMIN and SUPER_ADMIN */}
            {(userData?.role === ROLES.CENTER_ADMIN || userData?.role === ROLES.SUPER_ADMIN) &&
              adminLinks.map(link => (
                <NavItem key={link.to} link={link} section="admin" />
              ))}
            
            {userData?.role === ROLES.INSTRUCTOR &&
              instructorLinks.map(link => (
                <NavItem key={link.to} link={link} section="instructor" />
              ))}
            
            {userData?.role === ROLES.USER &&
              userLinks.map(link => (
                <NavItem key={link.to} link={link} section="user" />
              ))}
          </div>
        </div>
      </>
    );
  }
};

export default DashboardSidebar;