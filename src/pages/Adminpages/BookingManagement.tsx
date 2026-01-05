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
  Loader2,
  Eye,
  FileText,
  Ban,
  CheckCircle,
  XCircle,
  Shield,
  CreditCard,
  FileCheck,
  Bell,
  Clock as ClockIcon,
  CalendarDays,
  Mail as MailIcon,
  MessageSquare
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
  deleteDoc,
  onSnapshot,
  addDoc,
  serverTimestamp
} from '../../firebase/firebase_config';

// Type Definitions
type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded';

interface Hall {
  id: string;
  name: string;
  location: string;
  hourly_rate: number;
  images: string[];
  is_available: boolean;
}

interface Booking {
  id: string;
  bookingId: string;
  hallId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  bookingDate: string; // This is stored as string in BookHall
  startTime: string;
  endTime: string;
  duration: number;
  attendees: number;
  purpose: string;
  status: BookingStatus;
  totalCost: number;
  paymentStatus?: PaymentStatus;
  specialRequests?: string;
  adminNotes?: string;
  cancellationReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  hallName: string;
  hallLocation: string;
  isNotified?: boolean;
}

interface NotificationLog {
  id: string;
  booking_id: string;
  user_id: string;
  user_email: string;
  type: 'status_change' | 'reminder' | 'payment' | 'cancellation';
  status_before: BookingStatus;
  status_after: BookingStatus;
  message: string;
  created_at: Timestamp;
  sent_via: 'email' | 'in_app' | 'both';
  is_sent: boolean;
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [hallFilter, setHallFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
    revenue: 0,
    upcoming: 0
  });

  // Fetch halls and set up real-time listener for bookings
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const hallsSnapshot = await getDocs(collection(db, 'rental_halls'));
        const hallsList: Hall[] = [];
        hallsSnapshot.forEach(doc => {
          const hallData = doc.data();
          hallsList.push({ 
            id: doc.id,
            name: hallData.name || 'Unnamed Hall',
            location: hallData.location || '',
            hourly_rate: Number(hallData.hourly_rate) || 0,
            images: Array.isArray(hallData.images) ? hallData.images : [],
            is_available: hallData.is_available !== false
          });
        });
        setHalls(hallsList);
        
        // Set up real-time listener for bookings
        const bookingsQuery = query(
          collection(db, 'bookings'),
          orderBy('createdAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
          const bookingsList: Booking[] = [];
          
          snapshot.forEach((doc) => {
            const bookingData = doc.data();
            const hall = hallsList.find(h => h.id === bookingData.hallId);
            
            // Create Timestamps from stored data
            const startDatetime = new Date(`${bookingData.bookingDate}T${bookingData.startTime}`);
            const endDatetime = new Date(`${bookingData.bookingDate}T${bookingData.endTime}`);
            const now = new Date();
            
            let status: BookingStatus = bookingData.status || 'pending';
            
            // Auto-complete if end date has passed and status is accepted
            if (status === 'accepted' && endDatetime < now) {
              status = 'completed';
              // Note: In real implementation, you'd update this in Firestore
            }
            
            bookingsList.push({
              id: doc.id,
              bookingId: bookingData.bookingId || doc.id,
              hallId: bookingData.hallId || '',
              userId: bookingData.userId || '',
              userName: bookingData.userName || bookingData.userEmail?.split('@')[0] || 'Unknown',
              userEmail: bookingData.userEmail || '',
              userPhone: bookingData.userPhone,
              bookingDate: bookingData.bookingDate || '',
              startTime: bookingData.startTime || '',
              endTime: bookingData.endTime || '',
              duration: Number(bookingData.duration) || 0,
              attendees: Number(bookingData.attendees) || 0,
              purpose: bookingData.purpose || '',
              status: status,
              totalCost: Number(bookingData.totalCost) || 0,
              paymentStatus: bookingData.paymentStatus || 'pending',
              specialRequests: bookingData.specialRequests,
              adminNotes: bookingData.adminNotes,
              cancellationReason: bookingData.cancellationReason,
              createdAt: bookingData.createdAt || Timestamp.now(),
              updatedAt: bookingData.updatedAt || Timestamp.now(),
              hallName: hall?.name || 'Unknown Hall',
              hallLocation: hall?.location || '',
              isNotified: bookingData.isNotified || false
            });
          });
          
          setBookings(bookingsList);
          calculateStats(bookingsList);
          setLoading(false);
        }, (error) => {
          console.error('Error listening to bookings:', error);
          setLoading(false);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
        return () => {};
      }
    };
    
    const unsubscribe = fetchHalls();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Helper function to get date from booking
  const getBookingDate = (booking: Booking): Date => {
    return new Date(`${booking.bookingDate}T${booking.startTime}`);
  };

  // Helper function to get end date from booking
  const getBookingEndDate = (booking: Booking): Date => {
    return new Date(`${booking.bookingDate}T${booking.endTime}`);
  };

  // Format date string
  const formatDateString = (dateStr: string, timeStr?: string): string => {
    try {
      const date = timeStr ? new Date(`${dateStr}T${timeStr}`) : new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format time string
  const formatTimeString = (timeStr: string): string => {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return 'Invalid time';
    }
  };

  // Format DateTime
  const formatDateTime = (booking: Booking): string => {
    return `${formatDateString(booking.bookingDate)} ${formatTimeString(booking.startTime)}`;
  };

  // Format date for display
  const formatDate = (booking: Booking): string => {
    return formatDateString(booking.bookingDate);
  };

  // Format time for display
  const formatTime = (booking: Booking): string => {
    return `${formatTimeString(booking.startTime)} - ${formatTimeString(booking.endTime)}`;
  };

  // Log notification to Firestore
  const logNotification = async (notificationData: Omit<NotificationLog, 'id' | 'created_at' | 'is_sent'>) => {
    try {
      const notification: Omit<NotificationLog, 'id'> = {
        ...notificationData,
        created_at: Timestamp.now(),
        is_sent: false
      };
      
      const docRef = await addDoc(collection(db, 'notification_logs'), notification);
      
      // Update notification as sent (simulated)
      await updateDoc(doc(db, 'notification_logs', docRef.id), {
        is_sent: true
      });
      
      console.log('Notification logged:', { id: docRef.id, ...notification });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  };

  // Send email notification (placeholder for real email service)
  const sendEmailNotification = async (userEmail: string, subject: string, message: string) => {
    console.log('Email would be sent:', { to: userEmail, subject, message });
  };

  // Handle status change with notifications
  const handleStatusChange = async (booking: Booking, newStatus: BookingStatus, reason?: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    
    try {
      setUpdating(true);
      const bookingDocRef = doc(db, 'bookings', booking.id);
      
      const updateData: any = { 
        status: newStatus,
        updatedAt: Timestamp.now()
      };
      
      if (reason) {
        updateData.cancellationReason = reason;
      }
      
      await updateDoc(bookingDocRef, updateData);
      
      // Log the notification
      await logNotification({
        booking_id: booking.id,
        user_id: booking.userId,
        user_email: booking.userEmail,
        type: 'status_change',
        status_before: booking.status,
        status_after: newStatus,
        message: `Your booking for ${booking.hallName} has been ${newStatus}.${reason ? ` Reason: ${reason}` : ''}`,
        sent_via: 'both'
      });
      
      // Send email notification
      await sendEmailNotification(
        booking.userEmail,
        `Booking Status Update: ${booking.hallName}`,
        `Dear ${booking.userName},\n\nYour booking for "${booking.hallName}" on ${formatDateString(booking.bookingDate)} has been ${newStatus}.\n${reason ? `Reason: ${reason}\n` : ''}\nBooking Details:\n- Date: ${formatDateString(booking.bookingDate)}\n- Time: ${formatTimeString(booking.startTime)} to ${formatTimeString(booking.endTime)}\n- Purpose: ${booking.purpose}\n\nThank you for using our service.\n\nBest regards,\nHall Booking Team`
      );
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === booking.id 
          ? { ...b, ...updateData, status: newStatus }
          : b
      ));
      
      alert(`Booking status updated to ${newStatus}. User has been notified.`);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    } finally {
      setUpdating(false);
    }
  };

  // Handle user cancellation (simulated webhook or user action)
  const handleUserCancellation = async (bookingId: string, reason: string) => {
    try {
      setUpdating(true);
      const bookingDocRef = doc(db, 'bookings', bookingId);
      
      await updateDoc(bookingDocRef, { 
        status: 'cancelled',
        cancellationReason: reason,
        updatedAt: Timestamp.now()
      });
      
      // Find booking for notification
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await logNotification({
          booking_id: booking.id,
          user_id: booking.userId,
          user_email: booking.userEmail,
          type: 'cancellation',
          status_before: booking.status,
          status_after: 'cancelled',
          message: `You have cancelled your booking for ${booking.hallName}. Reason: ${reason}`,
          sent_via: 'both'
        });
      }
      
      setBookings(prev => prev.map(b => 
        b.id === bookingId 
          ? { ...b, status: 'cancelled', cancellationReason: reason }
          : b
      ));
      
      alert('Booking cancelled. User has been notified.');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    } finally {
      setUpdating(false);
    }
  };

  // Calculate statistics
  const calculateStats = (bookingsList: Booking[]) => {
    const now = new Date();
    const upcomingBookings = bookingsList.filter(b => {
      try {
        const startDate = getBookingDate(b);
        return startDate > now && b.status === 'accepted';
      } catch {
        return false;
      }
    }).length;

    setStats({
      total: bookingsList.length,
      pending: bookingsList.filter(b => b.status === 'pending').length,
      accepted: bookingsList.filter(b => b.status === 'accepted').length,
      rejected: bookingsList.filter(b => b.status === 'rejected').length,
      cancelled: bookingsList.filter(b => b.status === 'cancelled').length,
      completed: bookingsList.filter(b => b.status === 'completed').length,
      revenue: bookingsList
        .filter(b => b.status === 'accepted' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalCost || 0), 0),
      upcoming: upcomingBookings
    });
  };

  // Check for bookings that need auto-completion
  useEffect(() => {
    const checkAutoComplete = () => {
      const now = new Date();
      
      bookings.forEach(async (booking) => {
        if (booking.status === 'accepted') {
          try {
            const endDate = getBookingEndDate(booking);
            if (endDate < now) {
              // Auto-complete
              const bookingDocRef = doc(db, 'bookings', booking.id);
              await updateDoc(bookingDocRef, {
                status: 'completed',
                updatedAt: Timestamp.now()
              });
              
              // Log notification
              await logNotification({
                booking_id: booking.id,
                user_id: booking.userId,
                user_email: booking.userEmail,
                type: 'status_change',
                status_before: 'accepted',
                status_after: 'completed',
                message: `Your booking for ${booking.hallName} has been automatically marked as completed.`,
                sent_via: 'both'
              });
              
              // Send completion email
              await sendEmailNotification(
                booking.userEmail,
                `Booking Completed: ${booking.hallName}`,
                `Dear ${booking.userName},\n\nYour booking for "${booking.hallName}" has been marked as completed. We hope you had a great experience!\n\nBooking Details:\n- Date: ${formatDateString(booking.bookingDate)}\n- Time: ${formatTimeString(booking.startTime)} to ${formatTimeString(booking.endTime)}\n- Purpose: ${booking.purpose}\n\nThank you for choosing our service!\n\nBest regards,\nHall Booking Team`
              );
              
              // Update local state
              setBookings(prev => prev.map(b => 
                b.id === booking.id 
                  ? { ...b, status: 'completed' }
                  : b
              ));
            }
          } catch (error) {
            console.error('Error auto-completing booking:', error);
          }
        }
      });
    };
    
    // Check every minute
    const interval = setInterval(checkAutoComplete, 60000);
    return () => clearInterval(interval);
  }, [bookings]);

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchLower) ||
      booking.bookingId?.toLowerCase().includes(searchLower) ||
      booking.hallName.toLowerCase().includes(searchLower) ||
      booking.userEmail.toLowerCase().includes(searchLower) ||
      booking.userName.toLowerCase().includes(searchLower) ||
      booking.purpose.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesHall = hallFilter === 'all' || booking.hallId === hallFilter;
    
    const matchesDate = !dateFilter || 
      booking.bookingDate === dateFilter;
    
    return matchesSearch && matchesStatus && matchesHall && matchesDate;
  });

  // Status helpers
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <FileCheck className="w-4 h-4" />;
      case 'cancelled': return <Ban className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Booking ID',
      'Booking Reference',
      'Hall Name',
      'User Name',
      'User Email',
      'Booking Date',
      'Start Time',
      'End Time',
      'Duration (hours)',
      'Attendees',
      'Purpose',
      'Status',
      'Total Amount (XAF)',
      'Payment Status',
      'Created At',
      'Last Updated',
      'Special Requests',
      'Admin Notes',
      'Cancellation Reason'
    ];
    
    const rows = bookings.map(booking => [
      booking.id,
      booking.bookingId || '',
      booking.hallName,
      booking.userName,
      booking.userEmail,
      booking.bookingDate,
      booking.startTime,
      booking.endTime,
      booking.duration,
      booking.attendees,
      booking.purpose,
      booking.status,
      booking.totalCost,
      booking.paymentStatus || 'pending',
      booking.createdAt?.toDate().toLocaleString() || '',
      booking.updatedAt?.toDate().toLocaleString() || '',
      booking.specialRequests || '',
      booking.adminNotes || '',
      booking.cancellationReason || ''
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

  // Send manual notification
  const sendManualNotification = async (booking: Booking, message: string) => {
    try {
      await logNotification({
        booking_id: booking.id,
        user_id: booking.userId,
        user_email: booking.userEmail,
        type: 'status_change',
        status_before: booking.status,
        status_after: booking.status,
        message: message,
        sent_via: 'both'
      });
      
      await sendEmailNotification(
        booking.userEmail,
        `Update: ${booking.hallName}`,
        `Dear ${booking.userName},\n\n${message}\n\nBooking Details:\n- Hall: ${booking.hallName}\n- Date: ${formatDateString(booking.bookingDate)}\n- Time: ${formatTimeString(booking.startTime)} to ${formatTimeString(booking.endTime)}\n\nBest regards,\nHall Booking Team`
      );
      
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    }
  };

  // Update admin notes
  const handleSaveNotes = async (bookingId: string) => {
    try {
      setUpdating(true);
      const bookingDocRef = doc(db, 'bookings', bookingId);
      
      await updateDoc(bookingDocRef, {
        adminNotes: notes,
        updatedAt: Timestamp.now()
      });
      
      setBookings(prev => prev.map(b => 
        b.id === bookingId 
          ? { ...b, adminNotes: notes }
          : b
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
        <p className="text-muted-foreground">
          Manage all hall bookings, update statuses, and track schedules
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-8 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Bookings</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Accepted</p>
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
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
          <p className="text-2xl font-bold text-green-600">{stats.revenue.toFixed(0)} XAF</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
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
                          Ref: {booking.bookingId || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {booking.createdAt?.toDate().toLocaleDateString() || 'Unknown'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{booking.hallName}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.hallLocation}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{booking.userName}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.userEmail}
                        </div>
                        {booking.userPhone && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.userPhone}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{formatDateString(booking.bookingDate)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimeString(booking.startTime)} - {formatTimeString(booking.endTime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.duration} hours • {booking.attendees} attendees
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold">{booking.totalCost.toFixed(0)} XAF</div>
                        <div className="text-xs text-muted-foreground">
                          Payment: {booking.paymentStatus || 'pending'}
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
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {expandedBooking === booking.id && (
                      <tr className="border-t bg-muted/10">
                        <td colSpan={7} className="p-4">
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
                                {booking.specialRequests && (
                                  <div>
                                    <label className="text-sm text-muted-foreground">Special Requests</label>
                                    <p className="bg-muted/30 p-2 rounded">{booking.specialRequests}</p>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm text-muted-foreground">Total Hours</label>
                                    <p className="font-medium">{booking.duration}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-muted-foreground">Attendees</label>
                                    <p className="font-medium">{booking.attendees}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">Created</label>
                                  <p className="font-medium">
                                    {booking.createdAt?.toDate().toLocaleString() || 'Unknown'}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">Last Updated</label>
                                  <p className="font-medium">
                                    {booking.updatedAt?.toDate().toLocaleString() || 'Unknown'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Status Management */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Manage Status
                              </h4>
                              
                              <div className="space-y-3">
                                {/* Status Actions */}
                                <div>
                                  <label className="text-sm text-muted-foreground mb-2 block">Change Status</label>
                                  <div className="flex flex-wrap gap-2">
                                    {booking.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => handleStatusChange(booking, 'accepted')}
                                          disabled={updating}
                                          className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center gap-1"
                                        >
                                          <Check className="w-3 h-3" />
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => {
                                            const reason = prompt('Enter rejection reason:');
                                            if (reason) {
                                              handleStatusChange(booking, 'rejected', reason);
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
                                    {booking.status === 'accepted' && (
                                      <>
                                        <button
                                          onClick={() => handleStatusChange(booking, 'cancelled', 'Admin cancellation')}
                                          disabled={updating}
                                          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                        >
                                          Cancel (Admin)
                                        </button>
                                        <button
                                          onClick={() => {
                                            const reason = prompt('Enter cancellation reason for user:');
                                            if (reason) {
                                              handleUserCancellation(booking.id, reason);
                                            }
                                          }}
                                          disabled={updating}
                                          className="px-3 py-1 bg-orange-600 text-white rounded text-sm"
                                        >
                                          User Cancels
                                        </button>
                                      </>
                                    )}
                                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                      <button
                                        onClick={() => handleStatusChange(booking, 'completed')}
                                        disabled={updating}
                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                                      >
                                        Mark Complete
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Manual Notification */}
                                <div>
                                  <label className="text-sm text-muted-foreground mb-2 block">Send Notification</label>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        const message = prompt('Enter notification message:');
                                        if (message) {
                                          sendManualNotification(booking, message);
                                        }
                                      }}
                                      disabled={updating}
                                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm flex items-center gap-1"
                                    >
                                      <Bell className="w-3 h-3" />
                                      Send Message
                                    </button>
                                    <button
                                      onClick={() => sendManualNotification(booking, `Reminder: Your booking for ${booking.hallName} is scheduled for ${formatDateString(booking.bookingDate)}`)}
                                      disabled={updating}
                                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                                    >
                                      Send Reminder
                                    </button>
                                  </div>
                                </div>

                                {/* Cancellation Reason */}
                                {booking.cancellationReason && (
                                  <div className="p-3 bg-muted/30 rounded">
                                    <h5 className="font-medium text-sm mb-1">Cancellation Reason</h5>
                                    <p className="text-sm">{booking.cancellationReason}</p>
                                  </div>
                                )}
                              </div>
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
                                        {booking.adminNotes || 'No admin notes added.'}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setEditingNotes(booking.id);
                                        setNotes(booking.adminNotes || '');
                                      }}
                                      className="text-sm text-primary hover:underline"
                                    >
                                      {booking.adminNotes ? 'Edit Notes' : 'Add Notes'}
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
          <div className="text-sm text-muted-foreground">
            Auto-completion runs every minute • Notifications are logged and emailed
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;