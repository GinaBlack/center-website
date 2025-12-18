import React, { useState } from 'react';
import { 
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  UserPlus,
  FileText,
  Award,
  MessageSquare,
  Clock,
  Mail,
  MapPin,
  Users,
  BookOpen,
  XCircle
} from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Course Enrollment Confirmed',
      message: 'Your enrollment in "Advanced 3D Printing Workshop" has been confirmed.',
      time: '10:30 AM • Today',
      read: false
    },
    {
      id: 2,
      title: 'New Message from Instructor',
      message: 'Dr. Sarah Chen sent you a message regarding your project submission.',
      time: '9:15 AM • Today',
      read: false
    },
    {
      id: 3,
      title: 'Course Starts Tomorrow',
      message: '"CAD Modeling Intensive Course" begins tomorrow at 10:00 AM.',
      time: 'Yesterday • 2:45 PM',
      read: true
    },
    {
      id: 4,
      title: 'New Materials Available',
      message: 'Week 2 materials for "3D Printing Fundamentals" have been uploaded.',
      time: 'Yesterday • 11:20 AM',
      read: true
    },
    {
      id: 5,
      title: 'Certificate Ready',
      message: 'Your completion certificate is available for download.',
      time: 'Jan 14 • 4:30 PM',
      read: true
    },
    {
      id: 6,
      title: 'Location Change',
      message: 'Workshop has been moved to Innovation Center - Lab 302.',
      time: 'Jan 13 • 10:15 AM',
      iconBg: 'bg-red-100',
      read: true
    },
    {
      id: 7,
      title: 'New Instructor',
      message: 'Michael Rodriguez has been assigned as your instructor.',
      time: 'Jan 12 • 3:45 PM',
      read: true
    },
    {
      id: 8,
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday 2:00 AM - 6:00 AM.',
      time: 'Jan 11 • 1:20 PM',
      read: true
    },
    {
      id: 9,
      title: 'Class Full',
      message: 'The "Weekend 3D Printing Bootcamp" is now fully booked.',
      time: 'Jan 10 • 9:30 AM',
      read: true
    },
    {
      id: 10,
      title: 'Submission Deadline',
      message: 'Project submission deadline is approaching in 2 days.',
      time: 'Jan 9 • 5:15 PM',

      read: true
    }
  ]);

  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className=" w-full min-h-screen bg-gray-50 p-4 py-20  mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 ">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-600">Your latest updates and alerts</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-600  text-md font-medium">
              {unreadCount} new
            </span>
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${showUnreadOnly ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-100'}`}
            >
              {showUnreadOnly ? 'Show All' : 'Show Unread Only'}
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-xl border p-4 transition-all hover:shadow-sm ${!notification.read ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200'}`}
          >
            <div className="flex gap-4 pl-2">
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-smx">
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600  text-sm mb-2">{notification.message}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {notification.time}
                  </span>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-gray-500">
              {showUnreadOnly 
                ? "You've read all your notifications"
                : "You don't have any notifications yet"}
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {filteredNotifications.length > 0 && (
        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-sm text-gray-500">
            Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            {showUnreadOnly && ` • ${unreadCount} unread`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;