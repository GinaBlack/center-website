// src/components/Navigation/DashboardSidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from "../constants/roles";
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
    Award
} from 'lucide-react';

const DashboardSidebar = ({ mobileOnly = false }) => {
    const { userData, logout, hasRole } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        user: true,
        instructor: true,
        admin: true
    });

    // Close mobile menu on route change
    useEffect(() => {
        if (mobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    }, [location.pathname]);

    // User data
    const userName = userData?.displayName || userData?.firstName || 'User';
    const userInitial = userName.charAt(0).toUpperCase();

    // Navigation links
    const userLinks = [
        { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
        { to: '/dashboard/projects', label: 'My Projects', icon: <FolderKanban size={20} /> },
        { to: '/dashboard/courses', label: 'My Courses', icon: <BookOpen size={20} /> },
        { to: '/dashboard/bookings', label: 'My Bookings', icon: <Calendar size={20} /> },
        { to: '/dashboard/book-hall', label: 'Book Hall', icon: <Building size={20} /> },
        { to: '/dashboard/projects/upload', label: 'Submissions', icon: <FileText size={20} /> },
        { to: '/dashboard/notifications', label: 'Notifications', icon: <Bell size={20} /> },
    ];

    const instructorLinks = [
        { to: '/instructor/courses', label: 'My Courses', icon: <BookOpen size={20} /> },
        { to: '/instructor/courses/create', label: 'Create Course', icon: <BookPlus size={20} /> },
        { to: '/instructor/students', label: 'Students', icon: <Users size={20} /> },
        { to: '/instructor/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
        { to: '/instructor/live-sessions', label: 'Live Sessions', icon: <Video size={20} /> },
        { to: '/instructor/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    ];

    const adminLinks = [
        { to: '/admin/users', label: 'User Management', icon: <Users size={20} /> },
        { to: '/admin/projects', label: 'Content Moderation', icon: <Shield size={20} /> },
        { to: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
        { to: '/admin/settings', label: 'System Settings', icon: <Settings size={20} /> },
        { to: '/admin/database', label: 'Database', icon: <Database size={20} /> },
        { to: '/admin/reports', label: 'Reports', icon: <FileText size={20} /> },
    ];

    const quickLinks = [
        { to: '/', label: 'Home', icon: <Home size={20} /> },
        { to: '/dashboard/profile', label: 'Profile', icon: <User size={20} /> },
        { to: '/dashboard/profile/settings', label: 'Settings', icon: <Settings size={20} /> },
        { to: '/dashboard/profile/help', label: 'Help', icon: <HelpCircle size={20} /> },
    ];

    // Toggle functions
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/auth/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // NavItem component
    const NavItem = ({ link, section = 'user' }) => {
        const isActive = location.pathname === link.to || 
                        location.pathname.startsWith(link.to + '/');
        
        const sectionColors = {
            user: { active: 'bg-blue-500 text-blue-700 border-l-4 border-blue-600', icon: 'text-gray-200' },
            instructor: { active: 'bg-purple-50 text-purple-700 border-l-4 border-purple-600', icon: 'text-purple-600' },
            admin: { active: 'bg-red-50 text-red-700 border-l-4 border-red-600', icon: 'text-red-600' }
        };

        return (
            <NavLink
                to={link.to}
                className={({ isActive }) => `
                    flex items-center px-3 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                        ? sectionColors[section].active
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${sidebarCollapsed ? 'justify-center px-2' : ''}
                `}
                title={sidebarCollapsed ? link.label : ''}
            >
                <div className={`${isActive ? sectionColors[section].icon : 'text-gray-400'}`}>
                    {link.icon}
                </div>
                {!sidebarCollapsed && (
                    <span className="ml-3 font-medium flex-1">{link.label}</span>
                )}
            </NavLink>
        );
    };

    // Section Header component
    const SectionHeader = ({ title, icon, isExpanded, onToggle }) => (
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full py-3 px-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
            <div className="flex items-center">
                {icon}
                {!sidebarCollapsed && <span className="ml-2">{title}</span>}
            </div>
            {!sidebarCollapsed && (
                isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
        </button>
    );

    // Desktop Sidebar
    const DesktopSidebar = () => (
        <div className="h-full  bg-border  border-r border-gray-400 flex flex-col ">
            {/* Sidebar Header */}
            <div className="h-40 py-20 pt-40  border-b border-gray-300 flex items-center justify-between px-4">
                {!sidebarCollapsed ? (
                    <>
                        {/* User Profile */}
                        {!sidebarCollapsed && (
                            <div className="p-8 mb-4  rounded-lg">
                                <div className="grid flex items-center">
                                    <div className="w-25 h-25 gradient-black-to-gray rounded-full flex items-center justify-center text-white text-lgx font-bold">
                                        {userInitial}
                                    </div>
                                    <div className=" grid flex items-center justify-center ">
                                        <h3 className="font-semibold text-gray-900 text-smx">{userName}</h3>
                                        <p className="text-sm text-gray-600">
                                            {hasRole(ROLES.ADMIN) ? 'Administrator' : 
                                             hasRole(ROLES.INSTRUCTOR) ? 'Instructor' : 'User'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setSidebarCollapsed(true)}
                            className=" hover:bg-gray-100 rounded-lg "
                            title="Collapse sidebar"
                        >
                            <ChevronLeft size={25} />
                        </button>
                    </>
                ) : (
                    <div className="w-full flex justify-center">
                        <button
                            onClick={() => setSidebarCollapsed(false)}
                            className=" hover:bg-gray-100 rounded-lg"
                            title="Expand sidebar"
                        >
                            <ChevronRight size={25} />
                        </button>
                    </div>
                )}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
               

                {/* Navigation Sections */}
                <div className="space-y-4">
                    {/* User Links */}
                    <div>
                        {expandedSections.user && (
                            <div className="mt-2 space-y-1">
                                {userLinks.map(link => (
                                    <NavItem key={link.to} link={link} section="user" />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Instructor Links */}
                    {hasRole(ROLES.INSTRUCTOR) && (
                        <div>
                            <SectionHeader
                                title="Instructor"
                                icon={<BookOpen size={18} className="text-purple-500" />}
                                isExpanded={expandedSections.instructor}
                                onToggle={() => toggleSection('instructor')}
                            />
                            {expandedSections.instructor && (
                                <div className="mt-2 space-y-1">
                                    {instructorLinks.map(link => (
                                        <NavItem key={link.to} link={link} section="instructor" />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Admin Links */}
                    {hasRole(ROLES.ADMIN) && (
                        <div>
                            <SectionHeader
                                title="Administration"
                                icon={<Shield size={18} className="text-red-500" />}
                                isExpanded={expandedSections.admin}
                                onToggle={() => toggleSection('admin')}
                            />
                            {expandedSections.admin && (
                                <div className="mt-2 space-y-1">
                                    {adminLinks.map(link => (
                                        <NavItem key={link.to} link={link} section="admin" />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Footer */}
            <div className="border-t border-gray-300 p-4">
                {!sidebarCollapsed ? (
                    <>
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
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-3 py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white "
                        >
                            <LogOut size={16} />
                            <span className="ml-2">Logout</span>
                        </button>
                    </>
                ) : (
                    <div className="flex justify-center">
                        <button
                            onClick={handleLogout}
                            className="p-2 text-red-500 hover:bg-gray-50 rounded-lg"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    // Mobile Sidebar
    const MobileSidebar = () => (
        <>
            {/* Mobile Menu Button (Always visible on mobile) */}
            <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
                title='mobileMenuOpen'
            >
                <Menu size={24} />
            </button>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Panel */}
            <div className={`
                lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 
                transform transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Mobile Header */}
                    <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                <Award size={20} className="text-white" />
                            </div>
                            <span className="text-smfont-bold text-gray-900">Menu</span>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="SetMobileMenu"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Mobile Content (same as desktop but full width) */}
                    <div className="flex-1 overflow-y-auto py-4 px-3">
                        <div className="p-4 mb-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                                    {userInitial}
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-semibold text-gray-900 text-sm">{userName}</h3>
                                    <p className="text-xs text-gray-600">
                                        {hasRole(ROLES.ADMIN) ? 'Administrator' : 
                                         hasRole(ROLES.INSTRUCTOR) ? 'Instructor' : 'User'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* User Links */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Dashboard</h4>
                                <div className="space-y-1">
                                    {userLinks.map(link => (
                                        <NavItem key={link.to} link={link} section="user" />
                                    ))}
                                </div>
                            </div>

                            {/* Instructor Links */}
                            {hasRole(ROLES.INSTRUCTOR) && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Instructor</h4>
                                    <div className="space-y-1">
                                        {instructorLinks.map(link => (
                                            <NavItem key={link.to} link={link} section="instructor" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin Links */}
                            {hasRole(ROLES.ADMIN) && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Administration</h4>
                                    <div className="space-y-1">
                                        {adminLinks.map(link => (
                                            <NavItem key={link.to} link={link} section="admin" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Footer */}
                    <div className="border-t border-gray-300 p-4">
                        <div className="space-y-1 mb-4">
                            {quickLinks.map(link => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.icon}
                                    <span className="ml-3">{link.label}</span>
                                </NavLink>
                            ))}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                            <LogOut size={16} />
                            <span className="ml-2">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    // Add missing Chevron icons
    const ChevronDown = (props) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );

    const ChevronRight = (props) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );

    // Render based on props
    if (mobileOnly) {
        return <MobileSidebar />;
    }

    return <DesktopSidebar />;
};

export default DashboardSidebar;