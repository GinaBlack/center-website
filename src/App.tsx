// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from './contexts/languageContext';
import { Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import AuthLayout from './components/Layout/AuthLayout';
import DashboardLayout from './components/Layout/DashboardLayout';

// Route Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import InstructorRoute from './components/InstructorRoute';

// Public Pages
import HomePage from './pages/publicpages/HomePage';
import GalleryPage from './pages/publicpages/GalleryPage';
import WorkshopsPage from './pages/publicpages/WorkshopsPage';
import ServicesPage from './pages/publicpages/ServicesPage';
import MaterialLibraryPage from './pages/publicpages/MaterialLibraryPage';
import PricingPage from './pages/publicpages/PricingPage';
import AboutPage from './pages/publicpages/AboutPage';
import ContactPage from './pages/publicpages/ContactPage';

// Auth Pages
import LoginPage from './pages/Authpages/LoginPage';
import RegisterPage from './pages/Authpages/RegisterPage';
import ForgotPassword from './pages/Authpages/ForgotPassword';
import ResetPassword from './pages/Authpages/ResetPassword';

// Dashboard Pages (Role-Based)
import UserDashboard from './pages/dashboard/UserDashboardPage';
import InstructorDashboard from './pages/dashboard/InstructorDash';
import AdminDashboard from './pages/dashboard/AdminDashboardPage';
/*
// User Pages
import MyProjects from './pages/Userpages/projects/MyProjects';
import UploadProject from './pages/Userpages/projects/UploadProject';
//import MyCourses from './pages/Userpages/learning/MyCourses';
import BookHall from './pages/Userpages/services/BookHall';
//import MyBookings from './pages/Userpages/services/MyBookings';

// Instructor Pages
import MyInstructorCourses from './pages/Lecturerpages/MyCourse';
import CreateCourse from './pages/Lecturerpages/CreateCourse';
//import CourseStudents from './pages/Lecturer Dash pages/CourseStudents';
//import MyMaterials from './pages/Lecturer Dash pages/MyMaterials';

// Admin Pages
import UserManagement from './pages/Adminpages/UserManagement';
import ProjectManagement from './pages/Adminpages/ContentManagement/ProjectManagement';
//import CourseManagement from './pages/Admin Dash pages/ContentManagement/CourseManagement';
//import MaterialManagement from './pages/Admin Dash pages/ContentManagement/MaterialManagement';
//import BookingManagement from './pages/Admin Dash pages/BookingManagement';
//import GalleryManagement from './pages/Admin Dash pages/ContentManagement/GalleryManagement';
//import ContactMessages from './pages/Admin Dash pages/ContactMessages';

*/
// Error Pages
import Unauthorized from './pages/Errors/Unauthorised';
import NotFound from './pages/Errors/NotFound';

// Role-Based Dashboard Component
const RoleBasedDashboard = () => {
  const { currentUser, getUserRole } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  const role = getUserRole();

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'instructor':
      return <InstructorDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
};

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <LanguageProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* ================= PUBLIC ROUTES ================= */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/workshops" element={<WorkshopsPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/materials" element={<MaterialLibraryPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
              </Route>
              {/* ================= AUTH ROUTES ================= */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
              </Route>
              {/* ================= 404 ================= */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
};
export default App;

