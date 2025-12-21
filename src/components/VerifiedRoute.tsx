import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import React from "react";
import { useNavigate } from "react-router-dom";

interface VerifiedRouteProps {
  children: React.ReactNode;
}

const VerifiedRoute = ({ children }: VerifiedRouteProps) => {
  const { currentUser, userData, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  if (!currentUser) {
      navigate("/auth/login", { replace: true });
  }

  if (!userData?.emailVerified) {
    return <Navigate to="/auth/verifyemail" replace />;
  }

  return <>{children}</>;
};

export default VerifiedRoute;
