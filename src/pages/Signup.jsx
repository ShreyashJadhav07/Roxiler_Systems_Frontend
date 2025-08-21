import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LucideLoader2 } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Attempting signup..."); // Debug log
      const res = await signup(form.name, form.email, form.address, form.password);
      console.log("Signup response:", res); // Debug log

      // Check for different possible success indicators
      if (res?.status === "success" || res?.data?.status === "success" || res?.success || (res && !res.error)) {
        toast.success("Account created successfully!");
        
        // Add a small delay before navigation to ensure toast is visible
        setTimeout(() => {
          navigate("/login"); // Navigate to login page instead of "/"
        }, 1500);
      } else {
        // Handle cases where signup might succeed but doesn't return expected format
        toast.error(res?.message || res?.data?.message || "Signup failed - unexpected response format");
      }
    } catch (err) {
      console.error("Signup error:", err); // Debug log
      const errorMessage = err.response?.data?.message || err.message || "Signup failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col items-center justify-center px-4 pt-10">
      <div className="text-center mb-10 max-w-xl pt-5">
        <h1 className="text-4xl font-bold text-gray-800">Create Your Account</h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Sign Up</h2>
          <p className="text-gray-600 mt-1">
            Enter your information to create an account
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <Input
              id="name"
              type="text"
              name="name"
              placeholder="Full Name (min 20 chars)"
              value={form.name}
              onChange={handleChange}
              className="mt-1 text-black"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              value={form.email}
              onChange={handleChange}
              className="mt-1 text-black"
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <Input
              id="address"
              type="text"
              name="address"
              placeholder="Your address"
              value={form.address}
              onChange={handleChange}
              className="mt-1 text-black"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Password (8-16 chars, 1 uppercase, 1 special)"
              value={form.password}
              onChange={handleChange}
              className="mt-1 text-black"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-2 rounded-full hover:opacity-90 transition cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <>
                Creating...
                <LucideLoader2 className="animate-spin ml-2 w-4 h-4" />
              </>
            ) : (
              "Create an account"
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button 
            onClick={() => navigate("/login")}
            className="underline font-medium text-purple-600 hover:text-purple-700"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;