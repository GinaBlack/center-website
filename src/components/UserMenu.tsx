import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";


const UserMenu = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const navigateTo = (path: string) => {
    navigate(path); 
  }
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isActive = (path) => {
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
            ${isActive("/auth/login") ? "default" : "black"}
                  `}
        >
          Login
        </Button>
      </div>
    );
  }

  const initials = userData?.displayName
    ? userData.displayName.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {initials}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48  bg-gray-100 rounded shadow-lg border py-1 z-50">
          <div className="px-4 py-2 border-b">
            <p className="font-medium">{userData?.displayName || "User"}</p>
            <p className="text-sm text-gray-500">{userData?.email || ""}</p>
          </div>

          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 hover:bg-gray-100"
          >
            Dashboard
          </Link>

          <Link
            to="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 hover:bg-gray-100"
          >
            Profile
          </Link>

          <div className="border-t">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
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
