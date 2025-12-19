import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../constants/roles';
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  Building,
  Calendar,
  Users,
  Shield,
  BookPlus,
  FileText,
  Bell,
  BarChart3,
  Video,
  MessageSquare,
  Settings,
  HelpCircle,
  Home,
  User,
  Database,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
  Plus,
  Book,
  Image,
  ChartBarIcon,
  RockingChairIcon,
  PaperclipIcon
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebase_config";

const DashboardSidebar = ({ mobileOnly = false }) => {
  const { userData, logout, hasRole } = useAuth();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState(userData?.photoUrl || null);

  useEffect(() => {
    setAvatar(userData?.photoUrl || null);
  }, [userData]);

  useEffect(() => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
  }, [location.pathname]);

  const userName =
    userData?.displayName ||
    userData?.firstName ||
    'User';

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
  //  { to: '/instructor/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { to: '/instructor/my-materials', label: 'Course Materials', icon: <PaperclipIcon size={20} /> },
  //  { to: '/instructor/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { to: '/admin/users', label: 'User Management', icon: <Users size={20} /> },
    { to: '/admin/projects', label: 'Projects Management', icon: <FolderKanban size={20} /> },
    { to: '/admin/gallery', label: 'Gallery Management', icon: <Image size={20} /> },
    { to: '/admin/messages', label: 'Messages Management', icon: <MessageSquare size={20} /> },
    { to: '/dashboard/book-hall', label: 'Book Hall', icon: <Building size={20} /> },
    { to: '/admin/bookings', label: 'Booking Management', icon: <Calendar size={20} /> },
    { to: '/admin/courses', label: 'Course Management', icon: <Book size={20} /> },
    { to: '/admin/hallmanagement', label: 'Hall Management', icon: <RockingChairIcon size={20} /> },
   // { to: '/admin/materials', label: 'Material Mangement', icon: <Users size={20} /> },
    //{ to: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { to: '/admin/systemsettings', label: 'System Settings', icon: <Settings size={20} /> },
   // { to: '/admin/database', label: 'Database', icon: <Database size={20} /> },
   // { to: '/admin/reports', label: 'Reports', icon: <FileText size={20} /> },
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

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setAvatar(preview);
  };

  /* ================= NAV ITEM ================= */

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

  /* ================= DESKTOP SIDEBAR ================= */

  const DesktopSidebar = () => (
    <div className="pt-12">
      <div className="min-h-screen bg-muted/30 border-2 border-gray-200 flex flex-col">

        {/* HEADER */}
        <div className="h-40 py-20 pt-32 border-b border-gray-200 flex items-center justify-between px-4">
          {!sidebarCollapsed ? (
            <>
              <div className="p-8 mb-4 rounded-lg">
                <div className="grid flex items-center">
                  <div className="relative w-25 h-25 mx-auto">
                    <img
                      src={avatar || '/default-avatar.png'}
                      alt="User avatar"
                      className="w-25 h-25 rounded-full object-cover border"
                    />

                    {/* PLUS BUTTON */}
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
                    <h3 className="font-semibold text-gray-900 text-smx">
                      {userName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {hasRole(ROLES.ADMIN)
                        ? 'Administrator'
                        : hasRole(ROLES.INSTRUCTOR)
                        ? 'Instructor'
                        : 'User'}
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
          {hasRole(ROLES.ADMIN) &&
            adminLinks.map(link => (
              <NavItem key={link.to} link={link} section="admin" />
            ))}

          {hasRole(ROLES.INSTRUCTOR) &&
            instructorLinks.map(link => (
              <NavItem key={link.to} link={link} section="instructor" />
            ))}

          {hasRole(ROLES.USER) &&
            userLinks.map(link => (
              <NavItem key={link.to} link={link} section="user" />
            ))}
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-300 p-4">
          {!sidebarCollapsed && (
            <div className="space-y-1 mb-4">
              {quickLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  {link.icon}
                  <span className="ml-3">{link.label}</span>
                </NavLink>
              ))}
            </div>
          )}

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

  /* ================= MOBILE SIDEBAR ================= */

  const MobileSidebar = () => (
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
          {hasRole(ROLES.ADMIN) &&
            adminLinks.map(link => (
              <NavItem key={link.to} link={link} section="admin" />
            ))}

          {hasRole(ROLES.INSTRUCTOR) &&
            instructorLinks.map(link => (
              <NavItem key={link.to} link={link} section="instructor" />
            ))}

          {hasRole(ROLES.USER) &&
            userLinks.map(link => (
              <NavItem key={link.to} link={link} section="user" />
            ))}
        </div>
      </div>
    </>
  );

  if (mobileOnly) return <MobileSidebar />;
  return <DesktopSidebar />;
};

export default DashboardSidebar;
