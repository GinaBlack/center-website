import { Menu, X, User, LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useTranslation } from "../hooks/useTranslation";
import UserMenu from "./UserMenu";
import logo from "../assets/images/logo.png";
import { ROLES } from "../constants/roles";


export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, hasRole, logout } = useAuth();

  const navItems = [
    { path: "/", label: t("navigation.home") },
    { path: "/services", label: t("navigation.services") },
    { path: "/gallery", label: t("navigation.gallery") },
    { path: "/submit-project", label: t("navigation.submitProject") },
    { path: "/learning", label: t("navigation.learning") },
    { path: "/workshops", label: t("navigation.workshops") },
    { path: "/about", label: t("navigation.about") },
    { path: "/contact", label: t("navigation.contact") }
  ];

  // Smooth page navigation using React Router instead of window.history
  const navigateTo = async (path) => {
    if (isAnimating || location.pathname === path) return;

    setIsAnimating(true);

    const mainContent = document.querySelector("main");
    if (mainContent) {
      mainContent.classList.add(
        "opacity-0",
        "translate-y-4",
        "transition-all",
        "duration-300"
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    navigate(path);

    await new Promise((resolve) => setTimeout(resolve, 50));

    if (mainContent) {
      mainContent.classList.remove("opacity-0", "translate-y-4");
      mainContent.classList.add("opacity-100", "translate-y-0");
    }

    setTimeout(() => {
      setIsAnimating(false);
      if (mainContent) {
        mainContent.classList.remove(
          "transition-all",
          "duration-300",
          "opacity-100",
          "translate-y-0"
        );
      }
    }, 300);

    // Close mobile menu on navigation
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* NAV BAR */}
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => navigateTo("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <span className="tracking-tight">{t("navigation.logo")}</span>
          </button>

          <div className="flex items-center">
            {/* DESKTOP NAVIGATION */}
            <div className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  disabled={isAnimating}
                  className={`relative group text-sm transition-all duration-300 ${
                    isActive(item.path)
                      ? "text-foreground font-medium scale-105"
                      : "text-muted-foreground hover:text-foreground hover:scale-105"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform duration-300 ${
                      isActive(item.path)
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </button>
              ))}

              {/* Dashboard */}
              {isAuthenticated && (
                <button
                  onClick={() => navigateTo("/dashboard")}
                  className={`relative group text-sm transition-all duration-300 ${
                    isActive("/dashboard")
                      ? "text-foreground font-medium scale-105"
                      : "text-muted-foreground hover:text-foreground hover:scale-105"
                  }`}
                >
                  Dashboard
                </button>
              )}

              {/* Admin */}
              {hasRole(ROLES.ADMIN) && (
                <button
                  onClick={() => navigateTo("/admin/users")}
                  className={`relative group text-sm transition-all duration-300 ${
                    isActive("/admin")
                      ? "text-red-600 font-medium scale-105"
                      : "text-red-500 hover:text-red-800 hover:scale-105"
                  }`}
                >
                  Admin
                </button>
              )}

              {/* User / Login */}
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    onClick={() => navigateTo("/dashboard")}
                    disabled={isAnimating}
                  >
                    <User className="w-4 h-4" />
                    Account
                  </Button>

                  <button
                    onClick={handleLogout}
                    className="logout-icon-btn"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={() => navigateTo("/auth/login")}
                  className="transition-all duration-300 hover:scale-105"
                >
                  Login
                </Button>
              )}
            </div>

            {/* THEME TOGGLE */}
            <div className="ml-7 mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setTheme(theme === "dark" ? "light" : "dark")
                }
              >
                <Sun className="theme-icon sun" />
                <Moon className="theme-icon moon" />
              </Button>
                              <UserMenu />
            </div>

            {/* MOBILE BURGER MENU */}
            <button
              className="lg:hidden p-2 transition-transform duration-300 hover:scale-110"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className={`p-3 rounded-lg text-left transition-all duration-300 ${
                    isActive(item.path)
                      ? "text-foreground font-medium bg-accent scale-105 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-105"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {isAuthenticated && (
                <button
                  onClick={() => navigateTo("/dashboard")}
                  className={`p-3 rounded-lg text-left transition-all duration-300 ${
                    isActive("/dashboard")
                      ? "bg-green-100 font-medium scale-105 shadow-sm"
                      : "hover:bg-accent/50 hover:scale-105"
                  }`}
                >
                  Dashboard
                </button>
              )}

              {hasRole(ROLES.ADMIN) && (
                <button
                  onClick={() => navigateTo("/admin/users")}
                  className={`p-3 rounded-lg text-left transition-all duration-300 ${
                    isActive("/admin")
                      ? "bg-red-50 text-red-600 scale-105 shadow-sm"
                      : "text-red-500 hover:bg-red-50/50 hover:scale-105"
                  }`}
                >
                  Admin
                </button>
              )}

              {isAuthenticated ? (
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="mt-2 w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button
                  onClick={() => navigateTo("/auth/login")}
                  className="w-full"
                >
                  Login
                </Button>
              )}

              <div className="mt-3">
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
