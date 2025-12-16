// src/components/Layout/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../DashboardSidebar';
import Footer from '../Footer';
import NavBar from "../Navigation";

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-background/95 flex flex-col">
            <NavBar />
            {/* Main content container */}
            <div className="flex flex-1">
                {/* Sidebar - Fixed on left for desktop, hidden for mobile */}
                <div className=" lg:block lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:w-64 lg:z-30">
                    <DashboardSidebar />
                </div>
                <div className='h-full w-full'>
                <Outlet />
                </div>
            </div>
                <Footer />
        </div>
    );
};

export default DashboardLayout;