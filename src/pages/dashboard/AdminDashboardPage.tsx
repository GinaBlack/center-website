// src/pages/dashboard/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Package,
  Settings,
  Users,
  BarChart3,
  DollarSign,
  Activity,
  DownloadCloud,
  UploadCloud,
  Shield,
  Calendar,
  Mail,
} from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="p-4 py-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage platform users, content, and settings.
        </p>
      </div>

      <div className=" grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className='border rounded-lg pl-8 p-2 '>
        <Link
          to="/admin/users"
          className="bg-white p-2  rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-3">👥</div>
          <h3 className="font-bold mb-2">User Management</h3>
          <p className="text-sm text-gray-600">Manage users, roles, and permissions</p>
        </Link>
        </div>
        <div className='border rounded-lg pl-8 p-2 '>
        <Link
          to="/admin/projects"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
          <div className="text-2xl mb-3">🛡️</div>
          <h3 className="font-bold mb-2">Content Moderation</h3>
          <p className="text-sm text-gray-600">Review and moderate uploaded content</p>
        </Link>
        </div>

        <div className="bg-white p-6 border rounded-lg shadow">
          <div className="text-2xl mb-3">📊</div>
          <h3 className="font-bold mb-2">Platform Analytics</h3>
          <p className="text-sm text-gray-600 mb-2">View usage statistics and reports</p>
          <p className="text-sm text-gray-600">COMING SOON!!!</p>
        </div>
      </div>
                <div className="space-y-6 pt-6">
            <h2 className="tracking-tight text-smx flex justify-between">Bulk Operations Center<p className='text-gray-400 text-smx'> COMING SOON!!!!!!!</p></h2>
            
            <div className=" grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Bulk user operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <DownloadCloud className="w-4 h-4 mr-2" />
                    Export User Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Import Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Bulk Email
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Update Roles
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Operations</CardTitle>
                  <CardDescription>Bulk project actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <DownloadCloud className="w-4 h-4 mr-2" />
                    Export Projects
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Update Deadlines
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Generate Invoices
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Operations</CardTitle>
                  <CardDescription>Administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    System Backup
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Audit
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Performance Review
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

    </div>
    

    
  );
};

export default AdminDashboard;