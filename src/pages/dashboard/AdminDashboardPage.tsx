// src/pages/dashboard/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage platform users, content, and settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-3">👥</div>
          <h3 className="font-bold mb-2">User Management</h3>
          <p className="text-sm text-gray-600">Manage users, roles, and permissions</p>
        </Link>

        <Link
          to="/admin/projects"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-3">🛡️</div>
          <h3 className="font-bold mb-2">Content Moderation</h3>
          <p className="text-sm text-gray-600">Review and moderate uploaded content</p>
        </Link>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl mb-3">📊</div>
          <h3 className="font-bold mb-2">Platform Analytics</h3>
          <p className="text-sm text-gray-600">View usage statistics and reports</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;