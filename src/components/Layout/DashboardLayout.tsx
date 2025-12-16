// src/components/Layout/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../DashboardSidebar';
import Footer from '../Footer';
import NavBar from "../Navigation";

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <NavBar />
            {/* Main content container */}
            <div className="flex flex-1">
                {/* Sidebar - Fixed on left for desktop, hidden for mobile */}
                <div className=" lg:block lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:w-64 lg:z-30">
                    <DashboardSidebar />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 lg:ml-64">
                    {/* Optional: You can add a header here if needed */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 min-h-[calc(100vh-10rem)]">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
                <Footer />
        </div>
    );
};

export default DashboardLayout;