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
      const res = await login(email, password);

      if (res && (res.status === "success" || res.success || res.user)) {
        toast.success("Logged in successfully!");
        const role = res.user?.role || res.data?.user?.role;

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
        toast.error("Login failed - unexpected response format");
        console.log("Unexpected login response:", res);
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-10 transition-all duration-300 hover:shadow-3xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-lg text-gray-500 mt-2">
            Sign in to access your account
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-gray-800 mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="mt-1 text-lg text-gray-900 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all h-12"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-base font-semibold text-gray-800 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="mt-1 text-lg text-gray-900 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all h-12"
              required
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-700 to-pink-600 text-white text-lg font-bold py-3 rounded-lg hover:from-purple-800 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                Signing in...
                <LucideLoader2 className="animate-spin ml-3 w-5 h-5" />
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-8 flex justify-center text-base text-gray-600">
          
          <div>
            Need an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="font-medium text-purple-600 hover:text-purple-700 underline transition-colors cursor-pointer"
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