// src/components/Layout/AnimatedPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const AnimatedPage = ({ children }) => {
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== currentPath) {
      setIsAnimating(true);
      
      // Small delay to ensure the animation starts
      const timer = setTimeout(() => {
        setCurrentPath(location.pathname);
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, currentPath]);

  return (
    <main 
      className={`
        min-h-screen
        transition-all duration-300 ease-in-out
        ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        relative
      `}
    >
      {/* Page highlight indicator */}
      <div 
        className={`
          fixed top-4 right-4 z-50
          px-3 py-2 rounded-lg
          bg-black text-white
          font-medium text-sm
          transition-all duration-300 ease-in-out
          shadow-lg
          ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
        `}
      >
        {getPageName(location.pathname)}
      </div>

      {/* Active page border highlight */}
      <div 
        className={`
          fixed inset-0 pointer-events-none z-40
          border-4 border-black/10
          transition-all duration-500 ease-in-out
          ${isAnimating ? 'scale-105 opacity-0' : 'scale-100 opacity-100'}
        `}
      />

      {/* Content */}
      <div className={isAnimating ? 'blur-sm' : 'blur-0'}>
        {children}
      </div>
    </main>
  );
};

// Helper function to get page name from path
const getPageName = (path) => {
  const pathMap = {
    '/': 'Home',
    '/gallery': 'Gallery',
    '/workshops': 'Workshops',
    '/services': 'Services',
    '/materials': 'Material Library',
    '/pricing': 'Pricing',
    '/about': 'About Us',
    '/contact': 'Contact',
    '/auth/login': 'Login',
    '/auth/register': 'Register',
    '/dashboard': 'Dashboard',
    '/admin': 'Admin Panel',
  };

  // Find exact match first
  if (pathMap[path]) {
    return pathMap[path];
  }

  // Check for partial matches (e.g., /admin/users -> Admin Panel)
  for (const [key, value] of Object.entries(pathMap)) {
    if (path.startsWith(key) && key !== '/') {
      return value;
    }
  }

  // Default: format the path
  const formatted = path.replace('/', '').replace(/-/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1) || 'Page';
};

export default AnimatedPage;