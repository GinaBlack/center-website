// src/pages/dashboard/UserDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboard = () => {
  const { userData } = useAuth();

  return (
    <div className='py-20 p-8 bg-background/95 w-full'>
      <div className="mb-6">
        <h1 className="text-lgx font-bold text-gray-900">
          Welcome back, {userData?.displayName}!
        </h1>
        <p className="text-gray-600 text-smx">
          Here's what's happening with your 3D printing projects, Hall booking and Courses today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className=" flex items-center justify-center grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 border-2 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">My Projects</h3>
          <p className="text-3xl font-bold">0</p>
          <Link to="/dashboard/projects" className="text-blue-600 hover:underline text-sm">
            View all →
          </Link>
        </div>

        <div className="bg-card p-6 border-2 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Courses</h3>
          <p className="text-3xl font-bold">0</p>
          <Link to="/dashboard/courses" className="text-blue-600 hover:underline text-sm">
            Continue learning →
          </Link>
        </div>

        <div className="bg-card p-6 border-2 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Upcoming Bookings</h3>
          <p className="text-3xl font-bold">0</p>
          <Link to="/dashboard/bookings" className="text-blue-600 hover:underline text-sm">
            Manage bookings →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/dashboard/projects/upload"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-center"
          >
            <div className="text-2xl mb-2">🛠️</div>
            <div className="font-medium">Upload New Project</div>
          </Link>

          <Link
            to="/dashboard/book-hall"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 text-center"
          >
            <div className="text-2xl mb-2">🏢</div>
            <div className="font-medium">Book Printing Hall</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;