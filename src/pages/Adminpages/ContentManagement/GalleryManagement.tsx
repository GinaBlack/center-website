
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Upload,
  Package,
  Calendar,
  Clock,
  MapPin,
  Printer,
  Home,
  Phone,
  Car,
  ToyBrick,
  Palette,
  Cpu,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

// Types for gallery items (same as GalleryPage)
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

// Initial mock data (same as GalleryPage but with more sample items)
const initialGalleryItems: GalleryItem[] = [
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
];

// Category icons mapping
const categoryIcons = {
  "Electronics": Phone,
  "Home & Garden": Home,
  "Technology": Cpu,
  "Art & Design": Palette,
  "Automotive": Car,
  "Toys & Games": ToyBrick,
};

// Empty item template for adding new items
const emptyItem: GalleryItem = {
  id: 0,
  title: "",
  category: "Electronics",
  type: "3D-Print",
  description: "",
  summary: "",
  images: [""],
  details: {
    size: "",
    material: "",
    printTime: "",
    capacity: "",
    location: "",
    price: "",
    layerHeight: "",
    infill: ""
  }
};

// Component for editing/adding items
interface GalleryItemFormProps {
  item: GalleryItem;
  onSave: (item: GalleryItem) => void;
  onCancel: () => void;
  isEditMode: boolean;
}

function GalleryItemForm({ item, onSave, onCancel, isEditMode }: GalleryItemFormProps) {
  const [formData, setFormData] = useState<GalleryItem>({ ...item });
  const [imageUrls, setImageUrls] = useState<string>(item.images.join("\n"));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.summary.trim()) newErrors.summary = "Summary is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.details.price?.trim()) newErrors.price = "Price is required";
    
    if (formData.type === "3D-Print") {
      if (!formData.details.material?.trim()) newErrors.material = "Material is required";
      if (!formData.details.printTime?.trim()) newErrors.printTime = "Print time is required";
    } else {
      if (!formData.details.capacity?.trim()) newErrors.capacity = "Capacity is required";
      if (!formData.details.location?.trim()) newErrors.location = "Location is required";
    }
    
    // Validate image URLs
    const urls = imageUrls.split("\n").filter(url => url.trim());
    if (urls.length === 0) {
      newErrors.images = "At least one image URL is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const updatedItem = {
      ...formData,
      images: imageUrls.split("\n").filter(url => url.trim())
    };
    
    onSave(updatedItem);
  };

  const handleDetailChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: value
      }
    }));
    
    // Clear error for this field if it exists
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: "" }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "title" || name === "summary" || name === "description" || name === "category" || name === "type") {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {isEditMode ? "Edit Gallery Item" : "Add New Gallery Item"}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.title ? 'border-red-500' : 'border-input'}`}
                    placeholder="Enter item title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-lg"
                    >
                      <option value="3D-Print">3D Print</option>
                      <option value="Space-Rental">Space Rental</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-lg"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Home & Garden">Home & Garden</option>
                      <option value="Technology">Technology</option>
                      <option value="Art & Design">Art & Design</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Toys & Games">Toys & Games</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Summary *
                </label>
                <input
                  type="text"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.summary ? 'border-red-500' : 'border-input'}`}
                  placeholder="Brief summary (displayed in cards)"
                />
                {errors.summary && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.summary}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-input'}`}
                  placeholder="Full description (displayed in modal)"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Image URLs */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Images</h3>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Image URLs (one per line) *
                </label>
                <textarea
                  value={imageUrls}
                  onChange={(e) => {
                    setImageUrls(e.target.value);
                    if (errors.images) {
                      setErrors(prev => ({ ...prev, images: "" }));
                    }
                  }}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg font-mono text-sm ${errors.images ? 'border-red-500' : 'border-input'}`}
                  placeholder="https://images.unsplash.com/photo-..."
                />
                {errors.images && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.images}
                  </p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter one image URL per line. First image will be used as thumbnail.
                </p>
              </div>
            </div>

            {/* Type-specific Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">
                {formData.type === "3D-Print" ? "3D Print Details" : "Space Rental Details"}
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Price (common for both types) */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price *
                  </label>
                  <input
                    type="text"
                    value={formData.details.price || ""}
                    onChange={(e) => handleDetailChange("price", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.price ? 'border-red-500' : 'border-input'}`}
                    placeholder="$24.99 or $899/month"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.price}
                    </p>
                  )}
                </div>

                {formData.type === "3D-Print" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Material *
                      </label>
                      <input
                        type="text"
                        value={formData.details.material || ""}
                        onChange={(e) => handleDetailChange("material", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.material ? 'border-red-500' : 'border-input'}`}
                        placeholder="PLA, ABS, PETG, etc."
                      />
                      {errors.material && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.material}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Print Time *
                      </label>
                      <input
                        type="text"
                        value={formData.details.printTime || ""}
                        onChange={(e) => handleDetailChange("printTime", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.printTime ? 'border-red-500' : 'border-input'}`}
                        placeholder="4-6 hours"
                      />
                      {errors.printTime && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.printTime}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Size
                      </label>
                      <input
                        type="text"
                        value={formData.details.size || ""}
                        onChange={(e) => handleDetailChange("size", e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg"
                        placeholder="150x80x60mm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Layer Height
                      </label>
                      <input
                        type="text"
                        value={formData.details.layerHeight || ""}
                        onChange={(e) => handleDetailChange("layerHeight", e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg"
                        placeholder="0.2mm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Infill
                      </label>
                      <input
                        type="text"
                        value={formData.details.infill || ""}
                        onChange={(e) => handleDetailChange("infill", e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg"
                        placeholder="20%"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Capacity *
                      </label>
                      <input
                        type="text"
                        value={formData.details.capacity || ""}
                        onChange={(e) => handleDetailChange("capacity", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.capacity ? 'border-red-500' : 'border-input'}`}
                        placeholder="10-15 people"
                      />
                      {errors.capacity && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.capacity}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={formData.details.location || ""}
                        onChange={(e) => handleDetailChange("location", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.location ? 'border-red-500' : 'border-input'}`}
                        placeholder="Downtown Innovation Hub"
                      />
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.location}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-input rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isEditMode ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Confirmation dialog component
interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmationDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          
          <p className="text-muted-foreground mb-6">{message}</p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-input rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Gallery Management Component
export default function GalleryManagement() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGalleryItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "3D-Print" | "Space-Rental">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  // Load items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('galleryItems');
    if (savedItems) {
      try {
        setGalleryItems(JSON.parse(savedItems));
      } catch (error) {
        console.error('Error loading gallery items:', error);
      }
    }
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
  }, [galleryItems]);

  // Filter items based on search and filters
  const filteredItems = galleryItems.filter(item => {
    // Filter by search term
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.summary.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by type
    if (filterType !== "all" && item.type !== filterType) {
      return false;
    }
    
    // Filter by category
    if (filterCategory !== "all" && item.category !== filterCategory) {
      return false;
    }
    
    return true;
  });

  // Handle adding new item
  const handleAddItem = () => {
    setIsAddingNew(true);
    setEditingItem({ ...emptyItem, id: Math.max(0, ...galleryItems.map(i => i.id)) + 1 });
  };

  // Handle editing item
  const handleEditItem = (item: GalleryItem) => {
    setEditingItem({ ...item });
  };

  // Handle saving item (both add and edit)
  const handleSaveItem = (updatedItem: GalleryItem) => {
    if (isAddingNew) {
      setGalleryItems(prev => [...prev, updatedItem]);
      setIsAddingNew(false);
    } else {
      setGalleryItems(prev => prev.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
    }
    setEditingItem(null);
  };

  // Handle cancel edit/add
  const handleCancelEdit = () => {
    setEditingItem(null);
    setIsAddingNew(false);
  };

  // Handle delete item
  const handleDeleteItem = () => {
    if (itemToDelete) {
      setGalleryItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  // Toggle item visibility (you could add this feature if needed)
  const [hiddenItems, setHiddenItems] = useState<number[]>([]);
  
  const toggleItemVisibility = (id: number) => {
    setHiddenItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // Get unique categories for filter
  const categories = ["all", ...Array.from(new Set(galleryItems.map(item => item.category)))];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-black text-white mb-8 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Gallery Management</h1>
          <p className="text-white/80">
            Manage your 3D print projects and rental spaces. Add, edit, delete, and preview items.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats and Controls */}
        <div className="mb-8 grid md:grid-cols-4 gap-6">
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-3xl font-bold">{galleryItems.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">3D Prints</p>
                <p className="text-3xl font-bold">
                  {galleryItems.filter(item => item.type === "3D-Print").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Printer className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Space Rentals</p>
                <p className="text-3xl font-bold">
                  {galleryItems.filter(item => item.type === "Space-Rental").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hidden Items</p>
                <p className="text-3xl font-bold">{hiddenItems.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search items by title, description, or summary..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-3 border border-input rounded-lg bg-background"
              >
                <option value="all">All Types</option>
                <option value="3D-Print">3D Prints</option>
                <option value="Space-Rental">Space Rentals</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-input rounded-lg bg-background"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c !== "all").map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterCategory("all");
                }}
                className="px-4 py-3 border border-input rounded-lg hover:bg-muted transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing {filteredItems.length} of {galleryItems.length} items
            </div>

            <button
              onClick={handleAddItem}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Item
            </button>
          </div>
        </div>

        {/* Gallery Items Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-4 px-6 font-medium">Item</th>
                  <th className="text-left py-4 px-6 font-medium">Type</th>
                  <th className="text-left py-4 px-6 font-medium">Category</th>
                  <th className="text-left py-4 px-6 font-medium">Price</th>
                  <th className="text-left py-4 px-6 font-medium">Status</th>
                  <th className="text-left py-4 px-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <Filter className="w-12 h-12" />
                        <p className="text-lg">No items found</p>
                        <p>Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const CategoryIcon = categoryIcons[item.category];
                    const isHidden = hiddenItems.includes(item.id);
                    
                    return (
                      <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium">{item.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                                {item.summary}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.type === "3D-Print"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-green-500/10 text-green-600"
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {CategoryIcon && <CategoryIcon className="w-4 h-4" />}
                            <span>{item.category}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium">
                          {item.details.price}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => toggleItemVisibility(item.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                              isHidden
                                ? "bg-orange-500/10 text-orange-600"
                                : "bg-green-500/10 text-green-600"
                            }`}
                          >
                            {isHidden ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                Hidden
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                Visible
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPreviewItem(item)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setItemToDelete(item)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-muted/30 rounded-xl">
          <h3 className="font-medium mb-4">Management Instructions</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Adding Items</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click "Add New Item" to create new entries</li>
                <li>• Fill in all required fields marked with *</li>
                <li>• Add multiple image URLs (one per line)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Editing Items</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click the edit icon on any item</li>
                <li>• Make changes and save</li>
                <li>• Changes auto-save to browser storage</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Visibility Control</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Toggle visibility to hide/show items</li>
                <li>• Hidden items don't appear on main gallery</li>
                <li>• Useful for seasonal or temporary items</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Preview: {previewItem.title}</h2>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                      <p className="font-medium">{previewItem.type}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                      <div className="flex items-center gap-2">
                        {categoryIcons[previewItem.category] && 
                          React.createElement(categoryIcons[previewItem.category], { className: "w-4 h-4" })}
                        <span>{previewItem.category}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Summary</h4>
                      <p>{previewItem.summary}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {previewItem.type === "3D-Print" ? (
                      <>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Material</h4>
                          <p className="font-medium">{previewItem.details.material}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Print Time</h4>
                          <p className="font-medium">{previewItem.details.printTime}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Size</h4>
                          <p className="font-medium">{previewItem.details.size}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Capacity</h4>
                          <p className="font-medium">{previewItem.details.capacity}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                          <p className="font-medium">{previewItem.details.location}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                  <p className="text-muted-foreground">{previewItem.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Images ({previewItem.images.length})</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {previewItem.images.map((img, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
                      <p className="text-2xl font-bold">{previewItem.details.price}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleEditItem(previewItem);
                        setPreviewItem(null);
                      }}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit This Item
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Form */}
      {editingItem && (
        <GalleryItemForm
          item={editingItem}
          onSave={handleSaveItem}
          onCancel={handleCancelEdit}
          isEditMode={!isAddingNew}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!itemToDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
