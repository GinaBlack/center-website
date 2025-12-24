import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase_config";
import { ROLES } from "../constants/roles";
import { useNavigate } from "react-router-dom"

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const login = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

  const register = async (email: string, password: string, additionalData: RegisterData) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    if (additionalData.displayName) {
      await updateProfile(user, { displayName: additionalData.displayName });
    }

    // Send verification email
    await sendEmailVerification(user, {
    url: `${window.location.origin}/auth/verifyemail`,
  });

    const userDoc: UserData = {
      uid: user.uid,
      email: user.email || "",
      firstName: additionalData.firstName || "",
      displayName: additionalData.displayName || "",
      role: additionalData.role || ROLES.USER,
      emailVerified: user.emailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoUrl: null,
    };

    await setDoc(doc(db, "users", user.uid), userDoc);
    setUserData(userDoc);
    navigate("/auth/verifyemail");
  };

  const logout = async () => {
    await auth.signOut();
  };

  const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

  /** ✅ Email Verification Helpers */

  // Refresh the user's emailVerified status
  const refreshEmailVerification = async () => {
    if (currentUser) {
      await currentUser.reload();
      setUserData(prev =>
        prev ? { ...prev, emailVerified: currentUser.emailVerified } : prev
      );
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    if (currentUser && !currentUser.emailVerified) {
      await sendEmailVerification(currentUser);
      alert('Verification email resent! Please check your inbox.');
    }
  };

  const getUserRole = () => userData?.role || ROLES.USER;

  const hasRole = (role: ROLES) => userData?.role === role;

  const hasMinimumRole = (role: ROLES) => {
    const LEVEL: Record<ROLES, number> = {
  [ROLES.USER]: 1,
  [ROLES.INSTRUCTOR]: 2,
  [ROLES.CENTER_ADMIN]: 3,
  [ROLES.SUPER_ADMIN]: 4
    };
    const currentUserRole = getUserRole();
    return LEVEL[currentUserRole] >= LEVEL[role];
  };

  const updateUserPhoto = async (photoUrl: string) => {
    if (!currentUser) return;

    await updateDoc(doc(db, "users", currentUser.uid), {
      photoUrl,
      updatedAt: new Date().toISOString(),
    });

    setUserData(prev => (prev ? { ...prev, photoUrl } : prev));
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setUserLoggedIn(!!user);

      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            const data = snap.data() as UserData;

            // Keep Firebase emailVerified in sync
            data.emailVerified = user.emailVerified;

            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    userLoggedIn,
    isAuthenticated: !!currentUser && !!userData?.emailVerified,
    isInstructor: userData?.role === ROLES.INSTRUCTOR,
    isAdmin: userData?.role === ROLES.CENTER_ADMIN || userData?.role === ROLES.SUPER_ADMIN,
    login,
    register,
    logout,
    resetPassword,
    getUserRole,
    hasRole,
    hasMinimumRole,
    updateUserPhoto,
    // New email verification functions
    refreshEmailVerification,
    resendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

/* ================== TYPES ================== */
interface RegisterData {
  displayName?: string;
  firstName?: string;
  role?: ROLES;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  userLoggedIn: boolean;
  isAuthenticated: boolean;
  isInstructor: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string, data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getUserRole: () => ROLES;
  hasRole: (role: ROLES) => boolean;
  hasMinimumRole: (role: ROLES) => boolean;
  updateUserPhoto: (photoUrl: string) => Promise<void>;
  // Email verification
  refreshEmailVerification: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

interface UserData {
  uid: string;
  email: string;
  firstName: string;
  displayName: string;
  role: ROLES;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  photoUrl: string | null;
}
