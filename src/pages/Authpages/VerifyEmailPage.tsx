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
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
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
      case ROLES.CENTER_ADMIN || ROLES.SUPER_ADMIN:
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

  const handleResendEmail = async () => {
    setResending(true);
    setResendSuccess(false);
    
    try {
      await resendVerificationEmail();
      setResendSuccess(true);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error("Error resending verification email:", err);
      alert("Failed to resend verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

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
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold">Verify Your Email</h1>

        <p className="mt-4">
          A verification email has been sent to
          <strong> {currentUser?.email}</strong>.  
          Please click the link in your inbox to activate your account.
        </p>

        {resendSuccess && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
            ✅ Verification email sent successfully! Check your inbox.
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4">
          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {resending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </button>

          <button
            onClick={handleRefresh}
            disabled={checking}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {checking ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </>
            ) : (
              "I have verified my email"
            )}
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <p className="font-medium">Didn't receive the email?</p>
          <ul className="mt-2 text-left list-disc pl-5 space-y-1">
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes and try resending</li>
          </ul>
        </div>
      </div>
    </div>
  );
}