import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Store, 
  Star, 
  Plus, 
  Search, 
  Filter,
  LogOut,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LucideLoader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
 
  const [userFilters, setUserFilters] = useState({
    search: "",
    role: "all",
    sortBy: "name",
    sortOrder: "asc"
  });
  const [storeFilters, setStoreFilters] = useState({
    search: "",
    sortBy: "name",
    sortOrder: "asc"
  });

  
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user"
  });
  const [addStoreForm, setAddStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: ""
  });
  const [addingUser, setAddingUser] = useState(false);
  const [addingStore, setAddingStore] = useState(false);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, storesRes] = await Promise.all([
        axiosInstance.get("/api/admin/dashboard-stats"),
        axiosInstance.get("/api/admin/users"),
        axiosInstance.get("/api/admin/stores")
      ]);

      const statsData = statsRes.data.data || statsRes.data;
      const usersData = usersRes.data.data || usersRes.data;
      const storesData = storesRes.data.data || storesRes.data;

      setDashboardStats(statsData);
      setUsers(usersData);
      setStores(storesData);
      
      
      setOwners(usersData.filter(u => u.role === 'owner'));

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

 
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (addUserForm.name.length < 20 || addUserForm.name.length > 60) {
      toast.error("Name must be 20-60 characters long");
      return;
    }

    setAddingUser(true);

    try {
      const response = await axiosInstance.post("/api/admin/add-user", addUserForm);
      
      if (response.data.success) {
        toast.success("User added successfully!");
        setShowAddUserModal(false);
        setAddUserForm({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "user"
        });
        fetchDashboardData(); 
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(error.response?.data?.message || "Failed to add user");
    } finally {
      setAddingUser(false);
    }
  };

  
  const handleAddStore = async (e) => {
    e.preventDefault();
    
    if (!addStoreForm.ownerId) {
      toast.error("Please select an owner for the store");
      return;
    }

    setAddingStore(true);

    try {
      const response = await axiosInstance.post("/api/admin/add-store", addStoreForm);
      
      if (response.data.success) {
        toast.success("Store added successfully!");
        setShowAddStoreModal(false);
        setAddStoreForm({
          name: "",
          email: "",
          address: "",
          ownerId: ""
        });
        fetchDashboardData(); 
      }
    } catch (error) {
      console.error("Error adding store:", error);
      toast.error(error.response?.data?.message || "Failed to add store");
    } finally {
      setAddingStore(false);
    }
  };

  
  const getFilteredUsers = () => {
    let filtered = [...users];

  
    if (userFilters.search) {
      const searchTerm = userFilters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.address && user.address.toLowerCase().includes(searchTerm))
      );
    }

    
    if (userFilters.role !== "all") {
      filtered = filtered.filter(user => user.role === userFilters.role);
    }

    
    filtered.sort((a, b) => {
      let aVal = a[userFilters.sortBy] || "";
      let bVal = b[userFilters.sortBy] || "";
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (userFilters.sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  };

  
  const getFilteredStores = () => {
    let filtered = [...stores];

    
    if (storeFilters.search) {
      const searchTerm = storeFilters.search.toLowerCase();
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(searchTerm) ||
        store.email.toLowerCase().includes(searchTerm) ||
        store.address.toLowerCase().includes(searchTerm)
      );
    }

  
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      if (storeFilters.sortBy === "avgRating") {
        aVal = a.avgRating || 0;
        bVal = b.avgRating || 0;
      } else {
        aVal = a[storeFilters.sortBy] || "";
        bVal = b[storeFilters.sortBy] || "";
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
      }

      if (storeFilters.sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  };

  
  const toggleSort = (type, field) => {
    if (type === "users") {
      setUserFilters(prev => ({
        ...prev,
        sortBy: field,
        sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc"
      }));
    } else {
      setStoreFilters(prev => ({
        ...prev,
        sortBy: field,
        sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc"
      }));
    }
  };

  const getSortIcon = (type, field) => {
    const filters = type === "users" ? userFilters : storeFilters;
    if (filters.sortBy !== field) return <ArrowUpDown className="w-4 h-4" />;
    return filters.sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'owner':
        return 'secondary';
      default:
        return 'default';
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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="cursor-pointer">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard"  className="cursor-pointer">Dashboard</TabsTrigger>
            <TabsTrigger value="users"  className="cursor-pointer">Users</TabsTrigger>
            <TabsTrigger value="stores"  className="cursor-pointer">Stores</TabsTrigger>
          </TabsList>

        
          <TabsContent value="dashboard" className="cursor-pointer">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users on platform
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalStores}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered stores
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalRatings}</div>
                  <p className="text-xs text-muted-foreground">
                    Submitted ratings
                  </p>
                </CardContent>
              </Card>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Add new users and stores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setShowAddUserModal(true)} className="w-full cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New User
                  </Button>
                  <Button onClick={() => setShowAddStoreModal(true)} className="w-full cursor-pointer" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Store
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                  <CardDescription>Current system status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Admin Users:</span>
                    <span className="font-medium">{users.filter(u => u.role === 'admin').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Store Owners:</span>
                    <span className="font-medium">{users.filter(u => u.role === 'owner').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Regular Users:</span>
                    <span className="font-medium">{users.filter(u => u.role === 'user').length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Users Management</CardTitle>
                    <CardDescription>Manage all users in the system</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddUserModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by name, email, or address..."
                      value={userFilters.search}
                      onChange={(e) => setUserFilters({...userFilters, search: e.target.value})}
                      className="w-full"
                    />
                  </div>
                  <Select
                    value={userFilters.role}
                    onValueChange={(value) => setUserFilters({...userFilters, role: value})}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th 
                          className="border border-gray-300 p-3 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSort("users", "name")}
                        >
                          <div className="flex items-center gap-2">
                            Name {getSortIcon("users", "name")}
                          </div>
                        </th>
                        <th 
                          className="border border-gray-300 p-3 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSort("users", "email")}
                        >
                          <div className="flex items-center gap-2">
                            Email {getSortIcon("users", "email")}
                          </div>
                        </th>
                        <th 
                          className="border border-gray-300 p-3 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSort("users", "address")}
                        >
                          <div className="flex items-center gap-2">
                            Address {getSortIcon("users", "address")}
                          </div>
                        </th>
                        <th 
                          className="border border-gray-300 p-3 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSort("users", "role")}
                        >
                          <div className="flex items-center gap-2">
                            Role {getSortIcon("users", "role")}
                          </div>
                        </th>
                    
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredUsers().map((user) => (
                        <tr key={user._id || user.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3">{user.name}</td>
                          <td className="border border-gray-300 p-3">{user.email}</td>
                          <td className="border border-gray-300 p-3">{user.address || 'N/A'}</td>
                          <td className="border border-gray-300 p-3">
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {user.role}
                            </Badge>
                          </td>
                        
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredUsers().length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No users found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        
          <TabsContent value="stores">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Stores Management</CardTitle>
                    <CardDescription>Manage all stores in the system</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddStoreModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Store
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
              
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Search by name, email, or address..."
                    value={storeFilters.search}
                    onChange={(e) => setStoreFilters({...storeFilters, search: e.target.value})}
                    className="flex-1"
                  />
                </div>

                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th 
                          className="border border-gray-300 p-3 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSort("stores", "name")}
                        >
                          <div className="flex items-center gap-2">
                            Name {getSortIcon("stores", "name")}
                          </div>
                        </th>
                        <th 
                          className="border border-gray-300 p-3 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSort("stores", "email")}
                        >
                          <div className="flex items-center gap-2">
                            Email {getSortIcon("stores", "email")}
                          </div>
                        </th>
                        <th 
                          className="border border-gray-300 p-3 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSort("stores", "address")}
                        >
                          <div className="flex items-center gap-2">
                            Address {getSortIcon("stores", "address")}
                          </div>
                        </th>
                        <th 
                          className="border border-gray-300 p-3 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSort("stores", "avgRating")}
                        >
                          <div className="flex items-center gap-2">
                            Rating {getSortIcon("stores", "avgRating")}
                          </div>
                        </th>
                        <th className="border border-gray-300 p-3 text-left">Owner</th>

                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredStores().map((store) => (
                        <tr key={store._id || store.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3">{store.name}</td>
                          <td className="border border-gray-300 p-3">{store.email}</td>
                          <td className="border border-gray-300 p-3">{store.address}</td>
                          <td className="border border-gray-300 p-3">
                            {store.avgRating && store.avgRating > 0 ? (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                {store.avgRating.toFixed(1)}
                              </div>
                            ) : (
                              <span className="text-gray-400">No ratings</span>
                            )}
                          </td>
                          <td className="border border-gray-300 p-3">
                            <span className="text-sm text-gray-600">{store.ownerName || 'N/A'}</span>
                          </td>
                         
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredStores().length === 0 && (
                  <div className="text-center py-8">
                    <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No stores found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

  
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <Input
                placeholder="Full Name (20-60 characters)"
                value={addUserForm.name}
                onChange={(e) => setAddUserForm({...addUserForm, name: e.target.value})}
                required
                minLength={20}
                maxLength={60}
              />
              <Input
                type="email"
                placeholder="Email"
                value={addUserForm.email}
                onChange={(e) => setAddUserForm({...addUserForm, email: e.target.value})}
                required
              />
              <Input
                placeholder="Address (optional, max 400 characters)"
                value={addUserForm.address}
                onChange={(e) => setAddUserForm({...addUserForm, address: e.target.value})}
                maxLength={400}
              />
              <Input
                type="password"
                placeholder="Password (8-16 chars, 1 uppercase, 1 special)"
                value={addUserForm.password}
                onChange={(e) => setAddUserForm({...addUserForm, password: e.target.value})}
                required
                minLength={8}
                maxLength={16}
              />
              <Select
                value={addUserForm.role}
                onValueChange={(value) => setAddUserForm({...addUserForm, role: value})}
                
              >
                <SelectTrigger  className="cursor-pointer">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user"  className="cursor-pointer">User</SelectItem>
                  <SelectItem value="owner" className="cursor-pointer">Owner</SelectItem>
                  <SelectItem value="admin" className="cursor-pointer">Admin</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={addingUser} className="flex-1 cursor-pointer">
                  {addingUser ? (
                    <>
                      <LucideLoader2 className="animate-spin w-4 h-4 mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add User"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setAddUserForm({
                      name: "",
                      email: "",
                      password: "",
                      address: "",
                      role: "user"
                    });
                  }}
                  disabled={addingUser}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {showAddStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Store</h3>
            <form onSubmit={handleAddStore} className="space-y-4">
              <Input
                placeholder="Store Name (2-100 characters)"
                value={addStoreForm.name}
                onChange={(e) => setAddStoreForm({...addStoreForm, name: e.target.value})}
                required
                minLength={2}
                maxLength={100}
              />
              <Input
                type="email"
                placeholder="Store Email"
                value={addStoreForm.email}
                onChange={(e) => setAddStoreForm({...addStoreForm, email: e.target.value})}
                required
              />
              <Input
                placeholder="Store Address (max 400 characters)"
                value={addStoreForm.address}
                onChange={(e) => setAddStoreForm({...addStoreForm, address: e.target.value})}
                required
                maxLength={400}
              />
              <Select
                value={addStoreForm.ownerId}
                onValueChange={(value) => setAddStoreForm({...addStoreForm, ownerId: value})}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Select store owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.length > 0 ? (
                    owners.map(owner => (
                      <SelectItem key={owner._id || owner.id} value={owner._id || owner.id}>
                        {owner.name} ({owner.email})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No owners available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={addingStore || owners.length === 0} className="flex-1 cursor-pointer">
                  {addingStore ? (
                    <>
                      <LucideLoader2 className="animate-spin w-4 h-4 mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Store"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => {
                    setShowAddStoreModal(false);
                    setAddStoreForm({
                      name: "",
                      email: "",
                      address: "",
                      ownerId: ""
                    });
                  }}
                  disabled={addingStore}
                >
                  Cancel
                </Button>
              </div>
            </form>
            
            {owners.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                Note: You need to create users with "Owner" role first before adding stores.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;