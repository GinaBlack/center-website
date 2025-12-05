import React, { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download, ShoppingCart, Calendar, Clock, Package, MapPin, Filter, Printer, Home, Phone, Car, ToyBrick, Palette, Cpu } from "lucide-react";

// Types for gallery items
interface GalleryItem {
  id: number;
  title: string;
  category: "Electronics" | "Home & Garden" | "Technology" | "Art & Design" | "Automotive" | "Toys & Games";
  type: "3D-Print" | "Space-Rental";
  description: string;
  summary: string;
  images: string[];
  details: {
    size?: string;
    material?: string;
    printTime?: string;
    capacity?: string;
    location?: string;
    price?: string;
    layerHeight?: string;
    infill?: string;
  };
}

// Category icons mapping
const categoryIcons = {
  "Electronics": Phone,
  "Home & Garden": Home,
  "Technology": Cpu,
  "Art & Design": Palette,
  "Automotive": Car,
  "Toys & Games": ToyBrick,
};

// Category gradient classes mapping for 3D prints
const categoryGradients = {
  "Electronics": "bg-gradient-category-electronics",
  "Home & Garden": "bg-gradient-category-home",
  "Technology": "bg-gradient-category-technology",
  "Art & Design": "bg-gradient-category-art",
  "Automotive": "bg-gradient-category-automotive",
  "Toys & Games": "bg-gradient-category-toys",
};

// Category text colors
const categoryTextColors = {
  "Electronics": "text-category-electronics",
  "Home & Garden": "text-category-home",
  "Technology": "text-category-technology",
  "Art & Design": "text-category-art",
  "Automotive": "text-category-automotive",
  "Toys & Games": "text-category-toys",
};

// Category descriptions
const categoryDescriptions = {
  "Electronics": "Functional electronic components and accessories",
  "Home & Garden": "Home improvement and decorative items",
  "Technology": "Tech gadgets and innovative devices",
  "Art & Design": "Creative art pieces and design elements",
  "Automotive": "Vehicle parts and automotive accessories",
  "Toys & Games": "Fun and educational toys and games",
};

// Mock data for gallery items
const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "Modular Phone Stand",
    category: "Electronics",
    type: "3D-Print",
    description: "A fully modular phone stand with adjustable angles and cable management. Designed for 3D printing with interlocking parts that require no additional hardware. Perfect for desks, nightstands, or workspaces.",
    summary: "Adjustable modular stand for smartphones and tablets",
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&auto=format&fit=crop"
    ],
    details: {
      size: "150x80x60mm",
      material: "PLA/ABS",
      printTime: "4-6 hours",
      price: "$24.99",
      layerHeight: "0.2mm",
      infill: "20%"
    }
  },
  {
    id: 2,
    title: "Co-Working Space Loft",
    category: "Art & Design",
    type: "Space-Rental",
    description: "Modern co-working space with high-speed internet, meeting rooms, and recreational areas. Perfect for startups and remote teams looking for a collaborative environment.",
    summary: "Fully equipped modern workspace for creative teams",
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop"
    ],
    details: {
      capacity: "10-15 people",
      location: "Downtown Innovation Hub",
      price: "$899/month"
    }
  },
  {
    id: 3,
    title: "Geometric Planter Set",
    category: "Home & Garden",
    type: "3D-Print",
    description: "Set of three geometric planters with self-watering system and modern design. Perfect for indoor plants and succulents. Each planter features drainage holes and removable saucers.",
    summary: "Modern geometric planters with innovative design",
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=800&auto=format&fit=crop"
    ],
    details: {
      size: "Various sizes (S/M/L)",
      material: "PETG",
      printTime: "8-12 hours",
      price: "$39.99",
      layerHeight: "0.16mm",
      infill: "15%"
    }
  },
  {
    id: 4,
    title: "Creative Studio Space",
    category: "Art & Design",
    type: "Space-Rental",
    description: "Bright studio space with natural lighting, photography equipment, and editing stations. Ideal for photographers, designers, and content creators.",
    summary: "Professional creative studio with specialized equipment",
    images: [
      "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519452639340-7f0c5d5eac3f?w=800&auto=format&fit=crop"
    ],
    details: {
      capacity: "5-8 people",
      location: "Arts District",
      price: "$1,299/month"
    }
  },
  {
    id: 5,
    title: "Custom Drone Frame",
    category: "Technology",
    type: "3D-Print",
    description: "Lightweight and durable drone frame optimized for FPV racing. Customizable design with vibration dampening features and integrated camera mount.",
    summary: "High-performance drone frame for racing enthusiasts",
    images: [
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800&auto=format&fit=crop"
    ],
    details: {
      size: "250mm diagonal",
      material: "Carbon Fiber PLA",
      printTime: "10-14 hours",
      price: "$89.99",
      layerHeight: "0.12mm",
      infill: "30%"
    }
  },
  {
    id: 6,
    title: "Maker Space Workshop",
    category: "Technology",
    type: "Space-Rental",
    description: "Fully equipped maker space with 3D printers, CNC machines, laser cutters, and traditional workshop tools. Available for hourly or monthly rental.",
    summary: "Complete fabrication workshop with industrial equipment",
    images: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop"
    ],
    details: {
      capacity: "Up to 20 people",
      location: "Industrial Innovation Park",
      price: "$75/hour or $2,499/month"
    }
  },
  {
    id: 7,
    title: "RC Car Body Kit",
    category: "Automotive",
    type: "3D-Print",
    description: "Aerodynamic body kit for 1:10 scale RC cars with detailed venting and spoiler. Easy to install with snap-fit design.",
    summary: "High-detail aerodynamic body for RC cars",
    images: [
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&auto=format&fit=crop"
    ],
    details: {
      size: "200x100x60mm",
      material: "ABS",
      printTime: "6-8 hours",
      price: "$34.99",
      layerHeight: "0.18mm",
      infill: "25%"
    }
  },
  {
    id: 8,
    title: "Chess Set - Modern Design",
    category: "Toys & Games",
    type: "3D-Print",
    description: "Modern minimalist chess set with weighted pieces and smooth finish. Each piece features unique geometric design while maintaining traditional chess proportions.",
    summary: "Modern geometric chess set with weighted pieces",
    images: [
      "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800&auto=format&fit=crop"
    ],
    details: {
      size: "Board: 300x300mm",
      material: "Wood PLA + Marble PLA",
      printTime: "15-20 hours",
      price: "$79.99",
      layerHeight: "0.15mm",
      infill: "20%"
    }
  },
  {
    id: 9,
    title: "Custom Keyboard Case",
    category: "Electronics",
    type: "3D-Print",
    description: "Custom mechanical keyboard case with integrated wrist rest and sound dampening. Compatible with 60% and 65% layouts.",
    summary: "Custom mechanical keyboard enclosure",
    images: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop"
    ],
    details: {
      size: "320x120x30mm",
      material: "ASA",
      printTime: "8-10 hours",
      price: "$49.99",
      layerHeight: "0.2mm",
      infill: "40%"
    }
  }
];

// Component for the modal overlay
interface GalleryModalProps {
  item: GalleryItem;
  onClose: () => void;
}

function GalleryModal({ item, onClose }: GalleryModalProps) {
  const navigateTo = (page: string) => {
    window.location.hash = page;
  };
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-rotate carousel
  useEffect(() => {
    startCarousel();
    return () => stopCarousel();
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const startCarousel = () => {
    stopCarousel();
    carouselIntervalRef.current = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % item.images.length);
    }, 4000);
  };

  const stopCarousel = () => {
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % item.images.length);
    startCarousel();
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + item.images.length) % item.images.length);
    startCarousel();
  };

  const handleActionClick = () => {
    if (item.type === "3D-Print") {
      navigateTo("submit-project");
    } else {
      navigateTo("contact");
    }
    onClose();
  };

  const handleDownload = () => {
    if (item.type === "3D-Print") {
      // Create a dummy file download
      const element = document.createElement("a");
      const file = new Blob([`3D Model for: ${item.title}\nCategory: ${item.category}\nMaterial: ${item.details.material}\n\nDescription: ${item.description}`], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${item.title.toLowerCase().replace(/\s+/g, '-')}-3d-model.stl`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const CategoryIcon = categoryIcons[item.category];
  const categoryTextColor = categoryTextColors[item.category];

  return (
    <>
      {/* Backdrop Blur */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10" onClick={onClose} />

      {/* Modal - Centered with 90vh max height */}
      <div className="fixed inset-0 z-15 flex items-center justify-center  p-4">
        <div
          ref={modalRef}
          className="relative  bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto flex flex-col border border-border"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-8 h-8 glass-effect rounded-full flex items-center justify-center hover:bg-background transition-all hover:scale-110"
            title="Close"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 " />
          </button>

          <div className="flex flex-col">

            <div className="relative bg-black h-[200px] w-full flex-shrink-0">
              <div className="relative h-full w-full">
                <img
                  src={item.images[currentImageIndex]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 gradient-overlay-bottom" />

                {/* Carousel Controls */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  onMouseEnter={stopCarousel}
                  onMouseLeave={startCarousel}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 glass-effect-dark rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-10"
                  title="Previous image"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  onMouseEnter={stopCarousel}
                  onMouseLeave={startCarousel}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 glass-effect-dark rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-10"
                  title="Next image"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {item.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                        startCarousel();
                      }}
                      onMouseEnter={stopCarousel}
                      onMouseLeave={startCarousel}
                      className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                        ? 'bg-white w-4'
                        : 'bg-white/50 hover:bg-white/70'
                        }`}
                      title={`Go to image ${index + 1}`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Content - Scrollable area */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Type Badge */}
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${item.type === "3D-Print"
                    ? "bg-blue-500/10 text-blue-600"
                    : "bg-green-500/10 text-green-600"
                    }`}>
                    {item.type}
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm font-medium ${categoryTextColor}`}>
                    <CategoryIcon className="w-3 h-3" />
                    <span>{item.category}</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold">{item.title}</h2>

                {/* Summary */}
                <p className="text-muted-foreground">{item.summary}</p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {item.type === "3D-Print" ? (
                    <>
                      <div className="flex items-center gap-2 print-tech-spec">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Material</p>
                          <p className="font-medium">{item.details.material}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 print-tech-spec">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Print Time</p>
                          <p className="font-medium">{item.details.printTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 print-tech-spec">
                        <Printer className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Layer Height</p>
                          <p className="font-medium">{item.details.layerHeight}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 print-tech-spec">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <span className="text-xs font-bold">%</span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Infill</p>
                          <p className="font-medium">{item.details.infill}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Capacity</p>
                          <p className="font-medium">{item.details.capacity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{item.details.location}</p>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="col-span-2">
                    <div className="price-tag flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="text-xl font-bold">{item.details.price}</span>
                    </div>
                  </div>
                </div>

                {/* Full Description */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 pb-2">
                  <button
                    onClick={handleActionClick}
                    className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:scale-105 ${item.type === "3D-Print"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                  >
                    {item.type === "3D-Print" ? (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Order Now
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        Rent Now
                      </>
                    )}
                  </button>

                  {item.type === "3D-Print" && (
                    <button
                      onClick={handleDownload}
                      className="download-button py-3 px-6 border border-input hover:bg-accent rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:scale-105"
                    >
                      <Download className="w-4 h-4" />
                      Download STL
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Main Gallery Page Component
export function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "prints" | "rentals">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filterAnimation, setFilterAnimation] = useState(false);

  // Filter items based on active tab and category
  const filteredItems = galleryItems.filter(item => {
    // First filter by tab
    if (activeTab === "prints" && item.type !== "3D-Print") return false;
    if (activeTab === "rentals" && item.type !== "Space-Rental") return false;

    // Then filter by category
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;

    return true;
  });

  // Get unique categories for filter
  const allCategories = ["all", ...Array.from(new Set(galleryItems.map(item => item.category)))];

  // Separate print and rental items for display
  const printItems = filteredItems.filter(item => item.type === "3D-Print");
  const rentalItems = filteredItems.filter(item => item.type === "Space-Rental");

  // Handle category selection with animation
  const handleCategorySelect = (category: string) => {
    setFilterAnimation(true);
    setSelectedCategory(category);
    if (category !== "all") {
      setActiveTab("prints");
    }
    setTimeout(() => setFilterAnimation(false), 300);
  };

  // Handle tab change with animation
  const handleTabChange = (tab: "all" | "prints" | "rentals") => {
    setFilterAnimation(true);
    setActiveTab(tab);
    if (tab === "all") {
      setSelectedCategory("all");
    }
    setTimeout(() => setFilterAnimation(false), 300);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilterAnimation(true);
    setActiveTab("all");
    setSelectedCategory("all");
    setTimeout(() => setFilterAnimation(false), 300);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className=" text-center mb-4 py-20 bg-black text-white">
        <h1 className="tracking-tight  text-lgx mb-2 ">Gallery</h1>
        <p className="text-white ">
          Explore our collection of featured projects, prototypes, and completed works.
        </p>
      </div>
      {/* Category Filter Section - Sticky - Fixed to remove scroll lines */}
      < div className="top-0 z-10 bg-background/95 border-b backdrop-blur-sm glass-effect" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between py-4 gap-4">
            {/* Main Tabs - Without overflow-x-auto to remove scroll */}
            <div className="flex space-x-1">
              <button
                onClick={() => handleTabChange("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${filterAnimation ? 'filter-pulse' : ''
                  } ${activeTab === "all"
                    ? "bg-primary text-primary-foreground active-filter-indicator"
                    : "hover:bg-muted"
                  }`}
              >
                All Items
              </button>
              <button
                onClick={() => handleTabChange("prints")}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${filterAnimation ? 'filter-pulse' : ''
                  } ${activeTab === "prints"
                    ? "bg-blue-500 text-white active-filter-indicator"
                    : "hover:bg-muted"
                  }`}
              >
                3D Prints
              </button>
              <button
                onClick={() => handleTabChange("rentals")}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${filterAnimation ? 'filter-pulse' : ''
                  } ${activeTab === "rentals"
                    ? "bg-green-500 text-white active-filter-indicator"
                    : "hover:bg-muted"
                  }`}
              >
                Space Rentals
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="hidden lg:flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter by:</span>
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-muted transition-all hover:scale-105"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              {/* Desktop category filters - Without overflow to remove scroll */}
              <div className="hidden lg:flex flex-wrap gap-2">
                {allCategories.map(category => {
                  const CategoryIcon = category === "all" ? null : categoryIcons[category as keyof typeof categoryIcons];
                  const categoryTextColor = category === "all" ? "" : categoryTextColors[category as keyof typeof categoryTextColors];
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${filterAnimation ? 'filter-pulse' : ''
                        } ${selectedCategory === category
                          ? category === "all"
                            ? "bg-primary text-primary-foreground"
                            : `${categoryGradients[category as keyof typeof categoryGradients]} ${categoryTextColor}`
                          : "bg-muted hover:bg-muted/80"
                        }`}
                    >
                      {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
                      <span>{category === "all" ? "All Categories" : category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile category filters dropdown */}
          {showMobileFilters && (
            <div className={`lg:hidden mb-4 p-4 bg-muted/50 rounded-lg filter-section ${showMobileFilters ? 'expanded' : 'collapsed'}`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allCategories.map(category => {
                  const CategoryIcon = category === "all" ? null : categoryIcons[category as keyof typeof categoryIcons];
                  const categoryTextColor = category === "all" ? "" : categoryTextColors[category as keyof typeof categoryTextColors];
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        handleCategorySelect(category);
                        setShowMobileFilters(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${selectedCategory === category
                        ? category === "all"
                          ? "bg-primary text-primary-foreground"
                          : `${categoryGradients[category as keyof typeof categoryGradients]} ${categoryTextColor}`
                        : "bg-background hover:bg-muted"
                        }`}
                    >
                      {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
                      <span>{category === "all" ? "All" : category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div >

      {/* Main Content */}
      < main className="py-12 lg:py-16" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Active Filters Display */}
          {(activeTab !== "all" || selectedCategory !== "all") && (
            <div className="mb-8 p-4 bg-muted/30 rounded-lg">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Showing:</span>
                {activeTab !== "all" && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                    {activeTab === "prints" ? "3D Prints" : "Space Rentals"}
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className={`px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-sm flex items-center gap-1 ${categoryTextColors[selectedCategory as keyof typeof categoryTextColors]}`}>
                    {categoryIcons[selectedCategory as keyof typeof categoryIcons] &&
                      React.createElement(categoryIcons[selectedCategory as keyof typeof categoryIcons], { className: "w-3 h-3" })}
                    {selectedCategory}
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}

          {/* 3D Prints Section - Only show if prints tab is active or all tab with prints */}
          {(activeTab === "all" || activeTab === "prints") && printItems.length > 0 && (
            <section className="mb-16">
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                      <Printer className="w-6 h-6" />
                      3D Printed Works
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedCategory === "all"
                        ? "Custom designs across all categories"
                        : categoryDescriptions[selectedCategory as keyof typeof categoryDescriptions]}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {printItems.length} items
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {printItems.map((item) => {
                  const CategoryIcon = categoryIcons[item.category];
                  const categoryGradient = categoryGradients[item.category as keyof typeof categoryGradients];
                  const categoryTextColor = categoryTextColors[item.category as keyof typeof categoryTextColors];

                  return (
                    <div
                      key={item.id}
                      className="group cursor-pointer gallery-card-hover"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className={`${categoryGradient} rounded-xl overflow-hidden border hover:shadow-xl transition-all duration-300 h-full`}>
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 gradient-overlay-bottom" />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <div className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
                              {item.type}
                            </div>
                            <div className="glass-effect-dark px-2 py-1 text-white text-xs font-medium rounded flex items-center gap-1">
                              <CategoryIcon className="w-3 h-3" />
                              <span>{item.category}</span>
                            </div>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="flex items-center justify-between">
                              <span className="material-chip">
                                {item.details.material}
                              </span>
                              <span className="price-tag">
                                {item.details.price}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.summary}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{item.details.printTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">•</span>
                                <span>{item.details.layerHeight}</span>
                              </div>
                            </div>
                            <div className="px-2 py-1 bg-muted rounded text-xs">
                              Click to preview
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Space Rentals Section - Only show if rentals tab is active or all tab with rentals */}
          {(activeTab === "all" || activeTab === "rentals") && rentalItems.length > 0 && (
            <section>
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                      <Calendar className="w-6 h-6" />
                      Available Spaces
                    </h2>
                    <p className="text-muted-foreground">Creative workspaces and studios for rent</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {rentalItems.length} spaces
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rentalItems.map((item) => {
                  const CategoryIcon = categoryIcons[item.category];
                  const categoryTextColor = categoryTextColors[item.category as keyof typeof categoryTextColors];

                  return (
                    <div
                      key={item.id}
                      className="group cursor-pointer gallery-card-hover"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl overflow-hidden border hover:shadow-xl transition-all duration-300">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 gradient-overlay-bottom" />
                          <div className="absolute top-3 left-3">
                            <div className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                              {item.type}
                            </div>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="flex items-center justify-between">
                              <span className="material-chip">
                                {item.details.location}
                              </span>
                              <span className="price-tag">
                                {item.details.price}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm ${categoryTextColor}`}>{item.category}</span>
                          </div>
                          <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.summary}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{item.details.capacity}</span>
                            <MapPin className="w-3 h-3 ml-2" />
                            <span className="line-clamp-1">{item.details.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* No Results Message */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16 no-results-animation">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No items found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters to see more results
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:scale-105"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main >

      {/* Modal */}
      {
        selectedItem && (
          <GalleryModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )
      }
    </div >
  );
}