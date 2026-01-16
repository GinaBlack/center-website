import {
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Search,
  ChevronDown,
  ShoppingCart,
  MessageSquare,
  HelpCircle,
  FileText,
  Library,
  Printer,
  Scan,
  Users,
  Home,
  NotebookIcon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useTranslation } from "../hooks/useTranslation";
import UserMenu from "./UserMenu";
import logo from "../assets/images/logo.png";
import { ROLES } from "../constants/roles";

/* ================= MOBILE CHECK ================= */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return isMobile;
};

export function Navigation() {
  const isMobile = useIsMobile();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartCount] = useState(3);

  const searchRef = useRef<HTMLDivElement>(null);
  const supportDropdownRef = useRef<HTMLDivElement>(null);
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const mainServicesDropdownRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, hasRole, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const mockSuggestions = [
    "3D Printing Service",
    "3D Scanning",
    "Training Programs",
    "Hall Rentals",
    "Submit Project",
    "Community Projects",
  ];

  /* ---------------- TOP BAR ITEMS ---------------- */
  const topNavItems = [
    { label: "About Us", path: "/about" },
    { label: "Blog", path: "/blog" },
  ];

  const supportItems = [
    { label: "FAQ", icon: <HelpCircle className="w-4 h-4" />, path: "/faq" },
    { label: "Contact", icon: <MessageSquare className="w-4 h-4" />, path: "/contact" },
  ];

  const resourceItems = [
    { label: "Blog", icon: <MessageSquare className="w-4 h-4" />, path: "/blog" },
    { label: "File Guidelines", icon: <FileText className="w-4 h-4" />, path: "/guidelines" },
    { label: "Material Library", icon: <Library className="w-4 h-4" />, path: "/materials" },
    { label: "Our Services", icon: <NotebookIcon className="w-4 h-4" />, path: "/services" },
  ];

  const mainServiceItems = [
    { label: "Submit Project", icon: <Printer className="w-4 h-4" />, path: "/upload" },
    { label: "Book Hall", icon: <Home className="w-4 h-4" />, path: "/book-hall" },
    { label: "3D Scanning", icon: <Scan className="w-4 h-4" />, path: "/scanning" },
    { label: "Trainings", icon: <Users className="w-4 h-4" />, path: "/workshops" },
  ];

  const mainNavItems = [
    { path: "/", label: "Home" },
    { path: "/gallery", label: "Gallery" },
    { path: "#2", label: "Community" },
  ];

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const navigateTo = async (path: string) => {
    if (isAnimating || location.pathname === path) return;

    setIsAnimating(true);
    setActiveDropdown(null);
    setShowSuggestions(false);

    const main = document.querySelector("main");
    main?.classList.add("opacity-0", "translate-y-4", "transition-all", "duration-300");

    await new Promise((r) => setTimeout(r, 200));
    navigate(path);
    await new Promise((r) => setTimeout(r, 50));

    main?.classList.remove("opacity-0", "translate-y-4");
    main?.classList.add("opacity-100", "translate-y-0");

    setTimeout(() => {
      setIsAnimating(false);
      setIsMenuOpen(false);
    }, 300);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  /* ---------------- SEARCH FUNCTIONALITY ---------------- */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 1) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  /* ---------------- CART FUNCTIONALITY ---------------- */
  const handleCartClick = () => {
    navigate("/cart");
  };

  /* ---------------- CLICK OUTSIDE HANDLERS ---------------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      
      const target = event.target as Node;
      const clickedInsideSupport = supportDropdownRef.current?.contains(target);
      const clickedInsideResources = resourcesDropdownRef.current?.contains(target);
      const clickedInsideServices = servicesDropdownRef.current?.contains(target);
      const clickedInsideMainServices = mainServicesDropdownRef.current?.contains(target);
      
      if (!clickedInsideSupport && !clickedInsideResources && !clickedInsideServices && !clickedInsideMainServices) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  /* ---------------- DROPDOWN COMPONENTS ---------------- */
  const Dropdown = ({
    title,
    items,
    isOpen,
    onToggle,
    dropdownRef,
     }: any) => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium
          ${isOpen ? "bg-black text-white" : "text-muted hover:bg-muted"}`}
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-background  border rounded-lg shadow-xl z-50">
          {items.map((item: any) => (
            <button
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className="flex gap-2  px-4 py-3 w-65 text-black text-sm hover:bg-muted "
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  /* ================= MOBILE ACCORDION (FIXED NAVIGATION) ================= */
  const MobileAccordion = ({
    title,
    items,
    name,
  }: {
    title: string;
    items: { label: string; path: string; icon?: React.ReactNode }[];
    name: string;
  }) => (
    <div>
      <button
        onClick={() => setActiveDropdown(activeDropdown === name ? null : name)}
        className="w-full p-4 flex justify-between items-center rounded-lg hover:bg-muted text-muted-foreground"
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === name ? "rotate-180" : ""}`} />
      </button>

      {activeDropdown === name && (
        <div className="ml-4 space-y-1">
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                setActiveDropdown(null);
                setIsMenuOpen(false);
                navigateTo(item.path);
              }}
              className="w-full px-4 py-3 text-sm flex items-center gap-2 rounded-lg hover:bg-muted text-left"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {!isMobile && (
        <div className="bg-black text-gray-300 text-sm">
          <div className="h-10 flex items-center justify-between px-6">
            <div className="flex gap-4">
              {topNavItems.map((i) => (
                <button key={i.path} onClick={() => navigateTo(i.path)}>
                  {i.label}
                </button>
              ))}
              
              <Dropdown
                title="Support"
                items={supportItems}
                isOpen={activeDropdown === 'support'}
                onToggle={() => toggleDropdown('support')}
                dropdownRef={supportDropdownRef}
              />
              
              <Dropdown
                title="Resources"
                items={resourceItems}
                isOpen={activeDropdown === 'resources'}
                onToggle={() => toggleDropdown('resources')}
                dropdownRef={resourcesDropdownRef}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="relative" ref={searchRef}>
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                      placeholder="Search..."
                      className="pl-10 pr-4 py-1 bg-gray-900 border border-gray-500 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 transition-all duration-200"
                      style={{ width: searchQuery.length > 0 ? '300px' : '240px' }}
                    />
                  </div>
                </form>
                
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-black border border-gray-800 rounded-lg shadow-xl z-50">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-sm text-left hover:bg-gray-900 transition-colors border-b border-gray-800 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <Search className="w-3 h-3 text-gray-400" />
                          <span>{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleCartClick}
                className="relative flex items-center hover:text-white transition-colors whitespace-nowrap p-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
                <span className="hidden sm:inline ml-1">Cart</span>
              </button>
            </div>
          </div>
          </div>
      )}

      <nav className="bg-background border-b">
        <div className="h-16 flex justify-between items-center px-4">
          <button onClick={() => navigateTo("/")} className="flex gap-2">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <span className="tracking-tight font-semibold">{t("navigation.logo")}</span>
          </button>

          <div className="hidden lg:flex gap-2">


          {mainNavItems.map((item) => (
            <button 
              key={item.path} 
              onClick={() => navigateTo(item.path)} 
              disabled={isAnimating}
              className={`
                relative px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
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
          ))}

          {/* Services Dropdown in Main Nav */}
          <div className="relative" ref={mainServicesDropdownRef}>
            <button
              onClick={() => toggleDropdown('main-services')}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeDropdown === 'main-services' || mainServiceItems.some(item => isActive(item.path))
                  ? "bg-black text-white shadow-lg scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              Services
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'main-services' ? "rotate-180" : ""}`} />
            </button>

            {activeDropdown === 'main-services' && (
              <div className="absolute top-full left-0 mt-1 bg-background border rounded-lg shadow-xl z-50">
                {mainServiceItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigateTo(item.path)}
                    className="flex gap-2  px-4 py-3 w-50 text-black text-sm hover:bg-muted"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>           
            <UserMenu />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="ml-2"
              >
                <Sun className="theme-icon sun" />
                <Moon className="theme-icon moon" />
              </Button>
          </div>

            {/* MOBILE: Cart and Menu Toggle */}
            <div className="flex lg:hidden items-center gap-4">
              <button 
                onClick={handleCartClick}
                className="relative p-2"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-600  border text-black text-xs font-bold rounded-full">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              <button
                className="p-2 rounded-lg hover:bg-muted"
                onClick={() => setIsMenuOpen((v) => !v)}
              >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

          {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="lg:hidden p-4 space-y-2">
            {mainNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className={`
                    p-4 rounded-lg text-left font-medium flex justify-between w-full
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
            ))}

            <MobileAccordion title="Services" items={mainServiceItems} name="m-services" />
            <MobileAccordion title="Resources" items={resourceItems} name="m-resources" />
            <MobileAccordion title="Support" items={supportItems} name="m-support" />
             {/* ROLE SECTIONS */}
              <div className=" ">
                {hasRole(ROLES.USER) && (
                  <button onClick={() => navigateTo("/dashboard")} className="p-3 text-blue-500 hover:bg-blue-50 w-full text-left rounded-lg">
                    Dashboard
                  </button>
                )}

                {hasRole(ROLES.INSTRUCTOR) && (
                  <button onClick={() => navigateTo("/instructor")} className="p-3 text-red-600 hover:bg-red-50 w-full text-left rounded-lg">
                    Instructor
                  </button>
                )}

                {hasRole(ROLES.CENTER_ADMIN) && (
                  <button onClick={() => navigateTo("/admin")} className="p-3 text-blue-600 hover:bg-blue-50 w-full text-left rounded-lg">
                    Center Admin
                  </button>
                )}
                
                {hasRole(ROLES.SUPER_ADMIN) && (
                  <button onClick={() => navigateTo("/admin")} className="p-3 text-purple-600 hover:bg-purple-50 w-full text-left rounded-lg">
                    Super Admin
                  </button>
                )}
              </div>

              {/* Auth Buttons */}
            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="destructive" className="w-full">
                <LogOut className="mr-2" /> 
                Logout
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth/login")} className="w-full">
                Login
              </Button>
                )}
          
              {/* Mobile theme toggle */}
              <div className="mt-6 pt-4 border-t">
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
      </nav>
    </div>
  );
}

export default Navigation;
