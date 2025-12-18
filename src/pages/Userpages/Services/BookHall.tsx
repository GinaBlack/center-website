import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

const BookHall = () => {
  // Sample data for halls
  const [halls, setHalls] = useState([
    {
      id: 1,
      name: "3D Printing Innovation Hall",
      description: "A state-of-the-art facility equipped with the latest 3D printing technologies, perfect for workshops, demonstrations, and collaborative projects.",
      capacity: 50,
      location: "Main Building, Floor 3",
      images: [
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      amenities: ["Wi-Fi", "Projector", "Whiteboard", "Printing Stations", "Catering Area"],
      pricePerHour: 120,
      isAvailable: true,
      bookedDates: ["2024-01-15", "2024-01-20", "2024-01-25"]
    },
    {
      id: 2,
      name: "Maker Space Workshop",
      description: "Spacious workshop area designed for hands-on 3D printing sessions, prototyping, and group collaborations.",
      capacity: 30,
      location: "Tech Wing, Floor 1",
      images: [
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      amenities: ["3D Printers", "Workbenches", "Tools", "Ventilation System", "Storage Lockers"],
      pricePerHour: 85,
      isAvailable: true,
      bookedDates: ["2024-01-18", "2024-01-22"]
    },
    {
      id: 3,
      name: "Design Studio Conference Room",
      description: "Modern conference room ideal for design reviews, client presentations, and team meetings focused on 3D printing projects.",
      capacity: 20,
      location: "Design Center, Floor 2",
      images: [
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      amenities: ["Video Conferencing", "Smart Board", "Sound System", "Coffee Station", "Printing Hub"],
      pricePerHour: 65,
      isAvailable: false,
      bookedDates: ["2024-01-10", "2024-01-12", "2024-01-14", "2024-01-16"]
    },
    {
      id: 4,
      name: "Advanced Materials Lab",
      description: "Specialized laboratory for working with advanced 3D printing materials, complete with safety equipment and material storage.",
      capacity: 15,
      location: "Research Building, Floor B1",
      images: [
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      amenities: ["Fume Hoods", "Material Storage", "Safety Gear", "Temperature Control", "Specialized Tools"],
      pricePerHour: 150,
      isAvailable: true,
      bookedDates: ["2024-01-19"]
    }
  ]);

  const [selectedHall, setSelectedHall] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    hallId: null,
    date: '',
    startTime: '',
    endTime: '',
    attendees: 1,
    purpose: ''
  });
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState({});

  // Initialize current image index for each hall
  useEffect(() => {
    const initialIndexes = {};
    halls.forEach(hall => {
      initialIndexes[hall.id] = 0;
      // Aggregate booked dates for calendar
      setBookedDates(prev => ({
        ...prev,
        [hall.id]: hall.bookedDates
      }));
    });
    setCurrentImageIndex(initialIndexes);
  }, []);

  const nextImage = (hallId, e) => {
    e.stopPropagation();
    const hall = halls.find(h => h.id === hallId);
    setCurrentImageIndex(prev => ({
      ...prev,
      [hallId]: (prev[hallId] + 1) % hall.images.length
    }));
  };

  const prevImage = (hallId, e) => {
    e.stopPropagation();
    const hall = halls.find(h => h.id === hallId);
    setCurrentImageIndex(prev => ({
      ...prev,
      [hallId]: (prev[hallId] - 1 + hall.images.length) % hall.images.length
    }));
  };

  const handleRentHall = (hall) => {
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

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    // Add the booked date to the hall
    const updatedHalls = halls.map(hall => {
      if (hall.id === selectedHall.id) {
        const newBookedDates = [...hall.bookedDates, bookingData.date];
        return {
          ...hall,
          bookedDates: newBookedDates,
          isAvailable: true // You might want to add logic to check availability
        };
      }
      return hall;
    });
    
    setHalls(updatedHalls);
    setShowBookingForm(false);
    setSelectedHall(null);
    
    alert(`Successfully booked ${selectedHall.name} for ${bookingData.date}`);
  };

  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setBookingData(prev => ({ ...prev, date: formattedDate }));
  };

  const isDateDisabled = (date) => {
    if (!selectedHall) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable already booked dates
    const dateStr = date.toISOString().split('T')[0];
    return selectedHall.bookedDates.includes(dateStr);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
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
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-muted rounded-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="font-medium">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
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
            const isDisabled = isDateDisabled(date);
            const isSelected = bookingData.date === date.toISOString().split('T')[0];
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <button
                key={index}
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

  return (
    <div className="min-h-screen bg-background py-20 p-8 ">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-lgx font-bold mb-4">Book a Hall</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Reserve our state-of-the-art 3D printing facilities for workshops, events, or projects. 
            Choose from various specialized halls equipped with the latest technology.
          </p>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && selectedHall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full h-180 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Book {selectedHall.name}</h2>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="p-2 hover:bg-muted rounded-md"
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
                      <label className="block  text-smx font-medium mb-2">Select Date</label>
                      {renderCalendar()}
                      {bookingData.date && (
                        <p className=" text-sm  text-muted-foreground mt-2">
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
                          value={bookingData.endTime}
                          onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                          required
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
                        type="number"
                        min="1"
                        max={selectedHall.capacity}
                        value={bookingData.attendees}
                        onChange={(e) => setBookingData({...bookingData, attendees: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        required
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
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="flex-1 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Confirm Booking
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
                  onClick={(e) => prevImage(hall.id, e)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
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