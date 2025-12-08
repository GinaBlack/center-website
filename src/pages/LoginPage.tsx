import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface LoginPageProps {
  setIsLoggedIn: (value: boolean) => void;
}

export function LoginPage({ setIsLoggedIn }: LoginPageProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "student",
  });

  const [loginErrors, setLoginErrors] = useState({ email: "", password: "" });
  const [registerErrors, setRegisterErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const validateLogin = (field: string, value: string) => {
    const errors = { ...loginErrors };
    if (field === "email") errors.email = isValidEmail(value) ? "" : "Invalid email address";
    if (field === "password") errors.password = value.length >= 8 ? "" : "Password must be at least 8 characters";
    setLoginErrors(errors);
  };

  const validateRegister = (field: string, value: string) => {
    const errors = { ...registerErrors };
    if (field === "name") errors.name = value.length >= 3 ? "" : "Name must be at least 3 characters";
    if (field === "email") errors.email = isValidEmail(value) ? "" : "Invalid email address";
    if (field === "password") {
      errors.password = value.length >= 8 ? "" : "Password must be at least 8 characters";
      if (registerData.confirmPassword && value !== registerData.confirmPassword)
        errors.confirmPassword = "Passwords do not match";
      else errors.confirmPassword = "";
    }
    if (field === "confirmPassword") {
      errors.confirmPassword = value === registerData.password ? "" : "Passwords do not match";
    }
    setRegisterErrors(errors);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    validateLogin("email", loginData.email);
    validateLogin("password", loginData.password);

    if (loginErrors.email || loginErrors.password) return;

    if (loginData.password === "admin1001") {
      toast.success("Admin login successful!");
      setIsLoggedIn(true);
      window.location.hash = "AdminDash";
    } else {
      toast.success("Login successful!");
      setIsLoggedIn(true);
      window.location.hash = "dashboard";
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    validateRegister("name", registerData.name);
    validateRegister("email", registerData.email);
    validateRegister("password", registerData.password);
    validateRegister("confirmPassword", registerData.confirmPassword);

    if (
      registerErrors.name ||
      registerErrors.email ||
      registerErrors.password ||
      registerErrors.confirmPassword
    ) return;

    if (registerData.password === "admin1001") {
      setRegisterErrors((prev) => ({ ...prev, password: "Admin accounts cannot be created through registration" }));
      return;
    }

    toast.success("Account created successfully!");
    setIsLoggedIn(true);
    window.location.hash = "dashboard";
  };

  return (
    <div className="login-container">
      <div className="blur-overlay"></div>
      <div className="login-content">
        <div className="login-header">
          <h1 className="login-title">Welcome to 3D Printing High-Tech Center</h1>
          <p className="login-subtitle">Sign in to manage your projects</p>
        </div>

        <Tabs defaultValue="login" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => {
                        setLoginData({ ...loginData, email: e.target.value });
                        validateLogin("email", e.target.value);
                      }}
                      placeholder="you@example.com"
                      required
                    />
                    {loginErrors.email && <p className="text-red-500 text-xs">{loginErrors.email}</p>}
                  </div>

                  {/* Login Password */}
                  <div className="flex items-start w-full gap-2">
                    <div className="flex-1 flex flex-col space-y-1">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => {
                          setLoginData({ ...loginData, password: e.target.value });
                          validateLogin("password", e.target.value);
                        }}
                        placeholder="••••••••"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Use "admin1001" for admin access</p>
                      {loginErrors.password && <p className="text-red-500 text-xs">{loginErrors.password}</p>}
                    </div>
                    <span
                      className="text-gray-400 hover:text-gray-600 cursor-pointer mt-6"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </span>
                  </div>

                  <Button type="submit" variant="black" className="w-full">
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REGISTER */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Sign up to start submitting projects</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      value={registerData.name}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, name: e.target.value });
                        validateRegister("name", e.target.value);
                      }}
                      placeholder="John Doe"
                      required
                    />
                    {registerErrors.name && <p className="text-red-500 text-xs">{registerErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, email: e.target.value });
                        validateRegister("email", e.target.value);
                      }}
                      placeholder="you@example.com"
                      required
                    />
                    {registerErrors.email && <p className="text-red-500 text-xs">{registerErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userType">Account Type</Label>
                    <select
                      id="userType"
                      value={registerData.userType}
                      onChange={(e) => setRegisterData({ ...registerData, userType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="student">Student</option>
                      <option value="individual">Individual</option>
                      <option value="business">Business</option>
                      <option value="academic">Academic Institution</option>
                    </select>
                  </div>

                  {/* Register Password */}
                  <div className="flex items-start w-full gap-2">
                    <div className="flex-1 flex flex-col space-y-1">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, password: e.target.value });
                          validateRegister("password", e.target.value);
                        }}
                        placeholder="••••••••"
                        required
                      />
                      {registerErrors.password && (
                        <p className="text-red-500 text-xs">{registerErrors.password}</p>
                      )}
                    </div>
                    <span
                      className="text-gray-400 hover:text-gray-600 cursor-pointer mt-6"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    >
                      {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </span>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex items-start w-full gap-2">
                    <div className="flex-1 flex flex-col space-y-1">
                      <Label htmlFor="register-confirm">Confirm Password</Label>
                      <Input
                        id="register-confirm"
                        type={showRegisterConfirmPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, confirmPassword: e.target.value });
                          validateRegister("confirmPassword", e.target.value);
                        }}
                        placeholder="••••••••"
                        required
                      />
                      {registerErrors.confirmPassword && (
                        <p className="text-red-500 text-xs">{registerErrors.confirmPassword}</p>
                      )}
                    </div>
                    <span
                      className="text-gray-400 hover:text-gray-600 cursor-pointer mt-6"
                      onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                    >
                      {showRegisterConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </span>
                  </div>

                  <Button type="submit" variant="black" className="w-full">
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
