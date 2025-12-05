import { Menu, X, User, LogOut, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTranslation } from '../hooks/useTranslation';
import logo from "../assets/images/logo.png";


interface NavigationProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

export function Navigation({ isLoggedIn, setIsLoggedIn }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [isAnimating, setIsAnimating] = useState(false);
  const [language, setLanguage] = useState("en");

  // Update current page when hash changes
  useEffect(() => {
    const updateCurrentPage = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentPage(hash || 'home');
    };

    // Initial update
    updateCurrentPage();

    // Listen for hash changes
    window.addEventListener('hashchange', updateCurrentPage);

    return () => {
      window.removeEventListener('hashchange', updateCurrentPage);
    };
  }, []);

  const navigateTo = async (page: string) => {
    if (isAnimating || currentPage === page) return;

    setIsAnimating(true);

    // Add slide-out animation to current content
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-300');
    }

    // Wait for slide-out animation
    await new Promise(resolve => setTimeout(resolve, 200));

    // Change page
    window.location.hash = page;
    setCurrentPage(page);
    setIsMenuOpen(false);

    // Wait for next frame then slide in
    await new Promise(resolve => setTimeout(resolve, 50));

    if (mainContent) {
      mainContent.classList.remove('opacity-0', 'translate-y-4');
      mainContent.classList.add('opacity-100', 'translate-y-0');
    }

    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false);
      if (mainContent) {
        mainContent.classList.remove('transition-all', 'duration-300', 'opacity-100', 'translate-y-0');
      }
    }, 300);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigateTo("home");
  };

  // helps with translation
  const { t } = useTranslation();

  const navItems = [
    { label: t("navigation.home"), page: "home" },
    { label: t("navigation.services"), page: "services" },
    { label: t("navigation.gallery"), page: "gallery" },
    { label: t("navigation.submitProject"), page: "submit-project" },
    { label: t("navigation.learning"), page: "learning" },
    { label: t("navigation.workshops"), page: "workshops" },
    { label: t("navigation.about"), page: "about" },
    { label: t("navigation.contact"), page: "contact" },
  ];

  // Helper function to check if item is active
  const isActive = (page: string) => currentPage === page;



  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => navigateTo("home")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain " />
            <span className="tracking-tight">{t("navigation.logo")}</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => navigateTo(item.page)}
                disabled={isAnimating}
                className={`text-sm transition-all duration-300 relative ${isActive(item.page)
                  ? "text-foreground font-medium scale-105"
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
                  } ${isAnimating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {item.label}
                {isActive(item.page) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-100 transition-transform duration-300" />
                )}
                {!isActive(item.page) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                )}
              </button>
            ))}

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isAnimating}>
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => navigateTo("dashboard")}
                    className={`transition-colors duration-200 ${isActive("dashboard") ? "bg-accent scale-105" : "hover:scale-105"
                      }`}
                    disabled={isAnimating}
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigateTo("submit-project")}
                    className={`transition-colors duration-200 ${isActive("submit-project") ? "bg-accent scale-105" : "hover:scale-105"
                      }`}
                    disabled={isAnimating}
                  >
                    Submit Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isAnimating}
                    className="transition-colors duration-200 hover:scale-105"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="lg"
                onClick={() => navigateTo("login")}
                variant={isActive("login") ? "default" : "black"}
                disabled={isAnimating}
                className="transition-all duration-300 hover:scale-105 "
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}

          <button
            className="lg:hidden p-2 transition-transform duration-300 hover:scale-110"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            disabled={isAnimating}
          >
            {isMenuOpen ? <X className={isAnimating ? "opacity-50" : ""} /> : <Menu className={isAnimating ? "opacity-50" : ""} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigateTo(item.page)}
                  disabled={isAnimating}
                  className={`text-left transition-all duration-300 p-3 rounded-lg ${isActive(item.page)
                    ? "text-foreground font-medium bg-accent scale-105 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-105"
                    } ${isAnimating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {item.label}
                </button>
              ))}
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => navigateTo("dashboard")}
                    disabled={isAnimating}
                    className={`text-left transition-all duration-300 p-3 rounded-lg ${isActive("dashboard")
                      ? "text-foreground font-medium bg-accent scale-105 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-105"
                      } ${isAnimating ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Dashboard
                  </button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full transition-all duration-300 hover:scale-105 mt-2"
                    disabled={isAnimating}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigateTo("login")}
                  className="w-full transition-all duration-300 hover:scale-105"
                  variant={isActive("login") ? "default" : "black"}
                  disabled={isAnimating}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        )}

      </div>
    </nav >
  );
}