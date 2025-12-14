import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, currentUser, userData } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect based on role
  useEffect(() => {
    if (currentUser && userData) {
      switch (userData.role) {
        case 'admin':
          navigate("/admin/dashboard");
          break;
        case 'instructor':
          navigate("/instructor/dashboard");
          break;
        default:
          navigate("/dashboard");
          break;
      }
    }
  }, [currentUser, userData, navigate]);

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const [loginErrors, setLoginErrors] = useState({ email: "", password: "" });
  const validateLogin = (field: string, value: string) => {
    const errors = { ...loginErrors };
    if (field === "email") errors.email = isValidEmail(value) ? "" : "Invalid email address";
    if (field === "password") errors.password = value.length >= 8 ? "" : "Password must be at least 8 characters";
    setLoginErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    // If using AuthContext with proper login function
    if (login) {
      const result = await login(email, password);

    if (login) {
        try {
            const result = await login(email, password);
            // Login successful - you can access result.user
            setLoading(false);
            // Redirect or do something after successful login
        } catch (error: any) {
            setError(error.message || "Login failed");
            toast.error(error.message || "Login failed");
            setLoading(false);
            return;
        }
    }

      // Login successful - Redirect handled by AuthContext usually, but forcing here just in case
      if (userData) {
        switch (userData.role) {
          case 'admin':
            navigate("/admin/dashboard");
            break;
          case 'instructor':
            navigate("/instructor/dashboard");
            break;
          default:
            navigate("/dashboard");
            break;
        }
      } else {
        // Fallback to dashboard if userData not available immediately (might need another effect or wait)
        navigate("/dashboard");
      }

      toast.success("Login successful!");
    } else {
      // Fallback to mock login if AuthContext not available
      await handleMockLogin();
    }

    setLoading(false);
  };

  // Mock login function as fallback
  const handleMockLogin = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Your authentication logic here
    if (email === "admin@example.com" && password === "admin1001") {
      navigate("/admin/dashboard");
      toast.success("Admin login successful!");
    } else if (email && password.length >= 8) {
      navigate("/dashboard");
      toast.success("Login successful!");
    } else {
      setError("Invalid credentials. Please try again.");
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay">
        <div className="login-content">
          <div className="login-header">
          <h1 className="login-title">
            Welcome to 3D Printing High-Tech Center
          </h1>
          <p className="login-subtitle">Sign in to manage your projects</p>
        </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => 
                    setEmail(e.target.value)
                }
                    
                  
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
                {loginErrors.email && <p className="text-red-500 text-xs">{loginErrors.email}</p>}

              </div>

              <div className="flex items-start w-full gap-2">
              <div className="flex-1 flex flex-col space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                <p className="text-xs text-gray-500">
                  Use "admin@example.com" with password "admin1001" for admin access
                </p>
                  {loginErrors.password && <p className="text-red-500 text-xs">{loginErrors.password}</p>}

                  </div>
                </div>
                  <div
                    className="text-gray-400 hover:text-gray-600 cursor-pointer mt-6"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    placeholder="check"
                  />
                  <Label htmlFor="remember-me" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-black"
                  onClick={() => navigate("/auth/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                variant="black"
                className="w-full "
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center text-sm pt-4 border-t border-gray-200">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="font-medium text-blue-600 hover:text-blue-500"
                    onClick={() => navigate("/auth/register")}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-200">
          <p>
            By continuing, you agree to our{" "}
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-500"
              onClick={() => window.location.hash = "terms"}
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-500"
              onClick={() => window.location.hash = "privacy"}
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;