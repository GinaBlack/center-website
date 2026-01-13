import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebase_config';
import { 
  collection, getDocs, query, where, updateDoc, doc
} from 'firebase/firestore';
import { Link } from 'react-router-dom';

interface NotificationLog {
  id: string;
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
  action_url?: string;
  related_program_id?: string;
  related_program_name?: string;
}

const NotificationsPage = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      const notificationsRef = collection(db, 'notification_logs');
      
      // SIMPLIFIED QUERY: No orderBy to avoid index requirement
      const q = query(
        notificationsRef,
        where('user_email', '==', currentUser.email)
        // Removed: orderBy('created_at', 'desc') - This requires composite index
        // Removed: limit() - We'll fetch all at once
      );

      const querySnapshot = await getDocs(q);
      
      const notificationsData: NotificationLog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notificationsData.push({
          id: doc.id,
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
          action_url: data.action_url,
          related_program_id: data.related_program_id,
          related_program_name: data.related_program_name,
        } as NotificationLog);
      });

      // Sort by date CLIENT-SIDE (no index required)
      notificationsData.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

      setNotifications(notificationsData);

    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
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
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read_at);
      if (unreadNotifications.length === 0) return;

      // Mark each unread notification as read
      const promises = unreadNotifications.map(notif => 
        updateDoc(doc(db, 'notification_logs', notif.id), {
          read_at: new Date(),
          updated_at: new Date(),
        })
      );

      await Promise.all(promises);

      // Update local state
      setNotifications(prev => prev.map(notif => 
        !notif.read_at 
          ? { ...notif, read_at: new Date() } 
          : notif
      ));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'status_change': return 'bg-blue-100 text-blue-800';
      case 'booking_created': return 'bg-green-100 text-green-800';
      case 'booking_updated': return 'bg-yellow-100 text-yellow-800';
      case 'payment': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'announcement': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
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

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (loading) {
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
              <p className="text-gray-600">
                {notifications.length === 0 
                  ? 'You have no notifications yet.' 
                  : `You have ${notifications.length} notification${notifications.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              {unreadCount > 0 && (
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
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">No Notifications</h4>
              <p className="text-gray-600">
                Notifications will appear here when you have new updates about your bookings or programs.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-6 hover:bg-gray-50 transition-colors ${!notification.read_at ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Type Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
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
                            {!notification.read_at && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                🔴 NEW
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                          {formatTimeAgo(notification.created_at)}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{notification.message}</p>
                      
                      {/* Additional Information */}
                      {notification.related_program_name && (
                        <div className="text-sm text-gray-600 mb-4">
                          <span className="font-medium">Program:</span> {notification.related_program_name}
                        </div>
                      )}
                      
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
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;