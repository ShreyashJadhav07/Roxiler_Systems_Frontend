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

  // Signup function
  const signup = async (name, email, address, password) => {
    const res = await axiosInstance.post("/api/auth/signup", { name, email, address, password });
    return res.data;
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
