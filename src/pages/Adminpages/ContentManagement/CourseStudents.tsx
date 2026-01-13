import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase/firebase_config';
import { 
  doc, getDoc, collection, query, where, getDocs, updateDoc,
  addDoc, serverTimestamp
} from 'firebase/firestore';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  registeredAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
}

interface TrainingProgram {
  id: string;
  title: string;
  category: string;
  duration: string;
  instructor: string;
  maxParticipants: number;
}

const CourseStudentsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchProgramAndStudents(id);
    }
  }, [id]);

  const fetchProgramAndStudents = async (programId: string) => {
    try {
      setLoading(true);
      
      // Fetch program details
      const programRef = doc(db, 'trainingPrograms', programId);
      const programSnap = await getDoc(programRef);

      if (programSnap.exists()) {
        const data = programSnap.data();
        setProgram({
          id: programSnap.id,
          title: data.title,
          category: data.category,
          duration: data.duration,
          instructor: data.instructor || '--',
          maxParticipants: data.maxParticipants,
        });

        // Fetch students registered for this program
        const registrationsRef = collection(db, 'registrations');
        const q = query(registrationsRef, where('programId', '==', programId));
        const registrationsSnap = await getDocs(q);

        const studentsData: Student[] = [];
        for (const registrationDoc of registrationsSnap.docs) {
          const registrationData = registrationDoc.data();
          const studentId = registrationData.userId;
          
          // Fetch user details
          const userRef = doc(db, 'users', studentId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            
            // Handle potential undefined registeredAt
            let registeredAt: Date;
            if (registrationData.registeredAt) {
              // If it's a Firestore timestamp, convert to Date
              if (typeof registrationData.registeredAt.toDate === 'function') {
                registeredAt = registrationData.registeredAt.toDate();
              } else if (registrationData.registeredAt instanceof Date) {
                registeredAt = registrationData.registeredAt;
              } else {
                // Try to parse it as a date string/number
                registeredAt = new Date(registrationData.registeredAt);
              }
            } else {
              // Fallback to current date or a default
              registeredAt = new Date();
            }
            
            studentsData.push({
              id: userSnap.id,
              name: userData.displayName || userData.email?.split('@')[0] || 'Unknown',
              email: userData.email,
              phone: userData.phoneNumber,
              registeredAt: registeredAt,
              status: registrationData.status || 'pending',
            });
          }
        }

        setStudents(studentsData);
        setError('');
      } else {
        setError('Program not found');
      }
    } catch (err) {
      console.error('Error fetching program students:', err);
      setError('Failed to load program students');
    } finally {
      setLoading(false);
    }
  };

  // Function to send notification to user
  const sendNotification = async (
    userEmail: string,
    message: string,
    type: 'status_change',
    statusBefore: string,
    statusAfter: string,
    programId: string,
    programTitle: string
  ) => {
    try {
      const notificationLogsRef = collection(db, 'notification_logs');
      
      await addDoc(notificationLogsRef, {
        user_email: userEmail,
        title: getNotificationTitle(statusAfter),
        message: message,
        type: type,
        status_before: statusBefore,
        status_after: statusAfter,
        is_sent: true,
        sent_via: 'both', // email and in-app
        created_at: serverTimestamp(),
        read_at: null,
        metadata: {
          program_id: programId,
          program_name: programTitle,
          timestamp: new Date().toISOString(),
        },
        action_url: `/training/${programId}`,
        related_program_id: programId,
        related_program_name: programTitle,
      });

      console.log('Notification sent successfully');
    } catch (err) {
      console.error('Error sending notification:', err);
      // Don't throw error here - we don't want to block status update
    }
  };

  const getNotificationTitle = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Application Accepted!';
      case 'rejected':
        return 'Application Update';
      case 'pending':
        return 'Application Status Changed';
      case 'completed':
        return 'Training Completed!';
      default:
        return 'Status Update';
    }
  };

  const getNotificationMessage = (
    programTitle: string,
    statusBefore: string,
    statusAfter: string
  ) => {
    switch (statusAfter) {
      case 'accepted':
        return `Congratulations! Your application for "${programTitle}" has been accepted. You can now proceed with the training.`;
      case 'rejected':
        return `Your application for "${programTitle}" has been reviewed. Unfortunately, it has not been accepted at this time.`;
      case 'pending':
        return `Your application status for "${programTitle}" has been changed from ${statusBefore} to pending.`;
      case 'completed':
        return `Congratulations! You have successfully completed the "${programTitle}" training program.`;
      default:
        return `Your application status for "${programTitle}" has been updated from ${statusBefore} to ${statusAfter}.`;
    }
  };

  const handleUpdateStatus = async (studentId: string, newStatus: Student['status']) => {
    try {
      if (!program) return;
      
      // Find the student to get current status
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const oldStatus = student.status;
      
      // Update registration status in Firestore
      const registrationsRef = collection(db, 'registrations');
      const q = query(
        registrationsRef, 
        where('programId', '==', id),
        where('userId', '==', studentId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const registrationDoc = querySnapshot.docs[0];
        
        // Update status
        await updateDoc(registrationDoc.ref, {
          status: newStatus,
          updatedAt: new Date(),
        });

        // Send notification to user
        await sendNotification(
          student.email,
          getNotificationMessage(program.title, oldStatus, newStatus),
          'status_change',
          oldStatus,
          newStatus,
          program.id,
          program.title
        );

        // Update local state
        setStudents(prev => prev.map(student => 
          student.id === studentId ? { ...student, status: newStatus } : student
        ));

        // Show success message
        alert(`Status updated to ${newStatus}. Notification sent to ${student.email}`);
      }
    } catch (err) {
      console.error('Error updating student status:', err);
      alert('Failed to update student status');
    }
  };

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: Student['status']) => {
    switch (status) {
      case 'accepted': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      case 'completed': return '🎓';
      default: return '📄';
    }
  };

  // Bulk status update functions
  const bulkAcceptSelected = () => {
    // Implement if you want bulk actions
    // You would need to track selected students
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg">Loading student list...</div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Program Not Found</h1>
        <p className="text-gray-600 mb-6">{error || 'The requested program could not be found.'}</p>
        <button
          onClick={() => navigate('/workshops')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Programs
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
          <Link to={`/training/${id}`} className="hover:text-blue-600">{program.title}</Link>
          {' > '}
          <span className="text-gray-900">Students</span>
        </div>

        {/* Program Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{program.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>Category: {program.category}</span>
                <span>Duration: {program.duration}</span>
                <span>Instructor: {program.instructor}</span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{students.length}/{program.maxParticipants}</div>
              <div className="text-sm text-blue-700">Enrolled Students</div>
            </div>
          </div>
        </div>

        {/* Status Summary Bar */}
        <div className="mb-6 bg-white rounded-xl shadow p-4">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm text-gray-700">
                Pending: <span className="font-bold">{students.filter(s => s.status === 'pending').length}</span>
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-700">
                Accepted: <span className="font-bold">{students.filter(s => s.status === 'accepted').length}</span>
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-gray-700">
                Rejected: <span className="font-bold">{students.filter(s => s.status === 'rejected').length}</span>
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-700">
                Completed: <span className="font-bold">{students.filter(s => s.status === 'completed').length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Enrolled Students ({students.length})</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/training/${id}`)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Back to Program
                </button>
                <button
                  onClick={fetchProgramAndStudents}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 mb-4">No students enrolled in this program yet.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">ID: {student.id.substring(0, 8)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">{student.email}</div>
                          {student.phone && (
                            <div className="text-gray-500">{student.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {student.registeredAt ? student.registeredAt.toLocaleDateString() : 'Not available'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.registeredAt ? 
                            student.registeredAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                            ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(student.status)}`}>
                            {getStatusIcon(student.status)} {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <select
                            title="select"
                            value={student.status}
                            onChange={(e) => handleUpdateStatus(student.id, e.target.value as Student['status'])}
                            className="px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="completed">Completed</option>
                          </select>
                          <button
                            onClick={() => {
                              // Navigate to student details or send message
                              navigate(`/admin/users/${student.id}`);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                          >
                            View Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{students.length}</div>
            <div className="text-gray-600">Total Students</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {students.filter(s => s.status === 'accepted').length}
            </div>
            <div className="text-gray-600">Accepted</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {students.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-red-600">
              {students.filter(s => s.status === 'rejected').length}
            </div>
            <div className="text-gray-600">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseStudentsPage;