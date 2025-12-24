import { Menu, X, LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

  const { isAuthenticated, hasRole, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();


  /* ---------------- NAV ITEMS ---------------- */

  const publicNavItems = [
    { path: "/", label: t("navigation.home") },
    { path: "/services", label: t("navigation.services") },
    { path: "/gallery", label: t("navigation.gallery") },
    { path: "/dashboard/projects/upload", label: "Submit Project" },
    { path: "/dashboard/book-hall", label: "Book Hall" },
    { path: "/dashboard/scanning", label: "3D Scanning" },
    { path: "/workshops", label: t("navigation.workshops") },
    { path: "/about", label: t("navigation.about") },
    { path: "/contact", label: t("navigation.contact") },

  ];

  /* ---------------- HELPERS ---------------- */

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const navigateTo = async (path: string) => {
    if (isAnimating || location.pathname === path) return;

    setIsAnimating(true);

    const main = document.querySelector("main");
    main?.classList.add("opacity-0", "translate-y-4", "transition-all", "duration-300");

    await new Promise((r) => setTimeout(r, 200));
    navigate(path);
    await new Promise((r) => setTimeout(r, 50));

    main?.classList.remove("opacity-0", "translate-y-4");
    main?.classList.add("opacity-100", "translate-y-0");

    setTimeout(() => {
      setIsAnimating(false);
      main?.classList.remove("transition-all", "duration-300");
    }, 300);

    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  /* ---------------- RENDER ---------------- */

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* TOP BAR */}
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => navigateTo("/")}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <span className="tracking-tight">{t("navigation.logo")}</span>
          </button>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-4">
            {[...publicNavItems, ].map(
              (item) => (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  disabled={isAnimating}
                  className={`
                    relative px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive(item.path)
                      ? "bg-black text-white shadow-lg scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"}
                  `}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </button>
              )
            )}

            <UserMenu />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="theme-icon sun" />
              <Moon className="theme-icon moon" />
            </Button>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
          
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            {[...publicNavItems, ].map(
              (item) => (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className={`
                    p-4 rounded-lg text-left font-medium flex justify-between
                    ${isActive(item.path)
                      ? "bg-black text-white"
                      : "text-muted-foreground hover:bg-muted"}
                  `}
                >
                  <span>{item.label}</span>
                  {isActive(item.path) && (
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </button>
              )
            )}

            {/* ROLE SECTIONS */}
            {hasRole(ROLES.USER) && (
              <button onClick={() => navigateTo("/dashboard")} className="p-4 text-blue-500">
                Dashboard
              </button>
            )}

            {hasRole(ROLES.INSTRUCTOR) && (
              <button onClick={() => navigateTo("/instructor")} className="p-4 text-red-600">
                Instructor
              </button>
            )}

            {hasRole(ROLES.CENTER_ADMIN) || hasRole(ROLES.CENTER_ADMIN) && (
              <button onClick={() => navigateTo("/admin/users")} className="p-4 text-purple-600">
                Admin
              </button>
            )}

            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="destructive" className="mt-4 w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth/login")} className="mt-4 w-full">
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
          
        )}
        
      </div>
    </nav>
  );
}

export default Navigation;
