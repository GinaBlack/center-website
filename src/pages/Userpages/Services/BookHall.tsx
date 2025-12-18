import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { db, auth, collection, addDoc, getDocs, updateDoc, doc, query, where, Timestamp } from '../../../firebase/firebase_config';

// Interface for Hall type
interface Hall {
  id: string;
  name: string;
  description: string;
  capacity: number;
  location: string;
  images: string[];
  amenities: string[];
  pricePerHour: number;
  isAvailable: boolean;
  bookedDates: string[];
}

// Interface for Booking Data
interface BookingData {
  hallId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  purpose: string;
  userId?: string;
}

const BookHall = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    hallId: null,
    date: '',
    startTime: '',
    endTime: '',
    attendees: 1,
    purpose: ''
  });
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch halls from Firebase
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        const hallsCollection = collection(db, 'halls');
        const hallSnapshot = await getDocs(hallsCollection);
        
        const hallsList: Hall[] = [];
        hallSnapshot.forEach((doc) => {
          const hallData = doc.data();
          hallsList.push({
            id: doc.id,
            ...hallData
          } as Hall);
        });
        
        setHalls(hallsList);
        
        // Initialize current image index for each hall
        const initialIndexes: Record<string, number> = {};
        hallsList.forEach(hall => {
          initialIndexes[hall.id] = 0;
        });
        setCurrentImageIndex(initialIndexes);
      } catch (error) {
        console.error('Error fetching halls:', error);
        alert('Failed to load halls. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const nextImage = (hallId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const hall = halls.find(h => h.id === hallId);
    if (!hall) return;
    
    setCurrentImageIndex(prev => ({
      ...prev,
      [hallId]: (prev[hallId] + 1) % hall.images.length
    }));
  };

  const prevImage = (hallId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const hall = halls.find(h => h.id === hallId);
    if (!hall) return;
    
    setCurrentImageIndex(prev => ({
      ...prev,
      [hallId]: (prev[hallId] - 1 + hall.images.length) % hall.images.length
    }));
  };

  const handleRentHall = (hall: Hall) => {
    setSelectedHall(hall);
    setBookingData({
      hallId: hall.id,
      date: '',
      startTime: '',
      endTime: '',
      attendees: 1,
      purpose: ''
    });
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedHall || !bookingData.date || !bookingData.startTime || !bookingData.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const user = auth.currentUser;
      
      if (!user) {
        alert('Please login to make a booking');
        return;
      }

      // Calculate duration
      const start = new Date(`${bookingData.date}T${bookingData.startTime}`);
      const end = new Date(`${bookingData.date}T${bookingData.endTime}`);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // in hours

      // Create booking object
      const newBooking = {
        hallId: selectedHall.id,
        hallName: selectedHall.name,
        userId: user.uid,
        userEmail: user.email,
        bookingDate: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        duration: duration,
        attendees: bookingData.attendees,
        purpose: bookingData.purpose,
        status: 'pending',
        createdAt: Timestamp.now(),
        totalCost: selectedHall.pricePerHour * duration,
        bookingId: `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      // Add booking to Firebase
      const bookingsCollection = collection(db, 'bookings');
      await addDoc(bookingsCollection, newBooking);

      // Update hall's booked dates in Firebase
      const hallDocRef = doc(db, 'halls', selectedHall.id);
      const updatedBookedDates = [...selectedHall.bookedDates, bookingData.date];
      await updateDoc(hallDocRef, {
        bookedDates: updatedBookedDates
      });

      // Update local state
      const updatedHalls = halls.map(hall => {
        if (hall.id === selectedHall.id) {
          return {
            ...hall,
            bookedDates: updatedBookedDates
          };
        }
        return hall;
      });
      
      setHalls(updatedHalls);
      setShowBookingForm(false);
      setSelectedHall(null);
      
      alert(`Successfully booked ${selectedHall.name} for ${bookingData.date}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateChange = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setBookingData(prev => ({ ...prev, date: formattedDate }));
  };

  const isDateDisabled = (date: Date, hall: Hall | null) => {
    if (!hall) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable already booked dates
    const dateStr = date.toISOString().split('T')[0];
    return hall.bookedDates.includes(dateStr);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: Date[] = [];
    
    // Previous month's days
    for (let i = 0; i < startingDay; i++) {
      const date = new Date(year, month, -i);
      days.unshift(date);
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Next month's days to complete grid
    while (days.length % 7 !== 0) {
      const lastDate = days[days.length - 1];
      days.push(new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1));
    }
    
    return (
      <div className="bg-background rounded-lg border p-4">
        <div className="flex justify-between items-center mb-4">
          <button
          title='button'
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-muted rounded-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="font-medium">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
          title='button'
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-muted rounded-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm text-muted-foreground font-medium">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === month;
            const isDisabled = isDateDisabled(date, selectedHall);
            const isSelected = bookingData.date === date.toISOString().split('T')[0];
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => isCurrentMonth && !isDisabled && handleDateChange(date)}
                disabled={isDisabled}
                className={`
                  h-8 rounded-md text-sm transition-colors
                  ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                  ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted'}
                  ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                  ${isToday && !isSelected ? 'border border-primary' : ''}
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading halls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20 p-8">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Book a Hall</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Reserve our state-of-the-art 3D printing facilities for workshops, events, or projects. 
          Choose from various specialized halls equipped with the latest technology.
        </p>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedHall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Book {selectedHall.name}</h2>
                <button
                title='button'
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="p-2 hover:bg-muted rounded-md"
                  disabled={submitting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit}>
                {/* Hall Details Summary */}
                <div className="bg-muted/30 rounded-lg p-4 mb-6">
                  <h3 className="font-medium mb-2">Hall Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Capacity: {selectedHall.capacity} people</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Location: {selectedHall.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Price: ${selectedHall.pricePerHour}/hour</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Calendar Section */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Date</label>
                    {renderCalendar()}
                    {bookingData.date && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Selected: {new Date(bookingData.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>

                  {/* Time Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Time</label>
                      <select
                      title='select'
                        value={bookingData.startTime}
                        onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        required
                        disabled={submitting}
                      >
                        <option value="">Select time</option>
                        {Array.from({length: 12}, (_, i) => {
                          const hour = i + 8; // Starting from 8 AM
                          return [
                            {value: `${hour}:00`, label: `${hour}:00 AM`},
                            {value: `${hour}:30`, label: `${hour}:30 AM`}
                          ];
                        }).flat().map(time => (
                          <option key={time.value} value={time.value}>
                            {time.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">End Time</label>
                      <select
                      title='select'
                        value={bookingData.endTime}
                        onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        required
                        disabled={submitting}
                      >
                        <option value="">Select time</option>
                        {Array.from({length: 12}, (_, i) => {
                          const hour = i + 8;
                          return [
                            {value: `${hour}:00`, label: `${hour}:00 AM`},
                            {value: `${hour}:30`, label: `${hour}:30 AM`}
                          ];
                        }).flat().map(time => (
                          <option key={time.value} value={time.value}>
                            {time.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Attendees */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Number of Attendees (Max: {selectedHall.capacity})
                    </label>
                    <input
                    title='button'
                      type="number"
                      min="1"
                      max={selectedHall.capacity}
                      value={bookingData.attendees}
                      onChange={(e) => setBookingData({...bookingData, attendees: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      required
                      disabled={submitting}
                    />
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Purpose of Booking</label>
                    <textarea
                      value={bookingData.purpose}
                      onChange={(e) => setBookingData({...bookingData, purpose: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
                      placeholder="Describe the purpose of your booking..."
                      required
                      disabled={submitting}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                      disabled={submitting}
                    >
                      {submitting ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Halls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {halls.map((hall) => (
          <div key={hall.id} className="bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Image Carousel */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={hall.images[currentImageIndex[hall.id] || 0]}
                alt={hall.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              <button
              title='button'
                type="button"
                onClick={(e) => prevImage(hall.id, e)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
              title='button'
                type="button"
                onClick={(e) => nextImage(hall.id, e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {hall.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === currentImageIndex[hall.id] ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
              
              {/* Availability Badge */}
              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${hall.isAvailable ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                {hall.isAvailable ? 'Available' : 'Booked'}
              </div>
            </div>

            {/* Hall Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold">{hall.name}</h3>
                <span className="text-lg font-bold text-primary">${hall.pricePerHour}<span className="text-sm font-normal text-muted-foreground">/hour</span></span>
              </div>
              
              <p className="text-muted-foreground mb-4">{hall.description}</p>
              
              {/* Hall Features */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>Capacity: {hall.capacity}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{hall.location}</span>
                </div>
              </div>
              
              {/* Amenities */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {hall.amenities.map((amenity, index) => (
                    <span key={index} className="px-3 py-1 bg-muted rounded-full text-xs">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Booked Dates Preview */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Upcoming Bookings</h4>
                <div className="flex flex-wrap gap-2">
                  {hall.bookedDates.slice(0, 3).map((date, index) => (
                    <span key={index} className="px-2 py-1 bg-muted/50 rounded text-xs">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  ))}
                  {hall.bookedDates.length > 3 && (
                    <span className="px-2 py-1 bg-muted/50 rounded text-xs">
                      +{hall.bookedDates.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleRentHall(hall)}
                disabled={!hall.isAvailable}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${hall.isAvailable 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
              >
                {hall.isAvailable ? 'Rent This Hall' : 'Currently Unavailable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookHall;