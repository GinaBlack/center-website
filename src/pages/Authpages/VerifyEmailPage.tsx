import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../../constants/roles";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase_config";

export default function VerifyEmailPage() {
  const {
    currentUser,
    resendVerificationEmail,
    refreshEmailVerification, // your context function to reload user
    userData,
    loading,
  } = useAuth();

  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  // Redirect if user is not logged in
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/auth/login", { replace: true });
    }
  }, [currentUser, loading, navigate]);

  // Determine dashboard route based on role
  const getDashboardRoute = () => {
    switch (userData?.role) {
      case ROLES.ADMIN:
        return "/admin";
      case ROLES.INSTRUCTOR:
        return "/instructor";
      default:
        return "/dashboard";
    }
  };

  // Auto-redirect once verified
  useEffect(() => {
    if (!loading && userData?.emailVerified) {
      navigate(getDashboardRoute(), { replace: true });
    }
  }, [userData, loading, navigate]);

  const handleRefresh = async () => {
    setChecking(true);

    try {
      // Refresh user object
      await refreshEmailVerification(); // should call Firebase reload()

      // Check if email is verified
      const updatedUser = currentUser;
      if (updatedUser?.emailVerified) {
        // Update Firestore
        await setDoc(
          doc(db, "users", updatedUser.uid),
          { email_verified: true, updated_at: new Date().toISOString() },
          { merge: true }
        );

        // Redirect to dashboard
        navigate(getDashboardRoute(), { replace: true });
      } else {
        alert("Email is not verified yet. Please check your inbox.");
      }
    } catch (err: any) {
      console.error("Error checking verification:", err);
      alert("Failed to verify email. Try again.");
    } finally {
      setChecking(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold">Verify Your Email</h1>

      <p className="mt-4 max-w-md">
        A verification email has been sent to
        <strong> {currentUser?.email}</strong>.  
        Please click the link in your inbox to activate your account.
      </p>

      <div className="mt-6 flex gap-4">
        <button
          onClick={resendVerificationEmail}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Resend Email
        </button>

        <button
          onClick={handleRefresh}
          disabled={checking}
          className="px-4 py-2 bg-black/60 text-white rounded disabled:opacity-50"
        >
          {checking ? "Checking..." : "I have verified my email"}
        </button>
      </div>
    </div>
  );
}
