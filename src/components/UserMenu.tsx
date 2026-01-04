import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";

const UserMenu = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation hook instead of window.location
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navigateTo = (path: string) => {
    navigate(path); 
  };

  const isActive = (path: string) => {
    return path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate("/");
  };

  // If no user is logged in, show login/signup buttons
  if (!currentUser) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => navigateTo("/auth/login")}
          className={`
            ml-4 transition-all duration-300 hover:scale-105
            ${isActive("/auth/login") ? "" : "black"} // Fixed: removed "default" class
          `}
        >
          Login
        </Button>
      </div>
    );
  }

  // Safely get user name with fallbacks
  const firstName = userData?.first_name;
  const lastName = userData?.last_name ;
  const userName = `${firstName} ${lastName}`.trim() ;
  const email = userData?.email || "";

  // Get initials safely
  const initials = firstName
    ? firstName.charAt(0).toUpperCase()
    : userData?.email
    ? userData.email.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {initials}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-100 rounded shadow-lg border py-1 z-50">
          <div className="px-4 py-2 border-b">
            <p className="font-medium truncate">{userName}</p>
            {email && (
              <p className="text-sm text-gray-500 truncate">{email}</p>
            )}
          </div>

          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 hover:bg-gray-200"
          >
            Dashboard
          </Link>

          <Link
            to="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 hover:bg-gray-200"
          >
            Profile
          </Link>

          <div className="border-t">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;