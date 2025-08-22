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
  
 
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [isEditingRating, setIsEditingRating] = useState(false);

 
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const { logout, user } = useAuth();
  const navigate = useNavigate();


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


  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");

  };


  const getFilteredStores = () => {
    if (!searchTerm) return stores;
    
    const searchLower = searchTerm.toLowerCase();
    return stores.filter(store => 
      store.name.toLowerCase().includes(searchLower) ||
      store.address.toLowerCase().includes(searchLower)
    );
  };

  const openRatingModal = (store) => {
    setSelectedStore(store);
    const existingRating = userRatings[store._id || store.id];
    setRatingValue(existingRating || 0);
    setIsEditingRating(!!existingRating);
    setShowRatingModal(true);
  };

 
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
      
     
      setUserRatings(prev => ({
        ...prev,
        [selectedStore._id || selectedStore.id]: ratingValue
      }));

    
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
            <Button onClick={() => setShowPasswordModal(true)} variant="outline" className="cursor-pointer">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button onClick={handleLogout} variant="outline" className="cursor-pointer">
              <LogOut className="w-4 h-4 mr-2 " />
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 cursor-pointer">
            <TabsTrigger value="stores" className=" cursor-pointer">Stores</TabsTrigger>
            <TabsTrigger value="profile" className=" cursor-pointer">Profile</TabsTrigger>
          </TabsList>

        
 <TabsContent value="stores">
  <Card className="rounded-3xl shadow-lg border border-gray-100">
    <CardHeader className="pb-4">
      <div className="flex justify-between items-center">
        <div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Available Stores
          </CardTitle>
          <CardDescription className="text-gray-600">
            Browse and rate stores in your area
          </CardDescription>
        </div>
      </div>
    </CardHeader>

    <CardContent>
      {/* Search Bar */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search stores by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {getFilteredStores().map((store) => {
          const userRating = userRatings[store._id || store.id];
          return (
            <Card
              key={store._id || store.id}
              className="flex flex-col h-full rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-1">
                      {store.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="line-clamp-1">{store.address}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col justify-between flex-grow space-y-5">
                {/* Overall Rating */}
                <div>
                  <p className="text-sm font-medium mb-2 text-gray-700">
                    Overall Rating
                  </p>
                  <div className="flex items-center gap-2">
                    {renderStars(store.averageRating || 0)}
                    <span className="text-sm text-gray-600">
                      {store.averageRating
                        ? store.averageRating.toFixed(1)
                        : "No ratings"}
                    </span>
                  </div>
                </div>

                {/* User Rating */}
                {userRating && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-gray-700">
                      Your Rating
                    </p>
                    <div className="flex items-center gap-2">
                      {renderStars(userRating)}
                      <Badge
                        variant="secondary"
                        className="rounded-full px-3 py-0.5"
                      >
                        {userRating}/5
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => openRatingModal(store)}
                  variant={userRating ? "outline" : "default"}
                  size="sm"
                  className="w-full mt-auto rounded-xl font-medium transition-all duration-200 hover:scale-[1.02]"
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {getFilteredStores().length === 0 && (
        <div className="text-center py-16">
          <Store className="w-14 h-14 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No stores found
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Try adjusting your search terms."
              : "No stores are currently available."}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>



         
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
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <Badge variant="default" className="ml-5">{user?.role}</Badge>
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

   
      {showPasswordModal && (
        <div className="fixed inset-0 bg-white bg-opacity-40 flex items-center justify-center z-50">
           <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8">
                   <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Change Password</h2>
      <p className="text-gray-600 mt-1">Enter your details to update your password</p>
    </div>

    <form onSubmit={handleChangePassword} className="space-y-4">
      <Input
        type="password"
        placeholder="Current Password"
        value={passwordForm.currentPassword}
        onChange={(e) =>
          setPasswordForm({
            ...passwordForm,
            currentPassword: e.target.value,
          })
        }
        required
      />
      <Input
        type="password"
        placeholder="New Password"
        value={passwordForm.newPassword}
        onChange={(e) =>
          setPasswordForm({
            ...passwordForm,
            newPassword: e.target.value,
          })
        }
        required
      />
      <Input
        type="password"
        placeholder="Confirm New Password"
        value={passwordForm.confirmPassword}
        onChange={(e) =>
          setPasswordForm({
            ...passwordForm,
            confirmPassword: e.target.value,
          })
        }
        required
      />

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={changingPassword}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 cursor-pointer"
        >
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
          className="cursor-pointer"
          onClick={() => {
            setShowPasswordModal(false);
            setPasswordForm({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
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