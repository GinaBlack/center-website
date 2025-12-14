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
  User,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase_config";
import { ROLES } from "../constants/roles";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  //const { isAuthenticated, hasRole, logout } = useAuth();

  const login = (email: string, password: string): Promise<UserCredential> =>
    signInWithEmailAndPassword(auth, email, password);

  const register = async (email: string, password: string, data: object) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCredential.user.uid), data);
  };

  const logout = (): Promise<void> => auth.signOut();

  const resetPassword = (email: string): Promise<void> =>
    sendPasswordResetEmail(auth, email);

  const getUserRole = (): ROLES =>
    userData?.role || ROLES.USER;

  const hasRole = (role: ROLES): boolean =>
    userData?.role === role;

  const hasMinimumRole = (role: ROLES): boolean => {
    const ROLE_LEVEL: Record<ROLES, number> = {
      [ROLES.USER]: 1,
      [ROLES.INSTRUCTOR]: 2,
      [ROLES.ADMIN]: 3,
    };

    const userRole = getUserRole();

    return ROLE_LEVEL[userRole] >= ROLE_LEVEL[role];
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          setUserData({ role: ROLES.USER });
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
    login,
    register,
    logout,
    resetPassword,
    getUserRole,
    hasRole,
    hasMinimumRole,
    //isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
};
interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string, data: object) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getUserRole: () => ROLES;
  hasRole: (role: ROLES) => boolean;
  hasMinimumRole: (role: ROLES) => boolean;
 // isAuthenticated: boolean;

}
interface UserData {
  role: ROLES;
  [key: string]: any;
  
}
