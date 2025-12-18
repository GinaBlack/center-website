import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, X, Check, AlertCircle, Trash2, Download, Printer, ChevronRight } from 'lucide-react';

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
  id: number;
  hallId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  attendees: number;
  purpose: string;
  status: BookingStatus;
  hall: Hall;
  createdAt: string;
  bookingId: string;
  specialRequirements?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

const MyBookingsPage: React.FC = () => {
  // Sample bookings data
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 1,
      hallId: 1,
      bookingDate: '2024-01-15',
      startTime: '09:00',
      endTime: '12:00',
      duration: 3,
      attendees: 25,
      purpose: '3D Printing Workshop for Beginners',
      status: 'accepted',
      hall: {
        name: '3D Printing Innovation Hall',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        capacity: 50,
        location: 'Main Building, Floor 3',
        pricePerHour: 120
      },
      createdAt: '2024-01-10T10:30:00Z',
      bookingId: 'BK-001-2024',
      specialRequirements: 'Need 5 additional chairs and projector setup'
    },
    {
      id: 2,
      hallId: 2,
      bookingDate: '2024-01-20',
      startTime: '14:00',
      endTime: '17:30',
      duration: 3.5,
      attendees: 15,
      purpose: 'Prototype Development Session',
      status: 'pending',
      hall: {
        name: 'Maker Space Workshop',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        capacity: 30,
        location: 'Tech Wing, Floor 1',
        pricePerHour: 85
      },
      createdAt: '2024-01-12T14:45:00Z',
      bookingId: 'BK-002-2024',
      specialRequirements: 'Require 3D printer calibration before session'
    },
    {
      id: 3,
      hallId: 3,
      bookingDate: '2024-01-25',
      startTime: '10:00',
      endTime: '16:00',
      duration: 6,
      attendees: 18,
      purpose: 'Team Design Review Meeting',
      status: 'cancelled',
      hall: {
        name: 'Design Studio Conference Room',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        capacity: 20,
        location: 'Design Center, Floor 2',
        pricePerHour: 65
      },
      createdAt: '2024-01-15T09:20:00Z',
      cancelledAt: '2024-01-18T11:30:00Z',
      bookingId: 'BK-003-2024',
      cancellationReason: 'Schedule conflict with client meeting'
    },
    {
      id: 4,
      hallId: 4,
      bookingDate: '2024-02-01',
      startTime: '13:00',
      endTime: '18:00',
      duration: 5,
      attendees: 10,
      purpose: 'Advanced Materials Testing',
      status: 'rejected',
      hall: {
        name: 'Advanced Materials Lab',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        capacity: 15,
        location: 'Research Building, Floor B1',
        pricePerHour: 150
      },
      createdAt: '2024-01-18T16:30:00Z',
      rejectedAt: '2024-01-19T10:15:00Z',
      bookingId: 'BK-004-2024',
      rejectionReason: 'Lab undergoing maintenance on requested date'
    },
    {
      id: 5,
      hallId: 1,
      bookingDate: '2024-02-10',
      startTime: '08:30',
      endTime: '15:30',
      duration: 7,
      attendees: 40,
      purpose: 'Annual 3D Printing Conference',
      status: 'accepted',
      hall: {
        name: '3D Printing Innovation Hall',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        capacity: 50,
        location: 'Main Building, Floor 3',
        pricePerHour: 120
      },
      createdAt: '2024-01-20T11:15:00Z',
      bookingId: 'BK-005-2024',
      specialRequirements: 'Full day booking with catering arrangements'
    }
  ]);

  const [cancellingBooking, setCancellingBooking] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);

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
    return booking.hall.pricePerHour * booking.duration;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
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

  const handleCancelBooking = (bookingId: number): void => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === bookingId
          ? {
              ...booking,
              status: 'cancelled',
              cancelledAt: new Date().toISOString(),
              cancellationReason: cancelReason
            }
          : booking
      )
    );

    setCancellingBooking(null);
    setCancelReason('');
    alert('Booking cancelled successfully');
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
      return dateA.getTime() - dateB.getTime();
    });
  };

  const toggleExpandBooking = (bookingId: number): void => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

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
              <div className="size-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
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
                        src={booking.hall.image}
                        alt={booking.hall.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Hall Name Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <h3 className="text-white font-semibold text-sm">{booking.hall.name}</h3>
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
                            <span>{booking.hall.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Booking ID:</span>
                            <span className="font-mono text-primary">{booking.bookingId}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Total Cost:</span>
                            <span className="font-bold">${totalCost}</span>
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
                          <button className="px-4 py-2 text-sm bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2">
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
                                <span>{booking.hall.capacity} people</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Rate:</span>
                                <span>${booking.hall.pricePerHour}/hour</span>
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

          {filteredBookings.length === 0 && (
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

export default MyBookingsPage;