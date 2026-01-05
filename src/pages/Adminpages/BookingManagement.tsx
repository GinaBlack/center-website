import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  X, 
  Check, 
  AlertCircle, 
  Search, 
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Loader2,
  FileText,
  Ban,
  CheckCircle,
  XCircle,
  CreditCard,
  FileCheck,
  Bell,
  Clock as ClockIcon,
  DollarSign,
  Wallet,
  Receipt,
  Banknote,
  Coins,
  Edit,
  Calculator,
  Save,
  Percent,
  Timer
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
  onSnapshot,
  addDoc
} from '../../firebase/firebase_config';

// Type Definitions
type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded' | 'failed';
type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'card' | 'other';

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
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  attendees: number;
  purpose: string;
  status: BookingStatus;
  totalCost: number;
  estimatedCost: number; // Original estimated cost
  hourlyRate: number; // Hall's hourly rate at booking time
  discount?: number;
  additionalCharges?: number;
  notes?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentAmount?: number; // Amount actually paid
  paymentDate?: Timestamp;
  transactionId?: string;
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
  type: 'status_change' | 'reminder' | 'payment' | 'price_update' | 'cancellation';
  status_before: BookingStatus;
  status_after: BookingStatus;
  message: string;
  created_at: Timestamp;
  sent_via: 'email' | 'in_app' | 'both';
  is_sent: boolean;
}

interface PriceUpdateData {
  totalCost: number;
  discount?: number;
  additionalCharges?: number;
  notes?: string;
}

interface PaymentUpdateData {
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentDate?: Timestamp;
  transactionId?: string;
  notes?: string;
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [hallFilter, setHallFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [priceData, setPriceData] = useState<PriceUpdateData>({
    totalCost: 0,
    discount: 0,
    additionalCharges: 0,
    notes: ''
  });
  const [paymentData, setPaymentData] = useState<PaymentUpdateData>({
    paymentStatus: 'pending',
    paymentAmount: 0,
    paymentMethod: 'cash',
    transactionId: '',
    notes: ''
  });
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
    estimatedRevenue: 0,
    actualRevenue: 0,
    upcoming: 0,
    paid: 0,
    pendingPayment: 0,
    collectedRevenue: 0,
    discountGiven: 0
  });

  // Calculate duration in hours from time strings
  const calculateDuration = (startTime: string, endTime: string): number => {
    try {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      let durationMinutes = endTotalMinutes - startTotalMinutes;
      
      // Handle overnight bookings (though unlikely for hall rentals)
      if (durationMinutes < 0) {
        durationMinutes += 24 * 60;
      }
      
      return durationMinutes / 60; // Convert to hours
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 0;
    }
  };

  // Calculate estimated cost based on duration and hourly rate
  const calculateEstimatedCost = (duration: number, hourlyRate: number): number => {
    return duration * hourlyRate;
  };

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
            const hourlyRate = hall?.hourly_rate || 0;
            
            // Calculate duration from stored times
            const duration = bookingData.duration || 
              calculateDuration(bookingData.startTime, bookingData.endTime);
            
            // Calculate estimated cost if not already stored
            const estimatedCost = bookingData.estimatedCost || 
              calculateEstimatedCost(duration, hourlyRate);
            
            const totalCost = Number(bookingData.totalCost) || estimatedCost;
            
            const startDatetime = new Date(`${bookingData.bookingDate}T${bookingData.startTime}`);
            const endDatetime = new Date(`${bookingData.bookingDate}T${bookingData.endTime}`);
            const now = new Date();
            
            let status: BookingStatus = bookingData.status || 'pending';
            
            // Auto-complete if end date has passed and status is accepted
            if (status === 'accepted' && endDatetime < now) {
              status = 'completed';
              // Auto-update in database
              updateDoc(doc.ref, {
                status: 'completed',
                updatedAt: Timestamp.now()
              });
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
              duration: duration,
              attendees: Number(bookingData.attendees) || 0,
              purpose: bookingData.purpose || '',
              status: status,
              totalCost: totalCost,
              estimatedCost: estimatedCost,
              hourlyRate: hourlyRate,
              discount: Number(bookingData.discount) || 0,
              additionalCharges: Number(bookingData.additionalCharges) || 0,
              notes: bookingData.notes,
              paymentStatus: bookingData.paymentStatus || 'pending',
              paymentMethod: bookingData.paymentMethod,
              paymentAmount: Number(bookingData.paymentAmount) || 0,
              paymentDate: bookingData.paymentDate,
              transactionId: bookingData.transactionId,
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

  // Helper functions for date and time formatting
  const formatDateString = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

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

  // Log notification to Firestore
  const logNotification = async (notificationData: Omit<NotificationLog, 'id' | 'created_at' | 'is_sent'>) => {
    try {
      const notification: Omit<NotificationLog, 'id'> = {
        ...notificationData,
        created_at: Timestamp.now(),
        is_sent: false
      };
      
      const docRef = await addDoc(collection(db, 'notification_logs'), notification);
      
      await updateDoc(doc(db, 'notification_logs', docRef.id), {
        is_sent: true
      });
      
      console.log('Notification logged:', { id: docRef.id, ...notification });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  };

  // Send email notification (simulated)
  const sendEmailNotification = async (userEmail: string, subject: string, message: string) => {
    console.log('Email would be sent:', { to: userEmail, subject, message });
    // In production, integrate with email service like SendGrid, AWS SES, etc.
  };

  // Handle booking status change
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
      
      // Log notification
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
      const emailSubject = `Booking Status Update: ${booking.hallName}`;
      const emailMessage = `Dear ${booking.userName},\n\nYour booking for "${booking.hallName}" has been updated.\n\nStatus: ${newStatus.toUpperCase()}\n${reason ? `Reason: ${reason}\n` : ''}\nBooking Details:\n- Date: ${formatDateString(booking.bookingDate)}\n- Time: ${formatTimeString(booking.startTime)} to ${formatTimeString(booking.endTime)}\n- Duration: ${booking.duration.toFixed(1)} hours\n- Total Amount: ${booking.totalCost.toFixed(0)} XAF\n- Purpose: ${booking.purpose}\n\nThank you for using our service.\n\nBest regards,\nHall Booking Team`;
      
      await sendEmailNotification(booking.userEmail, emailSubject, emailMessage);
      
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

  // Handle price update
  const handlePriceUpdate = async (booking: Booking) => {
    if (!confirm('Update booking price? User will be notified of the change.')) return;
    
    try {
      setUpdating(true);
      const bookingDocRef = doc(db, 'bookings', booking.id);
      
      const updateData: any = {
        totalCost: priceData.totalCost,
        updatedAt: Timestamp.now()
      };
      
      if (priceData.discount !== undefined) {
        updateData.discount = priceData.discount;
      }
      
      if (priceData.additionalCharges !== undefined) {
        updateData.additionalCharges = priceData.additionalCharges;
      }
      
      if (priceData.notes) {
        updateData.notes = priceData.notes;
      }
      
      await updateDoc(bookingDocRef, updateData);
      
      // Log price update notification
      await logNotification({
        booking_id: booking.id,
        user_id: booking.userId,
        user_email: booking.userEmail,
        type: 'price_update',
        status_before: booking.status,
        status_after: booking.status,
        message: `The price for your booking "${booking.hallName}" has been updated. New total: ${priceData.totalCost.toFixed(0)} XAF.${priceData.notes ? ` Notes: ${priceData.notes}` : ''}`,
        sent_via: 'both'
      });
      
      // Send price update email
      const priceChange = priceData.totalCost - booking.totalCost;
      const changeType = priceChange > 0 ? 'increased' : 'decreased';
      const changeAmount = Math.abs(priceChange);
      
      const emailSubject = `Price Update: ${booking.hallName}`;
      const emailMessage = `Dear ${booking.userName},\n\nThe price for your booking has been updated.\n\nPrevious Total: ${booking.totalCost.toFixed(0)} XAF\nNew Total: ${priceData.totalCost.toFixed(0)} XAF\nChange: ${changeType} by ${changeAmount.toFixed(0)} XAF\n${priceData.discount ? `Discount Applied: ${priceData.discount.toFixed(0)} XAF\n` : ''}${priceData.additionalCharges ? `Additional Charges: ${priceData.additionalCharges.toFixed(0)} XAF\n` : ''}${priceData.notes ? `Notes: ${priceData.notes}\n` : ''}\nBooking Details:\n- Hall: ${booking.hallName}\n- Date: ${formatDateString(booking.bookingDate)}\n- Time: ${formatTimeString(booking.startTime)} to ${formatTimeString(booking.endTime)}\n- Duration: ${booking.duration.toFixed(1)} hours\n- Original Estimate: ${booking.estimatedCost.toFixed(0)} XAF\n\nIf you have any questions about this change, please contact us.\n\nBest regards,\nHall Booking Team`;
      
      await sendEmailNotification(booking.userEmail, emailSubject, emailMessage);
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === booking.id 
          ? { 
              ...b, 
              ...updateData,
              totalCost: priceData.totalCost,
              discount: priceData.discount || 0,
              additionalCharges: priceData.additionalCharges || 0,
              notes: priceData.notes || b.notes
            }
          : b
      ));
      
      setEditingPrice(null);
      setPriceData({
        totalCost: 0,
        discount: 0,
        additionalCharges: 0,
        notes: ''
      });
      
      alert('Price updated successfully. User has been notified.');
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price');
    } finally {
      setUpdating(false);
    }
  };

  // Handle payment update
  const handlePaymentUpdate = async (booking: Booking) => {
    if (!confirm('Update payment status?')) return;
    
    try {
      setUpdating(true);
      const bookingDocRef = doc(db, 'bookings', booking.id);
      
      const updateData: any = {
        paymentStatus: paymentData.paymentStatus,
        updatedAt: Timestamp.now()
      };
      
      if (paymentData.paymentAmount && paymentData.paymentAmount > 0) {
        updateData.paymentAmount = paymentData.paymentAmount;
      }
      
      if (paymentData.paymentMethod) {
        updateData.paymentMethod = paymentData.paymentMethod;
      }
      
      if (paymentData.transactionId) {
        updateData.transactionId = paymentData.transactionId;
      }
      
      if (paymentData.paymentStatus === 'paid' && !booking.paymentDate) {
        updateData.paymentDate = Timestamp.now();
      }
      
      await updateDoc(bookingDocRef, updateData);
      
      // Log payment notification
      await logNotification({
        booking_id: booking.id,
        user_id: booking.userId,
        user_email: booking.userEmail,
        type: 'payment',
        status_before: booking.status,
        status_after: booking.status,
        message: `Payment status for your booking "${booking.hallName}" has been updated to ${paymentData.paymentStatus}. Amount: ${paymentData.paymentAmount || booking.totalCost} XAF.${paymentData.notes ? ` Notes: ${paymentData.notes}` : ''}`,
        sent_via: 'both'
      });
      
      // Send payment update email
      const emailSubject = `Payment Update: ${booking.hallName}`;
      const emailMessage = `Dear ${booking.userName},\n\nPayment update for your booking:\n\nStatus: ${paymentData.paymentStatus.toUpperCase()}\nAmount: ${paymentData.paymentAmount || booking.totalCost} XAF\nMethod: ${paymentData.paymentMethod ? paymentData.paymentMethod.replace('_', ' ').toUpperCase() : 'Not specified'}\n${paymentData.transactionId ? `Transaction ID: ${paymentData.transactionId}\n` : ''}${paymentData.notes ? `Notes: ${paymentData.notes}\n` : ''}\nBooking Details:\n- Hall: ${booking.hallName}\n- Date: ${formatDateString(booking.bookingDate)}\n- Time: ${formatTimeString(booking.startTime)} to ${formatTimeString(booking.endTime)}\n- Total Amount: ${booking.totalCost.toFixed(0)} XAF\n\nThank you for your payment.\n\nBest regards,\nHall Booking Team`;
      
      await sendEmailNotification(booking.userEmail, emailSubject, emailMessage);
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === booking.id 
          ? { 
              ...b, 
              ...updateData,
              paymentAmount: paymentData.paymentAmount || b.paymentAmount,
              paymentDate: paymentData.paymentStatus === 'paid' && !b.paymentDate ? Timestamp.now() : b.paymentDate
            }
          : b
      ));
      
      setEditingPayment(null);
      setPaymentData({
        paymentStatus: 'pending',
        paymentAmount: 0,
        paymentMethod: 'cash',
        transactionId: '',
        notes: ''
      });
      
      alert('Payment status updated successfully. User has been notified.');
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  // Calculate statistics
  const calculateStats = (bookingsList: Booking[]) => {
    const now = new Date();
    const upcomingBookings = bookingsList.filter(b => {
      try {
        const startDate = new Date(`${b.bookingDate}T${b.startTime}`);
        return startDate > now && b.status === 'accepted';
      } catch {
        return false;
      }
    }).length;

    const paidBookings = bookingsList.filter(b => b.paymentStatus === 'paid').length;
    const pendingPaymentBookings = bookingsList.filter(b => 
      b.status === 'accepted' && b.paymentStatus === 'pending'
    ).length;
    
    const estimatedRevenue = bookingsList
      .filter(b => b.status === 'accepted' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.estimatedCost || 0), 0);
    
    const actualRevenue = bookingsList
      .filter(b => b.status === 'accepted' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalCost || 0), 0);
    
    const collectedRevenue = bookingsList
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.paymentAmount || b.totalCost || 0), 0);
    
    const discountGiven = bookingsList
      .filter(b => b.discount && b.discount > 0)
      .reduce((sum, b) => sum + (b.discount || 0), 0);

    setStats({
      total: bookingsList.length,
      pending: bookingsList.filter(b => b.status === 'pending').length,
      accepted: bookingsList.filter(b => b.status === 'accepted').length,
      rejected: bookingsList.filter(b => b.status === 'rejected').length,
      cancelled: bookingsList.filter(b => b.status === 'cancelled').length,
      completed: bookingsList.filter(b => b.status === 'completed').length,
      estimatedRevenue: estimatedRevenue,
      actualRevenue: actualRevenue,
      upcoming: upcomingBookings,
      paid: paidBookings,
      pendingPayment: pendingPaymentBookings,
      collectedRevenue: collectedRevenue,
      discountGiven: discountGiven
    });
  };

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
    const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter;
    const matchesHall = hallFilter === 'all' || booking.hallId === hallFilter;
    
    const matchesDate = !dateFilter || 
      booking.bookingDate === dateFilter;
    
    return matchesSearch && matchesStatus && matchesPayment && matchesHall && matchesDate;
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

  // Payment status helpers
  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
    }
  };

  const getPaymentStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <DollarSign className="w-4 h-4" />;
      case 'refunded': return <Wallet className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
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
      'Hourly Rate (XAF)',
      'Estimated Cost (XAF)',
      'Final Cost (XAF)',
      'Discount (XAF)',
      'Additional Charges (XAF)',
      'Attendees',
      'Purpose',
      'Status',
      'Payment Status',
      'Payment Amount (XAF)',
      'Payment Method',
      'Transaction ID',
      'Payment Date',
      'Created At',
      'Last Updated',
      'Notes',
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
      booking.duration.toFixed(2),
      booking.hourlyRate,
      booking.estimatedCost.toFixed(0),
      booking.totalCost.toFixed(0),
      (booking.discount || 0).toFixed(0),
      (booking.additionalCharges || 0).toFixed(0),
      booking.attendees,
      booking.purpose,
      booking.status,
      booking.paymentStatus || 'pending',
      (booking.paymentAmount || 0).toFixed(0),
      booking.paymentMethod || '',
      booking.transactionId || '',
      booking.paymentDate?.toDate().toLocaleString() || '',
      booking.createdAt?.toDate().toLocaleString() || '',
      booking.updatedAt?.toDate().toLocaleString() || '',
      booking.notes || '',
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
        type: 'reminder',
        status_before: booking.status,
        status_after: booking.status,
        message: message,
        sent_via: 'both'
      });
      
      await sendEmailNotification(
        booking.userEmail,
        `Notification: ${booking.hallName}`,
        `Dear ${booking.userName},\n\n${message}\n\nBooking Details:\n- Hall: ${booking.hallName}\n- Date: ${formatDateString(booking.bookingDate)}\n- Time: ${formatTimeString(booking.startTime)} to ${formatTimeString(booking.endTime)}\n- Total Amount: ${booking.totalCost.toFixed(0)} XAF\n\nBest regards,\nHall Booking Team`
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

  // Initialize price data when editing
  const handleEditPrice = (booking: Booking) => {
    setEditingPrice(booking.id);
    setPriceData({
      totalCost: booking.totalCost,
      discount: booking.discount || 0,
      additionalCharges: booking.additionalCharges || 0,
      notes: booking.notes || ''
    });
  };

  // Initialize payment data when editing
  const handleEditPayment = (booking: Booking) => {
    setEditingPayment(booking.id);
    setPaymentData({
      paymentStatus: booking.paymentStatus,
      paymentAmount: booking.paymentAmount || booking.totalCost,
      paymentMethod: booking.paymentMethod || 'cash',
      transactionId: booking.transactionId || '',
      notes: ''
    });
  };

  // Calculate final price based on inputs
  const calculateFinalPrice = () => {
    const discountAmount = priceData.discount || 0;
    const additionalAmount = priceData.additionalCharges || 0;
    // You can add logic here to calculate from base price if needed
    return priceData.totalCost;
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
          Manage all hall bookings, update statuses, pricing, payment, and track schedules
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Bookings</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Pending Payment</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pendingPayment}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Paid</p>
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Actual Revenue</p>
          <p className="text-2xl font-bold text-green-600">{stats.actualRevenue.toFixed(0)} XAF</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Collected</p>
          <p className="text-2xl font-bold text-blue-600">{stats.collectedRevenue.toFixed(0)} XAF</p>
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
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'all')}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending Payment</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="failed">Failed</option>
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
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Payment</th>
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
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{formatDateString(booking.bookingDate)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimeString(booking.startTime)} - {formatTimeString(booking.endTime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.duration.toFixed(1)} hours
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
                          Est: {booking.estimatedCost.toFixed(0)} XAF
                        </div>
                        {booking.discount > 0 && (
                          <div className="text-xs text-green-600">
                            -{booking.discount.toFixed(0)} XAF
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {getPaymentStatusIcon(booking.paymentStatus)}
                            {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                          </span>
                          {booking.paymentAmount > 0 && (
                            <div className="text-xs text-green-600">
                              Paid: {booking.paymentAmount.toFixed(0)} XAF
                            </div>
                          )}
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
                        <td colSpan={8} className="p-4">
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm text-muted-foreground">Duration</label>
                                    <p className="font-medium flex items-center gap-1">
                                      <Timer className="w-4 h-4" />
                                      {booking.duration.toFixed(1)} hours
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-muted-foreground">Attendees</label>
                                    <p className="font-medium">{booking.attendees}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm text-muted-foreground">Hourly Rate</label>
                                    <p className="font-medium">{booking.hourlyRate.toFixed(0)} XAF/hr</p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-muted-foreground">Estimated Cost</label>
                                    <p className="font-medium">{booking.estimatedCost.toFixed(0)} XAF</p>
                                  </div>
                                </div>
                                {booking.specialRequests && (
                                  <div>
                                    <label className="text-sm text-muted-foreground">Special Requests</label>
                                    <p className="bg-muted/30 p-2 rounded text-sm">{booking.specialRequests}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Price Management */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Calculator className="w-5 h-5" />
                                Price Management
                              </h4>
                              
                              {editingPrice === booking.id ? (
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm text-muted-foreground">Final Price (XAF)</label>
                                    <input
                                      type="number"
                                      value={priceData.totalCost}
                                      onChange={(e) => setPriceData({...priceData, totalCost: Number(e.target.value)})}
                                      className="w-full px-3 py-2 border rounded bg-background"
                                      min="0"
                                      step="100"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Original estimate: {booking.estimatedCost.toFixed(0)} XAF
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm text-muted-foreground">Discount (XAF)</label>
                                    <input
                                      type="number"
                                      value={priceData.discount}
                                      onChange={(e) => setPriceData({...priceData, discount: Number(e.target.value)})}
                                      className="w-full px-3 py-2 border rounded bg-background"
                                      min="0"
                                      max={priceData.totalCost}
                                      step="100"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm text-muted-foreground">Additional Charges (XAF)</label>
                                    <input
                                      type="number"
                                      value={priceData.additionalCharges}
                                      onChange={(e) => setPriceData({...priceData, additionalCharges: Number(e.target.value)})}
                                      className="w-full px-3 py-2 border rounded bg-background"
                                      min="0"
                                      step="100"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm text-muted-foreground">Notes</label>
                                    <textarea
                                      value={priceData.notes}
                                      onChange={(e) => setPriceData({...priceData, notes: e.target.value})}
                                      className="w-full px-3 py-2 border rounded bg-background"
                                      rows={2}
                                      placeholder="Explain price changes (optional)"
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2 pt-2">
                                    <button
                                      onClick={() => handlePriceUpdate(booking)}
                                      disabled={updating}
                                      className="flex-1 px-3 py-2 bg-primary text-white rounded text-sm flex items-center justify-center gap-1"
                                    >
                                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                      {updating ? 'Updating...' : 'Update Price'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingPrice(null);
                                        setPriceData({
                                          totalCost: 0,
                                          discount: 0,
                                          additionalCharges: 0,
                                          notes: ''
                                        });
                                      }}
                                      className="px-3 py-2 border rounded text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="p-3 bg-muted/30 rounded">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-medium">Final Price</span>
                                      <button
                                        onClick={() => handleEditPrice(booking)}
                                        className="p-1 hover:bg-muted rounded"
                                        title="Edit price"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <p className="text-2xl font-bold">{booking.totalCost.toFixed(0)} XAF</p>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      <div>
                                        <span className="text-xs text-muted-foreground">Estimate</span>
                                        <p className="text-sm">{booking.estimatedCost.toFixed(0)} XAF</p>
                                      </div>
                                      <div>
                                        <span className="text-xs text-muted-foreground">Hourly Rate</span>
                                        <p className="text-sm">{booking.hourlyRate.toFixed(0)} XAF</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {booking.discount > 0 && (
                                    <div className="p-2 bg-green-50 rounded">
                                      <div className="flex items-center gap-2">
                                        <Percent className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-700">Discount Applied</span>
                                      </div>
                                      <p className="text-lg font-bold text-green-700">-{booking.discount.toFixed(0)} XAF</p>
                                    </div>
                                  )}
                                  
                                  {booking.additionalCharges > 0 && (
                                    <div className="p-2 bg-blue-50 rounded">
                                      <div className="flex items-center gap-2">
                                        <FileInvoice className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-700">Additional Charges</span>
                                      </div>
                                      <p className="text-lg font-bold text-blue-700">+{booking.additionalCharges.toFixed(0)} XAF</p>
                                    </div>
                                  )}
                                  
                                  {booking.notes && (
                                    <div className="p-2 bg-muted/30 rounded">
                                      <span className="text-xs text-muted-foreground">Price Notes</span>
                                      <p className="text-sm">{booking.notes}</p>
                                    </div>
                                  )}
                                  
                                  <button
                                    onClick={() => handleEditPrice(booking)}
                                    className="w-full mt-2 px-3 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90 flex items-center justify-center gap-1"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit Price
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Payment Management */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Payment Management
                              </h4>
                              
                              {editingPayment === booking.id ? (
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm text-muted-foreground">Payment Status</label>
                                    <select
                                      value={paymentData.paymentStatus}
                                      onChange={(e) => setPaymentData({...paymentData, paymentStatus: e.target.value as PaymentStatus})}
                                      className="w-full px-3 py-2 border rounded bg-background"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="paid">Paid</option>
                                      <option value="partial">Partial</option>
                                      <option value="failed">Failed</option>
                                      <option value="refunded">Refunded</option>
                                    </select>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm text-muted-foreground">Payment Amount (XAF)</label>
                                    <input
                                      type="number"
                                      value={paymentData.paymentAmount}
                                      onChange={(e) => setPaymentData({...paymentData, paymentAmount: Number(e.target.value)})}
                                      className="w-full px-3 py-2 border rounded bg-background"
                                      min="0"
                                      max={booking.totalCost}
                                      step="100"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Total due: {booking.totalCost.toFixed(0)} XAF
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm text-muted-foreground">Payment Method</label>
                                    <select
                                      value={paymentData.paymentMethod}
                                      onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value as PaymentMethod})}
                                      className="w-full px-3 py-2 border rounded bg-background"
                                    >
                                      <option value="cash">Cash</option>
                                      <option value="bank_transfer">Bank Transfer</option>
                                      <option value="mobile_money">Mobile Money</option>
                                      <option value="card">Card</option>
                                      <option value="other">Other</option>
                                    </select>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm text-muted-foreground">Transaction ID</label>
                                    <input
                                      type="text"
                                      value={paymentData.transactionId}
                                      onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                                      className="w-full px-3 py-2 border rounded bg-background"
                                      placeholder="Optional transaction ID"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm text-muted-foreground">Payment Notes</label>
                                    <textarea
                                      value={paymentData.notes}
                                      onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                                      className="w-full px-3 py-2 border rounded bg-background"
                                      rows={2}
                                      placeholder="Optional payment notes"
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2 pt-2">
                                    <button
                                      onClick={() => handlePaymentUpdate(booking)}
                                      disabled={updating}
                                      className="flex-1 px-3 py-2 bg-primary text-white rounded text-sm flex items-center justify-center gap-1"
                                    >
                                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                      {updating ? 'Updating...' : 'Update Payment'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingPayment(null);
                                        setPaymentData({
                                          paymentStatus: 'pending',
                                          paymentAmount: 0,
                                          paymentMethod: 'cash',
                                          transactionId: '',
                                          notes: ''
                                        });
                                      }}
                                      className="px-3 py-2 border rounded text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="p-3 bg-muted/30 rounded">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-medium">Payment Status</span>
                                      <button
                                        onClick={() => handleEditPayment(booking)}
                                        className="p-1 hover:bg-muted rounded"
                                        title="Edit payment"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <p className={`inline-flex items-center gap-1 px-3 py-1 rounded ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                      {getPaymentStatusIcon(booking.paymentStatus)}
                                      {booking.paymentStatus.toUpperCase()}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                      <div>
                                        <span className="text-xs text-muted-foreground">Amount Due</span>
                                        <p className="text-sm font-bold">{booking.totalCost.toFixed(0)} XAF</p>
                                      </div>
                                      <div>
                                        <span className="text-xs text-muted-foreground">Amount Paid</span>
                                        <p className="text-sm font-bold text-green-600">{(booking.paymentAmount || 0).toFixed(0)} XAF</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {booking.paymentMethod && (
                                    <div>
                                      <label className="text-sm text-muted-foreground">Payment Method</label>
                                      <p className="font-medium">{booking.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                                    </div>
                                  )}
                                  
                                  {booking.transactionId && (
                                    <div>
                                      <label className="text-sm text-muted-foreground">Transaction ID</label>
                                      <p className="font-mono text-sm bg-muted/30 p-2 rounded">
                                        {booking.transactionId}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {booking.paymentDate && (
                                    <div>
                                      <label className="text-sm text-muted-foreground">Payment Date</label>
                                      <p className="font-medium">
                                        {booking.paymentDate.toDate().toLocaleDateString()}
                                      </p>
                                    </div>
                                  )}
                                  
                                  <button
                                    onClick={() => handleEditPayment(booking)}
                                    className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1"
                                  >
                                    <CreditCard className="w-4 h-4" />
                                    Manage Payment
                                  </button>
                                  
                                  {booking.paymentStatus !== 'paid' && booking.status === 'accepted' && (
                                    <button
                                      onClick={() => sendManualNotification(booking, `Payment Reminder: Your booking for ${booking.hallName} on ${formatDateString(booking.bookingDate)} has a pending payment of ${booking.totalCost.toFixed(0)} XAF. Please complete your payment to confirm your booking.`)}
                                      className="w-full px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 flex items-center justify-center gap-1"
                                    >
                                      <Bell className="w-4 h-4" />
                                      Send Payment Reminder
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Status & Notes Management */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Status & Notes
                              </h4>
                              
                              <div className="space-y-4">
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
                                          onClick={() => {
                                            const reason = prompt('Enter cancellation reason:');
                                            if (reason) {
                                              handleStatusChange(booking, 'cancelled', reason);
                                            }
                                          }}
                                          disabled={updating}
                                          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                        >
                                          Cancel Booking
                                        </button>
                                        <button
                                          onClick={() => handleStatusChange(booking, 'completed')}
                                          disabled={updating}
                                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                                        >
                                          Mark Complete
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm text-muted-foreground mb-2 block">Send Notification</label>
                                  <div className="flex flex-col gap-2">
                                    <button
                                      onClick={() => {
                                        const message = prompt('Enter notification message:');
                                        if (message) {
                                          sendManualNotification(booking, message);
                                        }
                                      }}
                                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm flex items-center gap-1"
                                    >
                                      <Bell className="w-3 h-3" />
                                      Custom Message
                                    </button>
                                    <button
                                      onClick={() => sendManualNotification(booking, `Reminder: Your booking for ${booking.hallName} is scheduled for ${formatDateString(booking.bookingDate)} at ${formatTimeString(booking.startTime)}. Please arrive on time.`)}
                                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                                    >
                                      Send Reminder
                                    </button>
                                  </div>
                                </div>

                                {/* Admin Notes */}
                                <div>
                                  <h5 className="font-medium mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Admin Notes
                                  </h5>
                                  
                                  {editingNotes === booking.id ? (
                                    <div className="space-y-2">
                                      <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full px-3 py-2 border rounded bg-background"
                                        rows={3}
                                        placeholder="Add admin notes..."
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleSaveNotes(booking.id)}
                                          disabled={updating}
                                          className="px-3 py-1 bg-primary text-white rounded text-sm"
                                        >
                                          {updating ? 'Saving...' : 'Save'}
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
                                      <div className="bg-muted/30 p-2 rounded min-h-[60px] mb-2">
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

                                {booking.cancellationReason && (
                                  <div className="p-2 bg-red-50 rounded">
                                    <h5 className="font-medium text-sm mb-1 text-red-800">Cancellation Reason</h5>
                                    <p className="text-sm">{booking.cancellationReason}</p>
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

      {/* Summary */}
      {filteredBookings.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
          <div className="text-sm text-muted-foreground">
            • Prices are calculated from duration and hourly rate
            • Admin can edit final price before payment
            • Users are notified of all changes
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;