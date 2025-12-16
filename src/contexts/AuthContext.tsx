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
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase_config";
import { ROLES } from "../constants/roles";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<UserCredential> => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, additionalData: any): Promise<void> => {
    try {
      // 1. Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update profile with display name if provided
      if (additionalData.displayName) {
        await updateProfile(user, {
          displayName: additionalData.displayName
        });
      }

      // 3. Send email verification
      await sendEmailVerification(user);

      // 4. Create user document in Firestore
      const userDataToStore = {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: additionalData.displayName || "",
        role: additionalData.role || ROLES.USER,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Include any additional data
        ...additionalData
      };

      await setDoc(doc(db, "users", user.uid), userDataToStore);
      
      // 5. Update local state
      setUserData(userDataToStore);
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await auth.signOut();
    } catch (error: any) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  const getUserRole = (): ROLES => {
    return userData?.role || ROLES.USER;
  };

  const hasRole = (role: ROLES): boolean => {
    return userData?.role === role;
  };

  const hasMinimumRole = (role: ROLES): boolean => {
    const ROLE_LEVEL: Record<ROLES, number> = {
      [ROLES.USER]: 1,
      [ROLES.INSTRUCTOR]: 2,
      [ROLES.ADMIN]: 3,
    };

    const userRole = getUserRole();
    return ROLE_LEVEL[userRole] >= ROLE_LEVEL[role];
  };

  const isAuthenticated = !!currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setUserLoggedIn(!!user);

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));

          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            // Create basic user data if document doesn't exist
            const basicUserData: UserData = {
              uid: user.uid,
              email: user.email || "",
              displayName: user.displayName || "",
              role: ROLES.USER,
              emailVerified: user.emailVerified,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setUserData(basicUserData);
            
            // Optionally create the document
            await setDoc(doc(db, "users", user.uid), basicUserData);
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

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    userLoggedIn,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
    getUserRole,
    hasRole,
    hasMinimumRole,
    // Optional: Add refresh user data function
    refreshUserData: async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Interfaces
interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  userLoggedIn: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string, data: any) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getUserRole: () => ROLES;
  hasRole: (role: ROLES) => boolean;
  hasMinimumRole: (role: ROLES) => boolean;
  refreshUserData?: () => Promise<void>;
}

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: ROLES;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}