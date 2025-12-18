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
  XCircle,
  Filter,
  Search
} from 'lucide-react';

// Firebase imports
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db, storage } from '../../firebase/firebase_config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// TypeScript interfaces
import { 
  Hall, 
  Booking, 
  HallFormData, 
  BookingStatus, 
  PaymentStatus,
  HallStats
} from '../../types/halls_bookings';

const BookingManagement: React.FC = () => {
  // State for all halls
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<HallStats>({
    total_halls: 0,
    available_halls: 0,
    total_bookings: 0,
    total_revenue: 0,
    average_hourly_rate: 0,
    occupancy_rate: 0
  });

  // State for new hall form
  const [newHall, setNewHall] = useState<HallFormData>({
    name: '',
    description: '',
    capacity: 10,
    area_sqft: '',
    equipment_included: [],
    hourly_rate: 50,
    daily_rate: '',
    security_deposit: 0,
    location: '',
    rules: '',
    images: [],
    is_available: true
  });

  // State for editing
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [viewingBookings, setViewingBookings] = useState<{
    hall: Hall;
    bookings: Booking[];
  } | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState<boolean>(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Firebase collection references
  const hallsCollectionRef = collection(db, 'halls');
  const bookingsCollectionRef = collection(db, 'bookings');

  // Fetch halls from Firebase
  useEffect(() => {
    fetchHalls();
    fetchBookings();
  }, []);

  // Calculate stats whenever halls or bookings change
  useEffect(() => {
    calculateStats();
  }, [halls, bookings]);

  const fetchHalls = async (): Promise<void> => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(hallsCollectionRef);
      const hallsData: Hall[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          capacity: data.capacity || 0,
          area_sqft: data.area_sqft || 0,
          equipment_included: data.equipment_included || [],
          hourly_rate: data.hourly_rate || 0,
          daily_rate: data.daily_rate || 0,
          security_deposit: data.security_deposit || 0,
          is_available: data.is_available ?? true,
          location: data.location || '',
          rules: data.rules || '',
          images: data.images || [],
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date()
        };
      });
      
      setHalls(hallsData);
      
      // Initialize image indexes
      const initialIndexes: Record<string, number> = {};
      hallsData.forEach(hall => {
        initialIndexes[hall.id] = 0;
      });
      setCurrentImageIndex(initialIndexes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching halls:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (): Promise<void> => {
    try {
      const querySnapshot = await getDocs(bookingsCollectionRef);
      const bookingsData: Booking[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          hall_id: data.hall_id || '',
          hall_name: data.hall_name || '',
          purpose: data.purpose || '',
          customer_name: data.customer_name || '',
          customer_email: data.customer_email || '',
          customer_phone: data.customer_phone || '',
          num_attendees: data.num_attendees || 0,
          start_time: data.start_time?.toDate() || new Date(),
          end_time: data.end_time?.toDate() || new Date(),
          duration_hours: data.duration_hours || 0,
          total_amount: data.total_amount || 0,
          amount_paid: data.amount_paid || 0,
          status: data.status || 'pending',
          payment_status: data.payment_status || 'pending',
          notes: data.notes || '',
          special_requirements: data.special_requirements || [],
          equipment_requested: data.equipment_requested || [],
          setup_time: data.setup_time?.toDate(),
          cleanup_time: data.cleanup_time?.toDate(),
          invoice_id: data.invoice_id || '',
          payment_method: data.payment_method || '',
          transaction_id: data.transaction_id || '',
          created_by: data.created_by || '',
          last_modified_by: data.last_modified_by || '',
          cancellation_reason: data.cancellation_reason || '',
          cancellation_date: data.cancellation_date?.toDate(),
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date()
        };
      });
      
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  // Fetch bookings for a specific hall
  const fetchBookingsForHall = async (hallId: string): Promise<Booking[]> => {
    try {
      const q = query(bookingsCollectionRef, where('hall_id', '==', hallId));
      const querySnapshot = await getDocs(q);
      const bookingsData: Booking[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          hall_id: data.hall_id || '',
          hall_name: data.hall_name || '',
          purpose: data.purpose || '',
          customer_name: data.customer_name || '',
          customer_email: data.customer_email || '',
          customer_phone: data.customer_phone || '',
          num_attendees: data.num_attendees || 0,
          start_time: data.start_time?.toDate() || new Date(),
          end_time: data.end_time?.toDate() || new Date(),
          duration_hours: data.duration_hours || 0,
          total_amount: data.total_amount || 0,
          amount_paid: data.amount_paid || 0,
          status: data.status || 'pending',
          payment_status: data.payment_status || 'pending',
          notes: data.notes || '',
          special_requirements: data.special_requirements || [],
          equipment_requested: data.equipment_requested || [],
          setup_time: data.setup_time?.toDate(),
          cleanup_time: data.cleanup_time?.toDate(),
          invoice_id: data.invoice_id || '',
          payment_method: data.payment_method || '',
          transaction_id: data.transaction_id || '',
          created_by: data.created_by || '',
          last_modified_by: data.last_modified_by || '',
          cancellation_reason: data.cancellation_reason || '',
          cancellation_date: data.cancellation_date?.toDate(),
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date()
        };
      });
      
      return bookingsData;
    } catch (err) {
      console.error('Error fetching bookings:', err);
      return [];
    }
  };

  const calculateStats = (): void => {
    const total_halls = halls.length;
    const available_halls = halls.filter(hall => hall.is_available).length;
    const total_bookings = bookings.length;
    
    const total_revenue = bookings.reduce((sum, booking) => sum + booking.total_amount, 0);
    const average_hourly_rate = halls.length > 0 
      ? halls.reduce((sum, hall) => sum + hall.hourly_rate, 0) / halls.length 
      : 0;
    
    // Calculate occupancy rate (simplified)
    const total_capacity = halls.reduce((sum, hall) => sum + hall.capacity, 0);
    const booked_capacity = bookings.reduce((sum, booking) => sum + booking.num_attendees, 0);
    const occupancy_rate = total_capacity > 0 ? (booked_capacity / total_capacity) * 100 : 0;

    setStats({
      total_halls,
      available_halls,
      total_bookings,
      total_revenue,
      average_hourly_rate,
      occupancy_rate
    });
  };

  // Handle adding a new hall
  const handleAddHall = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      // Prepare data for Firebase
      const hallData = {
        name: newHall.name.trim(),
        description: newHall.description.trim(),
        capacity: newHall.capacity,
        area_sqft: newHall.area_sqft ? parseFloat(newHall.area_sqft) : null,
        equipment_included: newHall.equipment_included.filter(item => item.trim() !== ''),
        hourly_rate: newHall.hourly_rate,
        daily_rate: newHall.daily_rate ? parseFloat(newHall.daily_rate) : null,
        security_deposit: newHall.security_deposit,
        location: newHall.location.trim(),
        rules: newHall.rules.trim(),
        images: newHall.images,
        is_available: newHall.is_available,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      const docRef = await addDoc(hallsCollectionRef, hallData);
      
      // Add the new hall to state with its Firebase ID
      const createdHall: Hall = {
        id: docRef.id,
        ...hallData,
        area_sqft: hallData.area_sqft || 0,
        daily_rate: hallData.daily_rate || 0,
        created_at: hallData.created_at.toDate(),
        updated_at: hallData.updated_at.toDate()
      };
      
      setHalls([...halls, createdHall]);
      
      // Reset form
      setNewHall({
        name: '',
        description: '',
        capacity: 10,
        area_sqft: '',
        equipment_included: [],
        hourly_rate: 50,
        daily_rate: '',
        security_deposit: 0,
        location: '',
        rules: '',
        images: [],
        is_available: true
      });
      
      setShowAddForm(false);
      alert('Hall added successfully!');
    } catch (err) {
      console.error('Error adding hall:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle deleting a hall
  const handleDeleteHall = async (hallId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this hall? This action cannot be undone.')) {
      return;
    }

    try {
      // First, delete associated images from Firebase Storage
      const hallToDelete = halls.find(hall => hall.id === hallId);
      if (hallToDelete?.images) {
        for (const imageUrl of hallToDelete.images) {
          try {
            // Extract path from URL
            const path = decodeURIComponent(imageUrl.split('/o/')[1]?.split('?')[0]);
            if (path) {
              const imageRef = ref(storage, path);
              await deleteObject(imageRef);
            }
          } catch (storageErr) {
            console.warn('Could not delete image from storage:', storageErr);
          }
        }
      }

      // Delete hall document from Firestore
      const hallDocRef = doc(db, 'halls', hallId);
      await deleteDoc(hallDocRef);
      
      // Update local state
      setHalls(halls.filter(hall => hall.id !== hallId));
      alert('Hall deleted successfully!');
    } catch (err) {
      console.error('Error deleting hall:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle toggling hall availability
  const handleToggleAvailability = async (hallId: string, currentStatus: boolean): Promise<void> => {
    try {
      const hallDocRef = doc(db, 'halls', hallId);
      await updateDoc(hallDocRef, {
        is_available: !currentStatus,
        updated_at: Timestamp.now()
      });
      
      // Update local state
      setHalls(halls.map(hall => 
        hall.id === hallId 
          ? { 
              ...hall, 
              is_available: !currentStatus, 
              updated_at: new Date() 
            }
          : hall
      ));
      
      alert(`Hall ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      console.error('Error updating hall status:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle updating a hall
  const handleUpdateHall = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!editingHall) return;
    
    try {
      // Prepare data for Firebase
      const hallData = {
        name: editingHall.name.trim(),
        description: editingHall.description?.trim() || '',
        capacity: editingHall.capacity,
        area_sqft: editingHall.area_sqft || null,
        equipment_included: editingHall.equipment_included.filter(item => item.trim() !== ''),
        hourly_rate: editingHall.hourly_rate,
        daily_rate: editingHall.daily_rate || null,
        security_deposit: editingHall.security_deposit || 0,
        location: editingHall.location?.trim() || '',
        rules: editingHall.rules?.trim() || '',
        images: editingHall.images,
        is_available: editingHall.is_available,
        updated_at: Timestamp.now()
      };

      const hallDocRef = doc(db, 'halls', editingHall.id);
      await updateDoc(hallDocRef, hallData);
      
      // Update local state
      const updatedHall: Hall = {
        ...editingHall,
        ...hallData,
        daily_rate: hallData.daily_rate || 0,
        area_sqft: hallData.area_sqft || 0,
        updated_at: new Date()
      };
      
      setHalls(halls.map(hall => 
        hall.id === editingHall.id ? updatedHall : hall
      ));
      
      setEditingHall(null);
      alert('Hall updated successfully!');
    } catch (err) {
      console.error('Error updating hall:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle image upload to Firebase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, hallId?: string): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const uploadedImageUrls: string[] = [];
      
      for (const file of files) {
        // Create a unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storagePath = hallId ? `halls/${hallId}/${fileName}` : `temp/${fileName}`;
        
        // Create storage reference
        const storageRef = ref(storage, storagePath);
        
        // Upload file
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedImageUrls.push(downloadURL);
        
        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [fileName]: 100
        }));
      }

      // Update state with uploaded image URLs
      if (!hallId) {
        // For new hall form
        setNewHall(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedImageUrls]
        }));
      } else if (editingHall && editingHall.id === hallId) {
        // For editing hall
        setEditingHall(prev => prev ? {
          ...prev,
          images: [...prev.images, ...uploadedImageUrls]
        } : null);
      }
      
      setUploading(false);
      setUploadProgress({});
    } catch (err) {
      console.error('Error uploading images:', err);
      setUploading(false);
      setUploadProgress({});
      alert('Error uploading images. Please try again.');
    }
  };

  // Handle removing an image
  const handleRemoveImage = async (imageUrl: string, imageIndex: number, hallId?: string): Promise<void> => {
    try {
      // Extract path from URL and decode
      const path = decodeURIComponent(imageUrl.split('/o/')[1]?.split('?')[0]);
      
      if (path) {
        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
      }

      // Update local state
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
        } : null);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Error deleting image. It may have already been removed.');
    }
  };

  // Handle adding equipment
  const handleAddEquipment = (equipment: string, hallId?: string): void => {
    if (equipment.trim() === '') return;
    
    if (hallId && editingHall && editingHall.id === hallId) {
      setEditingHall({
        ...editingHall,
        equipment_included: [...editingHall.equipment_included, equipment.trim()]
      });
    } else if (!hallId) {
      setNewHall({
        ...newHall,
        equipment_included: [...newHall.equipment_included, equipment.trim()]
      });
    }
  };

  // Handle removing equipment
  const handleRemoveEquipment = (equipmentIndex: number, hallId?: string): void => {
    if (hallId && editingHall && editingHall.id === hallId) {
      setEditingHall({
        ...editingHall,
        equipment_included: editingHall.equipment_included.filter((_, index) => index !== equipmentIndex)
      });
    } else if (!hallId) {
      setNewHall({
        ...newHall,
        equipment_included: newHall.equipment_included.filter((_, index) => index !== equipmentIndex)
      });
    }
  };

  // Handle viewing bookings for a hall
  const handleViewBookings = async (hall: Hall): Promise<void> => {
    try {
      const hallBookings = await fetchBookingsForHall(hall.id);
      setViewingBookings({
        hall,
        bookings: hallBookings
      });
    } catch (err) {
      alert(`Error loading bookings: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle deleting a booking
  const handleDeleteBooking = async (hallId: string, bookingId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      const bookingDocRef = doc(db, 'bookings', bookingId);
      await deleteDoc(bookingDocRef);
      
      // Update local state
      if (viewingBookings && viewingBookings.hall.id === hallId) {
        setViewingBookings({
          ...viewingBookings,
          bookings: viewingBookings.bookings.filter(b => b.id !== bookingId)
        });
      }
      
      // Also update main bookings state
      setBookings(bookings.filter(b => b.id !== bookingId));
      
      alert('Booking deleted successfully!');
    } catch (err) {
      console.error('Error deleting booking:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Navigation for image carousel
  const nextImage = (hallId: string): void => {
    const hall = halls.find(h => h.id === hallId);
    if (!hall || !hall.images || hall.images.length <= 1) return;
    
    setCurrentImageIndex(prev => ({
      ...prev,
      [hallId]: (prev[hallId] + 1) % hall.images.length
    }));
  };

  const prevImage = (hallId: string): void => {
    const hall = halls.find(h => h.id === hallId);
    if (!hall || !hall.images || hall.images.length <= 1) return;
    
    setCurrentImageIndex(prev => ({
      ...prev,
      [hallId]: (prev[hallId] - 1 + hall.images.length) % hall.images.length
    }));
  };

  // Format date
  const formatDate = (date: Date | Timestamp | undefined): string => {
    if (!date) return 'N/A';
    
    let dateObj: Date;
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: BookingStatus): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status badge color
  const getPaymentStatusBadgeColor = (status: PaymentStatus): string => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      case 'partial':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate revenue from bookings for a specific hall
  const calculateHallRevenue = (bookings: Booking[]): number => {
    return bookings.reduce((total, booking) => total + booking.total_amount, 0);
  };

  // Filter and sort halls
  const filteredAndSortedHalls = halls
    .filter(hall => {
      // Search filter
      if (searchTerm && !hall.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !hall.location?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Availability filter
      if (filterAvailable !== null && hall.is_available !== filterAvailable) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.hourly_rate;
          bValue = b.hourly_rate;
          break;
        case 'capacity':
          aValue = a.capacity;
          bValue = b.capacity;
          break;
        case 'recent':
          aValue = a.created_at instanceof Date ? a.created_at.getTime() : a.created_at;
          bValue = b.created_at instanceof Date ? b.created_at.getTime() : b.created_at;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

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

  if (error) {
    return (
      <div className="min-h-screen bg-background py-20 p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchHalls}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hall Management</h1>
        <p className="text-muted-foreground">
          Manage halls, view bookings, and update hall information
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="text-lg font-semibold mb-2">Total Halls</h3>
          <p className="text-3xl font-bold text-primary">{stats.total_halls}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="text-lg font-semibold mb-2">Available Halls</h3>
          <p className="text-3xl font-bold text-green-600">{stats.available_halls}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="text-lg font-semibold mb-2">Total Bookings</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.total_bookings}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.total_revenue)}</p>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="text-lg font-semibold mb-2">Average Hourly Rate</h3>
          <p className="text-3xl font-bold text-orange-600">{formatCurrency(stats.average_hourly_rate)}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="text-lg font-semibold mb-2">Occupancy Rate</h3>
          <p className="text-3xl font-bold text-cyan-600">{stats.occupancy_rate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search halls by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96 pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterAvailable === null ? 'all' : filterAvailable ? 'available' : 'unavailable'}
              onChange={(e) => {
                const value = e.target.value;
                setFilterAvailable(
                  value === 'all' ? null : 
                  value === 'available' ? true : false
                );
              }}
              className="px-3 py-2 border rounded-md bg-background text-sm"
            >
              <option value="all">All Halls</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-sm"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="capacity">Capacity</option>
              <option value="recent">Most Recent</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border rounded-md hover:bg-muted transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Hall Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Hall
        </button>
      </div>

      {/* Add Hall Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full h-180 overflow-y-auto">
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
                <div className="space-y-4">
                  {/* Hall Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Hall Name *</label>
                    <input
                      type="text"
                      value={newHall.name}
                      onChange={(e) => setNewHall({...newHall, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="Enter hall name (e.g., 3D Printing Innovation Hall)"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newHall.description}
                      onChange={(e) => setNewHall({...newHall, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
                      placeholder="Describe the hall features, facilities, and what makes it special"
                    />
                  </div>

                  {/* Basic Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Capacity *</label>
                      <input
                        type="number"
                        value={newHall.capacity}
                        onChange={(e) => setNewHall({...newHall, capacity: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Enter maximum capacity"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Area (sq ft)</label>
                      <input
                        type="number"
                        value={newHall.area_sqft}
                        onChange={(e) => setNewHall({...newHall, area_sqft: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Enter area in square feet"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Pricing Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Hourly Rate ($) *</label>
                      <input
                        type="number"
                        value={newHall.hourly_rate}
                        onChange={(e) => setNewHall({...newHall, hourly_rate: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Enter hourly rate"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Daily Rate ($)</label>
                      <input
                        type="number"
                        value={newHall.daily_rate}
                        onChange={(e) => setNewHall({...newHall, daily_rate: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Enter daily rate"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Security Deposit ($)</label>
                      <input
                        type="number"
                        value={newHall.security_deposit}
                        onChange={(e) => setNewHall({...newHall, security_deposit: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Enter security deposit"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={newHall.location}
                      onChange={(e) => setNewHall({...newHall, location: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="Enter hall location (e.g., Main Building, Floor 3)"
                    />
                  </div>

                  {/* Rules */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Rules & Terms</label>
                    <textarea
                      value={newHall.rules}
                      onChange={(e) => setNewHall({...newHall, rules: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md bg-background min-h-[80px]"
                      placeholder="Enter terms and conditions, rules for using the hall"
                    />
                  </div>

                  {/* Equipment Included */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Equipment Included</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newHall.equipment_included.map((equipment, index) => (
                        equipment && equipment.trim() !== '' && (
                          <span key={index} className="flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                            {equipment}
                            <button
                              type="button"
                              onClick={() => handleRemoveEquipment(index)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
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
                        placeholder="Add equipment (e.g., 3D Printer, Projector, Whiteboard)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddEquipment(e.target.value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="flex-1 px-3 py-2 border rounded-md bg-background"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling as HTMLInputElement;
                          handleAddEquipment(input.value);
                          input.value = '';
                        }}
                        className="px-3 py-2 border rounded-md hover:bg-muted transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Images Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Hall Images</label>
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
                            onClick={() => handleRemoveImage(img, index)}
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
                            <span>Uploading images...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <label className="flex flex-col items-center justify-center gap-2 px-4 py-4 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm font-medium">Click to upload images</span>
                      <span className="text-xs text-muted-foreground">or drag and drop</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e)}
                        className="hidden"
                        multiple
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: JPG, PNG, WebP. Max 5MB per image.
                    </p>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Adding...
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
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                <div className="space-y-4">
                  {/* Hall Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Hall Name *</label>
                    <input
                      type="text"
                      value={editingHall.name}
                      onChange={(e) => setEditingHall({...editingHall, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="Enter hall name"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={editingHall.description || ''}
                      onChange={(e) => setEditingHall({...editingHall, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
                      placeholder="Describe the hall"
                    />
                  </div>

                  {/* Basic Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Capacity *</label>
                      <input
                        type="number"
                        value={editingHall.capacity}
                        onChange={(e) => setEditingHall({...editingHall, capacity: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Enter capacity"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Area (sq ft)</label>
                      <input
                        type="number"
                        value={editingHall.area_sqft || ''}
                        onChange={(e) => setEditingHall({...editingHall, area_sqft: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Enter area"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Pricing Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Hourly Rate ($) *</label>
                      <input
                        type="number"
                        value={editingHall.hourly_rate}
                        onChange={(e) => setEditingHall({...editingHall, hourly_rate: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Enter hourly rate"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Daily Rate ($)</label>
                      <input
                        type="number"
                        value={editingHall.daily_rate || ''}
                        onChange={(e) => setEditingHall({...editingHall, daily_rate: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Enter daily rate"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Security Deposit ($)</label>
                      <input
                        type="number"
                        value={editingHall.security_deposit || 0}
                        onChange={(e) => setEditingHall({...editingHall, security_deposit: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Enter security deposit"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={editingHall.location || ''}
                      onChange={(e) => setEditingHall({...editingHall, location: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="Enter location"
                    />
                  </div>

                  {/* Rules */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Rules & Terms</label>
                    <textarea
                      value={editingHall.rules || ''}
                      onChange={(e) => setEditingHall({...editingHall, rules: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md bg-background min-h-[80px]"
                      placeholder="Enter rules and terms"
                    />
                  </div>

                  {/* Equipment Included */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Equipment Included</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(editingHall.equipment_included || []).map((equipment, index) => (
                        equipment && equipment.trim() !== '' && (
                          <span key={index} className="flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                            {equipment}
                            <button
                              type="button"
                              title='button'
                              onClick={() => handleRemoveEquipment(index, editingHall.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
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
                        placeholder="Add new equipment"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement; 
                            handleAddEquipment(target.value, editingHall.id);
                            target.value = '';
                                                       
                            
                          }
                        }}
                        className="flex-1 px-3 py-2 border rounded-md bg-background"
                      />
                       <button
                        type="button"
                        onClick={(e) => {
                        const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                        handleAddEquipment(input.value, editingHall.id);
                        input.value = '';
                        }}
                        className="px-3 py-2 border rounded-md hover:bg-muted transition-colors"
                    >
                        Add
                    </button>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Hall Images</label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {(editingHall.images || []).map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Hall image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            title='button'
                            onClick={() => handleRemoveImage(img, index, editingHall.id)}
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
                            <span>Uploading images...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <label className="flex flex-col items-center justify-center gap-2 px-4 py-4 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm font-medium">Click to upload more images</span>
                      <span className="text-xs text-muted-foreground">JPG, PNG, WebP up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, editingHall.id)}
                        className="hidden"
                        multiple
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setEditingHall(null)}
                      className="flex-1 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating...
                        </span>
                      ) : (
                        'Update Hall'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Bookings Modal */}
      {viewingBookings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Bookings for {viewingBookings.hall.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {viewingBookings.bookings.length} booking{viewingBookings.bookings.length !== 1 ? 's' : ''} • 
                    Total Revenue: {formatCurrency(calculateHallRevenue(viewingBookings.bookings))}
                  </p>
                </div>
                <button
                  onClick={() => setViewingBookings(null)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {viewingBookings.bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground">This hall has no upcoming or past bookings.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bookings Table */}
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Booking Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {viewingBookings.bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{booking.purpose}</div>
                              <div className="text-sm text-gray-500">
                                {booking.num_attendees} attendees
                              </div>
                              {booking.notes && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {booking.notes.length > 50 ? `${booking.notes.substring(0, 50)}...` : booking.notes}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                              <div className="text-sm text-gray-500">{booking.customer_email}</div>
                              {booking.customer_phone && (
                                <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(booking.start_time)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.start_time instanceof Date ? 
                                  booking.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                                  new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {booking.end_time instanceof Date ? 
                                  booking.end_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                                  new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Duration: {booking.duration_hours || 
                                  Math.round(
                                    ((booking.end_time instanceof Date ? booking.end_time.getTime() : new Date(booking.end_time).getTime()) - 
                                    (booking.start_time instanceof Date ? booking.start_time.getTime() : new Date(booking.start_time).getTime())) 
                                    / (1000 * 60 * 60)
                                  )} hours
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.status)}`}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusBadgeColor(booking.payment_status)}`}>
                                  {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                                </span>
                              </div>
                              {booking.cancellation_reason && (
                                <div className="text-xs text-red-600 mt-1">
                                  {booking.cancellation_reason}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(booking.total_amount)}
                              </div>
                              <div className="text-sm text-gray-500">
                                Paid: {formatCurrency(booking.amount_paid)}
                              </div>
                              {booking.amount_paid < booking.total_amount && (
                                <div className="text-xs text-red-600">
                                  Balance: {formatCurrency(booking.total_amount - booking.amount_paid)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    // View booking details
                                    console.log('View booking:', booking.id);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBooking(viewingBookings.hall.id, booking.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete booking"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(booking.created_at)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Booking Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{viewingBookings.bookings.length}</div>
                        <div className="text-sm text-gray-500">Total Bookings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(calculateHallRevenue(viewingBookings.bookings))}
                        </div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {viewingBookings.bookings.filter(b => b.status === 'confirmed').length}
                        </div>
                        <div className="text-sm text-gray-500">Confirmed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.round(viewingBookings.bookings.reduce((sum, b) => sum + b.num_attendees, 0) / viewingBookings.bookings.length) || 0}
                        </div>
                        <div className="text-sm text-gray-500">Avg. Attendees</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Halls List */}
      {halls.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <MapPin className="w-12 h-12 text-muted-foreground" />
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
        <div className="space-y-6">
          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredAndSortedHalls.length} of {halls.length} halls
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedHalls.map((hall) => (
              <div key={hall.id} className="bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Hall Header with Status */}
                <div className="flex justify-between items-center p-4 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-3 h-3 rounded-full ${hall.is_available ? 'bg-green-500' : 'bg-red-500'}`}
                      title={hall.is_available ? 'Available' : 'Unavailable'}
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{hall.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>ID: {hall.id.substring(0, 8)}...</span>
                        <span>•</span>
                        <span>Added: {formatDate(hall.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(hall.hourly_rate)}
                      <span className="text-sm font-normal text-muted-foreground">/hour</span>
                    </span>
                    {hall.daily_rate && hall.daily_rate > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(hall.daily_rate)}/day
                      </span>
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
                          onError={(e) => {
                            // Fallback for broken images
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                          }}
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
                        <MapPin className="w-12 h-12 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">No images</span>
                      </div>
                    )}
                  </div>

                  {/* Hall Details */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{hall.capacity} people</div>
                          <div className="text-xs text-muted-foreground">Capacity</div>
                        </div>
                      </div>
                      {hall.area_sqft && hall.area_sqft > 0 && (
                        <div className="flex items-center gap-2">
                          <Ruler className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{hall.area_sqft.toLocaleString()} sq ft</div>
                            <div className="text-xs text-muted-foreground">Area</div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium truncate">{hall.location || 'Not specified'}</div>
                          <div className="text-xs text-muted-foreground">Location</div>
                        </div>
                      </div>
                    </div>

                    {hall.description && (
                      <div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{hall.description}</p>
                      </div>
                    )}

                    {/* Equipment */}
                    {hall.equipment_included && hall.equipment_included.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Equipment Included</h4>
                        <div className="flex flex-wrap gap-1">
                          {hall.equipment_included.slice(0, 3).map((equipment, index) => (
                            <span key={index} className="px-2 py-1 bg-muted rounded text-xs" title={equipment}>
                              {equipment}
                            </span>
                          ))}
                          {hall.equipment_included.length > 3 && (
                            <span 
                              className="px-2 py-1 bg-muted/50 rounded text-xs cursor-help"
                              title={hall.equipment_included.slice(3).join(', ')}
                            >
                              +{hall.equipment_included.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Financial Info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {hall.security_deposit && hall.security_deposit > 0 && (
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span>Deposit: <span className="font-medium">{formatCurrency(hall.security_deposit)}</span></span>
                        </div>
                      )}
                      {hall.daily_rate && hall.daily_rate > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>Daily: <span className="font-medium">{formatCurrency(hall.daily_rate)}</span></span>
                        </div>
                      )}
                    </div>

                    {/* Last Updated */}
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Last updated: {formatDate(hall.updated_at)}</span>
                      <span>{hall.images.length} image{hall.images.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Bookings Summary */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="text-sm font-medium">Bookings</h4>
                          <p className="text-xs text-muted-foreground">
                            View all bookings for this hall
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewBookings(hall)}
                          className="flex items-center gap-1 text-sm text-primary hover:underline transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View All
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t">
                      <button
                        onClick={() => setEditingHall(hall)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        title="Edit hall details"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleAvailability(hall.id, hall.is_available)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          hall.is_available 
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                        title={hall.is_available ? 'Deactivate hall' : 'Activate hall'}
                      >
                        <Power className="w-4 h-4" />
                        {hall.is_available ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteHall(hall.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Delete hall permanently"
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
        </div>
      )}
    </div>
  );
};

export default BookingManagement;