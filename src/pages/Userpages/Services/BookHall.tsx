import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Check, X, ChevronLeft, ChevronRight, Loader2, AlertCircle, Info, Mail, Phone, MessageSquare } from 'lucide-react';
import { 
  db, 
  auth, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  Timestamp,
  query,
  where 
} from '../../../firebase/firebase_config';

// Interface for Hall type - Updated to match HallManagement
interface Hall {
  id: string;
  hall_id?: string;
  name: string;
  description: string;
  capacity: number;
  equipment_included: string[];
  images: string[]; // Direct ImgBB URLs
  hourly_rate: number; // In XAF
  is_available: boolean;
  unavailable_notice?: string;
  location: string;
  rules: string;
  created_at: Date;
  updated_at: Date;
  bookedDates?: string[];
}

// Interface for Booking Data
interface BookingData {
  hallId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  purpose: string;
}

const BookHall = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [currentRules, setCurrentRules] = useState('');
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
  const [user, setUser] = useState<any>(null);

  // Check authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch halls from Firebase with safety checks
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        const hallsCollection = collection(db, 'rental_halls');
        const hallSnapshot = await getDocs(hallsCollection);
        
        const hallsList: Hall[] = [];
        hallSnapshot.forEach((doc) => {
          const hallData = doc.data();
          
          const safeHallData = {
            id: doc.id,
            hall_id: doc.id,
            name: String(hallData.name || 'Unnamed Hall'),
            description: String(hallData.description || 'No description available'),
            capacity: Number(hallData.capacity) || 0,
            equipment_included: Array.isArray(hallData.equipment_included) ? hallData.equipment_included : [],
            images: Array.isArray(hallData.images) ? hallData.images : [], // Direct ImgBB URLs
            hourly_rate: Number(hallData.hourly_rate) || 0,
            is_available: hallData.is_available !== false,
            unavailable_notice: hallData.unavailable_notice || '',
            location: String(hallData.location || 'Location not specified'),
            rules: String(hallData.rules || ''),
            created_at: hallData.created_at?.toDate() || new Date(),
            updated_at: hallData.updated_at?.toDate() || new Date(),
            bookedDates: Array.isArray(hallData.bookedDates) ? hallData.bookedDates : [],
          } as Hall;
          
          // Only add hall if it's available
          if (safeHallData.is_available) {
            hallsList.push(safeHallData);
          }
        });
        
        setHalls(hallsList);
        
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
    if (!hall || !hall.images || hall.images.length === 0) return;
    
    setCurrentImageIndex(prev => ({
      ...prev,
      [hallId]: (prev[hallId] + 1) % hall.images.length
    }));
  };

  const prevImage = (hallId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const hall = halls.find(h => h.id === hallId);
    if (!hall || !hall.images || hall.images.length === 0) return;
    
    setCurrentImageIndex(prev => ({
      ...prev,
      [hallId]: (prev[hallId] - 1 + hall.images.length) % hall.images.length
    }));
  };

  const handleRentHall = (hall: Hall) => {
    if (!user) {
      alert('Please login to book a hall');
      return;
    }
    
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

  const handleShowRules = (rules: string) => {
    setCurrentRules(rules);
    setShowRulesModal(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to make a booking');
      return;
    }

    if (!selectedHall || !bookingData.date || !bookingData.startTime || !bookingData.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    const start = new Date(`${bookingData.date}T${bookingData.startTime}`);
    const end = new Date(`${bookingData.date}T${bookingData.endTime}`);
    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    try {
      setSubmitting(true);

      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      const newBooking = {
        hallId: selectedHall.id,
        hallName: selectedHall.name,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split('@')[0],
        bookingDate: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        duration: duration,
        attendees: bookingData.attendees,
        purpose: bookingData.purpose,
        status: 'pending',
        createdAt: Timestamp.now(),
        totalCost: selectedHall.hourly_rate * duration,
        bookingId: `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      };

      if (selectedHall.bookedDates?.includes(bookingData.date)) {
        alert('This date is already booked. Please select another date.');
        return;
      }

      const bookingsCollection = collection(db, 'bookings');
      await addDoc(bookingsCollection, newBooking);

      const hallDocRef = doc(db, 'rental_halls', selectedHall.id);
      const updatedBookedDates = [...(selectedHall.bookedDates || []), bookingData.date];
      await updateDoc(hallDocRef, {
        bookedDates: updatedBookedDates
      });

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
      
      alert(`Booking request submitted for ${selectedHall.name} on ${bookingData.date}. You will receive a confirmation email.`);
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
    
    if (date < today) return true;
    
    const dateStr = date.toISOString().split('T')[0];
    return (hall.bookedDates || []).includes(dateStr);
  };

  // Calendar component for date selection
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startingDay; i++) {
      const day = prevMonthLastDay - startingDay + i + 1;
      days.push(
        <div key={`prev-${i}`} className="h-10 flex items-center justify-center text-gray-400">
          {day}
        </div>
      );
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateStr = currentDate.toISOString().split('T')[0];
      const isDisabled = isDateDisabled(currentDate, selectedHall);
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = bookingData.date === dateStr;
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateChange(currentDate)}
          disabled={isDisabled}
          className={`h-10 flex items-center justify-center rounded-md transition-colors ${
            isDisabled
              ? 'text-gray-400 cursor-not-allowed'
              : isSelected
              ? 'bg-primary text-primary-foreground'
              : isToday
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'hover:bg-muted'
          }`}
        >
          {day}
          {selectedHall?.bookedDates?.includes(dateStr) && (
            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500" />
          )}
        </button>
      );
    }
    
    // Next month days
    const totalCells = 42; // 6 weeks * 7 days
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="h-10 flex items-center justify-center text-gray-400">
          {i}
        </div>
      );
    }
    
    return (
      <div className="border h-100 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 hover:bg-muted rounded-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-medium">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-2 hover:bg-muted rounded-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
        
        <div className="mt-4 flex items-center text-muted-foreground gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-100" />
            <span>Today</span>
          </div>
        </div>
      </div>
    );
  };

  // Generate time options (8 AM to 8 PM)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour <= 20; hour++) {
      const displayHour = hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      
      options.push(
        <option key={`${hour}:00`} value={`${hour}:00`}>
          {displayHour}:00 {ampm}
        </option>
      );
      
      if (hour < 20) {
        options.push(
          <option key={`${hour}:30`} value={`${hour}:30`}>
            {displayHour}:30 {ampm}
          </option>
        );
      }
    }
    return options;
  };

  // Handle contact page redirect
  const handleContactRedirect = () => {
    window.location.href = '/contact';
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
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Book a Hall</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Reserve our state-of-the-art halls for workshops, events, or projects. 
          Choose from various specialized halls equipped with modern facilities.
        </p>
      </div>

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Hall Rules & Terms</h2>
                <button
                  type="button"
                  onClick={() => setShowRulesModal(false)}
                  className="p-2 hover:bg-muted rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-line bg-muted/30 p-4 rounded-lg">
                  {currentRules || 'No rules specified for this hall.'}
                </div>
              </div>
              
              <div className="flex justify-end pt-6 mt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowRulesModal(false)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && selectedHall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-lg shadow-lg max-w-3xl w-full h-180 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Book {selectedHall.name}</h2>
                <button
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
                      <span>Price: {selectedHall.hourly_rate.toLocaleString()} XAF/hour</span>
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
                        value={bookingData.startTime}
                        onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        required
                        disabled={submitting}
                      >
                        <option value="">Select time</option>
                        {generateTimeOptions()}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">End Time</label>
                      <select
                        value={bookingData.endTime}
                        onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        required
                        disabled={submitting}
                      >
                        <option value="">Select time</option>
                        {generateTimeOptions()}
                      </select>
                    </div>
                  </div>

                  {/* Attendees */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Number of Attendees (Max: {selectedHall.capacity})
                    </label>
                    <input
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

                  {/* Rules Link */}
                  {selectedHall.rules && (
                    <div className="bg-muted border  rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800 mb-1">Important Rules & Terms</h4>
                          <p className="text-blue-700 text-sm mb-2">
                            Please review the hall rules before booking
                          </p>
                          <button
                            type="button"
                            onClick={() => handleShowRules(selectedHall.rules)}
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                          >
                            View Hall Rules
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  {user && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">Booking as:</h4>
                      <p className="text-green-700">{user.email}</p>
                      <p className="text-sm text-green-600 mt-1">
                        Confirmation will be sent to this email
                      </p>
                    </div>
                  )}

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
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        'Confirm Booking'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Halls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {halls.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No Halls Available</h3>
              <p>Check back later for available halls.</p>
            </div>
          </div>
        ) : (
          halls.map((hall) => (
            <div key={hall.id} className="bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Image Carousel */}
              <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
                {hall.images && hall.images.length > 0 ? (
                  <>
                    <img
                      src={hall.images[currentImageIndex[hall.id] || 0]} // Direct ImgBB URL
                      alt={hall.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/600x400?text=No+Image';
                      }}
                    />
                    
                    {/* Navigation Arrows */}
                    {hall.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => prevImage(hall.id, e)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
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
                              className={`w-2 h-2 rounded-full ${
                                index === (currentImageIndex[hall.id] || 0) ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>

              {/* Hall Details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold">{hall.name}</h3>
                  <span className="text-lg font-bold text-primary">
                    {hall.hourly_rate.toLocaleString()} XAF<span className="text-sm font-normal text-muted-foreground">/hour</span>
                  </span>
                </div>
                
                <p className="text-muted-foreground mb-4 line-clamp-2">{hall.description}</p>
                
                {/* Hall Features */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>Capacity: {hall.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{hall.location}</span>
                  </div>
                </div>
                
                {/* Equipment */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Equipment</h4>
                  <div className="flex flex-wrap gap-2">
                    {hall.equipment_included.length > 0 ? (
                      hall.equipment_included.slice(0, 3).map((equipment, index) => (
                        <span key={index} className="px-3 py-1 bg-muted rounded-full text-xs">
                          {equipment}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No equipment listed</p>
                    )}
                    {hall.equipment_included.length > 3 && (
                      <span className="px-3 py-1 bg-muted/50 rounded-full text-xs">
                        +{hall.equipment_included.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Rules Preview */}
                {hall.rules && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Rules & Terms</h4>
                      <button
                        type="button"
                        onClick={() => handleShowRules(hall.rules)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        View Rules
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {hall.rules.substring(0, 100)}...
                    </p>
                  </div>
                )}
                
                {/* Booked Dates Preview */}
                {hall.bookedDates && hall.bookedDates.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2">Upcoming Bookings</h4>
                    <div className="flex flex-wrap gap-2">
                      {hall.bookedDates.slice(0, 3).map((date, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
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
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRentHall(hall)}
                    disabled={!user}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      user
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {!user ? 'Login to Book' : 'Book Now'}
                  </button>
                  
                  {hall.rules && (
                    <button
                      type="button"
                      onClick={() => handleShowRules(hall.rules)}
                      className="px-4 py-3 border rounded-lg hover:bg-muted transition-colors"
                      title="View rules"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Contact Information Card */}
      <div className="mt-8">
        <div className="bg-card border  rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex-1">
              <h2 className="text-2xl font-bold  mb-3">Need Help with Your Booking?</h2>
              <p className="text-gray-600 mb-4">
                Have questions about our halls, pricing, or availability? Our team is here to help you 
                find the perfect space for your event.
              </p>
            </div> 
            <div className="flex flex-col items-center">
              <button
                onClick={handleContactRedirect}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600/10 transition-colors font-medium flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Contact Support
              </button>
            </div>
          </div>
      </div>

      {/* Login Prompt */}
      {!user && (
        <div className="mt-8 p-6  button-0 gradient-black-to-gray border rounded-lg text-center">
          <h3 className="text-lg font-medium text-white mb-2">Ready to book a hall?</h3>
          <p className="text-white mb-4">Please login to make a booking</p>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/auth/login';
            }}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-blue-700"
          >
            Login Now
          </button>
        </div>
      )}
    </div>
  );
};

export default BookHall;