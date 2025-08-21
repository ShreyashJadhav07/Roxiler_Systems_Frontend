import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/AdminDashboard'
import OwnerDashboard from './pages/OwnerDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />}/>
        <Route path="/signup" element={<Signup />}/>
        <Route path="/admin/dashboard" element={<AdminDashboard />}/>
        <Route path="/owner/dashboard" element={<OwnerDashboard />}/>
        <Route path="*" element={<h2>Page Not Found</h2>}/>
      </Routes>
    </Router>
  

    
  )

  
}

export default App
