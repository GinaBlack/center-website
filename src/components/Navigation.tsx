import { Menu, X, LogOut, Moon, Sun, Search, ChevronDown, ShoppingCart, MessageSquare, HelpCircle, FileText, Library, Printer, Scan, Users, Home } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartCount, setCartCount] = useState(3); // Example cart count, replace with actual cart state
  
  const searchRef = useRef<HTMLDivElement>(null);
  const supportDropdownRef = useRef<HTMLDivElement>(null);
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, hasRole, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Mock search suggestions - replace with actual API call
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
  ];

  const serviceItems = [
    { label: "3D Printing", icon: <Printer className="w-4 h-4" />, path: "/services/3d-printing" },
    { label: "3D Scanning", icon: <Scan className="w-4 h-4" />, path: "/scanning" },
    { label: "Trainings", icon: <Users className="w-4 h-4" />, path: "/trainings" },
    { label: "Hall Rentals", icon: <Home className="w-4 h-4" />, path: "/hall-rentals" },
  ];

  /* ---------------- BOTTOM NAV ITEMS ---------------- */
  const bottomNavItems = [
    { path: "/", label: "Home" },
    {path: "/gallery", label: "Gallery" },
    { path: "/upload", label: "Submit Project" },
    { path: "/book-hall", label: "Book Hall" },
    { path: "/scanning", label: "3D Scanning" },
    { path: "/workshops", label: "Trainings" },
    { path: "#2", label: "Community" },
  ];

  /* ---------------- HELPERS ---------------- */
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
      main?.classList.remove("transition-all", "duration-300");
    }, 300);

    setIsMenuOpen(false);
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
      // Filter suggestions based on query
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
      // Close search suggestions when clicking outside
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      
      // Close dropdowns when clicking outside
      const target = event.target as Node;
      const clickedInsideSupport = supportDropdownRef.current?.contains(target);
      const clickedInsideResources = resourcesDropdownRef.current?.contains(target);
      const clickedInsideServices = servicesDropdownRef.current?.contains(target);
      
      if (!clickedInsideSupport && !clickedInsideResources && !clickedInsideServices) {
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
    dropdownRef
  }: { 
    title: string; 
    items: Array<{ label: string; icon?: React.ReactNode; path: string }>;
    isOpen: boolean;
    onToggle: () => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
  }) => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center gap-1 px-3 py-2 text-sm hover:text-white transition-colors whitespace-nowrap"
      >
        {title}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-black border border-gray-800 rounded-lg shadow-xl z-50 min-w-max"
        >
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-gray-900 transition-colors text-left whitespace-nowrap"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  /* ---------------- RENDER ---------------- */
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* TOP BAR - 25% height */}
      <div className="bg-black text-gray-300 text-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 flex items-center justify-between">
            {/* LEFT SECTION */}
            <div className="flex items-center gap-4">
              {topNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className="hover:text-white transition-colors whitespace-nowrap"
                >
                  {item.label}
                </button>
              ))}
              
              {/* Support Dropdown */}
              <Dropdown
                title="Support"
                items={supportItems}
                isOpen={activeDropdown === 'support'}
                onToggle={() => toggleDropdown('support')}
                dropdownRef={supportDropdownRef}
              />
              
              {/* Resources Dropdown */}
              <Dropdown
                title="Resources"
                items={resourceItems}
                isOpen={activeDropdown === 'resources'}
                onToggle={() => toggleDropdown('resources')}
                dropdownRef={resourcesDropdownRef}
              />
              
              {/* Services Dropdown */}
              <Dropdown
                title="Services"
                items={serviceItems}
                isOpen={activeDropdown === 'services'}
                onToggle={() => toggleDropdown('services')}
                dropdownRef={servicesDropdownRef}
              />
            </div>

            {/* RIGHT SECTION - Search and Cart */}
            <div className="flex items-center gap-4">
              {/* Search with Auto-suggest */}
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
                      className="pl-10 pr-4 py-1 bg-gray-900 border border-gray-800 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 transition-all duration-200"
                      style={{ width: searchQuery.length > 0 ? '250px' : '200px' }}
                    />
                  </div>
                </form>
                
                {/* Auto-suggestions Dropdown */}
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
              
              {/* Cart with Order Counter */}
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
      </div>

      {/* BOTTOM NAV BAR - 75% height */}
      <nav className="bg-background/95 backdrop-blur-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* LOGO */}
            <button
              onClick={() => navigateTo("/")}
              className="flex items-center gap-2 hover:opacity-80"
            >
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
              <span className="tracking-tight font-semibold">{t("navigation.logo")}</span>
            </button>

            {/* DESKTOP BOTTOM NAV */}
            <div className="hidden lg:flex items-center gap-2">
              {bottomNavItems.map((item) => (
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
              {/* Top Bar Items in Mobile */}
              <div className="mb-6 pb-4 border-b">
                <h3 className="text-sm font-semibold mb-2">Quick Links</h3>
                <div className="space-y-1">
                  {topNavItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigateTo(item.path)}
                      className="p-3 rounded-lg text-left font-medium flex items-center gap-2 w-full hover:bg-muted"
                    >
                      {item.label}
                    </button>
                  ))}
                  
                  <div className="ml-3 space-y-1">
                    <h4 className="text-xs font-medium text-gray-500 mt-2">Support</h4>
                    {supportItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => navigateTo(item.path)}
                        className="p-2 rounded-lg text-left text-sm flex items-center gap-2 w-full hover:bg-muted"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                    
                    <h4 className="text-xs font-medium text-gray-500 mt-2">Resources</h4>
                    {resourceItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => navigateTo(item.path)}
                        className="p-2 rounded-lg text-left text-sm flex items-center gap-2 w-full hover:bg-muted"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                    
                    <h4 className="text-xs font-medium text-gray-500 mt-2">Services</h4>
                    {serviceItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => navigateTo(item.path)}
                        className="p-2 rounded-lg text-left text-sm flex items-center gap-2 w-full hover:bg-muted"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Nav Items in Mobile */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Navigation</h3>
                {bottomNavItems.map((item) => (
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
              </div>

              {/* Cart in Mobile */}
              <div className="mb-4">
                <button 
                  onClick={handleCartClick}
                  className="relative w-full p-4 rounded-lg text-left font-medium flex items-center justify-between hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              </div>

              {/* ROLE SECTIONS */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Account</h3>
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

              {/* Search in Mobile */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-muted border rounded-lg text-sm"
                  />
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-3 text-sm text-left hover:bg-muted border-b last:border-b-0"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="mb-4">
                {isAuthenticated ? (
                  <Button onClick={handleLogout} variant="destructive" className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/auth/login")} className="w-full">
                    Login
                  </Button>
                )}
              </div>

              {/* Mobile theme toggle */}
              <div className="mt-4 p-4 border-t pt-4">
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
    </div>
  );
}

export default Navigation;