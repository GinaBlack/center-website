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

  // Smooth page navigation
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
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        {/* NAV BAR */}
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => navigateTo("/")}
            className="flex items-center  hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <span className="tracking-tight">{t("navigation.logo")}</span>
          </button>

          <div className="flex items-center">
            {/* DESKTOP NAVIGATION */}
            <div className="hidden lg:flex items-center gap-4 ">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  disabled={isAnimating}
                  className={`
                    relative px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-300 transform
                    ${isActive(item.path)
                      ? "bg-black text-white shadow-lg scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                    hover:scale-105 active:scale-95
                  `}
                >
                  {item.label}
                  {/* Active indicator dot */}
                  {isActive(item.path) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </button>
              ))}

              <UserMenu />

            {/* THEME TOGGLE & USER MENU */}
            <div className="flex items-center  ml-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="theme-icon sun" />
                <Moon className="theme-icon moon" />
              </Button>
            </div>
            </div>


            {/* MOBILE BURGER MENU */}
            <button
              className="lg:hidden p-2 ml-2 rounded-lg hover:bg-muted transition-colors"
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
                  className={`
                    p-4 rounded-lg text-left font-medium
                    transition-all duration-300
                    flex items-center justify-between
                    ${isActive(item.path)
                      ? "bg-black text-white shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <span>{item.label}</span>
                  {isActive(item.path) && (
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </button>
              ))}

              {isAuthenticated && (
                <button
                  onClick={() => navigateTo("/dashboard")}
                  className={`
                    p-4 rounded-lg text-left font-medium
                    transition-all duration-300
                    flex items-center justify-between
                    ${isActive("/dashboard")
                      ? "bg-green-900 text-white shadow-lg"
                      : "text-green-600 hover:text-green-800 hover:bg-green-50"
                    }
                  `}
                >
                  <span>Dashboard</span>
                  {isActive("/dashboard") && (
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                </button>
              )}

              {hasRole(ROLES.ADMIN) && (
                <button
                  onClick={() => navigateTo("/admin/users")}
                  className={`
                    p-4 rounded-lg text-left font-medium
                    transition-all duration-300
                    flex items-center justify-between
                    ${isActive("/admin")
                      ? "bg-red-900 text-white shadow-lg"
                      : "text-red-600 hover:text-red-800 hover:bg-red-50"
                    }
                  `}
                >
                  <span>Admin</span>
                  {isActive("/admin") && (
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  )}
                </button>
              )}

              {isAuthenticated ? (
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="mt-4 p-4 w-full rounded-lg font-medium"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button
                  onClick={() => navigateTo("/auth/login")}
                  className={`
                    mt-4 p-4 w-full rounded-lg font-medium
                    ${isActive("/auth/login") ? "bg-black text-white" : ""}
                  `}
                >
                  Login
                </Button>
              )}

              {/* Mobile theme toggle */}
              <div className="mt-4 p-4 border-t  pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-lg"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="w-4 h-4 mr-2" />
                        Light
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 mr-2" />
                        Dark
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;