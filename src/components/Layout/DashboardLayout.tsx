// src/components/Layout/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navigation';
import DashboardSidebar from '../DashboardSidebar';
import Footer from '../Footer';

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-3">
                        <DashboardSidebar />
                    </div>

                    {/* Main Content */}
                    <main className="lg:col-span-9">
                        <Outlet />
                    </main>
                    <Footer/>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;