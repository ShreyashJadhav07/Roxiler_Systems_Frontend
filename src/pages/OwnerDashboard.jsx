import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Star, 
  Users,
  LogOut,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LucideLoader2,
  Lock,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState({
    store: null,
    avgRating: 0,
    ratings: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
 
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);


  const [ratingsFilters, setRatingsFilters] = useState({
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/owner/dashboard");
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

 
  const handleLogout = () => {
    logout();
    navigate("/");
  };

 
  const handlePasswordChange = async () => {
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(passwordForm.newPassword)) {
      toast.error("Password must be 8-16 characters with at least one uppercase letter and one special character");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await axiosInstance.put("/api/owner/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (response.data.success) {
        toast.success("Password changed successfully!");
        setShowPasswordModal(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  
  const getFilteredRatings = () => {
    let filtered = [...dashboardData.ratings];

   
    if (ratingsFilters.search) {
      const searchTerm = ratingsFilters.search.toLowerCase();
      filtered = filtered.filter(rating => 
        rating.userName.toLowerCase().includes(searchTerm) ||
        rating.userEmail.toLowerCase().includes(searchTerm)
      );
    }

    
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      if (ratingsFilters.sortBy === "rating") {
        aVal = a.rating;
        bVal = b.rating;
      } else if (ratingsFilters.sortBy === "createdAt") {
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
      } else {
        aVal = a[ratingsFilters.sortBy] || "";
        bVal = b[ratingsFilters.sortBy] || "";
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
      }

      if (ratingsFilters.sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  };

  
  const toggleSort = (field) => {
    setRatingsFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc"
    }));
  };

  const getSortIcon = (field) => {
    if (ratingsFilters.sortBy !== field) return <ArrowUpDown className="w-4 h-4" />;
    return ratingsFilters.sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LucideLoader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
            {dashboardData.store && (
              <p className="text-sm text-gray-500">Managing: {dashboardData.store.name}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowPasswordModal(true)} variant="outline" className="cursor-pointer">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button onClick={handleLogout} variant="outline" className="cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard" className="cursor-pointer">Dashboard</TabsTrigger>
            <TabsTrigger value="ratings" className="cursor-pointer">Customer Ratings</TabsTrigger>
          </TabsList>

        
          <TabsContent value="dashboard">
           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">
                      {dashboardData.avgRating > 0 ? dashboardData.avgRating : 'N/A'}
                    </div>
                    {dashboardData.avgRating > 0 && (
                      <div className="flex">
                        {getRatingStars(Math.round(dashboardData.avgRating))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on {dashboardData.ratings.length} reviews
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.ratings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Customer reviews received
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Store Status</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Active</div>
                  <p className="text-xs text-muted-foreground">
                    Store is operational
                  </p>
                </CardContent>
              </Card>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                  <CardDescription>Your store details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData.store && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Store Name</label>
                        <p className="text-sm font-semibold">{dashboardData.store.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm">{dashboardData.store.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-sm">{dashboardData.store.address}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rating Breakdown</CardTitle>
                  <CardDescription>Distribution of customer ratings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = dashboardData.ratings.filter(r => r.rating === star).length;
                    const percentage = dashboardData.ratings.length > 0 
                      ? (count / dashboardData.ratings.length * 100).toFixed(1) 
                      : 0;
                    
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm">{star}</span>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-12">{count}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        
          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle>Customer Ratings</CardTitle>
                <CardDescription>All ratings submitted for your store</CardDescription>
              </CardHeader>
              <CardContent>
                
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Search by customer name or email..."
                    value={ratingsFilters.search}
                    onChange={(e) => setRatingsFilters({...ratingsFilters, search: e.target.value})}
                    className="flex-1"
                  />
                </div>

               
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th 
                          className="border border-gray-300 p-3 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSort("userName")}
                        >
                          <div className="flex items-center gap-2">
                            Customer {getSortIcon("userName")}
                          </div>
                        </th>
                        <th 
                          className="border border-gray-300 p-3 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSort("userEmail")}
                        >
                          <div className="flex items-center gap-2">
                            Email {getSortIcon("userEmail")}
                          </div>
                        </th>
                        <th 
                          className="border border-gray-300 p-3 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSort("rating")}
                        >
                          <div className="flex items-center gap-2">
                            Rating {getSortIcon("rating")}
                          </div>
                        </th>
                        <th 
                          className="border border-gray-300 p-3 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSort("createdAt")}
                        >
                          <div className="flex items-center gap-2">
                            Date {getSortIcon("createdAt")}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredRatings().map((rating) => (
                        <tr key={rating.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3">{rating.userName}</td>
                          <td className="border border-gray-300 p-3">{rating.userEmail}</td>
                          <td className="border border-gray-300 p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {getRatingStars(rating.rating)}
                              </div>
                              <span className="text-sm font-medium">({rating.rating})</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {formatDate(rating.createdAt)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredRatings().length === 0 && (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No ratings found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

     
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                required
              />
              <Input
                type="password"
                placeholder="New Password (8-16 chars, 1 uppercase, 1 special)"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
                minLength={8}
                maxLength={16}
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
              />
              
              <div className="flex gap-2">
                <Button type="button" onClick={handlePasswordChange} disabled={changingPassword} className="flex-1">
                  {changingPassword ? (
                    <>
                      <LucideLoader2 className="animate-spin w-4 h-4 mr-2" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    });
                  }}
                  disabled={changingPassword}
                >
                  Cancel
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              Password must be 8-16 characters with at least one uppercase letter and one special character (!@#$%^&*)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;