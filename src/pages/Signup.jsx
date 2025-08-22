import React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { LucideLoader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "user", 
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
      console.log("Frontend - Form data being sent:", form);
      
      const res = await signup(
        form.name,
        form.email,
        form.address,
        form.password,
        form.role
      );

    

     
      const isSuccess = res && (
        res.status === "success" || 
        res.success === true || 
        res.data?.success === true ||
        res.message?.includes("success") ||
        res.message?.includes("created") ||
        res.user || // If user object is returned, it's likely successful
        res.data?.user ||
        (res.status >= 200 && res.status < 300) // HTTP success status
      );

      if (isSuccess) {
        toast.success("Account created successfully!");
        
        console.log("Frontend - Success detected, navigating to /");
        
        // Navigate immediately since toast is already showing
        navigate("/");
      } else {
        console.log("Frontend - Success not detected");
        console.log("Frontend - Full response object:", JSON.stringify(res, null, 2));
        toast.error("Account created but unexpected response format. Please try logging in.");
        
        // Still navigate in case it actually worked
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (err) {
      console.error("Frontend - Signup error:", err);
      console.error("Frontend - Error response data:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Signup failed";
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle role selection with debug logging
  const handleRoleChange = (value) => {
    console.log("Frontend - Role selected:", value);
    setForm(prevForm => {
      const newForm = { ...prevForm, role: value };
      console.log("Frontend - Updated form after role change:", newForm);
      return newForm;
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 pt-10">
      <div className="text-center mb-10 max-w-xl pt-5">
        <h1 className="text-4xl font-bold text-gray-800">Create Your Account</h1>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Sign Up</h2>
          <p className="text-gray-600 mt-1">Enter your information to create an account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <Input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="Full Name" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              placeholder="m@example.com" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <Input 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              placeholder="Your address" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input 
              name="password" 
              type="password" 
              value={form.password} 
              onChange={handleChange} 
              placeholder="Password" 
              required 
            />
          </div>

          {/* Role Dropdown with better debugging */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role (Current: {form.role})
            </label>
            <Select
              value={form.role}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Debug: Selected role is "{form.role}"
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500"
          >
            {loading ? (
              <>
                Creating... <LucideLoader2 className="animate-spin ml-2 w-4 h-4" />
              </>
            ) : (
              "Create an account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button 
            onClick={() => navigate("/")} 
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