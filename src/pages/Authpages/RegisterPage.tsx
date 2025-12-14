import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        userType: "student",
    });

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

    const validateField = (field: string, value: string) => {
        const newErrors = { ...errors };

        if (field === "name") {
            newErrors.name = value.length >= 3 ? "" : "Name must be at least 3 characters";
        }

        if (field === "email") {
            newErrors.email = isValidEmail(value) ? "" : "Invalid email address";
        }

        if (field === "password") {
            newErrors.password = value.length >= 8 ? "" : "Password must be at least 8 characters";
            if (registerData.confirmPassword && value !== registerData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            } else {
                newErrors.confirmPassword = "";
            }
        }

        if (field === "confirmPassword") {
            newErrors.confirmPassword = value === registerData.password ? "" : "Passwords do not match";
        }

        setErrors(newErrors);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate all fields
        validateField("name", registerData.name);
        validateField("email", registerData.email);
        validateField("password", registerData.password);
        validateField("confirmPassword", registerData.confirmPassword);

        if (errors.name || errors.email || errors.password || errors.confirmPassword) {
            return;
        }

        if (!registerData.name || !registerData.email || !registerData.password) {
            setError("Please fill in all fields");
            return;
        }

        if (registerData.password === "admin1001") {
            setErrors((prev) => ({ ...prev, password: "Admin accounts cannot be created through registration" }));
            return;
        }

        setLoading(true);

        const userData = {
            displayName: registerData.name,
            role: registerData.userType
            // Add other mock fields if needed or leave for updateProfile
        };

        try {
        await register(registerData.email, registerData.password, userData);
        toast.success("Account created successfully!");
        } catch (error: any) {
        const errorMessage = error?.message || "Registration failed. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
        } finally {
        setLoading(false);
        }
    }
    return (
        <div className="login-container">
            <div className="login-overlay">
                <div className="login-content">
                    <div className="login-header">
                    <h1 className="login-title">
                        Create Your Account
                    </h1>
                    <p className="login-subtitle">Join 3D Printing High-Tech Center to start submitting projects</p>
                </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Sign Up</CardTitle>
                        <CardDescription>Fill in your details to create an account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={registerData.name}
                                    onChange={(e) => {
                                        setRegisterData({ ...registerData, name: e.target.value });
                                        validateField("name", e.target.value);
                                    }}
                                    placeholder="John Doe"
                                    required
                                    disabled={loading}
                                />
                                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={registerData.email}
                                    onChange={(e) => {
                                        setRegisterData({ ...registerData, email: e.target.value });
                                        validateField("email", e.target.value);
                                    }}
                                    placeholder="you@example.com"
                                    required
                                    disabled={loading}
                                />
                                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="userType">Account Type *</Label>
                                <select
                                    id="userType"
                                    value={registerData.userType}
                                    onChange={(e) => setRegisterData({ ...registerData, userType: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                    title="userType"
                                >
                                    <option value="individual">Individual</option>
                                    <option value="Instructor">Business</option>
                                </select>
                            </div>

                            <div className="flex items-start w-full gap-2">
                            <div className="flex-1 flex flex-col space-y-1">
                                <Label htmlFor="password">Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={registerData.password}
                                        onChange={(e) => {
                                            setRegisterData({ ...registerData, password: e.target.value });
                                            validateField("password", e.target.value);
                                        }}
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Password must be at least 8 characters long
                                </p>
                                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                            </div>
                                    <span
                                        className="text-gray-400 hover:text-gray-600 cursor-pointer mt-6"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </span>
                            </div>

                            <div className="flex items-start w-full gap-2">
                            <div className="flex-1 flex flex-col space-y-1">
                                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={registerData.confirmPassword}
                                        onChange={(e) => {
                                            setRegisterData({ ...registerData, confirmPassword: e.target.value });
                                            validateField("confirmPassword", e.target.value);
                                        }}
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
                                    )}
                                </div>
                                    <span

                                        className="text-gray-400 hover:text-gray-600 cursor-pointer mt-6"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </span>
                            </div>

                            <Button
                                type="submit"
                                variant="black"
                                className="w-full "
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>

                            <div className="text-center text-sm">
                                <span className="text-gray-600">Already have an account? </span>
                                <button
                                    type="button"
                                    className="text-blue-600 hover:text-blue-500 font-medium"
                                    onClick={() => navigate("/auth/login")}
                                >
                                    Sign in
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        By creating an account, you agree to our{" "}
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


export default RegisterPage;