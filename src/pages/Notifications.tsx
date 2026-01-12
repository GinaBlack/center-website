import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebase_config';
import { 
  collection, getDocs, query, where, orderBy, updateDoc, doc 
} from 'firebase/firestore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
  programId?: string;
}

const NotificationsPage = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notificationsRef = collection(db, 'notifications');
      let q = query(
        notificationsRef, 
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const notificationsData: Notification[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notificationsData.push({
          id: doc.id,
          title: data.title,
          message: data.message,
          type: data.type,
          read: data.read,
          createdAt: data.createdAt?.toDate(),
          programId: data.programId,
        } as Notification);
      });

      // Apply filter
      let filteredData = notificationsData;
      if (filter === 'unread') {
        filteredData = notificationsData.filter(n => !n.read);
      } else if (filter === 'read') {
        filteredData = notificationsData.filter(n => n.read);
      }

      setNotifications(filteredData);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: new Date(),
      });

      // Update local state
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const batchPromises = unreadNotifications.map(notif => {
        const notificationRef = doc(db, 'notifications', notif.id);
        return updateDoc(notificationRef, {
          read: true,
          readAt: new Date(),
        });
      });

      await Promise.all(batchPromises);
      
      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'enrolled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'enrolled': return '🎓';
      case 'pending': return '⏳';
      default: return '📢';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your training program applications</p>
        </div>

        {/* Stats and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => !n.read).length}
              </div>
              <div className="text-gray-600">Unread Notifications</div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
              
              {notifications.some(n => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
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
              <div className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? 'You have no notifications yet.'
                  : `No ${filter} notifications.`}
              </div>
              <p className="text-gray-600">
                Notifications will appear here when your application status changes.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-6 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">{notification.title}</h3>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                          <span className="text-sm text-gray-500">
                            {notification.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(notification.type)}`}>
                          {notification.type.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {notification.read ? 'Read' : 'Unread'}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className={`px-3 py-1 text-sm rounded ${
                        notification.read 
                          ? 'bg-gray-100 text-gray-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {notification.read ? 'Read' : 'Mark as Read'}
                    </button>
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