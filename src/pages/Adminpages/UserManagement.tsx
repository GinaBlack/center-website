import React, { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Key,
  Send,
  FileText,
  Mail as MailIcon
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
  serverTimestamp,
  limit
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
  last_login?: string | null;
  status: 'active' | 'suspended' | 'banned' | 'deleted';
}

// Helper functions that don't depend on component state
const getRoleDisplay = (role: ROLES) => {
  switch (role) {
    case ROLES.SUPER_ADMIN: return 'Super Admin';
    case ROLES.CENTER_ADMIN: return 'Admin';
    case ROLES.INSTRUCTOR: return 'Instructor';
    case ROLES.USER: return 'User';
    default: return 'User';
  }
};

const formatDateShort = (dateString: string) => {
  if (!dateString) return 'Never';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid date';
  }
};

const UserManagement: React.FC = () => {
  const { userData } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<ROLES | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned' | 'deleted'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  
  // Activity log state
  const [activityLog, setActivityLog] = useState<any[]>([]);
  
  // Loading states
  const [actionLoading, setActionLoading] = useState<{
    fetchUsers: boolean;
    editUser: boolean;
    softDelete: boolean;
    restore: boolean;
    permanentDelete: boolean;
    bulkStatusUpdate: boolean;
    exportCSV: boolean;
    sendEmail: boolean;
    updateStatus: Record<string, boolean>;
  }>({
    fetchUsers: false,
    editUser: false,
    softDelete: false,
    restore: false,
    permanentDelete: false,
    bulkStatusUpdate: false,
    exportCSV: false,
    sendEmail: false,
    updateStatus: {}
  });

  const isAdmin = userData?.role === ROLES.SUPER_ADMIN || userData?.role === ROLES.CENTER_ADMIN;

  // Helper function to convert Firestore timestamps
  const convertTimestamp = (timestamp: any): string => {
    if (!timestamp) return new Date().toISOString();
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toISOString();
    }
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toISOString();
    }
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toISOString();
    }
    return new Date().toISOString();
  };

  // Fetch users with filters
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) {
      console.log('User is not admin, skipping fetch');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      setActionLoading(prev => ({ ...prev, fetchUsers: true }));
      
      console.log('Starting fetchUsers with:', {
        roleFilter,
        statusFilter,
        isAdmin,
        currentUserRole: userData?.role
      });
      
      const usersRef = collection(db, 'users');
      
      // Start with basic query
      let q = query(usersRef, orderBy('created_at', 'desc'));
      
      // Apply role filter if not 'all'
      if (roleFilter !== 'all') {
        console.log('Applying role filter:', roleFilter);
        q = query(q, where('role', '==', roleFilter));
      }
      
      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        console.log('Applying status filter:', statusFilter);
        q = query(q, where('status', '==', statusFilter));
      }

      console.log('Executing Firestore query...');
      const snapshot = await getDocs(q);
      console.log('Query completed, documents found:', snapshot.size);
      
      const usersList: User[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Processing user ${doc.id}:`, data);
        
        try {
          // Handle various field name formats
          const user: User = {
            uid: doc.id,
            email: data.email || data.Email || '',
            first_name: data.first_name || data.firstName || data.given_name || '',
            last_name: data.last_name || data.lastName || data.family_name || '',
            displayName: data.displayName || data.display_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Unnamed User',
            role: data.role || ROLES.USER,
            email_verified: data.email_verified || data.emailVerified || data.emailVerified || false,
            created_at: convertTimestamp(data.created_at || data.createdAt || data.dateCreated),
            updated_at: convertTimestamp(data.updated_at || data.updatedAt || data.lastUpdated),
            deleted_at: data.deleted_at ? convertTimestamp(data.deleted_at) : null,
            deleted_by: data.deleted_by || null,
            deleted_reason: data.deleted_reason || null,
            avatar_url: data.avatar_url || data.avatarUrl || data.photoURL || data.photoUrl || null,
            phone_number: data.phone_number || data.phoneNumber || data.phone || data.telephone || '',
            address: data.address || {},
            last_login: data.last_login ? convertTimestamp(data.last_login) : null,
            status: data.status || data.account_status || 'active',
          };
          
          // Validate required fields
          if (!user.email) {
            console.warn(`User ${doc.id} has no email`);
          }
          
          usersList.push(user);
        } catch (userError) {
          console.error(`Error processing user ${doc.id}:`, userError);
          console.log('Problematic data:', data);
        }
      });

      console.log('Successfully processed users:', usersList.length);
      setUsers(usersList);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        const errorDetails = {
          message: error.message,
          name: error.name,
          stack: error.stack
        };
        console.error('Error details:', errorDetails);
        setError(`Failed to fetch users: ${error.message}`);
      } else {
        setError('Failed to fetch users. Please check your connection and try again.');
      }
      
      alert('Failed to fetch users. Please check console for details.');
    } finally {
      setLoading(false);
      setActionLoading(prev => ({ ...prev, fetchUsers: false }));
      console.log('Fetch completed');
    }
  }, [isAdmin, roleFilter, statusFilter, userData?.role]);

  useEffect(() => {
    console.log('useEffect triggered, isAdmin:', isAdmin);
    fetchUsers();
  }, [fetchUsers]);

  // Debug users state
  useEffect(() => {
    if (users.length > 0) {
      console.log('Current users state updated:', users);
      if (users[0]) {
        console.log('First user sample:', users[0]);
        console.log('First user timestamps:', {
          created_at: users[0].created_at,
          updated_at: users[0].updated_at,
          last_login: users[0].last_login
        });
      }
    }
  }, [users]);

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    if (!user) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const phone = user.phone_number?.toLowerCase() || '';
    const role = getRoleDisplay(user.role).toLowerCase();
    
    return (
      email.includes(searchLower) ||
      fullName.includes(searchLower) ||
      phone.includes(searchLower) ||
      role.includes(searchLower) ||
      user.uid?.toLowerCase().includes(searchLower)
    );
  });

  // Sort users
  const sortedUsers = React.useMemo(() => {
    if (!sortConfig) return filteredUsers;
    
    return [...filteredUsers].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue == null || bValue == null) {
        return 0;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredUsers, sortConfig]);

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

  // Toggle row expansion
  const toggleRowExpansion = (uid: string) => {
    setExpandedRows(prev =>
      prev.includes(uid)
        ? prev.filter(id => id !== uid)
        : [...prev, uid]
    );
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
        status: currentUser.status,
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
      alert(`${usersToDelete.length} user(s) deleted successfully!`);
    } catch (error) {
      console.error('Error deleting users:', error);
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

  // Permanent delete user(s)
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

  // Bulk status update
  const handleBulkStatusUpdate = async (status: 'active' | 'suspended' | 'banned' | 'deleted') => {
    if (!selectedUsers.length) return;

    try {
      setActionLoading(prev => ({ 
        ...prev, 
        bulkStatusUpdate: true 
      }));
      
      const batch = writeBatch(db);
      selectedUsers.forEach(uid => {
        const userRef = doc(db, 'users', uid);
        const updates: any = {
          status,
          updated_at: serverTimestamp(),
        };
        
        // If setting to deleted, add deletion info
        if (status === 'deleted') {
          updates.deleted_at = serverTimestamp();
          updates.deleted_by = userData?.uid || null;
          updates.deleted_reason = 'Bulk action';
        }
        // If restoring from deleted, clear deletion info
        else if (status === 'active') {
          updates.deleted_at = null;
          updates.deleted_by = null;
          updates.deleted_reason = null;
        }
        
        batch.update(userRef, updates);
      });

      await batch.commit();
      
      setSelectedUsers([]);
      await fetchUsers();
      alert(`${selectedUsers.length} user(s) ${status === 'active' ? 'activated' : status === 'suspended' ? 'suspended' : status === 'banned' ? 'banned' : 'deleted'} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    } finally {
      setActionLoading(prev => ({ 
        ...prev, 
        bulkStatusUpdate: false 
      }));
    }
  };

  // Single user status update
  const handleUpdateStatus = async (uid: string, status: 'active' | 'suspended' | 'banned' | 'deleted') => {
    try {
      setActionLoading(prev => ({ 
        ...prev, 
        updateStatus: { ...prev.updateStatus, [uid]: true } 
      }));
      
      const userRef = doc(db, 'users', uid);
      const updates: any = {
        status,
        updated_at: serverTimestamp(),
      };
      
      // If setting to deleted, add deletion info
      if (status === 'deleted') {
        updates.deleted_at = serverTimestamp();
        updates.deleted_by = userData?.uid || null;
        updates.deleted_reason = 'Manual deletion';
      }
      // If restoring from deleted, clear deletion info
      else if (status === 'active') {
        updates.deleted_at = null;
        updates.deleted_by = null;
        updates.deleted_reason = null;
      }
      
      await updateDoc(userRef, updates);

      await fetchUsers();
      alert(`User ${status === 'active' ? 'activated' : status === 'suspended' ? 'suspended' : status === 'banned' ? 'banned' : 'deleted'} successfully!`);
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

  // Export users to CSV
  const exportUsersToCSV = async () => {
    try {
      setActionLoading(prev => ({ ...prev, exportCSV: true }));
      
      const usersToExport = filteredUsers;
      
      if (usersToExport.length === 0) {
        alert('No users to export');
        return;
      }

      const headers = ['Name', 'Email', 'Role', 'Status', 'Phone', 'Joined Date', 'Last Login', 'Email Verified'];
      
      const csvData = usersToExport.map(user => [
        user.displayName,
        user.email,
        getRoleDisplay(user.role),
        user.status,
        user.phone_number || '',
        formatDateShort(user.created_at),
        formatDateShort(user.last_login || ''),
        user.email_verified ? 'Yes' : 'No'
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Exported ${usersToExport.length} users to CSV`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export users');
    } finally {
      setActionLoading(prev => ({ ...prev, exportCSV: false }));
    }
  };

  // Fetch user activity
  const fetchUserActivity = async (userId: string) => {
    try {
      // For demo purposes - in real app, you would fetch from Firestore
      setActivityLog([
        {
          id: '1',
          action: 'Login',
          details: 'User logged in from Chrome on Windows',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '2',
          action: 'Profile Updated',
          details: 'Updated phone number',
          timestamp: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '3',
          action: 'Password Changed',
          details: 'Password updated successfully',
          timestamp: new Date(Date.now() - 259200000).toISOString()
        }
      ]);
      
      setShowActivityModal(true);
    } catch (error) {
      console.error('Error fetching activity:', error);
      alert('Failed to fetch user activity');
    }
  };

  // Send welcome email/notification
  const handleSendWelcomeEmail = async (userEmail: string) => {
    try {
      setActionLoading(prev => ({ ...prev, sendEmail: true }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`Welcome email sent to ${userEmail} successfully!`);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send welcome email');
    } finally {
      setActionLoading(prev => ({ ...prev, sendEmail: false }));
    }
  };

  // Keyboard shortcuts support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Refresh with Ctrl+R / Cmd+R
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        fetchUsers();
      }
      // Select all with Ctrl+A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !e.shiftKey) {
        e.preventDefault();
        toggleSelectAll();
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowViewModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowRestoreModal(false);
        setShowPermanentDeleteModal(false);
        setShowActivityModal(false);
      }
      // Delete with Delete key
      if (e.key === 'Delete' && selectedUsers.length > 0) {
        e.preventDefault();
        setShowDeleteModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchUsers, filteredUsers, selectedUsers]);

  // Helper functions
  const canModifyUser = (targetUser: User) => {
    if (!userData || !targetUser) return false;
    if (userData.uid === targetUser.uid) return false;
    
    if (userData.role === ROLES.SUPER_ADMIN) return true;
    
    if (userData.role === ROLES.CENTER_ADMIN) {
      return targetUser.role === ROLES.USER || targetUser.role === ROLES.INSTRUCTOR;
    }
    
    return false;
  };

  const getRoleColor = (role: ROLES) => {
    switch (role) {
      case ROLES.SUPER_ADMIN: return 'bg-purple-500/10 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case ROLES.CENTER_ADMIN: return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case ROLES.INSTRUCTOR: return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case ROLES.USER: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'suspended': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'banned': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'deleted': return 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

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

  // Statistics
  const deletedUsersCount = users.filter(u => u.status === 'deleted').length;
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const suspendedUsersCount = users.filter(u => u.status === 'suspended').length;
  const bannedUsersCount = users.filter(u => u.status === 'banned').length;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You don't have permission to access the user management page.
              Admin privileges are required.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-blue-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Manage all users, roles, and permissions</p>
            </div>
            
            <div className="flex right-0 flex-wrap items-center gap-3">
              <button
                onClick={exportUsersToCSV}
                disabled={actionLoading.exportCSV || filteredUsers.length === 0}
                className="p-2 py-2.5 border bg-green-500 border-gray-300 dark:border-gray-700 rounded-sm hover:bg-green-500/10 dark:hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {actionLoading.exportCSV ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {actionLoading.exportCSV ? 'Exporting...' : 'Export CSV'}
              </button>
              
              <button
                onClick={fetchUsers}
                disabled={actionLoading.fetchUsers}
                className="p-2 py-2.5 bg-blue-500 text-white rounded-sm hover:bg-blue-500/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-md"
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

          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-300">Debug Info</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-yellow-600 dark:text-yellow-400">Total Users:</span>
                  <span className="ml-2 font-mono">{users.length}</span>
                </div>
                <div>
                  <span className="text-yellow-600 dark:text-yellow-400">Filtered:</span>
                  <span className="ml-2 font-mono">{filteredUsers.length}</span>
                </div>
                <div>
                  <span className="text-yellow-600 dark:text-yellow-400">Is Admin:</span>
                  <span className="ml-2 font-mono">{isAdmin ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-yellow-600 dark:text-yellow-400">Loading:</span>
                  <span className="ml-2 font-mono">{loading ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-yellow-600 dark:text-yellow-400">Role Filter:</span>
                  <span className="ml-2 font-mono">{roleFilter}</span>
                </div>
                <div>
                  <span className="text-yellow-600 dark:text-yellow-400">Status Filter:</span>
                  <span className="ml-2 font-mono">{statusFilter}</span>
                </div>
                <div>
                  <span className="text-yellow-600 dark:text-yellow-400">Search Term:</span>
                  <span className="ml-2 font-mono">{searchTerm || '(empty)'}</span>
                </div>
                <div>
                  <span className="text-yellow-600 dark:text-yellow-400">Selected:</span>
                  <span className="ml-2 font-mono">{selectedUsers.length}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => {
                    console.log('=== DEBUG INFO ===');
                    console.log('Current users state:', users);
                    console.log('Current filters:', { roleFilter, statusFilter, searchTerm });
                    console.log('Auth user:', userData);
                    console.log('Is Admin:', isAdmin);
                    console.log('First user (if exists):', users[0]);
                    console.log('=== END DEBUG ===');
                  }}
                  className="px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-700"
                >
                  Log Debug Info
                </button>
                <button
                  onClick={fetchUsers}
                  className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700"
                >
                  Force Refresh
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-semibold text-red-800 dark:text-red-300">Error Loading Users</span>
              </div>
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Retry Loading
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{users.length}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{activeUsersCount}</p>
                </div>
                <UserCheck className="w-10 h-10 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Suspended</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{suspendedUsersCount}</p>
                </div>
                <EyeOff className="w-10 h-10 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Banned</p>
                  <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{bannedUsersCount}</p>
                </div>
                <ShieldOff className="w-10 h-10 text-red-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Deleted</p>
                  <p className="text-2xl font-bold mt-1 text-gray-600 dark:text-gray-400">{deletedUsersCount}</p>
                </div>
                <Archive className="w-10 h-10 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div>
              <label className="block p- text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">Search Users</label>
              <div className="relative ">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filter by Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as ROLES | 'all')}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
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
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
          </div>

          {/* Selected Users Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700 mb-4">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-300">
                    {selectedUsers.length} user(s) selected
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {selectedUsers.length === 1 ? '1 user selected' : `${selectedUsers.length} users selected`}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Bulk Status Actions */}
                <button
                  onClick={() => handleBulkStatusUpdate('suspended')}
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={actionLoading.bulkStatusUpdate}
                >
                  {actionLoading.bulkStatusUpdate ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                  Suspend Selected
                </button>
                
                <button
                  onClick={() => handleBulkStatusUpdate('active')}
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={actionLoading.bulkStatusUpdate}
                >
                  {actionLoading.bulkStatusUpdate ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  Activate Selected
                </button>
                
                <button
                  onClick={() => handleBulkStatusUpdate('deleted')}
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={actionLoading.bulkStatusUpdate}
                >
                  {actionLoading.bulkStatusUpdate ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Archive className="w-3 h-3" />
                  )}
                  Delete Selected
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
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1 transition-colors"
                  disabled={selectedUsers.length !== 1}
                >
                  <Edit className="w-3 h-3" />
                  Edit Selected
                </button>
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Hint */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 flex items-center gap-2">
            <Key className="w-3 h-3" />
            <span>Shortcuts: Ctrl+A (Select All) • Ctrl+R (Refresh) • Delete (Delete Users) • Esc (Close Modals)</span>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                {actionLoading.fetchUsers ? 'Fetching from Firestore...' : 'Processing data...'}
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : users.length === 0 
                    ? 'No users in the system yet' 
                    : 'No users match your criteria'}
              </p>
              {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="py-4 px-6 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 checked:bg-blue-500 checked:border-blue-500"
                        />
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email Verified</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Last Login</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedUsers.map((user) => (
                      <React.Fragment key={user.uid}>
                        <tr className={`hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${user.status === 'deleted' ? 'bg-gray-50 dark:bg-gray-900/30' : ''}`}>
                          <td className="py-4 px-6">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.uid)}
                              onChange={() => toggleUserSelection(user.uid)}
                              className="rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 checked:bg-blue-500 checked:border-blue-500"
                              disabled={!canModifyUser(user)}
                            />
                          </td>
                          
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`}
                                alt={user.displayName}
                                className={`w-10 h-10 rounded-full border-2 ${user.status === 'deleted' ? 'opacity-50 border-gray-300' : 'border-white shadow-sm'}`}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`font-semibold truncate ${user.status === 'deleted' ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                    {user.displayName}
                                  </p>
                                  {user.status === 'deleted' && (
                                    <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                      Deleted
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                {user.phone_number && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <Phone className="w-3 h-3" />
                                    {user.phone_number}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                              {getRoleDisplay(user.role)}
                            </span>
                          </td>
                          
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </td>
                          
                          <td className="py-4 px-6">
                            {user.email_verified ? (
                              <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Verified</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm">Not Verified</span>
                              </span>
                            )}
                          </td>
                          
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">{formatDateShort(user.created_at)}</span>
                            </div>
                          </td>
                          
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{formatDateShort(user.last_login || '')}</span>
                            </div>
                          </td>
                          
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1">
                              {/* Activity Button */}
                              <button
                                onClick={() => {
                                  setCurrentUser(user);
                                  fetchUserActivity(user.uid);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="View Activity"
                              >
                                <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </button>
                              
                              <button
                                onClick={() => {
                                  setCurrentUser(user);
                                  setShowViewModal(true);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="View Profile"
                              >
                                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </button>
                              
                              <button
                                onClick={() => {
                                  setCurrentUser(user);
                                  setShowEditModal(true);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Edit"
                                disabled={!canModifyUser(user) || actionLoading.editUser}
                              >
                                <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </button>
                              
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => handleUpdateStatus(user.uid, 'suspended')}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  title="Suspend"
                                  disabled={!canModifyUser(user) || actionLoading.updateStatus[user.uid]}
                                >
                                  {actionLoading.updateStatus[user.uid] ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                                  ) : (
                                    <EyeOff className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                  )}
                                </button>
                              ) : user.status === 'suspended' ? (
                                <button
                                  onClick={() => handleUpdateStatus(user.uid, 'active')}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  title="Activate"
                                  disabled={!canModifyUser(user) || actionLoading.updateStatus[user.uid]}
                                >
                                  {actionLoading.updateStatus[user.uid] ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                                  ) : (
                                    <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  )}
                                </button>
                              ) : user.status === 'deleted' ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(user.uid, 'active')}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Restore"
                                    disabled={!canModifyUser(user) || actionLoading.updateStatus[user.uid]}
                                  >
                                    {actionLoading.updateStatus[user.uid] ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Undo className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    )}
                                  </button>
                                  
                                  {userData?.role === ROLES.SUPER_ADMIN && (
                                    <button
                                      onClick={() => {
                                        setCurrentUser(user);
                                        setShowPermanentDeleteModal(true);
                                      }}
                                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      title="Permanent Delete"
                                      disabled={actionLoading.permanentDelete}
                                    >
                                      {actionLoading.permanentDelete ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash className="w-4 h-4 text-red-600 dark:text-red-400" />
                                      )}
                                    </button>
                                  )}
                                </>
                              ) : null}
                              
                              <button
                                onClick={() => handleSendWelcomeEmail(user.email)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Send Welcome Email"
                                disabled={actionLoading.sendEmail}
                              >
                                {actionLoading.sendEmail ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <MailIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                )}
                              </button>
                              
                              {user.status !== 'deleted' && (
                                <button
                                  onClick={() => handleUpdateStatus(user.uid, 'deleted')}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  title="Delete"
                                  disabled={!canModifyUser(user) || actionLoading.updateStatus[user.uid]}
                                >
                                  {actionLoading.updateStatus[user.uid] ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Archive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded Row Details */}
                        {expandedRows.includes(user.uid) && (
                          <tr className="bg-gray-50 dark:bg-gray-900/50">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Contact Info</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                                  {user.phone_number && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.phone_number}</p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Account Info</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Created: {formatDateShort(user.created_at)}
                                  </p>
                                  {user.last_login && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Last Login: {formatDateShort(user.last_login)}
                                    </p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Quick Actions</h4>
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={() => handleSendWelcomeEmail(user.email)}
                                      className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800"
                                    >
                                      Send Email
                                    </button>
                                    <button
                                      onClick={() => {
                                        setCurrentUser(user);
                                        setShowViewModal(true);
                                      }}
                                      className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                                    >
                                      View Profile
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={exportUsersToCSV}
                    disabled={actionLoading.exportCSV || filteredUsers.length === 0}
                    className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading.exportCSV ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    Export CSV
                  </button>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                      Ctrl+A
                    </kbd>
                    <span className="mx-2">to select all</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* View User Profile Modal */}
      {showViewModal && currentUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Profile</h3>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* User Info Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                  <img
                    src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName)}&background=random&size=128`}
                    alt={currentUser.displayName}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{currentUser.displayName}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{currentUser.email}</p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <span className={`px-4 py-2 rounded-full font-semibold ${getRoleColor(currentUser.role)}`}>
                        {getRoleDisplay(currentUser.role)}
                      </span>
                      <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(currentUser.status)}`}>
                        {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email Status</p>
                    <p className={`font-semibold mt-1 ${currentUser.email_verified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {currentUser.email_verified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Created</p>
                    <p className="font-semibold mt-1 text-gray-900 dark:text-white">{formatDateShort(currentUser.created_at)}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                    <p className="font-semibold mt-1 text-gray-900 dark:text-white">{formatDateShort(currentUser.updated_at)}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Login</p>
                    <p className="font-semibold mt-1 text-gray-900 dark:text-white">{formatDate(currentUser.last_login || '')}</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">First Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{currentUser.first_name}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{currentUser.last_name}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {currentUser.email}
                        {currentUser.email_verified ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {currentUser.phone_number || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <MapPin className="w-5 h-5" />
                    Address
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <p className="font-medium text-gray-900 dark:text-white">{formatAddress(currentUser.address)}</p>
                    {currentUser.address && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        {currentUser.address.street && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Street</p>
                            <p className="text-gray-900 dark:text-white">{currentUser.address.street}</p>
                          </div>
                        )}
                        {currentUser.address.city && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">City</p>
                            <p className="text-gray-900 dark:text-white">{currentUser.address.city}</p>
                          </div>
                        )}
                        {currentUser.address.state && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">State</p>
                            <p className="text-gray-900 dark:text-white">{currentUser.address.state}</p>
                          </div>
                        )}
                        {currentUser.address.country && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Country</p>
                            <p className="text-gray-900 dark:text-white">{currentUser.address.country}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Shield className="w-5 h-5" />
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white truncate">{currentUser.uid}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentUser.status)}`}>
                          {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
                        </span>
                        {currentUser.status === 'deleted' && currentUser.deleted_reason && (
                          <span className="text-xs text-gray-500 dark:text-gray-400" title={currentUser.deleted_reason}>
                            Reason: {currentUser.deleted_reason}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">User Role</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(currentUser.role)}`}>
                        {getRoleDisplay(currentUser.role)}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email Verification</p>
                      <div className="flex items-center gap-2">
                        {currentUser.email_verified ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 dark:text-green-400">Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-red-600 dark:text-red-400">Not Verified</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Clock className="w-5 h-5" />
                    Activity Timeline
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Account Created</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(currentUser.created_at)}</p>
                      </div>
                    </div>
                    {currentUser.last_login && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Last Login</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(currentUser.last_login)}</p>
                        </div>
                      </div>
                    )}
                    {currentUser.updated_at && currentUser.updated_at !== currentUser.created_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Last Updated</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(currentUser.updated_at)}</p>
                        </div>
                      </div>
                    )}
                    {currentUser.deleted_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Account Deleted</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(currentUser.deleted_at)}</p>
                          {currentUser.deleted_reason && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reason: {currentUser.deleted_reason}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Close
                </button>
                
                {currentUser.status !== 'deleted' && (
                  <>
                    <button
                      onClick={() => handleSendWelcomeEmail(currentUser.email)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      disabled={actionLoading.sendEmail}
                    >
                      {actionLoading.sendEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                      Send Welcome Email
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setShowEditModal(true);
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      disabled={!canModifyUser(currentUser) || actionLoading.editUser}
                    >
                      {actionLoading.editUser && <Loader2 className="w-4 h-4 animate-spin" />}
                      Edit User
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Activity Modal */}
      {showActivityModal && currentUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Activity Log</h3>
                    <p className="text-gray-600 dark:text-gray-400">{currentUser.displayName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {activityLog.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No activity recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLog.map((activity, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                            <p className="font-semibold text-gray-900 dark:text-white">{activity.action}</p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">{activity.details}</p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl animate-slideUp">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Edit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit User</h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email Address</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">First Name</label>
                    <input
                      type="text"
                      value={currentUser.first_name}
                      onChange={(e) => setCurrentUser({ ...currentUser, first_name: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Last Name</label>
                    <input
                      type="text"
                      value={currentUser.last_name}
                      onChange={(e) => setCurrentUser({ ...currentUser, last_name: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Phone Number</label>
                  <input
                    type="tel"
                    value={currentUser.phone_number || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, phone_number: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Role</label>
                  <select
                    value={currentUser.role}
                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as ROLES })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
                    disabled={userData?.role !== ROLES.SUPER_ADMIN}
                  >
                    <option value={ROLES.USER}>User</option>
                    <option value={ROLES.INSTRUCTOR}>Instructor</option>
                    <option value={ROLES.CENTER_ADMIN}>Admin</option>
                    <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
                  </select>
                  {userData?.role !== ROLES.SUPER_ADMIN && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Only Super Admins can change roles</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={currentUser.status}
                    onChange={(e) => setCurrentUser({ ...currentUser, status: e.target.value as any })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading.editUser}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slideUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                <Archive className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Users</h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete{' '}
              {currentUser 
                ? <span className="font-semibold text-gray-900 dark:text-white">"{currentUser.displayName}"</span>
                : <span className="font-semibold text-gray-900 dark:text-white">{selectedUsers.length} selected user(s)</span>
              }?
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reason for deletion (optional)</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason for deletion..."
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
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
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading.softDelete}
              >
                Cancel
              </button>
              <button
                onClick={handleSoftDeleteUsers}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={actionLoading.softDelete}
              >
                {actionLoading.softDelete && <Loader2 className="w-4 h-4 animate-spin" />}
                {actionLoading.softDelete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slideUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <Undo className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Restore User</h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to restore{' '}
              {currentUser 
                ? <span className="font-semibold text-gray-900 dark:text-white">"{currentUser.displayName}"</span>
                : <span className="font-semibold text-gray-900 dark:text-white">{selectedUsers.length} selected user(s)</span>
              }?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setCurrentUser(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading.restore}
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreUsers}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={actionLoading.restore}
              >
                {actionLoading.restore && <Loader2 className="w-4 h-4 animate-spin" />}
                {actionLoading.restore ? 'Restoring...' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {showPermanentDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slideUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Permanent Delete</h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              <strong className="text-red-600 dark:text-red-400">Warning: This action cannot be undone!</strong><br/><br/>
              Are you sure you want to permanently delete{' '}
              {currentUser 
                ? <span className="font-semibold text-gray-900 dark:text-white">"{currentUser.displayName}"</span>
                : <span className="font-semibold text-gray-900 dark:text-white">{selectedUsers.length} selected user(s)</span>
              }?
              <br/><br/>
              All user data will be permanently removed from the system.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPermanentDeleteModal(false);
                  setCurrentUser(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading.permanentDelete}
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDeleteUsers}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={actionLoading.permanentDelete}
              >
                {actionLoading.permanentDelete && <Loader2 className="w-4 h-4 animate-spin" />}
                {actionLoading.permanentDelete ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;