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
  AlertCircle,
  XCircle as XIcon,
  Trash,
  Archive,
  Undo,
  RotateCcw,
  User,
  MapPin,
  Clock,
  UserCheck,
  UserX,
  Loader2
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
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase_config';

interface User {
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
  displayName: string;
  role: ROLES.USER | ROLES.INSTRUCTOR | ROLES.CENTER_ADMIN | ROLES.SUPER_ADMIN;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
  deleted_reason?: string | null;
  avatar_url?: string | null;
  phone_number?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
  };
  last_login?: string;
  status: 'active' | 'suspended' | 'banned' | 'deleted';
}

const UserManagement: React.FC = () => {
  const { userData } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<ROLES | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned' | 'deleted'>('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: ROLES.USER as ROLES,
    phone_number: ''
  });

  // Loading states for different actions
  const [actionLoading, setActionLoading] = useState<{
    fetchUsers: boolean;
    editUser: boolean;
    softDelete: boolean;
    restore: boolean;
    permanentDelete: boolean;
    updateStatus: Record<string, boolean>;
  }>({
    fetchUsers: false,
    editUser: false,
    softDelete: false,
    restore: false,
    permanentDelete: false,
    updateStatus: {}
  });

  // Check if current user has admin privileges
  const isAdmin = userData?.role === ROLES.SUPER_ADMIN || userData?.role === ROLES.CENTER_ADMIN;

  // Fetch users from Firestore with soft delete filter
  const fetchUsers = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      setActionLoading(prev => ({ ...prev, fetchUsers: true }));
      const usersRef = collection(db, 'users');
      let q = query(usersRef, orderBy('created_at', 'desc'));
      
      // Apply filters
      if (roleFilter !== 'all') {
        q = query(q, where('role', '==', roleFilter));
      }
      if (statusFilter !== 'all') {
        q = query(q, where('status', '==', statusFilter));
      }
      
      // Exclude soft deleted users by default unless showing deleted
      if (!showDeleted) {
        q = query(q, where('status', '!=', 'deleted'));
      }

      const snapshot = await getDocs(q);
      const usersList: User[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          uid: doc.id,
          email: data.email,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          displayName: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          role: data.role,
          email_verified: data.email_verified || false,
          created_at: data.created_at instanceof Timestamp 
            ? data.created_at.toDate().toISOString() 
            : data.created_at || new Date().toISOString(),
          updated_at: data.updated_at instanceof Timestamp 
            ? data.updated_at.toDate().toISOString() 
            : data.updated_at || new Date().toISOString(),
          deleted_at: data.deleted_at instanceof Timestamp 
            ? data.deleted_at.toDate().toISOString() 
            : data.deleted_at || null,
          deleted_by: data.deleted_by || null,
          deleted_reason: data.deleted_reason || null,
          avatar_url: data.avatar_url || null,
          phone_number: data.phone_number || '',
          address: data.address || {},
          last_login: data.last_login instanceof Timestamp 
            ? data.last_login.toDate().toISOString() 
            : data.last_login,
          status: data.status || 'active',
        });
      });

      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
      setActionLoading(prev => ({ ...prev, fetchUsers: false }));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, showDeleted]);

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower) ||
      user.phone_number?.toLowerCase().includes(searchLower) ||
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

  // Edit user
  const handleEditUser = async () => {
    if (!currentUser) return;

    try {
      setActionLoading(prev => ({ ...prev, editUser: true }));
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        role: currentUser.role,
        phone_number: currentUser.phone_number || '',
        status: currentUser.status === 'deleted' ? 'active' : currentUser.status,
        updated_at: serverTimestamp(),
      });

      setShowEditModal(false);
      await fetchUsers();
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, editUser: false }));
    }
  };

  // Soft delete user(s)
  const handleSoftDeleteUsers = async () => {
    if (!selectedUsers.length && !currentUser) return;

    const usersToDelete = currentUser ? [currentUser.uid] : selectedUsers;

    try {
      setActionLoading(prev => ({ ...prev, softDelete: true }));
      const batch = writeBatch(db);
      usersToDelete.forEach(uid => {
        const userRef = doc(db, 'users', uid);
        batch.update(userRef, {
          status: 'deleted',
          deleted_at: serverTimestamp(),
          deleted_by: userData?.uid || null,
          deleted_reason: deleteReason || 'No reason provided',
          updated_at: serverTimestamp(),
        });
      });

      await batch.commit();
      
      setSelectedUsers([]);
      setDeleteReason('');
      setShowDeleteModal(false);
      setCurrentUser(null);
      await fetchUsers();
      alert(`${usersToDelete.length} user(s) moved to trash successfully!`);
    } catch (error) {
      console.error('Error soft deleting users:', error);
      alert('Failed to delete users. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, softDelete: false }));
    }
  };

  // Restore user(s)
  const handleRestoreUsers = async () => {
    if (!selectedUsers.length && !currentUser) return;

    const usersToRestore = currentUser ? [currentUser.uid] : selectedUsers;

    try {
      setActionLoading(prev => ({ ...prev, restore: true }));
      const batch = writeBatch(db);
      usersToRestore.forEach(uid => {
        const userRef = doc(db, 'users', uid);
        batch.update(userRef, {
          status: 'active',
          deleted_at: null,
          deleted_by: null,
          deleted_reason: null,
          updated_at: serverTimestamp(),
        });
      });

      await batch.commit();
      
      setSelectedUsers([]);
      setShowRestoreModal(false);
      setCurrentUser(null);
      await fetchUsers();
      alert(`${usersToRestore.length} user(s) restored successfully!`);
    } catch (error) {
      console.error('Error restoring users:', error);
      alert('Failed to restore users. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, restore: false }));
    }
  };

  // Permanent delete user(s) - Only for SUPER_ADMIN
  const handlePermanentDeleteUsers = async () => {
    if (!selectedUsers.length && !currentUser) return;

    const usersToDelete = currentUser ? [currentUser.uid] : selectedUsers;

    try {
      setActionLoading(prev => ({ ...prev, permanentDelete: true }));
      const batch = writeBatch(db);
      usersToDelete.forEach(uid => {
        const userRef = doc(db, 'users', uid);
        batch.delete(userRef);
      });

      await batch.commit();
      
      setSelectedUsers([]);
      setShowPermanentDeleteModal(false);
      setCurrentUser(null);
      await fetchUsers();
      alert(`${usersToDelete.length} user(s) permanently deleted!`);
    } catch (error) {
      console.error('Error permanently deleting users:', error);
      alert('Failed to permanently delete users. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, permanentDelete: false }));
    }
  };

  // Suspend/ban/activate user
  const handleUpdateStatus = async (uid: string, status: 'active' | 'suspended' | 'banned') => {
    try {
      setActionLoading(prev => ({ 
        ...prev, 
        updateStatus: { ...prev.updateStatus, [uid]: true } 
      }));
      
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status,
        updated_at: serverTimestamp(),
      });

      await fetchUsers();
      alert(`User ${status === 'active' ? 'activated' : status === 'suspended' ? 'suspended' : 'banned'} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    } finally {
      setActionLoading(prev => ({ 
        ...prev, 
        updateStatus: { ...prev.updateStatus, [uid]: false } 
      }));
    }
  };

  // Check if current user can modify target user
  const canModifyUser = (targetUser: User) => {
    if (!userData || !targetUser) return false;
    if (userData.uid === targetUser.uid) return false; // Cannot modify self
    
    // SUPER_ADMIN can modify everyone
    if (userData.role === ROLES.SUPER_ADMIN) return true;
    
    // CENTER_ADMIN can modify USER and INSTRUCTOR, but not other admins
    if (userData.role === ROLES.CENTER_ADMIN) {
      return targetUser.role === ROLES.USER || targetUser.role === ROLES.INSTRUCTOR;
    }
    
    // INSTRUCTOR and USER cannot modify anyone
    return false;
  };

  // Get role color
  const getRoleColor = (role: ROLES) => {
    switch (role) {
      case ROLES.SUPER_ADMIN: return 'bg-purple-100 text-purple-700';
      case ROLES.CENTER_ADMIN: return 'bg-red-100 text-red-700';
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
      case 'deleted': return 'bg-gray-300 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date without time
  const formatDateShort = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get role display name
  const getRoleDisplay = (role: ROLES) => {
    switch (role) {
      case ROLES.SUPER_ADMIN: return 'Super Admin';
      case ROLES.CENTER_ADMIN: return 'Admin';
      case ROLES.INSTRUCTOR: return 'Instructor';
      case ROLES.USER: return 'User';
      default: return 'User';
    }
  };

  // Format address
  const formatAddress = (address: any) => {
    if (!address) return 'Not provided';
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zip_code) parts.push(address.zip_code);
    if (address.country) parts.push(address.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  // Get deleted users count
  const deletedUsersCount = users.filter(u => u.status === 'deleted').length;

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
              className="px-6 py-3 bg-blue-500 text-black rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 py-20">
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
                onClick={() => setShowDeleted(!showDeleted)}
                className={`px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 ${showDeleted ? 'bg-gray-200' : ''}`}
              >
                {showDeleted ? <Undo className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                {showDeleted ? 'Show Active Users' : `Trash (${deletedUsersCount})`}
              </button>
              <button
                onClick={fetchUsers}
                disabled={actionLoading.fetchUsers}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading.fetchUsers ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {actionLoading.fetchUsers ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mb-6">
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
                <UserCheck className="w-8 h-8 text-green-500" />
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
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Deleted</p>
                  <p className="text-2xl font-bold mt-1">
                    {deletedUsersCount}
                  </p>
                </div>
                <Archive className="w-8 h-8 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                title='input'
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as ROLES | 'all')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value={ROLES.USER}>Users</option>
                <option value={ROLES.INSTRUCTOR}>Instructors</option>
                <option value={ROLES.CENTER_ADMIN}>Admins</option>
                <option value={ROLES.SUPER_ADMIN}>Super Admins</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Status</label>
              <select
                title='select'
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>

            {/* Show Deleted Toggle */}
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">Show Deleted Users</span>
              </label>
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
                {showDeleted ? (
                  <>
                    <button
                      onClick={() => {
                        if (selectedUsers.length === 1) {
                          const user = users.find(u => u.uid === selectedUsers[0]);
                          if (user && canModifyUser(user)) {
                            setCurrentUser(user);
                            setShowRestoreModal(true);
                          } else {
                            alert('You cannot modify this user');
                          }
                        } else {
                          setShowRestoreModal(true);
                        }
                      }}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={actionLoading.restore}
                    >
                      {actionLoading.restore ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Undo className="w-3 h-3" />
                      )}
                      {actionLoading.restore ? 'Restoring...' : 'Restore Selected'}
                    </button>
                    {userData?.role === ROLES.SUPER_ADMIN && (
                      <button
                        onClick={() => setShowPermanentDeleteModal(true)}
                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={actionLoading.permanentDelete}
                      >
                        {actionLoading.permanentDelete ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash className="w-3 h-3" />
                        )}
                        {actionLoading.permanentDelete ? 'Deleting...' : 'Permanent Delete'}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (selectedUsers.length === 1) {
                          const user = users.find(u => u.uid === selectedUsers[0]);
                          if (user) {
                            setCurrentUser(user);
                            setShowViewModal(true);
                          }
                        } else {
                          alert('Please select only one user to view');
                        }
                      }}
                      className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1"
                      disabled={selectedUsers.length !== 1}
                    >
                      <User className="w-3 h-3" />
                      View Profile
                    </button>
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
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={actionLoading.softDelete}
                    >
                      {actionLoading.softDelete ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Archive className="w-3 h-3" />
                      )}
                      {actionLoading.softDelete ? 'Moving...' : 'Move to Trash'}
                    </button>
                  </>
                )}
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
                          title='input'
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
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Last Login</th>
                      {showDeleted && (
                        <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Deleted On</th>
                      )}
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className={`hover:bg-gray-50 ${user.status === 'deleted' ? 'bg-gray-50' : ''}`}>
                        <td className="py-4 px-6">
                          <input
                            title='input'
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
                              src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`}
                              alt={user.displayName}
                              className={`w-10 h-10 rounded-full ${user.status === 'deleted' ? 'opacity-50' : ''}`}
                            />
                            <div>
                              <p className={`font-medium ${user.status === 'deleted' ? 'text-gray-500' : ''}`}>
                                {user.displayName}
                                {user.status === 'deleted' && (
                                  <span className="ml-2 text-xs text-gray-500">(Deleted)</span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              {user.phone_number && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Phone className="w-3 h-3" />
                                  {user.phone_number}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                            {getRoleDisplay(user.role)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {user.email_verified ? (
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
                            {formatDateShort(user.created_at)}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(user.last_login || '')}
                          </div>
                        </td>
                        {showDeleted && user.deleted_at && (
                          <td className="py-4 px-6 text-gray-600">
                            <div className="flex items-center gap-1">
                              <Archive className="w-4 h-4" />
                              {formatDateShort(user.deleted_at)}
                            </div>
                          </td>
                        )}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setCurrentUser(user);
                                setShowViewModal(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              title="View Profile"
                            >
                              <User className="w-4 h-4" />
                            </button>
                            {user.status === 'deleted' ? (
                              <>
                                <button
                                  onClick={() => {
                                    setCurrentUser(user);
                                    setShowRestoreModal(true);
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Restore"
                                  disabled={!canModifyUser(user) || actionLoading.restore}
                                >
                                  {actionLoading.restore ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Undo className="w-4 h-4 text-green-600" />
                                  )}
                                </button>
                                {userData?.role === ROLES.SUPER_ADMIN && (
                                  <button
                                    onClick={() => {
                                      setCurrentUser(user);
                                      setShowPermanentDeleteModal(true);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Permanent Delete"
                                    disabled={actionLoading.permanentDelete}
                                  >
                                    {actionLoading.permanentDelete ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash className="w-4 h-4 text-red-600" />
                                    )}
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setCurrentUser(user);
                                    setShowEditModal(true);
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Edit"
                                  disabled={!canModifyUser(user) || actionLoading.editUser}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {user.status === 'active' ? (
                                  <button
                                    onClick={() => handleUpdateStatus(user.uid, 'suspended')}
                                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Suspend"
                                    disabled={!canModifyUser(user) || actionLoading.updateStatus[user.uid]}
                                  >
                                    {actionLoading.updateStatus[user.uid] ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                                    ) : (
                                      <EyeOff className="w-4 h-4 text-yellow-600" />
                                    )}
                                  </button>
                                ) : user.status === 'suspended' ? (
                                  <button
                                    onClick={() => handleUpdateStatus(user.uid, 'active')}
                                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Activate"
                                    disabled={!canModifyUser(user) || actionLoading.updateStatus[user.uid]}
                                  >
                                    {actionLoading.updateStatus[user.uid] ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-green-600" />
                                    )}
                                  </button>
                                ) : null}
                                <button
                                  onClick={() => handleUpdateStatus(user.uid, 'banned')}
                                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Ban"
                                  disabled={!canModifyUser(user) || user.status === 'banned' || actionLoading.updateStatus[user.uid]}
                                >
                                  {actionLoading.updateStatus[user.uid] ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                                  ) : (
                                    <ShieldOff className="w-4 h-4 text-red-600" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setCurrentUser(user);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Move to Trash"
                                  disabled={!canModifyUser(user) || actionLoading.softDelete}
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                              </>
                            )}
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
                  {showDeleted && ` (${deletedUsersCount} deleted)`}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* View User Profile Modal */}
      {showViewModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">User Profile</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* User Info Section */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName)}&background=random&size=128`}
                    alt={currentUser.displayName}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                  <div>
                    <h2 className="text-2xl font-bold">{currentUser.displayName}</h2>
                    <p className="text-gray-600">{currentUser.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(currentUser.role)}`}>
                        {getRoleDisplay(currentUser.role)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentUser.status)}`}>
                        {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">Email Status</p>
                    <p className={`font-medium ${currentUser.email_verified ? 'text-green-600' : 'text-red-600'}`}>
                      {currentUser.email_verified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">Account Created</p>
                    <p className="font-medium">{formatDateShort(currentUser.created_at)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">{formatDateShort(currentUser.updated_at)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium">{formatDate(currentUser.last_login || '')}</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">First Name</p>
                      <p className="font-medium">{currentUser.first_name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Last Name</p>
                      <p className="font-medium">{currentUser.last_name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium flex items-center gap-2">
                        {currentUser.email}
                        {currentUser.email_verified ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {currentUser.phone_number || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{formatAddress(currentUser.address)}</p>
                    {currentUser.address && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        {currentUser.address.street && (
                          <div>
                            <p className="text-gray-500">Street</p>
                            <p>{currentUser.address.street}</p>
                          </div>
                        )}
                        {currentUser.address.city && (
                          <div>
                            <p className="text-gray-500">City</p>
                            <p>{currentUser.address.city}</p>
                          </div>
                        )}
                        {currentUser.address.state && (
                          <div>
                            <p className="text-gray-500">State</p>
                            <p>{currentUser.address.state}</p>
                          </div>
                        )}
                        {currentUser.address.country && (
                          <div>
                            <p className="text-gray-500">Country</p>
                            <p>{currentUser.address.country}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-mono text-sm truncate">{currentUser.uid}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Account Status</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentUser.status)}`}>
                          {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
                        </span>
                        {currentUser.status === 'deleted' && currentUser.deleted_reason && (
                          <span className="text-xs text-gray-500" title={currentUser.deleted_reason}>
                            Reason: {currentUser.deleted_reason}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">User Role</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(currentUser.role)}`}>
                        {getRoleDisplay(currentUser.role)}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Email Verification</p>
                      <div className="flex items-center gap-2">
                        {currentUser.email_verified ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-600">Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-red-600">Not Verified</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Activity Timeline
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Account Created</p>
                        <p className="text-sm text-gray-500">{formatDate(currentUser.created_at)}</p>
                      </div>
                    </div>
                    {currentUser.last_login && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">Last Login</p>
                          <p className="text-sm text-gray-500">{formatDate(currentUser.last_login)}</p>
                        </div>
                      </div>
                    )}
                    {currentUser.updated_at && currentUser.updated_at !== currentUser.created_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">Last Updated</p>
                          <p className="text-sm text-gray-500">{formatDate(currentUser.updated_at)}</p>
                        </div>
                      </div>
                    )}
                    {currentUser.deleted_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">Account Deleted</p>
                          <p className="text-sm text-gray-500">{formatDate(currentUser.deleted_at)}</p>
                          {currentUser.deleted_reason && (
                            <p className="text-sm text-gray-500 mt-1">Reason: {currentUser.deleted_reason}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {currentUser.status !== 'deleted' && (
                  <>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setShowEditModal(true);
                      }}
                      className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!canModifyUser(currentUser) || actionLoading.editUser}
                    >
                      {actionLoading.editUser && <Loader2 className="w-4 h-4 animate-spin" />}
                      Edit User
                    </button>
                    {currentUser.status === 'active' ? (
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          handleUpdateStatus(currentUser.uid, 'suspended');
                        }}
                        className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!canModifyUser(currentUser) || actionLoading.updateStatus[currentUser.uid]}
                      >
                        {actionLoading.updateStatus[currentUser.uid] && <Loader2 className="w-4 h-4 animate-spin" />}
                        Suspend
                      </button>
                    ) : currentUser.status === 'suspended' ? (
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          handleUpdateStatus(currentUser.uid, 'active');
                        }}
                        className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!canModifyUser(currentUser) || actionLoading.updateStatus[currentUser.uid]}
                      >
                        {actionLoading.updateStatus[currentUser.uid] && <Loader2 className="w-4 h-4 animate-spin" />}
                        Activate
                      </button>
                    ) : null}
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!canModifyUser(currentUser) || actionLoading.softDelete}
                    >
                      {actionLoading.softDelete && <Loader2 className="w-4 h-4 animate-spin" />}
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Edit User</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    title='input'
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full p-3 border rounded-lg bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      title='input'
                      type="text"
                      value={currentUser.first_name}
                      onChange={(e) => setCurrentUser({ ...currentUser, first_name: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      title='input'
                      type="text"
                      value={currentUser.last_name}
                      onChange={(e) => setCurrentUser({ ...currentUser, last_name: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    title='input'
                    type="tel"
                    value={currentUser.phone_number || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, phone_number: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    title='select'
                    value={currentUser.role}
                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as ROLES })}
                    className="w-full p-3 border rounded-lg"
                    disabled={userData?.role !== ROLES.SUPER_ADMIN}
                  >
                    <option value={ROLES.USER}>User</option>
                    <option value={ROLES.INSTRUCTOR}>Instructor</option>
                    <option value={ROLES.CENTER_ADMIN}>Admin</option>
                    <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
                  </select>
                  {userData?.role !== ROLES.SUPER_ADMIN && (
                    <p className="text-sm text-gray-500 mt-1">Only Super Admins can change roles</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    title='select'
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
                  className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading.editUser}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading.editUser}
                > 
                  {actionLoading.editUser && <Loader2 className="w-4 h-4 animate-spin" />}
                  {actionLoading.editUser ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white shadow-lg rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Archive className="w-12 h-12 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold">Move to Trash</h3>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to move{' '}
              {currentUser 
                ? `"${currentUser.displayName}"` 
                : `${selectedUsers.length} selected user(s)`} to trash?
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Reason for deletion (optional)</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason for deletion..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCurrentUser(null);
                  setDeleteReason('');
                }}
                className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading.softDelete}
              >
                Cancel
              </button>
              <button
                onClick={handleSoftDeleteUsers}
                className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading.softDelete}
              >
                {actionLoading.softDelete && <Loader2 className="w-4 h-4 animate-spin" />}
                {actionLoading.softDelete ? 'Moving...' : (
                  <>
                    <Archive className="w-6 h-6 inline-block mr-2" />
                    Move to Trash
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white shadow-lg rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Undo className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-xl font-bold">Restore User</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to restore{' '}
              {currentUser 
                ? `"${currentUser.displayName}"` 
                : `${selectedUsers.length} selected user(s)`}?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setCurrentUser(null);
                }}
                className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading.restore}
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreUsers}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading.restore}
              >
                {actionLoading.restore && <Loader2 className="w-4 h-4 animate-spin" />}
                {actionLoading.restore ? 'Restoring...' : (
                  <>
                    <Undo className="w-6 h-6 inline-block mr-2" />
                    Restore
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {showPermanentDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white shadow-lg rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-500">Permanent Delete</h3>
            </div>

            <p className="text-gray-600 mb-6">
              <strong className="text-red-600">Warning: This action cannot be undone!</strong><br/><br/>
              Are you sure you want to permanently delete{' '}
              {currentUser 
                ? `"${currentUser.displayName}"` 
                : `${selectedUsers.length} selected user(s)`}?
              All user data will be permanently removed from the system.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPermanentDeleteModal(false);
                  setCurrentUser(null);
                }}
                className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading.permanentDelete}
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDeleteUsers}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading.permanentDelete}
              >
                {actionLoading.permanentDelete && <Loader2 className="w-4 h-4 animate-spin" />}
                {actionLoading.permanentDelete ? 'Deleting...' : (
                  <>
                    <Trash className="w-6 h-6 inline-block mr-2" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;