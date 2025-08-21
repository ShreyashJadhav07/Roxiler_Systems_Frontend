import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LucideLoader2 } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (e) => {
    // Prevent default if this is called from a form submission
    if (e) e.preventDefault();

    try {
      if (!email || !password) {
        toast.error("Please fill in all fields");
        return;
      }

      if (!email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }

      setLoading(true);
      console.log("Attempting login with:", { email }); // Debug log (don't log password)
      
      const res = await login(email, password);
      console.log("Login response:", res); // Debug log

      // Check if login was successful
      if (res && (res.status === "success" || res.success || res.user)) {
        toast.success("Logged in successfully!");

        // Access user role more safely
        const role = res.user?.role || res.data?.user?.role;
        console.log("User role:", role); // Debug log

        // Navigate based on role with a small delay to show toast
        setTimeout(() => {
          if (role === "admin") {
            navigate("/admin/dashboard");
          } else if (role === "owner") {
            navigate("/owner/dashboard");
          } else {
            navigate("/user");
          }
        }, 1000);
      } else {
        // Handle unexpected response format
        toast.error("Login failed - unexpected response format");
        console.log("Unexpected login response:", res);
      }
    } catch (err) {
      console.error("Login error:", err); // Debug log
      const errorMessage = err.response?.data?.message || err.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Login</h2>
          <p className="text-gray-600 mt-1">
            Enter your credentials to continue.
          </p>
        </div>
        
        {/* Wrap inputs in a form for better accessibility and Enter key handling */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="mt-1 text-black"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="mt-1 text-black"
              required
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-2 rounded-full hover:opacity-90 transition cursor-pointer"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <>
                Signing in...
                <LucideLoader2 className="animate-spin ml-2 w-4 h-4" />
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
        
        <div className="mt-6 flex justify-between text-sm text-gray-600">
          <a href="#" className="hover:underline">Forgot Password?</a>
          <div>
            Need an account?{" "}
            <button 
              onClick={() => navigate("/signup")}
              className="underline font-medium text-purple-600 hover:text-purple-700"
              disabled={loading}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;