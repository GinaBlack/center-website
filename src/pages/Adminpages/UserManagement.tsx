import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../constants/roles';
import { 
  collection, 
  query, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  where,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/firebase_config';

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: ROLES.USER | ROLES.INSTRUCTOR | ROLES.ADMIN;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  photoUrl: string | null;
  phoneNumber?: string;
  lastLogin?: string;
  status: 'active' | 'suspended' | 'banned';
  metadata?: {
    lastIp?: string;
    loginAttempts?: number;
  };
}

const UserManagement: React.FC = () => {
  const { userData, hasMinimumRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<ROLES | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    role: ROLES.USER,
    phoneNumber: ''
  });

  // Check if current user has admin privileges
  //const isAdmin = hasMinimumRole(ROLES.ADMIN);
   const isAdmin = userData?.role === ROLES.ADMIN;
  // Fetch users from Firestore
  const fetchUsers = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      let q = query(usersRef, orderBy('createdAt', 'desc'));
      
      // Apply filters
      if (roleFilter !== 'all') {
        q = query(q, where('role', '==', roleFilter));
      }
      if (statusFilter !== 'all') {
        q = query(q, where('status', '==', statusFilter));
      }

      const snapshot = await getDocs(q);
      const usersList: User[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          uid: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp 
            ? data.updatedAt.toDate().toISOString() 
            : data.updatedAt,
        } as User);
      });

      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.displayName.toLowerCase().includes(searchLower) ||
      user.phoneNumber?.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  // Handle user selection
  const toggleUserSelection = (uid: string) => {
    setSelectedUsers(prev =>
      prev.includes(uid)
        ? prev.filter(id => id !== uid)
        : [...prev, uid]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.uid));
    }
  };

  // Add new user
  const handleAddUser = async () => {
    try {
      // This would typically call Firebase Admin SDK via Cloud Function
      // For now, we'll just add to Firestore
      const newUserData: Partial<User> = {
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        phoneNumber: newUser.phoneNumber || '',
      };

      // Note: In production, you'd create the user via Firebase Auth first
      // using a Cloud Function with admin privileges
      alert('User creation would be handled by a Cloud Function in production');
      
      setShowAddModal(false);
      resetNewUserForm();
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user. Please try again.');
    }
  };

  // Edit user
  const handleEditUser = async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: currentUser.displayName,
        role: currentUser.role,
        phoneNumber: currentUser.phoneNumber || '',
        updatedAt: new Date().toISOString(),
      });

      setShowEditModal(false);
      fetchUsers();
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  // Delete user(s)
  const handleDeleteUsers = async () => {
    if (!selectedUsers.length && !currentUser) return;

    const usersToDelete = currentUser ? [currentUser.uid] : selectedUsers;

    try {
      const batch = writeBatch(db);
      usersToDelete.forEach(uid => {
        const userRef = doc(db, 'users', uid);
        batch.delete(userRef);
      });

      await batch.commit();
      
      setSelectedUsers([]);
      setShowDeleteModal(false);
      fetchUsers();
      alert(`${usersToDelete.length} user(s) deleted successfully!`);
    } catch (error) {
      console.error('Error deleting users:', error);
      alert('Failed to delete users. Please try again.');
    }
  };

  // Suspend/ban user
  const handleSuspendUser = async (uid: string, status: 'suspended' | 'banned') => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status,
        updatedAt: new Date().toISOString(),
      });

      fetchUsers();
      alert(`User ${status === 'suspended' ? 'suspended' : 'banned'} successfully!`);
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user. Please try again.');
    }
  };

  // Reset new user form
  const resetNewUserForm = () => {
    setNewUser({
      email: '',
      password: '',
      displayName: '',
      role: ROLES.USER,
      phoneNumber: ''
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get role color
  const getRoleColor = (role: ROLES) => {
    switch (role) {
      case ROLES.ADMIN: return 'bg-purple-100 text-purple-700';
      case ROLES.INSTRUCTOR: return 'bg-blue-100 text-blue-700';
      case ROLES.USER: return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'suspended': return 'bg-yellow-100 text-yellow-700';
      case 'banned': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Check if current user can modify target user
  const canModifyUser = (targetUser: User) => {
    if (!userData) return false;
    if (userData.uid === targetUser.uid) return false; // Cannot modify self
    
    const rolePriority = {
      [ROLES.ADMIN]: 3,
      [ROLES.INSTRUCTOR]: 2,
      [ROLES.USER]: 1
    };
    
    return rolePriority[userData.role] > rolePriority[targetUser.role];
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access the user management page.
              Admin privileges are required.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 p-4 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage all users, roles, and permissions</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchUsers}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold mt-1">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold mt-1">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Suspended</p>
                  <p className="text-2xl font-bold mt-1">
                    {users.filter(u => u.status === 'suspended').length}
                  </p>
                </div>
                <EyeOff className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Banned</p>
                  <p className="text-2xl font-bold mt-1">
                    {users.filter(u => u.status === 'banned').length}
                  </p>
                </div>
                <ShieldOff className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as ROLES | 'all')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value={ROLES.USER}>Users</option>
                <option value={ROLES.INSTRUCTOR}>Instructors</option>
                <option value={ROLES.ADMIN}>Admins</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>

          {/* Selected Users Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <span className="font-medium text-blue-700">
                  {selectedUsers.length} user(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedUsers.length === 1) {
                      const user = users.find(u => u.uid === selectedUsers[0]);
                      if (user && canModifyUser(user)) {
                        setCurrentUser(user);
                        setShowEditModal(true);
                      } else {
                        alert('You cannot modify this user');
                      }
                    } else {
                      alert('Please select only one user to edit');
                    }
                  }}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1"
                  disabled={selectedUsers.length !== 1}
                >
                  <Edit className="w-3 h-3" />
                  Edit Selected
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-3 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search or filters' : 'No users in the system yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">User</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Role</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Email Verified</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Joined</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.uid)}
                            onChange={() => toggleUserSelection(user.uid)}
                            className="rounded border-gray-300"
                            disabled={!canModifyUser(user)}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`}
                              alt={user.displayName}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium">{user.displayName}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              {user.phoneNumber && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Phone className="w-3 h-3" />
                                  {user.phoneNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {user.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <XCircle className="w-4 h-4" />
                              Not Verified
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setCurrentUser(user);
                                setShowEditModal(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              title="Edit"
                              disabled={!canModifyUser(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (user.status === 'active') {
                                  handleSuspendUser(user.uid, 'suspended');
                                } else if (user.status === 'suspended') {
                                  handleSuspendUser(user.uid, 'active');
                                }
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              title={user.status === 'active' ? 'Suspend' : 'Activate'}
                              disabled={!canModifyUser(user)}
                            >
                              {user.status === 'active' ? (
                                <EyeOff className="w-4 h-4 text-yellow-600" />
                              ) : (
                                <Eye className="w-4 h-4 text-green-600" />
                              )}
                            </button>
                            <button
                              onClick={() => handleSuspendUser(user.uid, 'banned')}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              title="Ban"
                              disabled={!canModifyUser(user) || user.status === 'banned'}
                            >
                              <ShieldOff className="w-4 h-4 text-red-600" />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              title="Delete"
                              disabled={!canModifyUser(user)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {}}
                    className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ">
          <div className="bg-background rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg text-black  font-bold">Add New User</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetNewUserForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={newUser.displayName}
                    onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as ROLES })}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value={ROLES.USER}>User</option>
                    <option value={ROLES.INSTRUCTOR}>Instructor</option>
                    <option value={ROLES.ADMIN}>Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetNewUserForm();
                  }}
                  className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Edit User</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full p-3 border rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={currentUser.displayName}
                    onChange={(e) => setCurrentUser({ ...currentUser, displayName: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={currentUser.phoneNumber || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, phoneNumber: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={currentUser.role}
                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as ROLES })}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value={ROLES.USER}>User</option>
                    <option value={ROLES.INSTRUCTOR}>Instructor</option>
                    <option value={ROLES.ADMIN}>Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={currentUser.status}
                    onChange={(e) => setCurrentUser({ ...currentUser, status: e.target.value as any })}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                > 
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0  w-temp h-temp bg-background bg-opacity-50 flex rounded-xl border-2 items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold">Confirm Delete</h3>
            </div>

            <p className="text-black mb-6">
              Are you sure you want to delete{' '}
              {currentUser 
                ? `"${currentUser.displayName}"` 
                : `${selectedUsers.length} selected user(s)`}?
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCurrentUser(null);
                }}
                className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUsers}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-destructive"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
  );
};

export default UserManagement;