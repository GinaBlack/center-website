// src/components/Navigation/DashboardSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardSidebar = () => {
    const { hasRole } = useAuth();

    const userLinks = [
        { to: '/dashboard', label: 'Overview', icon: '📊' },
        { to: '/dashboard/projects', label: 'My Projects', icon: '🛠️' },
        { to: '/dashboard/courses', label: 'My Courses', icon: '🎓' },
        { to: '/dashboard/book-hall', label: 'Book Hall', icon: '🏢' },
        { to: '/dashboard/my-bookings', label: 'My Bookings', icon: '📅' },
    ];

    const instructorLinks = [
        { to: '/instructor/courses', label: 'My Courses', icon: '📚' },
        { to: '/instructor/courses/create', label: 'Create Course', icon: '➕' },
    ];

    const adminLinks = [
        { to: '/admin/users', label: 'User Management', icon: '👥' },
        { to: '/admin/projects', label: 'Content Moderation', icon: '🛡️' },
    ];

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-4">Dashboard</h3>

            <nav className="space-y-1">
                {/* Common User Links */}
                {userLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`
                        }
                    >
                        <span className="mr-2">{link.icon}</span>
                        {link.label}
                    </NavLink>
                ))}

                {/* Instructor Links */}
                {hasRole('instructor') && (
                    <>
                        <div className="pt-4 mt-4 border-t">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Instructor
                            </h4>
                            {instructorLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive
                                            ? 'bg-purple-50 text-purple-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`
                                    }
                                >
                                    <span className="mr-2">{link.icon}</span>
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    </>
                )}

                {/* Admin Links */}
                {hasRole('admin') && (
                    <>
                        <div className="pt-4 mt-4 border-t">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Administration
                            </h4>
                            {adminLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive
                                            ? 'bg-red-50 text-red-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`
                                    }
                                >
                                    <span className="mr-2">{link.icon}</span>
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    </>
                )}
            </nav>
        </div>
    );
};

export default DashboardSidebar;