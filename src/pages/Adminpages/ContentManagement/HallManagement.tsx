import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  Check, 
  Calendar, 
  Users, 
  Clock,
  MapPin,
  Upload,
  Power,
  Save,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Ruler,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building,
  Wifi,
  Monitor,
  Printer,
  Coffee
} from 'lucide-react';
import { 
  db, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp 
} from '../../../firebase/firebase_config';

// Interfaces based on your schema
interface Hall {
  hall_id?: string;
  id: string;
  name: string;
  description: string;
  capacity: number;
  area_sqft?: number;
  equipment_included: string[];
  images: string[];
  hourly_rate: number;
  daily_rate?: number;
  security_deposit: number;
  is_available: boolean;
  location: string;
  rules: string;
  created_at: Date;
  updated_at: Date;
}

interface HallFormData {
  name: string;
  description: string;
  capacity: number;
  area_sqft?: number;
  equipment_included: string[];
  images: string[];
  hourly_rate: number;
  daily_rate?: number;
  security_deposit: number;
  is_available: boolean;
  location: string;
  rules: string;
}

const HallManagement = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for new hall form
  const [newHall, setNewHall] = useState<HallFormData>({
    name: '',
    description: '',
    capacity: 20,
    area_sqft: undefined,
    equipment_included: [],
    images: [],
    hourly_rate: 50,
    daily_rate: undefined,
    security_deposit: 0,
    is_available: true,
    location: '',
    rules: ''
  });

  // State for editing
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);

  // Firebase collection references
  const hallsCollectionRef = collection(db, 'rental_halls');

  // Fetch halls from Firebase
  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(hallsCollectionRef);
      const hallsData: Hall[] = [];
      
      querySnapshot.forEach(doc => {
        const hallData = doc.data();
        hallsData.push({
          id: doc.id,
          hall_id: doc.id,
          name: hallData.name || '',
          description: hallData.description || '',
          capacity: Number(hallData.capacity) || 0,
          area_sqft: hallData.area_sqft ? Number(hallData.area_sqft) : undefined,
          equipment_included: Array.isArray(hallData.equipment_included) ? hallData.equipment_included : [],
          images: Array.isArray(hallData.images) ? hallData.images : [],
          hourly_rate: Number(hallData.hourly_rate) || 0,
          daily_rate: hallData.daily_rate ? Number(hallData.daily_rate) : undefined,
          security_deposit: Number(hallData.security_deposit) || 0,
          is_available: hallData.is_available !== false,
          location: hallData.location || '',
          rules: hallData.rules || '',
          created_at: hallData.created_at?.toDate() || new Date(),
          updated_at: hallData.updated_at?.toDate() || new Date()
        });
      });
      
      setHalls(hallsData);
      
      // Initialize image indexes
      const initialIndexes: Record<string, number> = {};
      hallsData.forEach(hall => {
        initialIndexes[hall.id] = 0;
      });
      setCurrentImageIndex(initialIndexes);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching halls:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new hall
  const handleAddHall = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare data for Firebase
      const hallData = {
        name: newHall.name.trim(),
        description: newHall.description.trim(),
        capacity: newHall.capacity,
        area_sqft: newHall.area_sqft || null,
        equipment_included: newHall.equipment_included.filter(item => item.trim() !== ''),
        images: newHall.images,
        hourly_rate: newHall.hourly_rate,
        daily_rate: newHall.daily_rate || null,
        security_deposit: newHall.security_deposit,
        is_available: newHall.is_available,
        location: newHall.location.trim(),
        rules: newHall.rules.trim(),
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      const docRef = await addDoc(hallsCollectionRef, hallData);
      
      // Add the new hall to state with its Firebase ID
      const createdHall: Hall = {
        id: docRef.id,
        hall_id: docRef.id,
        name: hallData.name,
        description: hallData.description,
        capacity: hallData.capacity,
        area_sqft: hallData.area_sqft || undefined,
        equipment_included: hallData.equipment_included,
        images: hallData.images,
        hourly_rate: hallData.hourly_rate,
        daily_rate: hallData.daily_rate || undefined,
        security_deposit: hallData.security_deposit,
        is_available: hallData.is_available,
        location: hallData.location,
        rules: hallData.rules,
        created_at: hallData.created_at.toDate(),
        updated_at: hallData.updated_at.toDate()
      };
      
      setHalls([...halls, createdHall]);
      
      // Reset form
      setNewHall({
        name: '',
        description: '',
        capacity: 20,
        area_sqft: undefined,
        equipment_included: [],
        images: [],
        hourly_rate: 50,
        daily_rate: undefined,
        security_deposit: 0,
        is_available: true,
        location: '',
        rules: ''
      });
      
      setShowAddForm(false);
      alert('Hall added successfully!');
    } catch (err: any) {
      console.error('Error adding hall:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle updating a hall
  const handleUpdateHall = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingHall) return;
    
    try {
      // Prepare data for Firebase
      const updateData = {
        name: editingHall.name.trim(),
        description: editingHall.description.trim(),
        capacity: editingHall.capacity,
        area_sqft: editingHall.area_sqft || null,
        equipment_included: editingHall.equipment_included.filter(item => item.trim() !== ''),
        images: editingHall.images,
        hourly_rate: editingHall.hourly_rate,
        daily_rate: editingHall.daily_rate || null,
        security_deposit: editingHall.security_deposit,
        is_available: editingHall.is_available,
        location: editingHall.location.trim(),
        rules: editingHall.rules.trim(),
        updated_at: Timestamp.now()
      };

      const hallDocRef = doc(db, 'rental_halls', editingHall.id);
      await updateDoc(hallDocRef, updateData);
      
      // Update local state
      const updatedHall = {
        ...editingHall,
        updated_at: new Date()
      };
      
      setHalls(halls.map(hall => 
        hall.id === editingHall.id ? updatedHall : hall
      ));
      
      setEditingHall(null);
      alert('Hall updated successfully!');
    } catch (err: any) {
      console.error('Error updating hall:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle deleting a hall
  const handleDeleteHall = async (hallId: string) => {
    if (!window.confirm('Are you sure you want to delete this hall? This will also delete all associated bookings.')) {
      return;
    }

    try {
      const hallDocRef = doc(db, 'rental_halls', hallId);
      await deleteDoc(hallDocRef);
      
      // Update local state
      setHalls(halls.filter(hall => hall.id !== hallId));
      alert('Hall deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting hall:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle toggling hall availability
  const handleToggleAvailability = async (hallId: string, currentStatus: boolean) => {
    try {
      const hallDocRef = doc(db, 'rental_halls', hallId);
      await updateDoc(hallDocRef, {
        is_available: !currentStatus,
        updated_at: Timestamp.now()
      });
      
      // Update local state
      setHalls(halls.map(hall => 
        hall.id === hallId 
          ? { ...hall, is_available: !currentStatus, updated_at: new Date() }
          : hall
      ));
      
      alert(`Hall ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (err: any) {
      console.error('Error updating hall status:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle image upload (for GitHub)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    
    // Simulate upload (in real app, you'd upload to GitHub)
    setTimeout(() => {
      const newImageUrls = files.map(file => URL.createObjectURL(file));
      
      if (!editingHall) {
        // For new hall form
        setNewHall(prev => ({
          ...prev,
          images: [...prev.images, ...newImageUrls]
        }));
      } else {
        // For editing hall
        setEditingHall(prev => prev ? {
          ...prev,
          images: [...prev.images, ...newImageUrls]
        } : prev);
      }
      
      setUploading(false);
    }, 1000);
  };

  // Handle removing an image
  const handleRemoveImage = (imageIndex: number, hallId?: string) => {
    if (!hallId) {
      // For new hall form
      setNewHall(prev => ({
        ...prev,
        images: prev.images.filter((_, index) => index !== imageIndex)
      }));
    } else if (editingHall && editingHall.id === hallId) {
      // For editing hall
      setEditingHall(prev => prev ? {
        ...prev,
        images: prev.images.filter((_, index) => index !== imageIndex)
      } : prev);
    }
  };

  // Handle adding equipment
  const handleAddEquipment = (equipment: string, hallId?: string) => {
    if (equipment.trim() === '') return;
    
    if (hallId && editingHall && editingHall.id === hallId) {
      setEditingHall({
        ...editingHall,
        equipment_included: [...editingHall.equipment_included, equipment.trim()]
      });
    } else {
      setNewHall({
        ...newHall,
        equipment_included: [...newHall.equipment_included, equipment.trim()]
      });
    }
  };

  // Handle removing equipment
  const handleRemoveEquipment = (equipmentIndex: number, hallId?: string) => {
    if (hallId && editingHall && editingHall.id === hallId) {
      setEditingHall({
        ...editingHall,
        equipment_included: editingHall.equipment_included.filter((_, index) => index !== equipmentIndex)
      });
    } else {
      setNewHall({
        ...newHall,
        equipment_included: newHall.equipment_included.filter((_, index) => index !== equipmentIndex)
      });
    }
  };

  // Navigation for image carousel
  const nextImage = (hallId: string) => {
    const hall = halls.find(h => h.id === hallId);
    if (!hall || !hall.images || hall.images.length <= 1) return;
    
    setCurrentImageIndex(prev => ({
      ...prev,
      [hallId]: (prev[hallId] + 1) % hall.images.length
    }));
  };

  const prevImage = (hallId: string) => {
    const hall = halls.find(h => h.id === hallId);
    if (!hall || !hall.images || hall.images.length <= 1) return;
    
    setCurrentImageIndex(prev => ({
      ...prev,
      [hallId]: (prev[hallId] - 1 + hall.images.length) % hall.images.length
    }));
  };

  // Get equipment icon
  const getEquipmentIcon = (equipment: string) => {
    const lowerEquip = equipment.toLowerCase();
    if (lowerEquip.includes('wifi')) return <Wifi className="w-3 h-3" />;
    if (lowerEquip.includes('projector') || lowerEquip.includes('screen')) return <Monitor className="w-3 h-3" />;
    if (lowerEquip.includes('printer')) return <Printer className="w-3 h-3" />;
    if (lowerEquip.includes('coffee') || lowerEquip.includes('tea')) return <Coffee className="w-3 h-3" />;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading halls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hall Management</h1>
        <p className="text-muted-foreground">
          Create, update, and manage rental halls
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="text-lg font-semibold mb-2">Total Halls</h3>
          <p className="text-3xl font-bold text-primary">{halls.length}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="text-lg font-semibold mb-2">Available</h3>
          <p className="text-3xl font-bold text-green-600">
            {halls.filter(h => h.is_available).length}
          </p>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="text-lg font-semibold mb-2">Avg. Hourly Rate</h3>
          <p className="text-3xl font-bold text-blue-600">
            ${(halls.reduce((total, hall) => total + hall.hourly_rate, 0) / (halls.length || 1)).toFixed(2)}
          </p>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="text-lg font-semibold mb-2">Avg. Capacity</h3>
          <p className="text-3xl font-bold text-purple-600">
            {Math.round(halls.reduce((total, hall) => total + hall.capacity, 0) / (halls.length || 1))} people
          </p>
        </div>
      </div>

      {/* Add Hall Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add New Hall
        </button>
      </div>

      {/* Add Hall Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full h-180 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add New Hall</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddHall}>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-4 text-lg">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Hall Name *</label>
                        <input
                          type="text"
                          value={newHall.name}
                          onChange={(e) => setNewHall({...newHall, name: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                          placeholder="e.g., 3D Printing Innovation Hall"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                          value={newHall.description}
                          onChange={(e) => setNewHall({...newHall, description: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
                          placeholder="Describe the hall features, amenities, and unique selling points..."
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Capacity *</label>
                          <input
                            type="number"
                            value={newHall.capacity}
                            onChange={(e) => setNewHall({...newHall, capacity: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Area (sq ft)</label>
                          <input
                            type="number"
                            value={newHall.area_sqft || ''}
                            onChange={(e) => setNewHall({...newHall, area_sqft: e.target.value ? parseFloat(e.target.value) : undefined})}
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Location *</label>
                        <input
                          type="text"
                          value={newHall.location}
                          onChange={(e) => setNewHall({...newHall, location: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                          placeholder="e.g., Main Building, Floor 3, Room 301"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-4 text-lg">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Hourly Rate ($) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                          <input
                            type="number"
                            value={newHall.hourly_rate}
                            onChange={(e) => setNewHall({...newHall, hourly_rate: parseFloat(e.target.value) || 0})}
                            className="w-full pl-8 pr-3 py-2 border rounded-md bg-background"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Daily Rate ($)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                          <input
                            type="number"
                            value={newHall.daily_rate || ''}
                            onChange={(e) => setNewHall({...newHall, daily_rate: e.target.value ? parseFloat(e.target.value) : undefined})}
                            className="w-full pl-8 pr-3 py-2 border rounded-md bg-background"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Security Deposit ($)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                          <input
                            type="number"
                            value={newHall.security_deposit}
                            onChange={(e) => setNewHall({...newHall, security_deposit: parseFloat(e.target.value) || 0})}
                            className="w-full pl-8 pr-3 py-2 border rounded-md bg-background"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Equipment */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-4 text-lg">Equipment Included</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {newHall.equipment_included.map((equipment, index) => (
                        equipment.trim() !== '' && (
                          <span key={index} className="flex items-center gap-2 px-3 py-2 bg-background border rounded-full">
                            {getEquipmentIcon(equipment)}
                            <span>{equipment}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEquipment(index)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add equipment (e.g., Wi-Fi, Projector, 3D Printer)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddEquipment(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="flex-1 px-3 py-2 border rounded-md bg-background"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                          handleAddEquipment(input.value);
                          input.value = '';
                        }}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Rules & Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="font-semibold mb-4 text-lg">Rules & Terms</h3>
                      <textarea
                        value={newHall.rules}
                        onChange={(e) => setNewHall({...newHall, rules: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md bg-background min-h-[150px]"
                        placeholder="Enter terms and conditions, cancellation policy, house rules..."
                        rows={6}
                      />
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="font-semibold mb-4 text-lg">Hall Images</h3>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {newHall.images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Hall image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {uploading && (
                          <div className="col-span-3 p-4 border rounded-md bg-muted/50">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Uploading...</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <span className="font-medium">Upload Images</span>
                        <span className="text-sm text-muted-foreground">Drag & drop or click to browse</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          multiple
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-3 border rounded-md hover:bg-muted transition-colors font-medium"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Adding Hall...
                        </span>
                      ) : (
                        'Add Hall'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hall Form Modal */}
      {editingHall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Hall: {editingHall.name}</h2>
                <button
                  onClick={() => setEditingHall(null)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateHall}>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-4 text-lg">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Hall Name *</label>
                        <input
                          type="text"
                          value={editingHall.name}
                          onChange={(e) => setEditingHall({...editingHall, name: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                          value={editingHall.description}
                          onChange={(e) => setEditingHall({...editingHall, description: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Capacity *</label>
                          <input
                            type="number"
                            value={editingHall.capacity}
                            onChange={(e) => setEditingHall({...editingHall, capacity: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Area (sq ft)</label>
                          <input
                            type="number"
                            value={editingHall.area_sqft || ''}
                            onChange={(e) => setEditingHall({...editingHall, area_sqft: e.target.value ? parseFloat(e.target.value) : undefined})}
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Location *</label>
                        <input
                          type="text"
                          value={editingHall.location}
                          onChange={(e) => setEditingHall({...editingHall, location: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-4 text-lg">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Hourly Rate ($) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                          <input
                            type="number"
                            value={editingHall.hourly_rate}
                            onChange={(e) => setEditingHall({...editingHall, hourly_rate: parseFloat(e.target.value) || 0})}
                            className="w-full pl-8 pr-3 py-2 border rounded-md bg-background"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Daily Rate ($)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                          <input
                            type="number"
                            value={editingHall.daily_rate || ''}
                            onChange={(e) => setEditingHall({...editingHall, daily_rate: e.target.value ? parseFloat(e.target.value) : undefined})}
                            className="w-full pl-8 pr-3 py-2 border rounded-md bg-background"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Security Deposit ($)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                          <input
                            type="number"
                            value={editingHall.security_deposit}
                            onChange={(e) => setEditingHall({...editingHall, security_deposit: parseFloat(e.target.value) || 0})}
                            className="w-full pl-8 pr-3 py-2 border rounded-md bg-background"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Equipment */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-4 text-lg">Equipment Included</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {editingHall.equipment_included.map((equipment, index) => (
                        equipment.trim() !== '' && (
                          <span key={index} className="flex items-center gap-2 px-3 py-2 bg-background border rounded-full">
                            {getEquipmentIcon(equipment)}
                            <span>{equipment}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEquipment(index, editingHall.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add equipment"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddEquipment(e.currentTarget.value, editingHall.id);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="flex-1 px-3 py-2 border rounded-md bg-background"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                          handleAddEquipment(input.value, editingHall.id);
                          input.value = '';
                        }}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Rules & Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="font-semibold mb-4 text-lg">Rules & Terms</h3>
                      <textarea
                        value={editingHall.rules}
                        onChange={(e) => setEditingHall({...editingHall, rules: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md bg-background min-h-[150px]"
                        rows={6}
                      />
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="font-semibold mb-4 text-lg">Hall Images</h3>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {editingHall.images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Hall image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index, editingHall.id)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <span className="font-medium">Add More Images</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          multiple
                        />
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setEditingHall(null)}
                      className="flex-1 px-4 py-3 border rounded-md hover:bg-muted transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                      Update Hall
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Halls List */}
      {halls.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Building className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Halls Found</h2>
          <p className="text-muted-foreground mb-4">Add your first hall to get started.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Your First Hall
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {halls.map((hall) => (
            <div key={hall.id} className="bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Hall Header with Status */}
              <div className="flex justify-between items-center p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${hall.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <h3 className="text-lg font-semibold">{hall.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Added: {new Date(hall.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">${hall.hourly_rate}<span className="text-sm font-normal text-muted-foreground">/hour</span></span>
                  {hall.daily_rate && (
                    <span className="text-sm text-muted-foreground">${hall.daily_rate}/day</span>
                  )}
                </div>
              </div>

              {/* Hall Content */}
              <div className="p-4">
                {/* Image Carousel */}
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-muted">
                  {hall.images && hall.images.length > 0 ? (
                    <>
                      <img
                        src={hall.images[currentImageIndex[hall.id] || 0]}
                        alt={hall.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {hall.images.length > 1 && (
                        <>
                          <button
                            onClick={() => prevImage(hall.id)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                            title="Previous image"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => nextImage(hall.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                            title="Next image"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                            {hall.images.map((_, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${index === (currentImageIndex[hall.id] || 0) ? 'bg-white' : 'bg-white/50'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Hall Details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{hall.capacity} people</div>
                        <div className="text-xs text-muted-foreground">Capacity</div>
                      </div>
                    </div>
                    {hall.area_sqft && (
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{hall.area_sqft} sq ft</div>
                          <div className="text-xs text-muted-foreground">Area</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{hall.location}</span>
                  </div>

                  {/* Description Preview */}
                  {hall.description && (
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{hall.description}</p>
                    </div>
                  )}

                  {/* Equipment */}
                  {hall.equipment_included && hall.equipment_included.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Equipment</h4>
                      <div className="flex flex-wrap gap-1">
                        {hall.equipment_included.slice(0, 3).map((equipment, index) => (
                          <span key={index} className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                            {getEquipmentIcon(equipment)}
                            <span>{equipment}</span>
                          </span>
                        ))}
                        {hall.equipment_included.length > 3 && (
                          <span className="px-2 py-1 bg-muted/50 rounded text-xs">
                            +{hall.equipment_included.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Security Deposit */}
                  {hall.security_deposit > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span>Security deposit: <span className="font-medium">${hall.security_deposit}</span></span>
                    </div>
                  )}

                  {/* Rules Preview */}
                  {hall.rules && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Rules</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{hall.rules}</p>
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(hall.updated_at).toLocaleDateString()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => setEditingHall(hall)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleAvailability(hall.id, hall.is_available)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                        hall.is_available 
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                      {hall.is_available ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteHall(hall.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HallManagement;