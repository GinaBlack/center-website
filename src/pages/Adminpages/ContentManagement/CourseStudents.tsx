import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase/firebase_config';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  registeredAt: Date;
  status: 'active' | 'pending' | 'completed';
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
            studentsData.push({
              id: userSnap.id,
              name: userData.displayName || userData.email?.split('@')[0] || 'Unknown',
              email: userData.email,
              phone: userData.phoneNumber,
              registeredAt: registrationData.registeredAt?.toDate(),
              status: registrationData.status || 'active',
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

  const handleUpdateStatus = async (studentId: string, newStatus: Student['status']) => {
    try {
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
        await updateDoc(registrationDoc.ref, {
          status: newStatus,
          updatedAt: new Date(),
        });

        // Update local state
        setStudents(prev => prev.map(student => 
          student.id === studentId ? { ...student, status: newStatus } : student
        ));
      }
    } catch (err) {
      console.error('Error updating student status:', err);
      alert('Failed to update student status');
    }
  };

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-green-500';
      case 'pending': return 'bg-yellow-500 text-yellow-500';
      case 'completed': return 'bg-blue-500 text-blue-500';
      default: return 'bg-gray-200 text-gray-500';
    }
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

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Enrolled Students ({students.length})</h2>
              <button
                onClick={() => navigate(`/training/${id}`)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Back to Program
              </button>
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
                          {student.registeredAt.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.registeredAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(student.status)}`}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <select
                            value={student.status}
                            onChange={(e) => handleUpdateStatus(student.id, e.target.value as Student['status'])}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                          </select>
                          <button
                            onClick={() => {
                              // Navigate to student details or send message
                              alert(`View details for ${student.name}`);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                          >
                            View
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{students.length}</div>
            <div className="text-gray-600">Total Students</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {students.filter(s => s.status === 'active').length}
            </div>
            <div className="text-gray-600">Active Students</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {students.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {students.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseStudentsPage;