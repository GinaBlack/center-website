import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase/firebase_config';
import { 
  collection, getDocs, query, where, updateDoc, doc, 
  orderBy, addDoc, getDoc 
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

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const programsRef = collection(db, 'trainingPrograms');
      const q = query(programsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const programsData: TrainingProgram[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        programsData.push({
          id: doc.id,
          title: data.title,
          category: data.category,
          duration: data.duration,
          instructor: data.instructor || '--',
          maxParticipants: data.maxParticipants,
          isVisible: data.isVisible,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as TrainingProgram);
      });

      setPrograms(programsData);
      
      // Select first program by default if none selected
      if (programsData.length > 0 && !selectedProgram) {
        setSelectedProgram(programsData[0].id);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load training programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (programId: string) => {
    try {
      setLoadingRegistrations(true);
      
      // Fetch registrations for this program
      const registrationsRef = collection(db, 'registrations');
      const q = query(
        registrationsRef, 
        where('programId', '==', programId),
        orderBy('appliedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const registrationsData: StudentRegistration[] = [];
      const userIds = new Set<string>();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        registrationsData.push({
          id: doc.id,
          programId: data.programId,
          userId: data.userId,
          userName: data.userName || 'Unknown',
          userEmail: data.userEmail,
          userPhone: data.userPhone,
          status: data.status || 'pending',
          appliedAt: data.appliedAt?.toDate() || new Date(),
          reviewedAt: data.reviewedAt?.toDate(),
          reviewedBy: data.reviewedBy,
          notes: data.notes,
        } as StudentRegistration);
        
        userIds.add(data.userId);
      });

      setRegistrations(registrationsData);
      
      // Fetch user details for all registrations
      if (userIds.size > 0) {
        await fetchUsersDetails(Array.from(userIds));
      }
      
      // Update stats
      updateStats(registrationsData);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError('Failed to load student registrations');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const fetchUsersDetails = async (userIds: string[]) => {
    try {
      const usersData: Record<string, User> = {};
      
      for (const userId of userIds) {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef); // Now getDoc is imported
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          usersData[userId] = {
            id: userSnap.id,
            email: userData.email || '',
            displayName: userData.displayName || userData.email?.split('@')[0] || 'Unknown',
            phoneNumber: userData.phoneNumber,
          };
        } else {
          // Create a fallback user entry if user doesn't exist
          usersData[userId] = {
            id: userId,
            email: 'unknown@example.com',
            displayName: 'Unknown User',
            phoneNumber: 'Unknown',
          };
        }
      }
      
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching user details:', err);
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
    setStats(newStats);
  };

  const sendNotification = async (userId: string, title: string, message: string, type: string) => {
    try {
      // Check if notifications collection exists, if not create it
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date(),
      });
      
      console.log('Notification sent to user:', userId);
    } catch (err) {
      console.error('Error sending notification:', err);
      // Don't fail the whole operation if notification fails
    }
  };

 // In the handleUpdateStatus function
const handleUpdateStatus = async (registrationId: string, newStatus: StudentRegistration['status']) => {
  if (!currentUser) return;

  try {
    const registrationRef = doc(db, 'registrations', registrationId);
    const registration = registrations.find(r => r.id === registrationId);
    
    if (!registration) return;

    const updateData: any = {
      status: newStatus,
      reviewedAt: new Date(),
      reviewedBy: currentUser.uid,
    };

    if (notesInput.trim() && selectedRegistration === registrationId) {
      updateData.notes = notesInput.trim();
    }

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

    // Send notification to student
    const program = programs.find(p => p.id === registration.programId);
    const notificationMessage = getNotificationMessage(
      newStatus, 
      program?.title, 
      notesInput.trim()
    );

    await sendNotification({
      user_email: registration.userEmail,
      message: notificationMessage,
      type: 'status_change',
      status_before: registration.status,
      status_after: newStatus,
      title: getNotificationTitle(newStatus),
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

    setSuccess(`Registration ${newStatus} successfully! Notification sent to ${registration.userEmail}.`);
    
    setNotesInput('');
    setSelectedRegistration(null);
    
    updateStats(registrations.map(r => 
      r.id === registrationId ? { ...r, status: newStatus } : r
    ));

    setTimeout(() => setSuccess(''), 3000);
  } catch (err) {
    console.error('Error updating registration status:', err);
    setError('Failed to update registration status');
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
        updatedAt: new Date(),
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
    } catch (err) {
      console.error('Error saving notes:', err);
      setError('Failed to save notes');
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
        (reg.userPhone && reg.userPhone.includes(term)) ||
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
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Registrations Management</h1>
          <p className="text-gray-600">Review and manage student applications for training programs</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Program List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Training Programs</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {programs.map((program) => (
                  <button
                    key={program.id}
                    onClick={() => setSelectedProgram(program.id)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedProgram === program.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{program.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>{program.category}</div>
                      <div>{program.duration} • {program.instructor}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Registration Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Applications</span>
                  <span className="font-bold">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-600">Pending Review</span>
                  <span className="font-bold">{stats.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600">Accepted</span>
                  <span className="font-bold">{stats.accepted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-600">Enrolled</span>
                  <span className="font-bold">{stats.enrolled}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-600">Rejected</span>
                  <span className="font-bold">{stats.rejected}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Registrations */}
          <div className="lg:col-span-3">
            {selectedProgram ? (
              <>
                {/* Program Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedProgramData?.title}
                      </h2>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>Category: {selectedProgramData?.category}</span>
                        <span>Duration: {selectedProgramData?.duration}</span>
                        <span>Instructor: {selectedProgramData?.instructor}</span>
                        <span>Capacity: {selectedProgramData?.maxParticipants} students</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchRegistrations(selectedProgram)}
                        disabled={loadingRegistrations}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                      >
                        <svg className={`w-5 h-5 mr-2 ${loadingRegistrations ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search students by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                      title="select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <div className="text-sm text-gray-500">Loading...</div>
                      )}
                    </div>
                  </div>

                  {filteredRegistrations.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-gray-500 mb-4">
                        {registrations.length === 0 
                          ? 'No student applications for this program yet.'
                          : 'No applications match your filters.'}
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredRegistrations.map((registration) => (
                        <div key={registration.id} className="p-6 hover:bg-gray-50">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Student Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-blue-600 font-bold">
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
                                  
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    <span className={`px-3 py-1 text-sm rounded-full flex items-center gap-2 ${getStatusColor(registration.status)}`}>
                                      <span>{getStatusIcon(registration.status)}</span>
                                      <span className="font-medium">{registration.status.toUpperCase()}</span>
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                      Applied: {registration.appliedAt.toLocaleDateString()}
                                    </span>
                                    {registration.reviewedAt && (
                                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                        Reviewed: {registration.reviewedAt.toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  {registration.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateStatus(registration.id, 'accepted')}
                                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => handleUpdateStatus(registration.id, 'rejected')}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                      >
                                        Decline
                                      </button>
                                    </>
                                  )}
                                  {registration.status === 'accepted' && (
                                    <button
                                      onClick={() => handleUpdateStatus(registration.id, 'enrolled')}
                                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                                    >
                                      Mark as Enrolled
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Notes Section */}
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-sm font-medium text-gray-700">Notes</div>
                                  {selectedRegistration === registration.id ? (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleSaveNotes(registration.id)}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedRegistration(null);
                                          setNotesInput('');
                                        }}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleAddNotes(registration.id)}
                                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                                    >
                                      {registration.notes ? 'Edit Notes' : 'Add Notes'}
                                    </button>
                                  )}
                                </div>
                                
                                {selectedRegistration === registration.id ? (
                                  <textarea
                                    value={notesInput}
                                    onChange={(e) => setNotesInput(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Add notes about this student's application..."
                                  />
                                ) : (
                                  <div className={`p-3 rounded-lg ${registration.notes ? 'bg-gray-50' : 'bg-gray-100'}`}>
                                    {registration.notes ? (
                                      <p className="text-gray-700">{registration.notes}</p>
                                    ) : (
                                      <p className="text-gray-500 italic">No notes added yet.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action History */}
                            <div className="lg:w-64">
                              <div className="text-sm font-medium text-gray-700 mb-2">Action History</div>
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <div className="text-gray-900">Applied</div>
                                  <div className="text-gray-500">
                                    {registration.appliedAt.toLocaleDateString()} at{' '}
                                    {registration.appliedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                                
                                {registration.reviewedAt && (
                                  <div className="text-sm">
                                    <div className="text-gray-900">Reviewed</div>
                                    <div className="text-gray-500">
                                      {registration.reviewedAt.toLocaleDateString()} at{' '}
                                      {registration.reviewedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    {registration.reviewedBy && (
                                      <div className="text-gray-500 text-xs">
                                        By: {users[registration.reviewedBy]?.displayName || 'Admin'}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Quick Actions */}
                                <div className="pt-4 border-t">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions</div>
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={() => window.open(`mailto:${registration.userEmail}`, '_blank')}
                                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                                    >
                                      Email Student
                                    </button>
                                    <button
                                      onClick={() => {
                                        // View student profile
                                        alert(`View profile for ${registration.userName}`);
                                      }}
                                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                                    >
                                      View Profile
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bulk Actions */}
                {registrations.length > 0 && (
                  <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Bulk Actions</h3>
                    <div className="flex flex-wrap gap-3">
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
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
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
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      >
                        Decline All Pending
                      </button>
                      <button
                        onClick={() => {
                          // Export to CSV
                          alert('Export feature coming soon!');
                        }}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                      >
                        Export to CSV
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
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