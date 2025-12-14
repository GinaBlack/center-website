// src/components/Layout/AuthLayout.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Navbar from '../Navigation';
import Footer from '../Footer';

const AuthLayout = () => {
  return (
              <>
              <Navbar />
              <Outlet />
              <Footer />
              </>
  );
};

export default AuthLayout;