import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function VerifyEmailPage() {
  const { currentUser, resendVerificationEmail, refreshEmailVerification } = useAuth();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const checkVerification = async () => {
      if (currentUser) {
        await refreshEmailVerification();
        setVerified(currentUser.emailVerified);
      }
    };
    checkVerification();
  }, [currentUser]);

  if (verified) {
    return <p>Email verified! Redirecting to dashboard...</p>;
    // You can programmatically redirect after verification
  }

  return (
    <div>
      <h2>Verify Your Email</h2>
      <p>
        A verification email has been sent to {currentUser?.email}. Please click the link in your inbox.
      </p>
      <button onClick={resendVerificationEmail}>Resend Email</button>
      <button onClick={refreshEmailVerification}>I have verified my email</button>
    </div>
  );
}
