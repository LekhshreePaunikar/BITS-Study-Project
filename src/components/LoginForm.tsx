// root/src/components/LoginForm.tsx

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

interface LoginFormProps {
  onSwitchToSignUp: () => void;
  onLoginSuccess: (username: string) => void;
  onAdminLoginSuccess?: (username: string) => void;
}

export default function LoginForm({
  onSwitchToSignUp,
  onLoginSuccess,
  onAdminLoginSuccess,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for admin credentials
    const isAdmin =
      formData.email.toLowerCase() === "admin@email.com" &&
      formData.password === "admin1234";

    console.log(
      "Login attempt:",
      { email: formData.email, isAdmin },
      "Remember me:",
      rememberMe,
    );

    // Simulate successful login
    if (formData.email && formData.password) {
      // Extract username from email for display purposes (before @ symbol)
      const username = isAdmin
        ? "admin"
        : formData.email.split("@")[0];

      // Handle remember me functionality
      if (rememberMe) {
        // Store user preferences in localStorage for future sessions
        localStorage.setItem(
          "rememberUser",
          JSON.stringify({
            username: username,
            email: formData.email,
            rememberMe: true,
            isAdmin: isAdmin,
          }),
        );
      }

      // Route to appropriate dashboard
      if (isAdmin && onAdminLoginSuccess) {
        console.log(
          "Calling onAdminLoginSuccess with username:",
          username,
        );
        onAdminLoginSuccess(username);
      } else {
        console.log(
          "Calling onLoginSuccess with username:",
          username,
        );
        onLoginSuccess(username);
      }
    }
  };

  return (
    <Card
      className="w-full max-w-md mx-auto border transition-all duration-200 hover:shadow-xl"
      style={{
        backgroundColor: "#1F2937",
        borderColor: "#374151",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
      }}
    >
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-white">
          Welcome Back
        </CardTitle>
        <CardDescription
          className="text-center"
          style={{ color: "#9CA3AF" }}
        >
          Enter your credentials to access your account
        </CardDescription>
        {/* <div className="mt-3 p-3 rounded-md" style={{ backgroundColor: "#374151" }}>
          <p className="text-xs text-center" style={{ color: "#9CA3AF" }}>
            💡 Admin login: <span style={{ color: "#60A5FA" }}>admin@email.com</span> / <span style={{ color: "#60A5FA" }}>admin1234</span>
          </p>
        </div> */}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="login-email"
              style={{ color: "#9CA3AF" }}
            >
              Email
            </Label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: "#6B7280" }}
              />
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  handleInputChange("email", e.target.value)
                }
                className="pl-10 transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                style={{
                  backgroundColor: "#374151",
                  borderColor: "#4B5563",
                  color: "#FFFFFF",
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="login-password"
              style={{ color: "#9CA3AF" }}
            >
              Password
            </Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: "#6B7280" }}
              />
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  handleInputChange("password", e.target.value)
                }
                className="pl-10 pr-10 transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                style={{
                  backgroundColor: "#374151",
                  borderColor: "#4B5563",
                  color: "#FFFFFF",
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                style={{ color: "#6B7280" }}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked: boolean) =>
                setRememberMe(checked === true)
              }
              style={{
                borderColor: "#4B5563",
              }}
            />
            <Label
              htmlFor="remember-me"
              className="text-sm cursor-pointer"
              style={{ color: "#9CA3AF" }}
            >
              Remember me
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full transition-all duration-200 hover:shadow-lg hover:scale-105 text-white"
            style={{ backgroundColor: "#3B82F6" }}
          >
            Sign In
          </Button>

          <div className="text-center space-y-2">
            <button
              type="button"
              className="text-sm transition-colors duration-200 underline"
              style={{
                color: "#9CA3AF",
              }}
            >
              Forgot your password?
            </button>
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-white hover:underline transition-colors duration-200"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}