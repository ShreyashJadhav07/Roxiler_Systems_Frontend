import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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

  const validateForm = () => {
    if (form.name.length < 20 || form.name.length > 60) {
      toast.error("Full name must be between 20 and 60 characters.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
if (form.address.length < 10 || form.address.length > 400) {
    toast.error("Address must be between 10 and 400 characters.");
    return false;
  }


    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
    if (!passwordRegex.test(form.password)) {
      toast.error(
        "Password must be 8-16 characters, include at least 1 uppercase letter and 1 special character."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

   
    if (!validateForm()) return;

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

      const isSuccess =
        res &&
        (res.status === "success" ||
          res.success === true ||
          res.data?.success === true ||
          res.message?.includes("success") ||
          res.message?.includes("created") ||
          res.user ||
          res.data?.user ||
          (res.status >= 200 && res.status < 300));

      if (isSuccess) {
        toast.success("Account created successfully!");
        console.log("Frontend - Success detected, navigating to /");
        navigate("/");
      } else {
        console.log(
          "Frontend - Full response object:",
          JSON.stringify(res, null, 2)
        );
        toast.error(
          "Account created but unexpected response format. Please try logging in."
        );
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (err) {
      console.error("Frontend - Signup error:", err);
      console.error("Frontend - Error response data:", err.response?.data);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Signup failed";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (value) => {
    console.log("Frontend - Role selected:", value);
    setForm((prevForm) => {
      const newForm = { ...prevForm, role: value };
      console.log("Frontend - Updated form after role change:", newForm);
      return newForm;
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 pt-10">
      <div className="text-center mb-10 max-w-xl pt-5">
        <h1 className="text-4xl font-bold text-gray-800">
          Create Your Account
        </h1>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Sign Up</h2>
          <p className="text-gray-600 mt-1">
            Enter your information to create an account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name (20-60 characters)"
              required
            />
          </div>

         
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="m@example.com"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <Input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Your address (max 400 characters)"
              required
            />
          </div>

         
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password (8-16 chars, 1 uppercase, 1 special)"
              required
            />
          </div>

         
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role (Current: {form.role})
            </label>
            <Select
              value={form.role}
              onValueChange={handleRoleChange}
              className="cursor-pointer"
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user" className="cursor-pointer">
                  User
                </SelectItem>
                <SelectItem value="owner" className="cursor-pointer">
                  Owner
                </SelectItem>
                <SelectItem value="admin" className="cursor-pointer">
                  Admin
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 cursor-pointer"
          >
            {loading ? (
              <>
                Creating...{" "}
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
            onClick={() => navigate("/")}
            className="underline font-medium text-purple-600 hover:text-purple-700 cursor-pointer"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
