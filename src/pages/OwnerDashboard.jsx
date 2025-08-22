import React, { useState, useEffect } from "react";
   import { Button } from "@/components/ui/button";
   import { Input } from "@/components/ui/input";
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
   import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
   import { Star, LogOut, Lock, LucideLoader2 } from "lucide-react";
   import { toast } from "sonner";
   import { useAuth } from "../context/AuthContext";
   import { useNavigate } from "react-router-dom";
   import axiosInstance from "../api/axios";

   function OwnerDashboard() {
     const [store, setStore] = useState({ id: "", name: "", address: "", email: "" });
     const [avgRating, setAvgRating] = useState(0);
     const [ratings, setRatings] = useState([]);
     const [loading, setLoading] = useState(true);
     const [showPasswordModal, setShowPasswordModal] = useState(false);
     const [passwordForm, setPasswordForm] = useState({
       currentPassword: "",
       newPassword: "",
       confirmPassword: "",
     });
     const [updatingPassword, setUpdatingPassword] = useState(false);

     const { logout, user, token } = useAuth();
     const navigate = useNavigate();

     useEffect(() => {
       if (token) {
         axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
       } else {
         console.warn("No token found, redirecting to login");
         navigate("/login");
       }
     }, [token, navigate]);

     useEffect(() => {
       fetchOwnerData();
     }, []);

     const fetchOwnerData = async () => {
       try {
         setLoading(true);
         console.log("Fetching data from /owner/dashboard");
         const response = await axiosInstance.get("/owner/dashboard");
         console.log("API Response:", response.data);
         if (!response.data.success) throw new Error(response.data.message || "Failed to fetch dashboard data");
         const { store, avgRating, ratings } = response.data.data;
         setStore(store || { id: "", name: "", address: "", email: "" });
         setAvgRating(avgRating || 0);
         setRatings(ratings || []);
       } catch (error) {
         console.error("Fetch error:", error.response?.status, error.response?.data?.message || error.message);
         if (error.response?.status === 401 || error.response?.status === 403) {
           toast.error("Session expired, please log in again");
           logout();
           navigate("/login");
         } else if (error.response?.status === 404) {
           toast.error("No store found for this owner");
         } else {
           toast.error(error.message || "Failed to load dashboard data");
         }
       } finally {
         setLoading(false);
       }
     };

     const handleLogout = async () => {
       try {
         await axiosInstance.post("/auth/logout");
         logout();
         navigate("/");
       } catch (error) {
         console.error("Logout error:", error);
         toast.error("Failed to logout");
         logout();
         navigate("/");
       }
     };

     const handleUpdatePassword = async (e) => {
       e.preventDefault();
       if (passwordForm.newPassword !== passwordForm.confirmPassword) {
         toast.error("New password and confirmation do not match");
         return;
       }
       const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
       if (!passwordRegex.test(passwordForm.newPassword)) {
         toast.error("Password must be 8-16 characters with at least one uppercase letter and one special character");
         return;
       }
       setUpdatingPassword(true);
       try {
         const response = await axiosInstance.put("/owner/change-password", {
           currentPassword: passwordForm.currentPassword,
           newPassword: passwordForm.newPassword,
         });
         if (response.data.success) {
           toast.success("Password updated successfully!");
           setShowPasswordModal(false);
           setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
         } else {
           throw new Error(response.data.message || "Failed to update password");
         }
       } catch (error) {
         console.error("Password update error:", error.response?.data?.message || error.message);
         toast.error(error.response?.data?.message || "Failed to update password");
       } finally {
         setUpdatingPassword(false);
       }
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
           <div className="flex justify-between items-center mb-8">
             <div>
               <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
               <p className="text-gray-600">Welcome back, {user?.name || "Owner"}</p>
             </div>
             <Button onClick={handleLogout} variant="outline">
               <LogOut className="w-4 h-4 mr-2" /> Logout
             </Button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Store Details</CardTitle>
                 <Store className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">{store.name || "No Store"}</div>
                 <p className="text-sm text-gray-600">{store.email || "N/A"}</p>
                 <p className="text-sm text-gray-600">{store.address || "N/A"}</p>
               </CardContent>
             </Card>
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                 <Star className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">
                   {avgRating > 0 ? `${avgRating} / 5` : "No ratings yet"}
                 </div>
                 <p className="text-xs text-muted-foreground">Based on {ratings.length} user ratings</p>
               </CardContent>
             </Card>
           </div>
           <Card className="mb-8">
             <CardHeader>
               <CardTitle>Quick Actions</CardTitle>
               <CardDescription>Manage your account</CardDescription>
             </CardHeader>
             <CardContent>
               <Button onClick={() => setShowPasswordModal(true)} className="w-full md:w-auto">
                 <Lock className="w-4 h-4 mr-2" /> Update Password
               </Button>
             </CardContent>
           </Card>
           <Card>
             <CardHeader>
               <CardTitle>User Ratings</CardTitle>
               <CardDescription>View ratings submitted for your store</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="overflow-x-auto">
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>User Name</TableHead>
                       <TableHead>User Email</TableHead>
                       <TableHead>Rating</TableHead>
                       <TableHead>Date</TableHead>
                       <TableHead>Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {ratings.length > 0 ? (
                       ratings.map((rating) => (
                         <TableRow key={rating.id}>
                           <TableCell>{rating.userName || "Anonymous"}</TableCell>
                           <TableCell>{rating.userEmail || "N/A"}</TableCell>
                           <TableCell>
                             <div className="flex items-center gap-1">
                               <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                               {rating.rating}
                             </div>
                           </TableCell>
                           <TableCell>
                             {new Date(rating.createdAt).toLocaleDateString()}
                           </TableCell>
                           <TableCell>
                             <Button size="sm" variant="outline">
                               <Eye className="w-4 h-4" />
                             </Button>
                           </TableCell>
                         </TableRow>
                       ))
                     ) : (
                       <TableRow>
                         <TableCell colSpan={5} className="text-center py-8">
                           <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                           <p className="text-gray-600">No ratings found</p>
                         </TableCell>
                       </TableRow>
                     )}
                   </TableBody>
                 </Table>
               </div>
             </CardContent>
           </Card>
           {showPasswordModal && (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-lg p-6 w-full max-w-md">
                 <h3 className="text-lg font-semibold mb-4">Update Password</h3>
                 <form onSubmit={handleUpdatePassword} className="space-y-4">
                   <Input
                     type="password"
                     placeholder="Current Password"
                     value={passwordForm.currentPassword}
                     onChange={(e) =>
                       setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                     }
                     required
                   />
                   <Input
                     type="password"
                     placeholder="New Password (8-16 chars, 1 uppercase, 1 special)"
                     value={passwordForm.newPassword}
                     onChange={(e) =>
                       setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                     }
                     required
                     minLength={8}
                     maxLength={16}
                   />
                   <Input
                     type="password"
                     placeholder="Confirm New Password"
                     value={passwordForm.confirmPassword}
                     onChange={(e) =>
                       setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                     }
                     required
                     minLength={8}
                     maxLength={16}
                   />
                   <div className="flex gap-2">
                     <Button type="submit" disabled={updatingPassword} className="flex-1">
                       {updatingPassword ? (
                         <>
                           <LucideLoader2 className="animate-spin w-4 h-4 mr-2" />
                           Updating...
                         </>
                       ) : (
                         "Update Password"
                       )}
                     </Button>
                     <Button
                       type="button"
                       variant="outline"
                       onClick={() => {
                         setShowPasswordModal(false);
                         setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                       }}
                       disabled={updatingPassword}
                     >
                       Cancel
                     </Button>
                   </div>
                 </form>
               </div>
             </div>
           )}
         </div>
       </div>
     );
   }

   export default OwnerDashboard;