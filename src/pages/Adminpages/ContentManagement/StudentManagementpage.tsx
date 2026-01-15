import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase/firebase_config';
import { 
  collection, getDocs, query, where, updateDoc, doc, 
  orderBy, addDoc, getDoc, Timestamp 
} from 'firebase/firestore';
import { sendNotification } from '../../../utils/sendNotifications';

interface TrainingProgram {
  id: string;
  title: string;
  category: string;
  duration: string;
  instructor: string;
  maxParticipants: number;
  isVisible: boolean;
  createdAt: Date;
}

interface StudentRegistration {
  id: string;
  programId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'enrolled';
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
}

const Students = () => {
  const { currentUser } = useAuth();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    enrolled: 0
  });

  // Fetch all training programs
  useEffect(() => {
    if (currentUser) {
      fetchPrograms();
    }
  }, [currentUser]);

  // Fetch registrations when program is selected
  useEffect(() => {
    if (selectedProgram) {
      fetchRegistrations(selectedProgram);
    } else {
      setRegistrations([]);
      setUsers({});
      setStats({ total: 0, pending: 0, accepted: 0, rejected: 0, enrolled: 0 });
    }
  }, [selectedProgram]);

  const convertFirestoreTimestamp = (timestamp: any): Date => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return new Date();
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching training programs...');
      const programsRef = collection(db, 'trainingPrograms');
      const q = query(programsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const programsData: TrainingProgram[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Program ${doc.id}:`, data);
        
        programsData.push({
          id: doc.id,
          title: data.title || data.programName || 'Untitled Program',
          category: data.category || data.type || 'General',
          duration: data.duration || 'Not specified',
          instructor: data.instructor || data.trainer || data.createdBy || '--',
          maxParticipants: data.maxParticipants || data.maxStudents || data.capacity || 0,
          isVisible: data.isVisible !== false, // Default to true
          createdAt: convertFirestoreTimestamp(data.createdAt),
        });
      });

      console.log(`Fetched ${programsData.length} programs`);
      setPrograms(programsData);
      
      // Select first program by default if none selected
      if (programsData.length > 0 && !selectedProgram) {
        setSelectedProgram(programsData[0].id);
      } else if (programsData.length === 0) {
        setError('No training programs found. Create a program first.');
      }
    } catch (err: any) {
      console.error('Error fetching programs:', err);
      setError(`Failed to load training programs: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (programId: string) => {
    try {
      setLoadingRegistrations(true);
      setError('');
      
      console.log(`Fetching registrations for program ${programId}...`);
      
      // First, check if registrations collection exists
      const registrationsRef = collection(db, 'registrations');
      const q = query(
        registrationsRef, 
        where('programId', '==', programId)
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} registrations`);

      const registrationsData: StudentRegistration[] = [];
      const userIds = new Set<string>();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Registration ${doc.id}:`, data);
        
        const registration: StudentRegistration = {
          id: doc.id,
          programId: data.programId || programId,
          userId: data.userId || data.user_id || '',
          userName: data.userName || data.name || data.displayName || 'Unknown User',
          userEmail: data.userEmail || data.email || 'unknown@example.com',
          userPhone: data.userPhone || data.phone || data.phoneNumber || '',
          status: (data.status as StudentRegistration['status']) || 'pending',
          appliedAt: convertFirestoreTimestamp(data.appliedAt || data.createdAt),
          reviewedAt: data.reviewedAt ? convertFirestoreTimestamp(data.reviewedAt) : undefined,
          reviewedBy: data.reviewedBy || data.reviewed_by,
          notes: data.notes || data.comments || '',
        };
        
        registrationsData.push(registration);
        
        if (registration.userId) {
          userIds.add(registration.userId);
        }
      });

      // Sort by applied date (newest first)
      registrationsData.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());

      setRegistrations(registrationsData);
      console.log(`Processed ${registrationsData.length} registrations, ${userIds.size} unique users`);
      
      // Fetch user details for all registrations
      if (userIds.size > 0) {
        await fetchUsersDetails(Array.from(userIds));
      } else {
        console.log('No user IDs to fetch');
      }
      
      // Update stats
      updateStats(registrationsData);
      
    } catch (err: any) {
      console.error('Error fetching registrations:', err);
      setError(`Failed to load student registrations: ${err.message || 'Unknown error'}`);
      
      // If it's a permission error, show a helpful message
      if (err.code === 'permission-denied') {
        setError('Permission denied. Make sure you have read access to the registrations collection.');
      }
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const fetchUsersDetails = async (userIds: string[]) => {
    try {
      console.log(`Fetching details for ${userIds.length} users...`);
      const usersData: Record<string, User> = {};
      
      for (const userId of userIds) {
        try {
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log(`User ${userId} data:`, userData);
            
            usersData[userId] = {
              id: userSnap.id,
              email: userData.email || userData.Email || '',
              displayName: userData.displayName || 
                         userData.display_name || 
                         `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 
                         userData.email?.split('@')[0] || 
                         'Unknown User',
              phoneNumber: userData.phoneNumber || userData.phone_number || userData.phone || '',
            };
          } else {
            console.log(`User ${userId} not found in users collection`);
            // Create a fallback user entry if user doesn't exist
            usersData[userId] = {
              id: userId,
              email: 'unknown@example.com',
              displayName: 'Unknown User',
              phoneNumber: 'Unknown',
            };
          }
        } catch (userErr) {
          console.error(`Error fetching user ${userId}:`, userErr);
          // Still create a fallback entry
          usersData[userId] = {
            id: userId,
            email: 'unknown@example.com',
            displayName: 'Unknown User',
            phoneNumber: 'Unknown',
          };
        }
      }
      
      setUsers(usersData);
      console.log(`Fetched ${Object.keys(usersData).length} user details`);
    } catch (err) {
      console.error('Error in fetchUsersDetails:', err);
      // Don't show error to user, just log it
    }
  };

  const updateStats = (regs: StudentRegistration[]) => {
    const newStats = {
      total: regs.length,
      pending: regs.filter(r => r.status === 'pending').length,
      accepted: regs.filter(r => r.status === 'accepted').length,
      rejected: regs.filter(r => r.status === 'rejected').length,
      enrolled: regs.filter(r => r.status === 'enrolled').length,
    };
    console.log('Updated stats:', newStats);
    setStats(newStats);
  };

  const sendNotificationToDb = async (notificationData: {
    user_email?: string;
    userId?: string;
    message: string;
    type: string;
    title: string;
    status_before?: string;
    status_after?: string;
    sent_via?: string;
    action_url?: string;
    related_program_id?: string;
    related_program_name?: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        ...notificationData,
        read: false,
        createdAt: Timestamp.now(),
      });
      
      console.log('In-app notification saved:', notificationData);
    } catch (err) {
      console.error('Error saving notification:', err);
      // Don't fail the whole operation if notification fails
    }
  };

  const handleUpdateStatus = async (registrationId: string, newStatus: StudentRegistration['status']) => {
    if (!currentUser) return;

    try {
      setError('');
      
      const registrationRef = doc(db, 'registrations', registrationId);
      const registration = registrations.find(r => r.id === registrationId);
      
      if (!registration) {
        setError('Registration not found');
        return;
      }

      const updateData: any = {
        status: newStatus,
        reviewedAt: Timestamp.now(),
        reviewedBy: currentUser.uid,
      };

      if (notesInput.trim() && selectedRegistration === registrationId) {
        updateData.notes = notesInput.trim();
      }

      console.log('Updating registration:', registrationId, updateData);
      await updateDoc(registrationRef, updateData);

      // Update local state
      setRegistrations(prev => prev.map(reg => 
        reg.id === registrationId 
          ? { 
              ...reg, 
              status: newStatus, 
              reviewedAt: new Date(),
              reviewedBy: currentUser.uid,
              notes: notesInput.trim() || reg.notes
            } 
          : reg
      ));

      // Send notifications to student
      const program = programs.find(p => p.id === registration.programId);
      const notificationMessage = getNotificationMessage(
        newStatus, 
        program?.title, 
        notesInput.trim()
      );

      const notificationTitle = getNotificationTitle(newStatus);

      try {
        // Send email notification
        await sendNotification({
          user_email: registration.userEmail,
          message: notificationMessage,
          type: 'status_change',
          status_before: registration.status,
          status_after: newStatus,
          title: notificationTitle,
          sent_via: 'both',
          action_url: `/training/${registration.programId}`,
          related_program_id: registration.programId,
          related_program_name: program?.title,
          metadata: {
            registration_id: registration.id,
            program_id: registration.programId,
            program_name: program?.title,
            reviewed_by: currentUser.uid,
            notes: notesInput.trim() || undefined,
          },
        });
        
        // Save in-app notification
        await sendNotificationToDb({
          user_email: registration.userEmail,
          userId: registration.userId,
          message: notificationMessage,
          type: 'status_change',
          title: notificationTitle,
          status_before: registration.status,
          status_after: newStatus,
          action_url: `/training/${registration.programId}`,
          related_program_id: registration.programId,
          related_program_name: program?.title,
        });
        
        console.log('Notifications sent successfully');
      } catch (notifErr) {
        console.error('Error sending notifications:', notifErr);
        // Continue even if notifications fail
      }

      setSuccess(`Registration ${newStatus} successfully!${registration.userEmail ? ` Notification sent to ${registration.userEmail}.` : ''}`);
      
      setNotesInput('');
      setSelectedRegistration(null);
      
      // Update stats
      const updatedRegistrations = registrations.map(r => 
        r.id === registrationId ? { ...r, status: newStatus } : r
      );
      updateStats(updatedRegistrations);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating registration status:', err);
      setError(`Failed to update registration status: ${err.message || 'Unknown error'}`);
    }
  };

  const getNotificationMessage = (
    newStatus: string, 
    programTitle?: string, 
    notes?: string
  ): string => {
    const baseMessage = `Your registration for "${programTitle || 'the training program'}"`;
    
    switch (newStatus) {
      case 'accepted':
        return `${baseMessage} has been accepted. ${notes || 'Please proceed with payment to secure your spot.'}`;
      case 'rejected':
        return `${baseMessage} has been declined. ${notes || 'Please contact administration for more details.'}`;
      case 'enrolled':
        return `Congratulations! You are now enrolled in "${programTitle || 'the training program'}". ${notes || 'Welcome to the program!'}`;
      case 'pending':
        return `${baseMessage} is now pending review. You will be notified once reviewed.`;
      default:
        return `${baseMessage} status has been updated to ${newStatus}.`;
    }
  };

  const getNotificationTitle = (status: string): string => {
    switch (status) {
      case 'accepted': return 'Registration Accepted! 🎉';
      case 'rejected': return 'Registration Declined';
      case 'enrolled': return 'Enrollment Confirmed! 🎓';
      case 'pending': return 'Registration Submitted ⏳';
      default: return 'Registration Status Updated';
    }
  };

  const handleAddNotes = (registrationId: string) => {
    setSelectedRegistration(registrationId);
    const registration = registrations.find(r => r.id === registrationId);
    setNotesInput(registration?.notes || '');
  };

  const handleSaveNotes = async (registrationId: string) => {
    try {
      const registrationRef = doc(db, 'registrations', registrationId);
      await updateDoc(registrationRef, {
        notes: notesInput.trim(),
        updatedAt: Timestamp.now(),
      });

      // Update local state
      setRegistrations(prev => prev.map(reg => 
        reg.id === registrationId 
          ? { ...reg, notes: notesInput.trim() } 
          : reg
      ));

      setSuccess('Notes saved successfully!');
      setSelectedRegistration(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving notes:', err);
      setError(`Failed to save notes: ${err.message || 'Unknown error'}`);
    }
  };

  const getStatusColor = (status: StudentRegistration['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'enrolled': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: StudentRegistration['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'enrolled': return '🎓';
      default: return '📝';
    }
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    // Status filter
    if (filterStatus !== 'all' && reg.status !== filterStatus) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        reg.userName.toLowerCase().includes(term) ||
        reg.userEmail.toLowerCase().includes(term) ||
        (reg.userPhone && reg.userPhone.toLowerCase().includes(term)) ||
        (users[reg.userId]?.displayName?.toLowerCase().includes(term))
      );
    }
    
    return true;
  });

  const selectedProgramData = programs.find(p => p.id === selectedProgram);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg">Loading student management...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Registrations Management</h1>
          <p className="text-gray-600">Review and manage student applications for training programs</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Course Selection Cards - Horizontal Layout */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Training Programs</h2>
            <span className="text-sm text-gray-600">{programs.length} programs</span>
          </div>
          
          {programs.length === 0 ? (
            <div className="text-gray-500 text-center py-4 bg-white rounded-xl shadow">
              No programs found
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 mb-6">
              {programs.map((program) => (
                <button
                  key={program.id}
                  onClick={() => setSelectedProgram(program.id)}
                  className={`flex-1 min-w-[200px] max-w-[300px] p-4 rounded-xl border transition-all duration-200 ${
                    selectedProgram === program.id
                      ? 'bg-blue-50 border-blue-300 shadow-md transform scale-[1.02]'
                      : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 mb-1 truncate">{program.title}</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">{program.category}</span>
                      </div>
                      <div className="truncate">{program.duration} • {program.instructor}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area - Horizontal Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Program Details and Stats */}
          <div className="lg:w-1/3">
            {selectedProgram && selectedProgramData ? (
              <>
                {/* Selected Program Details */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Selected Program</h2>
                    <button
                      onClick={() => fetchRegistrations(selectedProgram)}
                      disabled={loadingRegistrations}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center text-sm disabled:opacity-50"
                    >
                      <svg className={`w-4 h-4 mr-2 ${loadingRegistrations ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {loadingRegistrations ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedProgramData.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="font-medium">{selectedProgramData.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{selectedProgramData.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Instructor:</span>
                      <span className="font-medium">{selectedProgramData.instructor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Capacity:</span>
                      <span className="font-medium">{selectedProgramData.maxParticipants} students</span>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Registration Stats</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600">Total Applications</span>
                        <span className="font-bold text-lg">{stats.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: stats.total > 0 ? '100%' : '0%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="text-yellow-800 font-bold text-lg">{stats.pending}</div>
                        <div className="text-yellow-600 text-sm">Pending</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-blue-800 font-bold text-lg">{stats.accepted}</div>
                        <div className="text-blue-600 text-sm">Accepted</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-green-800 font-bold text-lg">{stats.enrolled}</div>
                        <div className="text-green-600 text-sm">Enrolled</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-red-800 font-bold text-lg">{stats.rejected}</div>
                        <div className="text-red-600 text-sm">Rejected</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-gray-400 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="text-gray-500 mb-4">Select a training program to view details</div>
              </div>
            )}
          </div>

          {/* Right Column - Registrations List */}
          <div className="lg:w-2/3">
            {selectedProgram ? (
              <>
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search students by name, email, or phone..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        title="Status Filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="enrolled">Enrolled</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Registrations List */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">
                        Student Applications ({filteredRegistrations.length})
                      </h3>
                      {loadingRegistrations && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </div>
                      )}
                    </div>
                  </div>

                  {filteredRegistrations.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-gray-400 mb-3">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="text-gray-500 mb-4">
                        {registrations.length === 0 
                          ? 'No student applications for this program yet.'
                          : 'No applications match your filters.'}
                      </div>
                      <button
                        onClick={() => {
                          setFilterStatus('all');
                          setSearchTerm('');
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto">
                      <div className="divide-y divide-gray-200">
                        {filteredRegistrations.map((registration) => (
                          <div key={registration.id} className="p-4 hover:bg-gray-50">
                            <div className="flex flex-col md:flex-row gap-4">
                              {/* Student Info */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                                      <span className="text-blue-700 font-bold text-lg">
                                        {registration.userName.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-gray-900">{registration.userName}</h4>
                                      <div className="text-sm text-gray-600">{registration.userEmail}</div>
                                      {registration.userPhone && (
                                        <div className="text-sm text-gray-600">{registration.userPhone}</div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    {registration.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => handleUpdateStatus(registration.id, 'accepted')}
                                          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                                        >
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => handleUpdateStatus(registration.id, 'rejected')}
                                          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                                        >
                                          Decline
                                        </button>
                                      </>
                                    )}
                                    {registration.status === 'accepted' && (
                                      <button
                                        onClick={() => handleUpdateStatus(registration.id, 'enrolled')}
                                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                                      >
                                        Enroll
                                      </button>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <span className={`px-3 py-1 text-xs rounded-full flex items-center gap-2 ${getStatusColor(registration.status)}`}>
                                    <span>{getStatusIcon(registration.status)}</span>
                                    <span className="font-medium">{registration.status.toUpperCase()}</span>
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    Applied: {registration.appliedAt.toLocaleDateString()}
                                  </span>
                                  {registration.reviewedAt && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      Reviewed: {registration.reviewedAt.toLocaleDateString()}
                                    </span>
                                  )}
                                </div>

                                {/* Notes Section */}
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium text-gray-700">Notes</div>
                                    {selectedRegistration === registration.id ? (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleSaveNotes(registration.id)}
                                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedRegistration(null);
                                            setNotesInput('');
                                          }}
                                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleAddNotes(registration.id)}
                                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                                      >
                                        {registration.notes ? 'Edit Notes' : 'Add Notes'}
                                      </button>
                                    )}
                                  </div>
                                  
                                  {selectedRegistration === registration.id ? (
                                    <textarea
                                      value={notesInput}
                                      onChange={(e) => setNotesInput(e.target.value)}
                                      rows={2}
                                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                      placeholder="Add notes about this student's application..."
                                    />
                                  ) : (
                                    <div className={`p-2 rounded-lg text-sm ${registration.notes ? 'bg-gray-50' : 'bg-gray-100'}`}>
                                      {registration.notes ? (
                                        <p className="text-gray-700">{registration.notes}</p>
                                      ) : (
                                        <p className="text-gray-500 italic">No notes added yet.</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bulk Actions */}
                {registrations.length > 0 && (
                  <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Bulk Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          const pendingRegs = registrations.filter(r => r.status === 'pending');
                          if (pendingRegs.length === 0) {
                            alert('No pending applications to accept.');
                            return;
                          }
                          if (confirm(`Accept all ${pendingRegs.length} pending applications?`)) {
                            pendingRegs.forEach(reg => handleUpdateStatus(reg.id, 'accepted'));
                          }
                        }}
                        className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                      >
                        Accept All Pending
                      </button>
                      <button
                        onClick={() => {
                          const pendingRegs = registrations.filter(r => r.status === 'pending');
                          if (pendingRegs.length === 0) {
                            alert('No pending applications to decline.');
                            return;
                          }
                          if (confirm(`Decline all ${pendingRegs.length} pending applications?`)) {
                            pendingRegs.forEach(reg => handleUpdateStatus(reg.id, 'rejected'));
                          }
                        }}
                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                      >
                        Decline All Pending
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-gray-400 mb-3">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-gray-500 mb-4">Select a training program to view student applications</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;