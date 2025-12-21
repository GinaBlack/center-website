      import { useState } from "react";
      import { useNavigate } from "react-router-dom";
      import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
      import { Button } from "../../components/ui/button";
      import { Input } from "../../components/ui/input";
      import { Label } from "../../components/ui/label";
      import { toast } from "sonner";
      import { Eye, EyeOff } from "lucide-react";
      import {
        createUserWithEmailAndPassword,
        updateProfile,
        sendEmailVerification,
        GoogleAuthProvider,
        signInWithPopup,
        UserCredential
      } from "firebase/auth";
      import { doc, setDoc, getDoc } from "firebase/firestore";
      import { auth, db } from "../../firebase/firebase_config";
      import { ROLES } from "../../constants/roles";

      enum UserRole {
        INDIVIDUAL = ROLES.USER,
        INSTRUCTOR = ROLES.INSTRUCTOR,
        ADMIN = ROLES.ADMIN,
      }

      export default function RegisterPage() {
        const navigate = useNavigate();

        const [registerData, setRegisterData] = useState({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          userType: UserRole.INDIVIDUAL,
          phone: "",
        });

        const [errors, setErrors] = useState<any>({});
        const [showPassword, setShowPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");

        const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
        const isValidPhone = (phone: string) => /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\D/g, ''));

        const validateAllFields = () => {
          const newErrors: any = {};
          newErrors.firstName = registerData.firstName.length >= 2 ? "" : "First name must be at least 2 characters";
          newErrors.lastName = registerData.lastName.length >= 2 ? "" : "Last name must be at least 2 characters";
          newErrors.email = isValidEmail(registerData.email) ? "" : "Please enter a valid email address";
          newErrors.password = registerData.password.length >= 8 ? "" : "Password must be at least 8 characters";
          newErrors.confirmPassword = registerData.confirmPassword === registerData.password ? "" : "Passwords do not match";
          newErrors.phone = registerData.phone === "" || isValidPhone(registerData.phone) ? "" : "Please enter a valid phone number";

          setErrors(newErrors);
          return !Object.values(newErrors).some(err => err !== "");
        };

        const handleInputChange = (field: string, value: string) => {
          setRegisterData(prev => ({ ...prev, [field]: value }));
        };

        const createFirestoreUser = async (user: any) => {
          const fullName = `${registerData.firstName} ${registerData.lastName}`.trim();

          await setDoc(doc(db, "users", user.uid), {
            user_id: user.uid,
            email: user.email,
            email_verified: user.emailVerified,
            first_name: registerData.firstName,
            last_name: registerData.lastName,
            role: registerData.userType,
            phone: registerData.phone || null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login: null,
            avatar_url: "../../assets/images/placseholder.png",
            two_factor_enabled: false,
            two_factor_secret: null,
          });

          await setDoc(doc(db, "user_profiles", user.uid), {
            user_id: user.uid,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          await setDoc(doc(db, "user_settings", user.uid), {
            user_id: user.uid,
            email_notifications: true,
            sms_notifications: false,
            marketing_emails: true,
            notification_preferences: {},
            privacy_settings: {},
            updated_at: new Date().toISOString(),
          });
        };

        const handleEmailSignup = async (e: React.FormEvent) => {
          e.preventDefault();
          setError("");

          if (!validateAllFields()) {
            toast.error("Please fix the errors in the form");
            return;
          }

          setLoading(true);
          try {
            const userCredential: UserCredential = await createUserWithEmailAndPassword(
              auth,
              registerData.email,
              registerData.password
            );

            const user = userCredential.user;

            await updateProfile(user, { displayName: `${registerData.firstName} ${registerData.lastName}` });
            await sendEmailVerification(user);
            await createFirestoreUser(user);

            toast.success("Account created! Check your email for verification.");

            navigate("/auth/verifyemail", {
              state: { email: registerData.email, userType: registerData.userType },
            });
          } catch (err: any) {
            console.error(err);
            let msg = "Registration failed. Please try again.";
            if (err.code === "auth/email-already-in-use") msg = "Email already in use.";
            if (err.code === "auth/invalid-email") msg = "Invalid email address.";
            if (err.code === "auth/weak-password") msg = "Weak password.";
            setError(msg);
            toast.error(msg);
          } finally {
            setLoading(false);
          }
        };

        const handleGoogleSignup = async () => {
          setLoading(true);
          setError("");
          try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
              await createFirestoreUser(user);
            }

            toast.success("Signed in with Google!");
            navigate("/dashboard");
          } catch (err: any) {
            console.error(err);
            setError(err.message || "Google signup failed");
            toast.error(err.message || "Google signup failed");
          } finally {
            setLoading(false);
          }
        };
        

        return (
          <div className="login-container">
            <div className="login-overlay">
              <div className="login-content">
                <div className="login-header">
                <h1 className="login-title">
                  Create Your Account
                </h1>
                <p className="login-subtitle">
                  Join 3D Printing High-Tech Center to start submitting projects
                </p>
              </div>
                </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

            <Card className="shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>Fill in your details to create an account</CardDescription>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={registerData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="John"
                          required
                          disabled={loading}
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={registerData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Doe"
                          required
                          disabled={loading}
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={loading}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={registerData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        disabled={loading}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userType">Account Type *</Label>
                      <select
                        id="userType"
                        value={registerData.userType}
                        onChange={(e) => handleInputChange("userType", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        title="userType"
                        disabled={loading}
                      >
                        <option value={UserRole.INDIVIDUAL}>Individual User</option>
                        <option value={UserRole.INSTRUCTOR}>Instructor</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {registerData.userType === UserRole.INSTRUCTOR 
                          ? "Instructors can create and manage courses"
                          : "Individual users can enroll in courses and submit projects"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={registerData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          placeholder="••••••••"
                          required
                          disabled={loading}
                          className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1 mt-1">
                        <p>Password must contain:</p>
                        <ul className="list-disc list-inside pl-2">
                          <li className={registerData.password.length >= 8 ? "text-green-600" : ""}>
                            At least 8 characters
                          </li>
                          <li className={/\d/.test(registerData.password) ? "text-green-600" : ""}>
                            At least one number
                          </li>
                          <li className={/[A-Z]/.test(registerData.password) ? "text-green-600" : ""}>
                            At least one uppercase letter
                          </li>
                        </ul>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={registerData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          placeholder="••••••••"
                          required
                          disabled={loading}
                          className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="space-y-4 pt-2">
                      <Button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Account...
                          </span>
                        ) : (
                          'Create Account'
                        )}
                  </Button>

                      <div className="relative pt-8">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t p-4  border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleGoogleSignup}
                          disabled={loading}
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                    Continue with Google
                  </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => {/* Add other OAuth here */}}
                          disabled={true}
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          GitHub
                        </Button>
                      </div>

                      <div className="text-center text-sm pt-4 border-t border-gray-200">
                        <span className="text-gray-600">Already have an account? </span>
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                          onClick={() => navigate("/auth/login")}
                          disabled={loading}
                        >
                          Sign in here
                        </button>
                      </div>
                    </div>
                </form>
              </CardContent>
            </Card>

              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">
                  By creating an account, you agree to our{" "}
                  <button
                    type="button"
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    onClick={() => navigate("/terms")}
                  >
                    Terms of Service
                  </button>
                  {" "}and{" "}
                  <button
                    type="button"
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    onClick={() => navigate("/privacy")}
                  >
                    Privacy Policy
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  Need help?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                    onClick={() => navigate("/contact")}
                  >
                    Contact Support
                  </button>
                </p>
              </div>
            </div>
          </div>
        );
      }
