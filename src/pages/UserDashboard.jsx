import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Star, 
  Search, 
  LogOut,
  MapPin,
  Edit3,
  Plus,
  LucideLoader2,
  User,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stores");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [isEditingRating, setIsEditingRating] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Fetch stores and user ratings
  useEffect(() => {
    fetchStoresAndRatings();
  }, []);

  const fetchStoresAndRatings = async () => {
    try {
      setLoading(true);
      const [storesRes, ratingsRes] = await Promise.all([
        axiosInstance.get("/api/user/stores"),
        axiosInstance.get("/api/user/my-ratings")
      ]);

      setStores(storesRes.data.data || storesRes.data.stores || []);
      
      // Convert ratings array to object for easier lookup
      const ratingsData = ratingsRes.data.data || ratingsRes.data.ratings || [];
      const ratingsMap = {};
      ratingsData.forEach(rating => {
        ratingsMap[rating.storeId] = rating.rating;
      });
      setUserRatings(ratingsMap);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load stores data");
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Filter stores based on search
  const getFilteredStores = () => {
    if (!searchTerm) return stores;
    
    const searchLower = searchTerm.toLowerCase();
    return stores.filter(store => 
      store.name.toLowerCase().includes(searchLower) ||
      store.address.toLowerCase().includes(searchLower)
    );
  };

  // Open rating modal
  const openRatingModal = (store) => {
    setSelectedStore(store);
    const existingRating = userRatings[store._id || store.id];
    setRatingValue(existingRating || 0);
    setIsEditingRating(!!existingRating);
    setShowRatingModal(true);
  };

  // Submit or update rating
  const handleSubmitRating = async () => {
    if (!selectedStore || ratingValue === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmittingRating(true);
    try {
      const endpoint = isEditingRating 
        ? `/api/user/ratings/${selectedStore._id || selectedStore.id}`
        : "/api/user/ratings";
      
      const method = isEditingRating ? "put" : "post";
      
      await axiosInstance[method](endpoint, {
        storeId: selectedStore._id || selectedStore.id,
        rating: ratingValue
      });

      toast.success(isEditingRating ? "Rating updated successfully!" : "Rating submitted successfully!");
      
      // Update local state
      setUserRatings(prev => ({
        ...prev,
        [selectedStore._id || selectedStore.id]: ratingValue
      }));

      // Refresh stores to get updated average ratings
      fetchStoresAndRatings();
      
      setShowRatingModal(false);
      setSelectedStore(null);
      setRatingValue(0);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setChangingPassword(true);
    try {
      await axiosInstance.put("/api/user/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // Render star rating
  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onStarClick && onStarClick(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LucideLoader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowPasswordModal(true)} variant="outline">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="stores">Stores</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Stores Tab */}
          <TabsContent value="stores">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Available Stores</CardTitle>
                    <CardDescription>Browse and rate stores in your area</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search stores by name or address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Stores Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredStores().map((store) => {
                    const userRating = userRatings[store._id || store.id];
                    return (
                      <Card key={store._id || store.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{store.name}</CardTitle>
                              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                <MapPin className="w-4 h-4" />
                                {store.address}
                              </div>
                            </div>
                            <Store className="w-6 h-6 text-gray-400" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Overall Rating */}
                            <div>
                              <p className="text-sm font-medium mb-2">Overall Rating</p>
                              <div className="flex items-center gap-2">
                                {renderStars(store.averageRating || 0)}
                                <span className="text-sm text-gray-600">
                                  {store.averageRating ? store.averageRating.toFixed(1) : "No ratings"}
                                </span>
                              </div>
                            </div>

                            {/* User's Rating */}
                            {userRating && (
                              <div>
                                <p className="text-sm font-medium mb-2">Your Rating</p>
                                <div className="flex items-center gap-2">
                                  {renderStars(userRating)}
                                  <Badge variant="secondary">{userRating}/5</Badge>
                                </div>
                              </div>
                            )}

                            {/* Rating Action */}
                            <Button 
                              onClick={() => openRatingModal(store)}
                              variant={userRating ? "outline" : "default"}
                              size="sm"
                              className="w-full"
                            >
                              {userRating ? (
                                <>
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Update Rating
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Rate Store
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {getFilteredStores().length === 0 && (
                  <div className="text-center py-12">
                    <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? "Try adjusting your search terms." : "No stores are currently available."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <p className="text-gray-900">{user?.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <Badge variant="default">{user?.role}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                  <CardDescription>Manage your account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setShowPasswordModal(true)} className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      Total Ratings Submitted: {Object.keys(userRatings).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {isEditingRating ? "Update Rating" : "Rate Store"}
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedStore.name}</h4>
                <p className="text-sm text-gray-600">{selectedStore.address}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Your Rating
                </label>
                {renderStars(ratingValue, true, setRatingValue)}
                <p className="text-xs text-gray-500 mt-1">
                  Click on stars to rate (1-5)
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitRating} 
                  disabled={submittingRating || ratingValue === 0}
                  className="flex-1"
                >
                  {submittingRating ? (
                    <>
                      <LucideLoader2 className="animate-spin w-4 h-4 mr-2" />
                      {isEditingRating ? "Updating..." : "Submitting..."}
                    </>
                  ) : (
                    isEditingRating ? "Update Rating" : "Submit Rating"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowRatingModal(false);
                    setSelectedStore(null);
                    setRatingValue(0);
                  }}
                  disabled={submittingRating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                required
              />
              <Input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
              />
              
              <div className="flex gap-2">
                <Button type="submit" disabled={changingPassword} className="flex-1">
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;