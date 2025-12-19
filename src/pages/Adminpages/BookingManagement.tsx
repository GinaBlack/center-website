import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  X, 
  Check, 
  AlertCircle, 
  Trash2, 
  Search, 
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  User,
  Building,
  DollarSign,
  Loader2,
  Eye,
  FileText,
  Ban,
  CheckCircle,
  XCircle,
  MoreVertical,
  Shield,
  CreditCard,
  FileCheck
} from 'lucide-react';
import { 
  db, 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  Timestamp,
  query,
  where,
  orderBy,
  deleteDoc
} from '../../firebase/firebase_config';

// Type Definitions based on your schema
type BookingType = 'hourly' | 'daily' | 'weekly';
type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rejected';
type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded';

interface Hall {
  id: string;
  name: string;
  location: string;
  hourly_rate: number;
  daily_rate?: number;
  security_deposit: number;
  images: string[];
}

interface Booking {
  id: string;
  booking_id?: string;
  hall_id: string;
  user_id: string;
  booking_type: BookingType;
  start_datetime: Timestamp;
  end_datetime: Timestamp;
  total_hours: number;
  total_amount: number;
  status: BookingStatus;
  purpose: string;
  attendees_count: number;
  special_requests?: string;
  payment_status: PaymentStatus;
  created_at: Timestamp;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  hall_name?: string;
  hall_location?: string;
  hall_hourly_rate?: number;
  security_deposit?: number;
  cancellation_reason?: string;
  admin_notes?: string;
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [hallFilter, setHallFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
    revenue: 0,
    pending_payment: 0
  });

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch halls
        const hallsSnapshot = await getDocs(collection(db, 'rental_halls'));
        const hallsList: Hall[] = [];
        hallsSnapshot.forEach(doc => {
          const hallData = doc.data();
          hallsList.push({ 
            id: doc.id,
            name: hallData.name || 'Unnamed Hall',
            location: hallData.location || '',
            hourly_rate: Number(hallData.hourly_rate) || 0,
            daily_rate: hallData.daily_rate ? Number(hallData.daily_rate) : undefined,
            security_deposit: Number(hallData.security_deposit) || 0,
            images: Array.isArray(hallData.images) ? hallData.images : []
          });
        });
        setHalls(hallsList);
        
        // Fetch bookings with hall details
        const bookingsQuery = query(
          collection(db, 'hall_bookings'),
          orderBy('created_at', 'desc')
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsList: Booking[] = [];
        
        for (const doc of bookingsSnapshot.docs) {
          const bookingData = doc.data();
          
          // Get hall details
          const hall = hallsList.find(h => h.id === bookingData.hall_id);
          
          bookingsList.push({ 
            id: doc.id,
            booking_id: doc.id,
            hall_id: bookingData.hall_id || '',
            user_id: bookingData.user_id || '',
            booking_type: bookingData.booking_type || 'hourly',
            start_datetime: bookingData.start_datetime || Timestamp.now(),
            end_datetime: bookingData.end_datetime || Timestamp.now(),
            total_hours: Number(bookingData.total_hours) || 0,
            total_amount: Number(bookingData.total_amount) || 0,
            status: bookingData.status || 'pending',
            purpose: bookingData.purpose || '',
            attendees_count: Number(bookingData.attendees_count) || 0,
            special_requests: bookingData.special_requests,
            payment_status: bookingData.payment_status || 'pending',
            created_at: bookingData.created_at || Timestamp.now(),
            user_name: bookingData.user_name || 'Unknown User',
            user_email: bookingData.user_email || '',
            user_phone: bookingData.user_phone,
            hall_name: hall?.name || 'Unknown Hall',
            hall_location: hall?.location || '',
            hall_hourly_rate: hall?.hourly_rate || 0,
            security_deposit: hall?.security_deposit || 0,
            cancellation_reason: bookingData.cancellation_reason,
            admin_notes: bookingData.admin_notes
          } as Booking);
        }
        
        setBookings(bookingsList);
        
        // Calculate statistics
        calculateStats(bookingsList);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const calculateStats = (bookingsList: Booking[]) => {
    const stats = {
      total: bookingsList.length,
      pending: bookingsList.filter(b => b.status === 'pending').length,
      confirmed: bookingsList.filter(b => b.status === 'confirmed').length,
      completed: bookingsList.filter(b => b.status === 'completed').length,
      cancelled: bookingsList.filter(b => b.status === 'cancelled').length,
      rejected: bookingsList.filter(b => b.status === 'rejected').length,
      revenue: bookingsList
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0),
      pending_payment: bookingsList.filter(b => b.payment_status === 'pending').length
    };
    setStats(stats);
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus, reason?: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    
    try {
      setUpdating(true);
      const bookingDocRef = doc(db, 'hall_bookings', bookingId);
      const updateData: any = { 
        status: newStatus,
        updated_at: Timestamp.now()
      };
      
      if (newStatus === 'rejected' || newStatus === 'cancelled') {
        updateData.cancellation_reason = reason || 'No reason provided';
      }
      
      await updateDoc(bookingDocRef, updateData);
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, ...updateData }
          : booking
      ));
      
      alert(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (bookingId: string, newPaymentStatus: PaymentStatus) => {
    try {
      setUpdating(true);
      const bookingDocRef = doc(db, 'hall_bookings', bookingId);
      await updateDoc(bookingDocRef, { 
        payment_status: newPaymentStatus,
        updated_at: Timestamp.now()
      });
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, payment_status: newPaymentStatus }
          : booking
      ));
      
      alert(`Payment status updated to ${newPaymentStatus}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async (bookingId: string) => {
    try {
      setUpdating(true);
      const bookingDocRef = doc(db, 'hall_bookings', bookingId);
      await updateDoc(bookingDocRef, { 
        admin_notes: notes,
        updated_at: Timestamp.now()
      });
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, admin_notes: notes }
          : booking
      ));
      
      setEditingNotes(null);
      setNotes('');
      alert('Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;
    
    try {
      setUpdating(true);
      await deleteDoc(doc(db, 'hall_bookings', bookingId));
      
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      alert('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    } finally {
      setUpdating(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchLower) ||
      (booking.hall_name || '').toLowerCase().includes(searchLower) ||
      (booking.user_email || '').toLowerCase().includes(searchLower) ||
      (booking.user_name || '').toLowerCase().includes(searchLower) ||
      (booking.purpose || '').toLowerCase().includes(searchLower);
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    // Hall filter
    const matchesHall = hallFilter === 'all' || booking.hall_id === hallFilter;
    
    // Date filter
    const matchesDate = !dateFilter || 
      booking.start_datetime.toDate().toISOString().split('T')[0] === dateFilter;
    
    // Payment filter
    const matchesPayment = paymentFilter === 'all' || booking.payment_status === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesHall && matchesDate && matchesPayment;
  });

  const formatDateTime = (timestamp: Timestamp) => {
    try {
      const date = timestamp.toDate();
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (timestamp: Timestamp) => {
    try {
      const date = timestamp.toDate();
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <FileCheck className="w-4 h-4" />;
      case 'cancelled': return <Ban className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'no_show': return <X className="w-4 h-4" />;
    }
  };

  const getPaymentColor = (status: PaymentStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'refunded': return 'bg-red-100 text-red-800';
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Booking ID',
      'Hall Name',
      'User Name',
      'User Email',
      'Start Date/Time',
      'End Date/Time',
      'Total Hours',
      'Booking Type',
      'Attendees',
      'Purpose',
      'Status',
      'Total Amount',
      'Security Deposit',
      'Payment Status',
      'Created At',
      'Special Requests',
      'Admin Notes'
    ];
    
    const rows = bookings.map(booking => [
      booking.id,
      booking.hall_name,
      booking.user_name,
      booking.user_email,
      formatDateTime(booking.start_datetime),
      formatDateTime(booking.end_datetime),
      booking.total_hours,
      booking.booking_type,
      booking.attendees_count,
      booking.purpose,
      booking.status,
      `$${booking.total_amount.toFixed(2)}`,
      `$${booking.security_deposit?.toFixed(2) || '0.00'}`,
      booking.payment_status,
      formatDateTime(booking.created_at),
      booking.special_requests || '',
      booking.admin_notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
        <p className="text-muted-foreground">
          Manage all hall bookings, update statuses, and track schedules
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-8 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Revenue</p>
          <p className="text-2xl font-bold text-purple-600">${stats.revenue.toFixed(2)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Pending Payment</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pending_payment}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search bookings by hall, user, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
              <option value="no_show">No Show</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'all')}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Payment</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={hallFilter}
              onChange={(e) => setHallFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Halls</option>
              {halls.map(hall => (
                <option key={hall.id} value={hall.id}>{hall.name}</option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-background"
            />

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No bookings found</h3>
            <p className="text-muted-foreground">Try changing your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Booking ID</th>
                  <th className="text-left p-4 font-medium">Hall</th>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Date & Time</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Payment</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <React.Fragment key={booking.id}>
                    <tr className="border-t hover:bg-muted/30">
                      <td className="p-4">
                        <div className="font-medium text-sm">{booking.id.substring(0, 8)}...</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(booking.created_at)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{booking.hall_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.hall_location}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{booking.user_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.user_email}
                        </div>
                        {booking.user_phone && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.user_phone}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{formatDate(booking.start_datetime)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(booking.start_datetime)} - {formatTime(booking.end_datetime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.total_hours} hours • {booking.booking_type}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-sm ${getPaymentColor(booking.payment_status)}`}>
                          <CreditCard className="w-3 h-3" />
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold">${booking.total_amount.toFixed(2)}</div>
                        {booking.security_deposit > 0 && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Deposit: ${booking.security_deposit.toFixed(2)}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {booking.attendees_count} attendees
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedBooking(
                              expandedBooking === booking.id ? null : booking.id
                            )}
                            className="p-2 hover:bg-muted rounded"
                            title="View details"
                          >
                            {expandedBooking === booking.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                            title="Delete booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {expandedBooking === booking.id && (
                      <tr className="border-t bg-muted/10">
                        <td colSpan={8} className="p-4">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Booking Details */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Booking Details
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm text-muted-foreground">Purpose</label>
                                  <p className="font-medium bg-muted/30 p-2 rounded">{booking.purpose}</p>
                                </div>
                                {booking.special_requests && (
                                  <div>
                                    <label className="text-sm text-muted-foreground">Special Requests</label>
                                    <p className="bg-muted/30 p-2 rounded">{booking.special_requests}</p>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm text-muted-foreground">Booking Type</label>
                                    <p className="font-medium">{booking.booking_type}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-muted-foreground">Total Hours</label>
                                    <p className="font-medium">{booking.total_hours}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Status Management */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Manage Status
                              </h4>
                              
                              {/* Status Actions */}
                              <div className="space-y-2 mb-4">
                                <div className="flex flex-wrap gap-2">
                                  {booking.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                        disabled={updating}
                                        className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center gap-1"
                                      >
                                        <Check className="w-3 h-3" />
                                        Confirm
                                      </button>
                                      <button
                                        onClick={() => {
                                          const reason = prompt('Enter rejection reason:');
                                          if (reason) {
                                            handleStatusChange(booking.id, 'rejected', reason);
                                          }
                                        }}
                                        disabled={updating}
                                        className="px-3 py-1 bg-red-600 text-white rounded text-sm flex items-center gap-1"
                                      >
                                        <X className="w-3 h-3" />
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {booking.status === 'confirmed' && (
                                    <>
                                      <button
                                        onClick={() => handleStatusChange(booking.id, 'completed')}
                                        disabled={updating}
                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                                      >
                                        Mark Complete
                                      </button>
                                      <button
                                        onClick={() => {
                                          const reason = prompt('Enter cancellation reason:');
                                          if (reason) {
                                            handleStatusChange(booking.id, 'cancelled', reason);
                                          }
                                        }}
                                        disabled={updating}
                                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                    <button
                                      onClick={() => {
                                        const reason = prompt('Enter no-show reason:');
                                        if (reason) {
                                          handleStatusChange(booking.id, 'no_show', reason);
                                        }
                                      }}
                                      disabled={updating}
                                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
                                    >
                                      Mark No Show
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Payment Status */}
                              <div className="mb-4">
                                <h5 className="font-medium text-sm mb-2">Payment Status</h5>
                                <div className="flex flex-wrap gap-2">
                                  {['pending', 'paid', 'partial', 'refunded'].map(status => (
                                    <button
                                      key={status}
                                      onClick={() => handlePaymentStatusChange(booking.id, status as PaymentStatus)}
                                      disabled={updating || booking.payment_status === status}
                                      className={`px-3 py-1 rounded text-sm ${
                                        booking.payment_status === status
                                          ? 'bg-primary text-primary-foreground'
                                          : 'hover:bg-muted'
                                      }`}
                                    >
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Status History */}
                              {booking.cancellation_reason && (
                                <div className="p-3 bg-muted/30 rounded">
                                  <h5 className="font-medium text-sm mb-1">Cancellation Reason</h5>
                                  <p className="text-sm">{booking.cancellation_reason}</p>
                                </div>
                              )}
                            </div>

                            {/* Admin Notes */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Admin Notes
                              </h4>
                              
                              <div className="space-y-2">
                                {editingNotes === booking.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={notes}
                                      onChange={(e) => setNotes(e.target.value)}
                                      className="w-full px-3 py-2 border rounded bg-background"
                                      rows={4}
                                      placeholder="Add admin notes..."
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleSaveNotes(booking.id)}
                                        disabled={updating}
                                        className="px-3 py-1 bg-primary text-white rounded text-sm"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingNotes(null);
                                          setNotes('');
                                        }}
                                        className="px-3 py-1 border rounded text-sm"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="bg-muted/30 p-3 rounded min-h-[100px] mb-2">
                                      <p className="text-sm">
                                        {booking.admin_notes || 'No admin notes added.'}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setEditingNotes(booking.id);
                                        setNotes(booking.admin_notes || '');
                                      }}
                                      className="text-sm text-primary hover:underline"
                                    >
                                      {booking.admin_notes ? 'Edit Notes' : 'Add Notes'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredBookings.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded hover:bg-muted">Previous</button>
            <button className="px-3 py-1 border rounded bg-primary text-primary-foreground">1</button>
            <button className="px-3 py-1 border rounded hover:bg-muted">2</button>
            <button className="px-3 py-1 border rounded hover:bg-muted">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;