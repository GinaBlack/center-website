import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase_config';
import { 
  collection, getDocs, query, where
} from 'firebase/firestore';

interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  price: string;
  instructor: string;
  schedule: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  contactEmail: string;
  contactPhone: string;
  isVisible: boolean;
  imageUrl?: string;
  createdAt: Date;
}

// Generate color based on category
const getCategoryColor = (category: string) => {
  const colors = {
    'Business & Administration': 'from-purple-500 to-purple-700',
    'Engineering & Technology': 'from-blue-500 to-blue-700',
    'Engineering': 'from-green-500 to-green-700',
    'Technology & Innovation': 'from-red-500 to-red-700',
    'IT & Networking': 'from-indigo-500 to-indigo-700',
    'Engineering Software': 'from-teal-500 to-teal-700',
  };
  return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-700';
};

// Generate initials from title
const getTitleInitials = (title: string) => {
  return title
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const WorkshopsPage = () => {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchPrograms();
  }, [selectedCategory]);

  // Function to fetch all registrations at once (more efficient)
  const fetchAllRegistrations = async () => {
    try {
      const registrationsRef = collection(db, 'studentRegistrations');
      const q = query(
        registrationsRef,
        where('status', 'in', ['accepted', 'pending', 'active'])
      );
      
      const querySnapshot = await getDocs(q);
      
      // Group registrations by programId
      const registrationsByProgram: Record<string, number> = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const programId = data.programId;
        if (programId && typeof programId === 'string') {
          registrationsByProgram[programId] = (registrationsByProgram[programId] || 0) + 1;
        }
      });
      
      return registrationsByProgram;
    } catch (err) {
      console.error('Error fetching all registrations:', err);
      return {};
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const programsRef = collection(db, 'trainingPrograms');
      
      // Build query based on filters
      let q = query(programsRef, where('isVisible', '==', true));
      
      if (selectedCategory !== 'all') {
        q = query(q, where('category', '==', selectedCategory));
      }
      
      const querySnapshot = await getDocs(q);
      
      // Fetch all registrations once
      const registrationsByProgram = await fetchAllRegistrations();
      
      const programsData: TrainingProgram[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const programId = doc.id;
        
        // Get registration count for this program
        const registrationCount = registrationsByProgram[programId] || 0;
        
        // Ensure all values are properly converted
        const maxParticipants = typeof data.maxParticipants === 'number' 
          ? data.maxParticipants 
          : parseInt(data.maxParticipants) || 0;
        
        programsData.push({
          id: programId,
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'Uncategorized',
          duration: data.duration || 'N/A',
          price: data.price || 'Free',
          instructor: data.instructor || '--',
          schedule: data.schedule || 'TBA',
          location: data.location || 'TBA',
          maxParticipants: maxParticipants,
          currentParticipants: registrationCount, // Use actual count from registrations
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          isVisible: data.isVisible || false,
          imageUrl: data.imageUrl || '',
          createdAt: data.createdAt?.toDate() || new Date(),
        } as TrainingProgram);
      });

      // Sort by creation date (newest first)
      programsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setPrograms(programsData);
      setError('');
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load training programs');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from programs
  const categories = ['all', ...new Set(programs.map(p => p.category).filter(Boolean))];

  const handleProgramClick = (programId: string) => {
    navigate(`/training/${programId}`);
  };

  // In the Quick Register button handler
  const handleQuickRegister = (program: TrainingProgram, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please login to register for training programs');
      navigate('/login');
      return;
    }
    
    // Check if already enrolled
    if (program.currentParticipants >= program.maxParticipants) {
      alert('This program is fully booked. Please check back later for availability.');
      return;
    }
    
    // Show pending status message
    alert(`Registration submitted for ${program.title}. Your application is pending admin approval. You will receive a notification once reviewed.`);
    
    navigate(`/training/${program.id}`);
  };

  // Calculate enrollment percentage safely
  const calculateEnrollmentPercentage = (program: TrainingProgram) => {
    if (program.maxParticipants <= 0) return 0;
    const percentage = (program.currentParticipants / program.maxParticipants) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  // Get enrollment status color (for progress bar only)
  const getEnrollmentStatusColor = (program: TrainingProgram) => {
    const percentage = calculateEnrollmentPercentage(program);
    if (percentage >= 100) return 'bg-red-500'; // Full
    if (percentage >= 80) return 'bg-yellow-500'; // Almost full
    return 'bg-green-500'; // Available
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg">Loading training programs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Professional Training Programs</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Centre d'expérimentation et de production de l'Ecole Nationale Supérieure Polytechnique de Yaoundé
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto mt-2">
            De l'imagination à la Production de Qualité
          </p>
        </div>

        {/* Contact Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Need More Information?</h3>
              <p className="opacity-90">Contact us for program details, pricing, and enrollment</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="text-center">
                <div className="font-bold">{programs.length} Programs Available</div>
                <div className="text-sm opacity-90">Comprehensive Training</div>
              </div>
              <a 
                href="tel:+237222224547" 
                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Call Now: +237 222 22 45 47
              </a>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full transition ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Programs Grid */}
        {programs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No training programs available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => {
              const enrollmentPercentage = calculateEnrollmentPercentage(program);
              const isFull = program.currentParticipants >= program.maxParticipants;
              
              return (
                <div 
                  key={program.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleProgramClick(program.id)}
                >
                  {/* Image/Color Banner */}
                  <div className={`h-48 overflow-hidden relative ${program.imageUrl ? '' : `bg-gradient-to-br ${getCategoryColor(program.category)}`}`}>
                    {program.imageUrl ? (
                      <img 
                        src={program.imageUrl} 
                        alt={program.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, fall back to color
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement?.classList.add(`bg-gradient-to-br`, ...getCategoryColor(program.category).split(' '));
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-6">
                          <div className="text-4xl font-bold text-white mb-2">
                            {getTitleInitials(program.title)}
                          </div>
                          <div className="text-white opacity-90">Training Program</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white text-gray-800 text-sm rounded-full font-medium">
                        {program.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{program.title}</h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">{program.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className={program.instructor === '--' ? 'text-gray-400 italic' : ''}>
                          {program.instructor}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {program.schedule}
                      </div>
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {program.location}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">{program.price}</span>
                        <div className="text-sm text-gray-500">Full Program</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Duration: {program.duration}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        className={`flex-1 px-4 py-2 rounded-lg transition ${
                          isFull 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isFull) {
                            alert('This program is fully booked. Please check back later for availability.');
                          } else {
                            handleQuickRegister(program, e);
                          }
                        }}
                        disabled={isFull}
                      >
                        {isFull ? 'Fully Booked' : 'Quick Register'}
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        onClick={() => handleProgramClick(program.id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Contact Information Footer */}
        <div className="mt-12 pt-8 border-t">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-bold mb-1">Phone Numbers</div>
                <div className="text-gray-600 text-sm">
                  <div>+237 222 22 45 47</div>
                  <div>+237 694 70 56 90</div>
                  <div>+237 677 46 99 21</div>
                  <div>+237 697 39 63 01</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-bold mb-1">Email</div>
                <div className="text-gray-600 text-sm">enspy.cep@polytechnique.cm</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-bold mb-1">Website</div>
                <div className="text-gray-600 text-sm">www.cep-enspy.com</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-bold mb-1">Location</div>
                <div className="text-gray-600 text-sm">Centre d'expérimentation et de production, ENSPY, Yaoundé</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopsPage;