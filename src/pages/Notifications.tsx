import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebase_config';
import { 
  collection, getDocs, query, where, orderBy, updateDoc, doc,
  limit, startAfter, Timestamp, writeBatch
} from 'firebase/firestore';
import { Link } from 'react-router-dom';

interface NotificationLog {
  id: string;
  booking_id?: string;
  user_email: string;
  title?: string;
  message: string;
  type: 'status_change' | 'booking_created' | 'booking_updated' | 'payment' | 'system' | 'announcement';
  status_before?: string;
  status_after?: string;
  is_sent: boolean;
  sent_via: 'email' | 'sms' | 'both' | 'none';
  created_at: Date;
  read_at?: Date;
  metadata?: Record<string, any>;
  action_url?: string;
  related_program_id?: string;
  related_program_name?: string;
}

const NotificationsPage = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    sent: 0
  });

  // Notification types with icons and colors
  const notificationTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'status_change', name: 'Status Changes' },
    { id: 'booking_created', name: 'New Bookings' },
    { id: 'booking_updated', name: 'Booking Updates' },
    { id: 'payment', name: 'Payments' },
    { id: 'system', name: 'System' },
    { id: 'announcement', name: 'Announcements' }
  ];

  const PAGE_SIZE = 20;

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      fetchNotificationStats();
    }
  }, [currentUser, filter, typeFilter]);

  const fetchNotifications = async (loadMore = false) => {
    if (!currentUser) return;

    try {
      if (!loadMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const notificationsRef = collection(db, 'notification_logs');
      
      // Build query - using user_email to match notifications
      let q = query(
        notificationsRef,
        where('user_email', '==', currentUser.email),
        orderBy('created_at', 'desc'),
        limit(PAGE_SIZE)
      );

      // Apply filters
      if (typeFilter !== 'all') {
        q = query(q, where('type', '==', typeFilter));
      }

      // For pagination
      if (loadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(q);
      
      const notificationsData: NotificationLog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notificationsData.push({
          id: doc.id,
          booking_id: data.booking_id,
          user_email: data.user_email,
          title: data.title || getDefaultTitle(data.type, data.status_before, data.status_after),
          message: data.message,
          type: data.type,
          status_before: data.status_before,
          status_after: data.status_after,
          is_sent: data.is_sent,
          sent_via: data.sent_via,
          created_at: data.created_at?.toDate(),
          read_at: data.read_at?.toDate(),
          metadata: data.metadata,
          action_url: data.action_url,
          related_program_id: data.related_program_id,
          related_program_name: data.related_program_name,
        } as NotificationLog);
      });

      // Update state
      if (loadMore) {
        setNotifications(prev => [...prev, ...notificationsData]);
      } else {
        setNotifications(notificationsData);
      }

      // Update pagination
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      setHasMore(querySnapshot.docs.length === PAGE_SIZE);

    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const getDefaultTitle = (type: string, statusBefore?: string, statusAfter?: string) => {
    switch (type) {
      case 'status_change':
        return `Status Updated: ${statusBefore || 'Pending'} → ${statusAfter || 'Accepted'}`;
      case 'booking_created':
        return 'New Booking Created';
      case 'booking_updated':
        return 'Booking Updated';
      case 'payment':
        return 'Payment Notification';
      case 'system':
        return 'System Notification';
      case 'announcement':
        return 'Announcement';
      default:
        return 'Notification';
    }
  };

  const fetchNotificationStats = async () => {
    if (!currentUser) return;

    try {
      const notificationsRef = collection(db, 'notification_logs');
      
      // Get all notifications for stats
      const q = query(
        notificationsRef,
        where('user_email', '==', currentUser.email)
      );

      const querySnapshot = await getDocs(q);
      
      let total = 0;
      let unread = 0;
      let read = 0;
      let sent = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        
        // Check if notification is read (has read_at timestamp)
        if (data.read_at) {
          read++;
        } else {
          unread++;
        }
        
        // Count sent notifications
        if (data.is_sent) {
          sent++;
        }
      });

      setStats({ total, unread, read, sent });
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notification_logs', notificationId);
      await updateDoc(notificationRef, {
        read_at: new Date(),
        updated_at: new Date(),
      });

      // Update local state
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read_at: new Date() } 
          : notif
      ));

      // Update stats
      setStats(prev => ({
        ...prev,
        unread: prev.unread - 1,
        read: prev.read + 1
      }));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read_at);
      if (unreadNotifications.length === 0) return;

      const batch = writeBatch(db);
      unreadNotifications.forEach(notif => {
        const notificationRef = doc(db, 'notification_logs', notif.id);
        batch.update(notificationRef, {
          read_at: new Date(),
          updated_at: new Date(),
        });
      });

      await batch.commit();

      // Update local state
      setNotifications(prev => prev.map(notif => 
        !notif.read_at 
          ? { ...notif, read_at: new Date() } 
          : notif
      ));

      // Update stats
      setStats(prev => ({
        ...prev,
        unread: 0,
        read: prev.read + unreadNotifications.length
      }));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notification_logs', notificationId);
      await updateDoc(notificationRef, {
        is_archived: true,
        updated_at: new Date(),
      });

      // Remove from local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Update stats
      if (notification) {
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          unread: notification.read_at ? prev.unread : prev.unread - 1,
          read: notification.read_at ? prev.read - 1 : prev.read,
        }));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'status_change': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'booking_created': return 'bg-green-100 text-green-800 border-green-200';
      case 'booking_updated': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'payment': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'system': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'announcement': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'status_change': return '🔄';
      case 'booking_created': return '📅';
      case 'booking_updated': return '✏️';
      case 'payment': return '💰';
      case 'system': return '⚙️';
      case 'announcement': return '📢';
      default: return '📄';
    }
  };

  const getStatusIcon = (statusBefore?: string, statusAfter?: string) => {
    if (statusBefore && statusAfter) {
      switch (statusAfter) {
        case 'accepted': return '✅';
        case 'rejected': return '❌';
        case 'pending': return '⏳';
        case 'completed': return '🎓';
        default: return '📝';
      }
    }
    return '📄';
  };

  const getSentViaIcon = (sentVia: string) => {
    switch (sentVia) {
      case 'email': return '📧';
      case 'sms': return '📱';
      case 'both': return '📧📱';
      case 'none': return '🚫';
      default: return '📤';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Filter notifications based on search term
  const filteredNotifications = notifications.filter(notification => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      notification.message.toLowerCase().includes(term) ||
      (notification.title?.toLowerCase().includes(term)) ||
      (notification.related_program_name?.toLowerCase().includes(term)) ||
      notification.type.toLowerCase().includes(term) ||
      (notification.status_before?.toLowerCase().includes(term)) ||
      (notification.status_after?.toLowerCase().includes(term))
    );
  });

  const loadMoreNotifications = () => {
    if (hasMore && !loadingMore) {
      fetchNotifications(true);
    }
  };

  if (loading && !loadingMore) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Stay updated with your bookings and program activities</p>
            </div>
            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-gray-600">Total Notifications</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
            <div className="text-gray-600">Unread</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.read}</div>
            <div className="text-gray-600">Read</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
            <div className="text-gray-600">Sent</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {notificationTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Read Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Notifications</label>
              <input
                type="text"
                placeholder="Search by message, program, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
            <button
              onClick={() => {
                setFilter('all');
                setTypeFilter('all');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Clear Filters
            </button>
            <button
              onClick={() => fetchNotifications()}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {typeFilter === 'all' ? 'All Notifications' : notificationTypes.find(t => t.id === typeFilter)?.name}
                <span className="text-gray-500 text-sm font-normal ml-2">
                  ({filteredNotifications.length} shown)
                </span>
              </h3>
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">No Notifications Found</h4>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'No notifications match your search. Try different keywords.'
                  : typeFilter === 'all'
                    ? 'You have no notifications yet.'
                    : `You have no ${notificationTypes.find(t => t.id === typeFilter)?.name?.toLowerCase()} notifications.`}
              </p>
              {searchTerm || typeFilter !== 'all' ? (
                <button
                  onClick={() => {
                    setFilter('all');
                    setTypeFilter('all');
                    setSearchTerm('');
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View All Notifications
                </button>
              ) : (
                <p className="text-gray-500">
                  Notifications will appear here when you have new updates.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !notification.read_at ? 'bg-blue-50/30 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Type Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${getTypeColor(notification.type)}`}>
                        {notification.type === 'status_change' 
                          ? getStatusIcon(notification.status_before, notification.status_after)
                          : getTypeIcon(notification.type)}
                      </div>
                      
                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg mb-1">
                              {notification.title || getDefaultTitle(notification.type, notification.status_before, notification.status_after)}
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(notification.type)}`}>
                                {notification.type.replace('_', ' ').toUpperCase()}
                              </span>
                              {notification.status_before && notification.status_after && (
                                <span className="px-2 py-1 text-xs bg-gradient-to-r from-gray-100 to-blue-100 text-gray-800 rounded-full">
                                  {notification.status_before.toUpperCase()} → {notification.status_after.toUpperCase()}
                                </span>
                              )}
                              {notification.is_sent && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  {getSentViaIcon(notification.sent_via)} Sent via {notification.sent_via}
                                </span>
                              )}
                              {!notification.read_at && (
                                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                  🔴 NEW
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-sm text-gray-500 whitespace-nowrap">
                              {formatTimeAgo(notification.created_at)}
                            </div>
                            {notification.read_at && (
                              <div className="text-xs text-gray-400">
                                Read {formatTimeAgo(notification.read_at)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{notification.message}</p>
                        
                        {/* Additional Information */}
                        <div className="text-sm text-gray-600 space-y-1 mb-4">
                          {notification.booking_id && (
                            <div>
                              <span className="font-medium">Booking ID:</span> {notification.booking_id}
                            </div>
                          )}
                          {notification.related_program_name && (
                            <div>
                              <span className="font-medium">Program:</span> {notification.related_program_name}
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          {!notification.read_at ? (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm flex items-center"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Mark as Read
                            </button>
                          ) : (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                            >
                              Mark as Unread
                            </button>
                          )}
                          
                          {notification.action_url && (
                            <Link
                              to={notification.action_url}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                              View Details
                            </Link>
                          )}
                          
                          {notification.related_program_id && (
                            <Link
                              to={`/training/${notification.related_program_id}`}
                              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm"
                            >
                              View Program
                            </Link>
                          )}
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="p-6 text-center border-t">
                  <button
                    onClick={loadMoreNotifications}
                    disabled={loadingMore}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? 'Loading...' : 'Load More Notifications'}
                  </button>
                </div>
              )}

              {/* End of List */}
              {!hasMore && filteredNotifications.length > 0 && (
                <div className="p-6 text-center border-t bg-gray-50">
                  <p className="text-gray-600">You've reached the end of your notifications.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;