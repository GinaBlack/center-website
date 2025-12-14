// src/pages/dashboard/InstructorDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const InstructorDash = () => {
    const { userData } = useAuth();
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Instructor Dashboard
                </h1>
                <p className="text-gray-600">
                    Manage your courses and students here.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Course Management</h3>
                    <div className="space-y-3">
                        <Link
                            to="/instructor/courses/create"
                            className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg"
                        >
                            <div className="font-medium">Create New Course</div>
                            <div className="text-sm text-gray-600">Start a new workshop or training</div>
                        </Link>
                        <Link
                            to="/instructor/courses"
                            className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg"
                        >
                            <div className="font-medium">View My Courses</div>
                            <div className="text-sm text-gray-600">Manage existing courses</div>
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Student Analytics</h3>
                    <p className="text-gray-600 mb-4">Track student progress and engagement</p>
                    <div className="text-center py-8 text-gray-400">
                        Analytics coming soon
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorDash;