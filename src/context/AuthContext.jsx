import { createContext, useState, useContext } from "react";
import axiosInstance from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Login function
  const login = async (email, password) => {
    const res = await axiosInstance.post("/api/auth/login", { email, password });
    setUser(res.data.user);
    return res.data;
  };

  // Signup function with better debugging
  const signup = async (name, email, address, password, role) => {
    console.log("AuthContext - Signup called with:", { 
      name, 
      email, 
      address, 
      password: "***hidden***", 
      role 
    });

    try {
      const requestData = { name, email, address, password, role };
      console.log("AuthContext - Request data:", requestData);
      
      const res = await axiosInstance.post("/api/auth/signup", requestData);
      
      console.log("AuthContext - Response:", res);
      console.log("AuthContext - Response data:", res.data);
      
      return res.data;
    } catch (error) {
      console.error("AuthContext - Signup error:", error);
      console.error("AuthContext - Error response:", error.response?.data);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    await axiosInstance.post("/api/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using context
export const useAuth = () => useContext(AuthContext);