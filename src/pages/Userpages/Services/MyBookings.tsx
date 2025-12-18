import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, X, Check, AlertCircle, Trash2, Download, ChevronRight } from 'lucide-react';
import { db, auth, collection, getDocs, query, where, updateDoc, doc, Timestamp } from '../../../firebase/firebase_config';

// Type Definitions
type BookingStatus = 'accepted' | 'pending' | 'cancelled' | 'rejected';

interface Hall {
  name: string;
  image: string;
  capacity: number;
  location: string;
  pricePerHour: number;
}

interface Booking {
  id: string;
  hallId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  attendees: number;
  purpose: string;
  status: BookingStatus;
  hallName: string;
  hallImage: string;
  hallLocation: string;
  hallCapacity: number;
  hallPricePerHour: number;
  createdAt: Timestamp;
  bookingId: string;
  userId: string;
  userEmail: string;
  specialRequirements?: string;
  cancelledAt?: Timestamp;
  cancellationReason?: string;
  rejectedAt?: Timestamp;
  rejectionReason?: string;
  totalCost: number;
}

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user bookings from Firebase
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        
        if (!user) {
          console.log('No user logged in');
          setBookings([]);
          return;
        }

        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid)
        );

        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        const bookingsList: Booking[] = [];
        bookingsSnapshot.forEach((doc) => {
          const bookingData = doc.data();
          bookingsList.push({
            id: doc.id,
            ...bookingData
          } as Booking);
        });

        // Fetch hall details for each booking
        const bookingsWithHallDetails = await Promise.all(
          bookingsList.map(async (booking) => {
            try {
              // If hall details are already stored with booking, use them
              if (booking.hallName && booking.hallImage) {
                return booking;
              }
              
              // Otherwise, fetch hall details from halls collection
              const hallsQuery = query(
                collection(db, 'halls'),
                where('id', '==', booking.hallId)
              );
              const hallSnapshot = await getDocs(hallsQuery);
              
              if (!hallSnapshot.empty) {
                const hallData = hallSnapshot.docs[0].data();
                return {
                  ...booking,
                  hallName: hallData.name || 'Unknown Hall',
                  hallImage: hallData.images?.[0] || '',
                  hallLocation: hallData.location || '',
                  hallCapacity: hallData.capacity || 0,
                  hallPricePerHour: hallData.pricePerHour || 0
                };
              }
              
              return booking;
            } catch (error) {
              console.error('Error fetching hall details:', error);
              return booking;
            }
          })
        );

        setBookings(bookingsWithHallDetails);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        alert('Failed to load bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusConfig = (status: BookingStatus): StatusConfig => {
    const configs: Record<BookingStatus, StatusConfig> = {
      accepted: {
        label: 'Accepted',
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-600',
        borderColor: 'border-green-500/20',
        icon: <Check className="w-4 h-4" />
      },
      pending: {
        label: 'Pending',
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-600',
        borderColor: 'border-yellow-500/20',
        icon: <AlertCircle className="w-4 h-4" />
      },
      cancelled: {
        label: 'Cancelled',
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-500/20',
        icon: <X className="w-4 h-4" />
      },
      rejected: {
        label: 'Rejected',
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-600',
        borderColor: 'border-red-500/20',
        icon: <X className="w-4 h-4" />
      }
    };
    return configs[status];
  };

  const calculateTotalCost = (booking: Booking): number => {
    return booking.totalCost || booking.duration * (booking.hallPricePerHour || 0);
  };

  const formatDate = (dateString: string | Timestamp): string => {
    let date: Date;
    
    if (dateString instanceof Timestamp) {
      date = dateString.toDate();
    } else {
      date = new Date(dateString);
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      const bookingDocRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingDocRef, {
        status: 'cancelled',
        cancelledAt: Timestamp.now(),
        cancellationReason: cancelReason
      });

      // Update local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? {
                ...booking,
                status: 'cancelled',
                cancelledAt: Timestamp.now(),
                cancellationReason: cancelReason
              }
            : booking
        )
      );

      setCancellingBooking(null);
      setCancelReason('');
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const filteredBookings = bookings.filter((booking: Booking): boolean => {
    const now = new Date();
    const bookingDate = new Date(booking.bookingDate);
    
    if (activeFilter === 'upcoming') return bookingDate >= now && booking.status !== 'cancelled';
    if (activeFilter === 'past') return bookingDate < now && booking.status !== 'cancelled';
    if (activeFilter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  const sortBookings = (bookingsArray: Booking[]): Booking[] => {
    return [...bookingsArray].sort((a: Booking, b: Booking): number => {
      const dateA = new Date(a.bookingDate);
      const dateB = new Date(b.bookingDate);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  };

  const toggleExpandBooking = (bookingId: string): void => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const handleDownloadInvoice = (booking: Booking) => {
    // Generate invoice content
    const invoiceContent = `
      Booking Invoice
      =================
      
      Booking ID: ${booking.bookingId}
      Hall: ${booking.hallName}
      Date: ${formatDate(booking.bookingDate)}
      Time: ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}
      Duration: ${booking.duration} hours
      Attendees: ${booking.attendees}
      Purpose: ${booking.purpose}
      Rate: $${booking.hallPricePerHour}/hour
      Total Cost: $${calculateTotalCost(booking)}
      Status: ${booking.status}
      Booked On: ${formatDate(booking.createdAt)}
    `;
    
    // Create and download file
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${booking.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20 p-4 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="py-20 p-4 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">My Bookings</h1>
          <p className="text-muted-foreground">
            Manage your hall reservations, view booking details, and track status
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{bookings.filter(b => new Date(b.bookingDate) >= new Date() && b.status !== 'cancelled').length}</p>
              </div>
              <div className="size-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</p>
              </div>
              <div className="size-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'cancelled').length}</p>
              </div>
              <div className="size-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <X className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            All Bookings
          </button>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === 'upcoming' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveFilter('past')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === 'past' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            Past
          </button>
          <button
            onClick={() => setActiveFilter('cancelled')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === 'cancelled' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            Cancelled
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {sortBookings(filteredBookings).map((booking: Booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const totalCost = calculateTotalCost(booking);
            const isUpcoming = new Date(booking.bookingDate) >= new Date();
            const isExpanded = expandedBooking === booking.id;

            return (
              <div key={booking.id} className="bg-card rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
                {/* Main Booking Card - Horizontal Layout */}
                <div className="flex flex-col md:flex-row">
                  {/* Hall Image */}
                  <div className="md:w-1/4 lg:w-1/5 p-4">
                    <div className="relative h-48 md:h-full rounded-lg overflow-hidden">
                      <img
                        src={booking.hallImage}
                        alt={booking.hallName}
                        className="w-full h-full object-cover"
                      />
                      {/* Hall Name Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <h3 className="text-white font-semibold text-sm">{booking.hallName}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-semibold">{booking.purpose}</h2>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDate(booking.bookingDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{booking.attendees} attendees • {booking.duration} hours</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{booking.hallLocation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Booking ID:</span>
                            <span className="font-mono text-primary">{booking.bookingId}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Total Cost:</span>
                            <span className="font-bold">${totalCost.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => toggleExpandBooking(booking.id)}
                          className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
                        >
                          {isExpanded ? 'Show Less' : 'View Details'}
                          <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {(booking.status === 'accepted' || booking.status === 'pending') && isUpcoming && (
                          <button
                            onClick={() => setCancellingBooking(booking.id)}
                            className="px-4 py-2 text-sm bg-red-500/10 text-red-600 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Cancel Booking
                          </button>
                        )}
                        
                        {booking.status === 'accepted' && (
                          <button 
                            onClick={() => handleDownloadInvoice(booking)}
                            className="px-4 py-2 text-sm bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download Invoice
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t pt-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Booking Details */}
                          <div>
                            <h4 className="font-medium mb-3">Booking Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Booked On:</span>
                                <span>{formatDate(booking.createdAt)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Hall Capacity:</span>
                                <span>{booking.hallCapacity} people</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Rate:</span>
                                <span>${booking.hallPricePerHour}/hour</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration:</span>
                                <span>{booking.duration} hours</span>
                              </div>
                              {booking.specialRequirements && (
                                <div>
                                  <span className="text-muted-foreground">Special Requirements:</span>
                                  <p className="mt-1 text-sm">{booking.specialRequirements}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status History */}
                          <div>
                            <h4 className="font-medium mb-3">Status History</h4>
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <div className={`mt-1 size-2 rounded-full ${booking.status === 'cancelled' ? 'bg-gray-500' : 'bg-green-500'}`} />
                                <div>
                                  <p className="text-sm">Booking created</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(booking.createdAt)}</p>
                                </div>
                              </div>
                              
                              {booking.status === 'cancelled' && booking.cancelledAt && (
                                <div className="flex items-start gap-2">
                                  <div className="mt-1 size-2 rounded-full bg-gray-500" />
                                  <div>
                                    <p className="text-sm">Booking cancelled</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(booking.cancelledAt)}</p>
                                    {booking.cancellationReason && (
                                      <p className="text-xs mt-1">Reason: {booking.cancellationReason}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {booking.status === 'rejected' && booking.rejectedAt && (
                                <div className="flex items-start gap-2">
                                  <div className="mt-1 size-2 rounded-full bg-red-500" />
                                  <div>
                                    <p className="text-sm">Booking rejected</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(booking.rejectedAt)}</p>
                                    {booking.rejectionReason && (
                                      <p className="text-xs mt-1">Reason: {booking.rejectionReason}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredBookings.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No bookings found</h3>
              <p className="text-muted-foreground">
                {activeFilter === 'all' 
                  ? "You haven't made any bookings yet" 
                  : `No ${activeFilter} bookings found`}
              </p>
              {activeFilter !== 'all' && (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View All Bookings
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Cancellation Modal */}
      {cancellingBooking !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cancel Booking</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Reason for cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCancellingBooking(null);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => handleCancelBooking(cancellingBooking)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;