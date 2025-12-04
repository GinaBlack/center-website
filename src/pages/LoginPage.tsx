import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";

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
    userType: "student"
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for admin password
    if (loginData.password === "admin1001") {
      toast.success("Admin login successful!");
      setIsLoggedIn(true);
      window.location.hash = "AdminDash";
    } else {
      // Regular user login
      toast.success("Login successful!");
      setIsLoggedIn(true);
      window.location.hash = "dashboard";
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    // Check if user is trying to register as admin
    if (registerData.password === "admin1001") {
      toast.error("Admin accounts cannot be created through registration.");
      return;
    }
    
    // Mock registration for regular users
    toast.success("Account created successfully!");
    setIsLoggedIn(true);
    window.location.hash = "dashboard";
  };

  return (
    <div className="login-container">
      {/* Blur overlay */}
      <div className="blur-overlay"></div>
      
      <div className="login-content">
        <div className="login-header">
          <div className="flex items-center justify-center gap-2 mb-4">
          </div>
          <h1 className="login-title">Welcome to 3D Printing High-Tech Center</h1>
          <p className="login-subtitle">Sign in to manage your projects</p>
        </div>

        <Tabs defaultValue="login" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use "admin1001" as password for admin access
                    </p>
                  </div>
                  <Button type="submit" variant="black" className="w-full">
                    Sign In
                  </Button>
                  <div className="text-center">
                    <button type="button" className="text-sm text-blue-500 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Sign up to start submitting projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userType">Account Type</Label>
                    <select
                      id="userType"
                      value={registerData.userType}
                      onChange={(e) => setRegisterData({ ...registerData, userType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      title="Select account type"
                    >
                      <option value="student">Student</option>
                      <option value="individual">Individual</option>
                      <option value="business">Business</option>
                      <option value="academic">Academic Institution</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirm Password</Label>
                    <Input
                      id="register-confirm"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
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