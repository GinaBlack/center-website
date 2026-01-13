import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase_config';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import {sendNotification} from '../../utils/sendNotifications';
import { ROLES } from '../../constants/roles';

interface TrainingProgram {
  id?: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  price: string;
  prerequisites: string[];
  learningOutcomes: string[];
  syllabus: string[];
  instructor: string;
  schedule: string;
  location: string;
  maxParticipants: number;
  contactEmail: string;
  contactPhone: string;
  imageUrl?: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
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

const TrainingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentParticipants, setCurrentParticipants] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProgramDetails(id);
      checkIfRegistered(id);
    }
  }, [id, currentUser]);

// const fetchAdminUsers 

  const fetchProgramDetails = async (programId: string) => {
    try {
      setLoading(true);
      const programRef = doc(db, 'trainingPrograms', programId);
      const programSnap = await getDoc(programRef);

      if (programSnap.exists()) {
        const data = programSnap.data();
        setProgram({
          id: programSnap.id,
          title: data.title,
          description: data.description,
          category: data.category,
          duration: data.duration,
          price: data.price,
          prerequisites: data.prerequisites || [],
          learningOutcomes: data.learningOutcomes || [],
          syllabus: data.syllabus || [],
          instructor: data.instructor || '--',
          schedule: data.schedule,
          location: data.location,
          maxParticipants: data.maxParticipants,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          imageUrl: data.imageUrl,
          isVisible: data.isVisible,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });

        // Get current participants count from registrations
        const registrationsRef = collection(db, 'registrations');
        const q = query(registrationsRef, where('programId', '==', programId));
        const registrationsSnap = await getDocs(q);
        setCurrentParticipants(registrationsSnap.size);
        
        setError('');
      } else {
        setError('Program not found');
        setProgram(null);
      }
    } catch (err) {
      console.error('Error fetching program details:', err);
      setError('Failed to load program details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfRegistered = async (programId: string) => {
    if (!currentUser) return;

    try {
      const registrationsRef = collection(db, 'registrations');
      const q = query(
        registrationsRef, 
        where('programId', '==', programId),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      setIsRegistered(!querySnapshot.empty);
    } catch (err) {
      console.error('Error checking registration:', err);
    }
  };

// In the handleRegister function in TrainingDetailsPage.tsx
const handleRegister = async () => {
  if (!currentUser) {
    alert('Please login to register for this training program');
    navigate('/login');
    return;
  }

  if (!program?.id) return;

  try {
    // Check if program has capacity
    if (currentParticipants >= program.maxParticipants) {
      alert('This program has reached maximum capacity. Please try another program.');
      return;
    }

    // Check if already registered
    if (isRegistered) {
      alert('You are already registered for this program.');
      return;
    }

    // Create registration record with 'pending' status
    const registrationsRef = collection(db, 'registrations');
    const registrationData = {
      programId: program.id,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
      userEmail: currentUser.email,
      userPhone: currentUser.phoneNumber,
      status: 'pending',
      appliedAt: new Date(),
      updatedAt: new Date(),
    };

    const registrationDoc = await addDoc(registrationsRef, registrationData);

    // Send confirmation notification to user
    await sendNotification({
      user_email: currentUser.email || '',
      message: `Your registration for "${program.title}" has been submitted and is pending admin approval. You will be notified once reviewed.`,
      type: 'status_change',
      status_before: " ",
      status_after: 'pending',
      title: 'Registration Submitted! ⏳',
      sent_via: 'both',
      action_url: `/training/${program.id}`,
      related_program_id: program.id,
      related_program_name: program.title,
      metadata: {
        registration_id: registrationDoc.id,
        program_id: program.id,
        program_name: program.title,
        user_id: currentUser.uid,
        applied_at: new Date().toISOString(),
      },
    });

    // Send notification to admin (fetch admin users)
    const adminUsers = await fetchAdminUsers();
    for (const admin of adminUsers) {
      await sendNotification({
        user_email: admin.email,
        message: `New registration request from ${currentUser.displayName || currentUser.email} for "${program.title}". Please review in the admin panel.`,
        type: 'booking_created',
        title: 'New Registration Request 📋',
        sent_via: 'email',
        action_url: `/admin/students?program=${program.id}`,
        related_program_id: program.id,
        related_program_name: program.title,
        metadata: {
          registration_id: registrationDoc.id,
          program_id: program.id,
          program_name: program.title,
          applicant_id: currentUser.uid,
          applicant_name: currentUser.displayName,
          applicant_email: currentUser.email,
        },
      });
    }

    setIsRegistered(true);
    setCurrentParticipants(prev => prev + 1);
    
    alert(`Registration submitted successfully! Your application is pending admin approval. Check your email and notifications for updates.`);
  } catch (err) {
    console.error('Error registering for program:', err);
    alert('Failed to register. Please try again.');
  }
};

  const handleUnregister = async () => {
    if (!program?.id || !isRegistered || !currentUser) return;

    try {
      const registrationsRef = collection(db, 'registrations');
      const q = query(
        registrationsRef, 
        where('programId', '==', program.id),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Note: In Firestore, you need to delete the document
        // This would require a deleteDoc function
        alert('Please contact administration to unregister.');
        return;
      }

      setIsRegistered(false);
      setCurrentParticipants(prev => prev - 1);
      
      alert(`Successfully unregistered from ${program.title}`);
    } catch (err) {
      console.error('Error unregistering from program:', err);
      alert('Failed to unregister. Please contact administration.');
    }
  };

  const handleViewStudents = () => {
    navigate(`/course/${id}/students`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg">Loading program details...</div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Program Not Found</h1>
        <p className="text-gray-600 mb-6">{error || 'The requested training program could not be found.'}</p>
        <button
          onClick={() => navigate('/workshops')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Training Programs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          {' > '}
          <Link to="/workshops" className="hover:text-blue-600">Training Programs</Link>
          {' > '}
          <span className="text-gray-900">{program.title}</span>
        </div>

        {/* Program Header with Image */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className={`h-64 overflow-hidden relative ${program.imageUrl ? '' : `bg-gradient-to-br ${getCategoryColor(program.category)}`}`}>
            {program.imageUrl ? (
              <img 
                src={program.imageUrl} 
                alt={program.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement?.classList.add(`bg-gradient-to-br`, ...getCategoryColor(program.category).split(' '));
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="text-6xl font-bold text-white mb-4">
                    {getTitleInitials(program.title)}
                  </div>
                  <div className="text-white text-xl font-medium">Training Program</div>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <h1 className="text-3xl font-bold text-white mb-2">{program.title}</h1>
              <div className="flex items-center text-white/90">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  {program.category}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div className="flex-1">
                <p className="text-gray-600">{program.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 mb-2">{program.price}</div>
                <div className="text-gray-600">Duration: {program.duration}</div>
              </div>
            </div>

            {/* Key Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Instructor</div>
                <div className={`font-medium ${program.instructor === '--' ? 'text-gray-400 italic' : ''}`}>
                  {program.instructor}
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Schedule</div>
                <div className="font-medium">{program.schedule}</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Location</div>
                <div className="font-medium">{program.location}</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Capacity</div>
                <div className="font-medium">
                  {currentParticipants} / {program.maxParticipants} participants
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (currentParticipants / program.maxParticipants) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Program Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Syllabus */}
            {program.syllabus.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Syllabus</h2>
                <ul className="space-y-3">
                  {program.syllabus.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learning Outcomes */}
            {program.learningOutcomes.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Learning Outcomes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {program.learningOutcomes.map((outcome, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">{index + 1}</span>
                        </div>
                        <span className="font-medium">{outcome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {program.prerequisites.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Prerequisites</h2>
                <div className="flex flex-wrap gap-2">
                  {program.prerequisites.map((prereq, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Registration & Actions */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Registration</h3>
              
              {isRegistered ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Registered!</h4>
                  <p className="text-gray-600 mb-4">You are enrolled in this program.</p>
                  <button
                    onClick={handleUnregister}
                    className="w-full mb-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    Unregister
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Program Fee</span>
                      <span className="font-bold text-gray-900">{program.price}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{program.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Seats Available</span>
                      <span className="font-medium">
                        {program.maxParticipants - currentParticipants} / {program.maxParticipants}
                      </span>
                    </div>
                  </div>

                  {currentParticipants >= program.maxParticipants ? (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-center">
                      This program is currently full. Please check back later.
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                      className="w-full mb-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Register Now
                    </button>
                  )}
                </>
              )}

              {/* Admin Actions */}
              {currentUser && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Admin Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={handleViewStudents}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      View Students ({currentParticipants})
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>{program.contactEmail}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>{program.contactPhone}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{program.location}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Link
                  to="/contact"
                  className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                  </svg>
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDetailsPage;