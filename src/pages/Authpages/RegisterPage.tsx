import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase_config";

// User roles
enum UserRole {
  USER = 'user',
  INSTRUCTOR = 'instructor',
  CENTER_ADMIN = 'center_admin',
  SUPER_ADMIN = 'super_admin'
}

// Validation rules
const VALIDATION_RULES = {
  firstName: {
    minLength: 2,
    maxLength: 30,
    pattern: /^[a-zA-ZÀ-ÿ\s\-']+$/,
    message: "First name must be 2-30 letters only"
  },
  lastName: {
    minLength: 2,
    maxLength: 30,
    pattern: /^[a-zA-ZÀ-ÿ\s\-']+$/,
    message: "Last name must be 2-30 letters only"
  },
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    maxLength: 100,
    message: "Please enter a valid email address"
  },
  password: {
    minLength: 8,
    hasNumber: /\d/,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/,
    message: "Password must be at least 8 characters with mixed case and number"
  },
  phone: {
    pattern: /^\+?[\d\s\-()]{10,20}$/,
    message: "Please enter a valid phone number"
  }
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: UserRole.USER,
    phone: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [validationStates, setValidationStates] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  // Real-time validation
  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case 'firstName':
        if (value.length < VALIDATION_RULES.firstName.minLength) 
          return VALIDATION_RULES.firstName.message;
        if (value.length > VALIDATION_RULES.firstName.maxLength) 
          return `First name must be less than ${VALIDATION_RULES.firstName.maxLength} characters`;
        if (!VALIDATION_RULES.firstName.pattern.test(value))
          return "First name contains invalid characters";
        return '';
      
      case 'lastName':
        if (value.length < VALIDATION_RULES.lastName.minLength) 
          return VALIDATION_RULES.lastName.message;
        if (value.length > VALIDATION_RULES.lastName.maxLength) 
          return `Last name must be less than ${VALIDATION_RULES.lastName.maxLength} characters`;
        if (!VALIDATION_RULES.lastName.pattern.test(value))
          return "Last name contains invalid characters";
        return '';
      
      case 'email':
        if (!VALIDATION_RULES.email.pattern.test(value)) 
          return VALIDATION_RULES.email.message;
        if (value.length > VALIDATION_RULES.email.maxLength)
          return `Email must be less than ${VALIDATION_RULES.email.maxLength} characters`;
        return '';
      
      case 'password':
        if (value.length < VALIDATION_RULES.password.minLength) 
          return "At least 8 characters required";
        if (!VALIDATION_RULES.password.hasNumber.test(value)) 
          return "At least one number required";
        if (!VALIDATION_RULES.password.hasUppercase.test(value)) 
          return "At least one uppercase letter required";
        if (!VALIDATION_RULES.password.hasLowercase.test(value)) 
          return "At least one lowercase letter required";
        return '';
      
      case 'confirmPassword':
        return value === registerData.password 
          ? '' 
          : 'Passwords do not match';
      
      case 'phone':
        if (!value) return '';
        if (!VALIDATION_RULES.phone.pattern.test(value)) 
          return VALIDATION_RULES.phone.message;
        return '';
      
      default:
        return '';
    }
  }, [registerData.password]);

  // Handle input change - SIMPLIFIED VERSION
  const handleInputChange = (field: string, value: string) => {
    // Update the field value immediately
    setRegisterData(prev => ({ ...prev, [field]: value }));
    
    // Mark field as touched
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
    
    // Run validation synchronously without useState updates that cause re-renders
    const error = validateField(field, value);
    const isValid = !error;
    
    // Update errors and validation states directly
    setErrors(prev => ({ ...prev, [field]: error }));
    setValidationStates(prev => ({ 
      ...prev, 
      [field]: { 
        isValid,
        message: error 
      }
    }));
  };

  // Validate entire form
  const validateAllFields = useCallback(() => {
    const newErrors: any = {};
    const newValidationStates: any = {};
    
    Object.keys(registerData).forEach(field => {
      if (field === 'userType') return;
      
      const value = registerData[field as keyof typeof registerData];
      const error = validateField(field, value);
      newErrors[field] = error;
      newValidationStates[field] = { 
        isValid: !error,
        message: error 
      };
    });
    
    setErrors(newErrors);
    setValidationStates(newValidationStates);
    
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    const allRequiredFilled = 
      registerData.firstName && 
      registerData.lastName && 
      registerData.email && 
      registerData.password && 
      registerData.confirmPassword;
    
    setIsFormValid(!hasErrors && allRequiredFilled);
    
    return !hasErrors;
  }, [registerData, validateField]);

  // Run validation when form data changes
  useEffect(() => {
    validateAllFields();
  }, [registerData, validateAllFields]);

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (VALIDATION_RULES.password.hasNumber.test(password)) score++;
    if (VALIDATION_RULES.password.hasUppercase.test(password)) score++;
    if (VALIDATION_RULES.password.hasLowercase.test(password)) score++;
    
    const percentage = (score / 4) * 100;
    
    return {
      score,
      percentage,
      color: score <= 1 ? 'bg-red-500' : 
             score <= 2 ? 'bg-yellow-500' : 
             score === 3 ? 'bg-blue-500' : 'bg-green-500',
      text: score <= 1 ? 'Very weak' : 
            score <= 2 ? 'Weak' : 
            score === 3 ? 'Good' : 'Strong'
    };
  };

  // Password strength component
  const PasswordStrengthMeter = ({ password }: { password: string }) => {
    const strength = getPasswordStrength(password);
    
    return (
      <div className="mt-2 pt-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">Password strength:</span>
          <span className={`font-medium ${strength.color.replace('bg-', 'text-')}`}>
            {strength.text}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
          title="progress bar" 
            className={`${strength.color} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${strength.percentage}%` }}
            role="progressbar"
          />
        </div>
      </div>
    );
  };

  // Create Firestore user documents
  const createFirestoreUser = async (user: any) => {
    const userId = user.uid;
    const now = Timestamp.now();
    const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user document
    await setDoc(doc(db, "users", userId), {
      user_id: userId,
      email: user.email.toLowerCase(),
      first_name: registerData.firstName,
      last_name: registerData.lastName,
      role: registerData.userType,
      email_verified: user.emailVerified,
      verification_token: verificationToken,
      verification_expires: Timestamp.fromDate(verificationExpires),
      phone: registerData.phone || null,
      is_active: true,
      account_status: 'active',
      created_at: now,
      updated_at: now,
      last_login: null,
      deleted_at: null
    });

    // Create user_profiles document
    await setDoc(doc(db, "user_profiles", userId), {
      profile_id: userId,
      user_id: userId,
      avatar_url: "",
      created_at: now,
      updated_at: now
    });

    // Create user_settings document
    await setDoc(doc(db, "user_settings", userId), {
      setting_id: userId,
      user_id: userId,
      email_notifications: true,
      sms_notifications: false,
      marketing_emails: true,
      two_factor_enabled: false,
      two_factor_secret: null,
      notification_preferences: {
        project_updates: true,
        course_updates: true,
        booking_confirmation: true,
        new_messages: true,
        system_notifications: true
      },
      privacy_settings: {
        profile_visibility: "public",
        show_email: false,
        show_phone: false,
        show_last_login: false
      },
      theme_preference: "light",
      language: "en",
      updated_at: now
    });
      // 4. Create initial user_addresses document if needed
     const addressId = `address_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await setDoc(doc(db, "user_addresses", addressId), {
        address_id:addressId,
        user_id: userId,
        addressType:"shipping",
        street_address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        is_default: true,
        created_at: now
      });
    
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateAllFields()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (!isFormValid) {
      toast.error("Please complete all required fields correctly");
      return;
    }

    if (registerData.userType === UserRole.CENTER_ADMIN || registerData.userType === UserRole.SUPER_ADMIN) {
      toast.error("Administrator accounts must be created by existing administrators");
      return;
    }

    setLoading(true);
    
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        registerData.email.toLowerCase(),
        registerData.password
      );

      const user = userCredential.user;

      await updateProfile(user, { 
        displayName: `${registerData.firstName} ${registerData.lastName}` 
      });

      await sendEmailVerification(user);
      await createFirestoreUser(user);

      toast.success("Account created successfully! Please check your email for verification.");

      navigate("/auth/verifyemail", {
        state: { 
          email: registerData.email, 
          userType: registerData.userType,
          userId: user.uid 
        },
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      
      let msg = "Registration failed. Please try again.";
      if (err.code === "auth/email-already-in-use") msg = "Email already in use.";
      if (err.code === "auth/invalid-email") msg = "Invalid email address.";
      if (err.code === "auth/weak-password") msg = "Password is too weak. Use at least 8 characters with mixed case and numbers.";
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
      provider.setCustomParameters({
        'prompt': 'select_account'
      });

      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        const displayName = user.displayName || "";
        const nameParts = displayName.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        const userId = user.uid;
        const now = Timestamp.now();

        await setDoc(doc(db, "users", userId), {
          user_id: userId,
          email: user.email?.toLowerCase() ,
          first_name: firstName,
          last_name: lastName,
          role: UserRole.USER,
          email_verified: user.emailVerified,
          verification_token: null,
          verification_expires: null,
          phone: user.phoneNumber || null,
          is_active: true,
          account_status: 'active',
          created_at: now,
          updated_at: now,
          last_login: now,
          deleted_at: null
        });

        await setDoc(doc(db, "user_profiles", userId), {
          profile_id: userId,
          user_id: userId,
          avatar_url: "",
          created_at: now,
          updated_at: now
        });

        await setDoc(doc(db, "user_settings", userId), {
          setting_id: userId,
          user_id: userId,
          email_notifications: true,
          sms_notifications: false,
          marketing_emails: true,
          two_factor_enabled: false,
          two_factor_secret: null,
          notification_preferences: {
            project_updates: true,
            course_updates: true,
            booking_confirmation: true,
            new_messages: true,
            system_notifications: true
          },
          privacy_settings: {
            profile_visibility: "public",
            show_email: false,
            show_phone: false,
            show_last_login: false
          },
          theme_preference: "light",
          language: "en",
          updated_at: now
        });
        
     const addressId = `address_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await setDoc(doc(db, "user_addresses", addressId), {
        address_id:addressId,
        user_id: userId,
        addressType:"shipping",
        street_address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        is_default: true,
        created_at: now
      });
    
      }

      toast.success("Signed in with Google successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Google signup error:", err);
      let msg = "Google signup failed. Please try again.";
      if (err.code === "auth/popup-closed-by-user") msg = "Signup cancelled.";
      if (err.code === "auth/cancelled-popup-request") msg = "Signup cancelled.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" >
      <div className="login-overlay">
        <div className="login-content">
          <div className="login-header">
            <h1 className="login-title">
              Create Your Account
            </h1>
            <p className="login-subtitle">
              Join 3D Printing High-Tech Center to start Managing and Submitting Projects, 
              Book Halls, Register for Trainings, Request for 3D Scanning Services
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 opacity-70 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-white">{error}</p>
              </div>
            </div>
          </div>
        )}

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">
              Fill in your details to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form 
              onSubmit={handleEmailSignup} 
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* First Name Input - Direct implementation */}
                <div className="space-y-1">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={registerData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="John"
                      required
                      disabled={loading}
                      autoComplete="given-name"
                      aria-required={true}
                      className={`${errors.firstName && touched.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
                                validationStates.firstName?.isValid && touched.firstName ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : 
                                'border-gray-300'} transition-colors`}
                    />
                    {validationStates.firstName?.isValid && touched.firstName && registerData.firstName && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                    {errors.firstName && touched.firstName && !validationStates.firstName?.isValid && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {touched.firstName && registerData.firstName && validationStates.firstName?.message && (
                    <div className={`flex items-center mt-1 ${validationStates.firstName.isValid ? 'text-green-600' : 'text-red-500'}`}>
                      {validationStates.firstName.isValid ? (
                        <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      )}
                      <span className="text-xs">{validationStates.firstName.message}</span>
                    </div>
                  )}
                </div>

                {/* Last Name Input - Direct implementation */}
                <div className="space-y-1">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={registerData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Doe"
                      required
                      disabled={loading}
                      autoComplete="family-name"
                      aria-required={true}
                      className={`${errors.lastName && touched.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
                                validationStates.lastName?.isValid && touched.lastName ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : 
                                'border-gray-300'} transition-colors`}
                    />
                    {validationStates.lastName?.isValid && touched.lastName && registerData.lastName && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                    {errors.lastName && touched.lastName && !validationStates.lastName?.isValid && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {touched.lastName && registerData.lastName && validationStates.lastName?.message && (
                    <div className={`flex items-center mt-1 ${validationStates.lastName.isValid ? 'text-green-600' : 'text-red-500'}`}>
                      {validationStates.lastName.isValid ? (
                        <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      )}
                      <span className="text-xs">{validationStates.lastName.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Input - Direct implementation */}
              <div className="space-y-1">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    autoComplete="email"
                    aria-required={true}
                    className={`${errors.email && touched.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
                              validationStates.email?.isValid && touched.email ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : 
                              'border-gray-300'} transition-colors`}
                  />
                  {validationStates.email?.isValid && touched.email && registerData.email && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                  {errors.email && touched.email && !validationStates.email?.isValid && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
                {touched.email && registerData.email && validationStates.email?.message && (
                  <div className={`flex items-center mt-1 ${validationStates.email.isValid ? 'text-green-600' : 'text-red-500'}`}>
                    {validationStates.email.isValid ? (
                      <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    )}
                    <span className="text-xs">{validationStates.email.message}</span>
                  </div>
                )}
              </div>

              {/* Phone Input - Direct implementation */}
              <div className="space-y-1">
                <Label htmlFor="phone">
                  Phone Number
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    disabled={loading}
                    autoComplete="tel"
                    className={`${errors.phone && touched.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
                              validationStates.phone?.isValid && touched.phone && registerData.phone ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : 
                              'border-gray-300'} transition-colors`}
                  />
                  {validationStates.phone?.isValid && touched.phone && registerData.phone && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                  {errors.phone && touched.phone && !validationStates.phone?.isValid && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
                {touched.phone && registerData.phone && validationStates.phone?.message && (
                  <div className={`flex items-center mt-1 ${validationStates.phone.isValid ? 'text-green-600' : 'text-red-500'}`}>
                    {validationStates.phone.isValid ? (
                      <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    )}
                    <span className="text-xs">{validationStates.phone.message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-userType">
                  Account Type <span className="text-red-500">*</span>
                </Label>
                <select
                title="handleinputchange"
                  id="register-userType"
                  name="userType"
                  value={registerData.userType}
                  onChange={(e) => handleInputChange("userType", e.target.value)}
                  disabled={loading}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value={UserRole.USER}>Individual User</option>
                  <option value={UserRole.INSTRUCTOR}>Instructor</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {registerData.userType === UserRole.INSTRUCTOR 
                    ? "Instructors can create and manage training courses"
                    : "Individual users can enroll in courses, submit projects, and book halls"}
                </p>
              </div>

              {/* Password Input - Direct implementation */}
              <div className="space-y-2 ">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative flex ">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={registerData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => !touched.password && setTouched(prev => ({ ...prev, password: true }))}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className={`${errors.password && touched.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
                              validationStates.password?.isValid && touched.password ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : 
                              'border-gray-300'} pr-10 transition-colors`}
                  />
                  <div className="pl-8 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute  right-0 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                  </div>
                </div>
                
                <PasswordStrengthMeter password={registerData.password} />
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center">
                    {registerData.password.length >= 8 ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className={`text-xs ${registerData.password.length >= 8 ? 'text-green-600' : 'text-red-500'}`}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center">
                    {VALIDATION_RULES.password.hasNumber.test(registerData.password) ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className={`text-xs ${VALIDATION_RULES.password.hasNumber.test(registerData.password) ? 'text-green-600' : 'text-red-500'}`}>
                      At least one number
                    </span>
                  </div>
                  <div className="flex items-center">
                    {VALIDATION_RULES.password.hasUppercase.test(registerData.password) ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className={`text-xs ${VALIDATION_RULES.password.hasUppercase.test(registerData.password) ? 'text-green-600' : 'text-red-500'}`}>
                      At least one uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center">
                    {VALIDATION_RULES.password.hasLowercase.test(registerData.password) ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className={`text-xs ${VALIDATION_RULES.password.hasLowercase.test(registerData.password) ? 'text-green-600' : 'text-red-500'}`}>
                      At least one lowercase letter
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm Password Input - Direct implementation */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative flex">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={registerData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={() => !touched.confirmPassword && setTouched(prev => ({ ...prev, confirmPassword: true }))}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className={`${errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
                              validationStates.confirmPassword?.isValid && touched.confirmPassword ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : 
                              'border-gray-300'} pr-10 transition-colors`}
                  />
                  <div className="pl-8 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                  </div>
                </div>
                
                <div className="mt-1">
                  {touched.confirmPassword && registerData.confirmPassword && (
                    <div className="flex items-center">
                      {registerData.confirmPassword === registerData.password ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-xs text-red-500">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  className={`w-full py-2.5 ${isFormValid ? 'bg-blue-500 hover: text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  disabled={loading || !isFormValid}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg 
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t pt-8 border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center pt-8 text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

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

                <div className="text-center text-sm pt-2">
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

        <div className="text-center mt-6 text-sm text-gray-500">
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
          <p className="text-sm text-gray-500">
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