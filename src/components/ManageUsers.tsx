// root/src/components/ManageUsers.tsx

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ArrowLeft,
  Search,
  User,
  Eye,
  Trash2,
  Users,
  Filter,
  Mail,
  Calendar,
  UserCheck,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface ManageUsersProps {
  username: string;
  onBackToAdminDashboard: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredOn: string;
  isAdmin?: boolean;
  lastLogin?: string;
  status?: "active" | "inactive";
  profileCompleted?: boolean;
}

export default function ManageUsers({
  username,
  onBackToAdminDashboard,
}: ManageUsersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] =
    useState<UserData | null>(null);
  const [showProfileModal, setShowProfileModal] =
    useState(false);

  // Mock users data
  const [users, setUsers] = useState<UserData[]>([
    {
      id: "USR_001",
      name: "John Doe",
      email: "john.doe@email.com",
      role: "Frontend Developer",
      registeredOn: "15 Jul 2025",
      lastLogin: "20 Jul 2025, 09:30 AM",
      status: "active",
      profileCompleted: true,
    },
    {
      id: "USR_002",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      role: "Data Analyst",
      registeredOn: "10 Jul 2025",
      lastLogin: "19 Jul 2025, 02:15 PM",
      status: "active",
      profileCompleted: true,
    },
    {
      id: "USR_003",
      name: "Mike Chen",
      email: "mike.chen@email.com",
      role: "Backend Developer",
      registeredOn: "08 Jul 2025",
      lastLogin: "18 Jul 2025, 11:45 AM",
      status: "active",
      profileCompleted: false,
    },
    {
      id: "USR_004",
      name: "Emma Watson",
      email: "emma.watson@email.com",
      role: "UI/UX Designer",
      registeredOn: "05 Jul 2025",
      lastLogin: "17 Jul 2025, 04:20 PM",
      status: "inactive",
      profileCompleted: true,
    },
    {
      id: "USR_005",
      name: "Alex Rivera",
      email: "alex.rivera@email.com",
      role: "Full Stack Developer",
      registeredOn: "03 Jul 2025",
      lastLogin: "20 Jul 2025, 07:00 AM",
      status: "active",
      profileCompleted: true,
    },
    {
      id: "USR_006",
      name: "David Kim",
      email: "david.kim@email.com",
      role: "Data Scientist",
      registeredOn: "01 Jul 2025",
      lastLogin: "16 Jul 2025, 03:30 PM",
      status: "active",
      profileCompleted: false,
    },
    {
      id: "USR_007",
      name: "Lisa Zhang",
      email: "lisa.zhang@email.com",
      role: "DevOps Engineer",
      registeredOn: "28 Jun 2025",
      lastLogin: "19 Jul 2025, 10:15 AM",
      status: "active",
      profileCompleted: true,
    },
    {
      id: "USR_008",
      name: "Tom Wilson",
      email: "tom.wilson@email.com",
      role: "Software Engineer",
      registeredOn: "25 Jun 2025",
      lastLogin: "15 Jul 2025, 01:45 PM",
      status: "inactive",
      profileCompleted: true,
      isAdmin: true,
    },
  ]);

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) =>
      prev.filter((user) => user.id !== userId),
    );

    toast.success("✅ User deleted successfully", {
      style: {
        background: "#10B981",
        color: "white",
        border: "none",
      },
    });
  };

  const handleViewProfile = (user: UserData) => {
    setSelectedUser(user);
    setShowProfileModal(true);

    toast.success("✅ User profile opened", {
      style: {
        background: "#10B981",
        color: "white",
        border: "none",
      },
    });
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge
        className="text-xs px-2 py-1 border-0 text-white"
        style={{ backgroundColor: "#10B981" }}
      >
        Active
      </Badge>
    ) : (
      <Badge
        className="text-xs px-2 py-1 border-0 text-white"
        style={{ backgroundColor: "#6B7280" }}
      >
        Inactive
      </Badge>
    );
  };

  const getRoleBadge = (role: string, isAdmin?: boolean) => {
    if (isAdmin) {
      return (
        <Badge
          className="text-xs px-2 py-1 border-0 flex items-center space-x-1 text-white"
          style={{ backgroundColor: "#F59E0B" }}
        >
          <Shield className="h-3 w-3" />
          <span>Admin</span>
        </Badge>
      );
    }

    const roleColors: { [key: string]: string } = {
      "Frontend Developer": "#3B82F6",
      "Backend Developer": "#10B981",
      "Full Stack Developer": "#8B5CF6",
      "Data Analyst": "#F59E0B",
      "Data Scientist": "#EF4444",
      "UI/UX Designer": "#EC4899",
      "DevOps Engineer": "#06B6D4",
      "Software Engineer": "#6366F1",
    };

    return (
      <Badge
        className="text-xs px-2 py-1 border-0 text-white"
        style={{
          backgroundColor: roleColors[role] || "#6B7280",
        }}
      >
        {role}
      </Badge>
    );
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.id
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.role
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const uniqueRoles = Array.from(
    new Set(users.map((user) => user.role)),
  );

  return (
    <TooltipProvider>
      <div
        className="min-h-screen"
        style={{ backgroundColor: "#111827" }}
      >
        {/* Header */}
        <header
          className="border-b"
          style={{
            backgroundColor: "#1F2937",
            borderColor: "#374151",
          }}
        >
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-center flex-1">
                <h1
                  className="mb-2 text-2xl"
                  style={{
                    fontFamily:
                      "Inter, SF Pro, Roboto, sans-serif",
                    color: "#FFFFFF",
                  }}
                >
                  Manage Users Page
                </h1>
              </div>

              <Button
                variant="outline"
                onClick={onBackToAdminDashboard}
                className="flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: "#6B7280",
                  color: "#9CA3AF",
                  backgroundColor: "transparent",
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Top Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                    style={{ color: "#6B7280" }}
                  />
                  <Input
                    placeholder="Search users by ID, name, email, or role..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-10 w-full sm:w-80 transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                    style={{
                      backgroundColor: "#374151",
                      borderColor: "#4B5563",
                      color: "#FFFFFF",
                    }}
                  />
                </div>

                <Select
                  value={roleFilter}
                  onValueChange={setRoleFilter}
                >
                  <SelectTrigger
                    className="w-full sm:w-48 text-white"
                    style={{
                      backgroundColor: "#374151",
                      borderColor: "#4B5563",
                      color: "#FFFFFF",
                    }}
                  >
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Roles
                    </SelectItem>
                    {uniqueRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger
                    className="w-full sm:w-40 text-white"
                    style={{
                      backgroundColor: "#374151",
                      borderColor: "#4B5563",
                      color: "#FFFFFF",
                    }}
                  >
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Status
                    </SelectItem>
                    <SelectItem value="active">
                      Active
                    </SelectItem>
                    <SelectItem value="inactive">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                className="flex items-center space-x-2 text-sm"
                style={{ color: "#9CA3AF" }}
              >
                <Users className="h-4 w-4" />
                <span>
                  Total Registered Users: {filteredUsers.length}
                </span>
              </div>
            </div>

            {/* Users Grid */}
            {filteredUsers.length === 0 ? (
              <Card
                className="border text-center py-16"
                style={{
                  backgroundColor: "#1F2937",
                  borderColor: "#374151",
                }}
              >
                <CardContent>
                  <User
                    className="h-16 w-16 mx-auto mb-4"
                    style={{ color: "#6B7280" }}
                  />
                  <h3 className="text-xl text-white mb-2">
                    No users found
                  </h3>
                  <p style={{ color: "#9CA3AF" }}>
                    {searchTerm ||
                    roleFilter !== "all" ||
                    statusFilter !== "all"
                      ? "No users match your current filters."
                      : "No users are registered yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="border transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                    style={{
                      backgroundColor: "#1F2937",
                      borderColor: "#374151",
                    }}
                  >
                    <CardContent className="p-6">
                      {/* User Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: "#374151",
                            }}
                          >
                            <User
                              className="h-5 w-5"
                              style={{ color: "#9CA3AF" }}
                            />
                          </div>
                          <div>
                            <p className="text-white text-sm">
                              {user.name}
                            </p>
                            <p
                              className="text-xs"
                              style={{
                                color: "#9CA3AF",
                                fontFamily: "monospace",
                              }}
                            >
                              {user.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {getStatusBadge(
                            user.status || "active",
                          )}
                          {user.isAdmin &&
                            getRoleBadge(user.role, true)}
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="space-y-3 mb-4">
                        {/* Left Section */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail
                              className="h-3 w-3"
                              style={{ color: "#9CA3AF" }}
                            />
                            <span style={{ color: "#9CA3AF" }}>
                              Email:
                            </span>
                            <span className="text-white">
                              {user.email}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar
                              className="h-3 w-3"
                              style={{ color: "#9CA3AF" }}
                            />
                            <span style={{ color: "#9CA3AF" }}>
                              Registered On:
                            </span>
                            <span className="text-white">
                              {user.registeredOn}
                            </span>
                          </div>

                          {user.lastLogin && (
                            <div className="flex items-center space-x-2 text-sm">
                              <UserCheck
                                className="h-3 w-3"
                                style={{ color: "#9CA3AF" }}
                              />
                              <span
                                style={{ color: "#9CA3AF" }}
                              >
                                Last Login:
                              </span>
                              <span className="text-white text-xs">
                                {user.lastLogin}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Right Section */}
                        <div
                          className="pt-2 border-t"
                          style={{ borderColor: "#374151" }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                style={{ color: "#9CA3AF" }}
                                className="text-sm"
                              >
                                Role:
                              </p>
                              <div className="mt-1">
                                {!user.isAdmin &&
                                  getRoleBadge(user.role)}
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                style={{ color: "#9CA3AF" }}
                                className="text-sm"
                              >
                                Profile:
                              </p>
                              <Badge
                                className="text-xs px-2 py-1 border-0 mt-1 text-white"
                                style={{
                                  backgroundColor:
                                    user.profileCompleted
                                      ? "#10B981"
                                      : "#F59E0B",
                                }}
                              >
                                {user.profileCompleted
                                  ? "Complete"
                                  : "Incomplete"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() =>
                                handleViewProfile(user)
                              }
                              className="flex-1 flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 text-white"
                              style={{
                                backgroundColor: "#3B82F6",
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Profile</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View detailed user profile</p>
                          </TooltipContent>
                        </Tooltip>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 text-white"
                                  style={{
                                    backgroundColor: "#EF4444",
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete user account</p>
                              </TooltipContent>
                            </Tooltip>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            style={{
                              backgroundColor: "#1F2937",
                              borderColor: "#374151",
                            }}
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">
                                Are you sure you want to delete
                                this user?
                              </AlertDialogTitle>
                              <AlertDialogDescription
                                style={{ color: "#9CA3AF" }}
                              >
                                This action cannot be undone.
                                This will permanently delete{" "}
                                {user.name}'s account and remove
                                all their data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                className="transition-all duration-200"
                                style={{
                                  color: "#9CA3AF",
                                  borderColor: "#6B7280",
                                  backgroundColor:
                                    "transparent",
                                }}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteUser(user.id)
                                }
                                className="transition-all duration-200 hover:scale-105 text-white"
                                style={{
                                  backgroundColor: "#EF4444",
                                }}
                              >
                                Yes, Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Profile Modal */}
            <Dialog
              open={showProfileModal}
              onOpenChange={setShowProfileModal}
            >
              <DialogContent
                className="max-w-2xl border"
                style={{
                  backgroundColor: "#1F2937",
                  borderColor: "#374151",
                }}
              >
                <DialogHeader>
                  <DialogTitle className="text-white text-xl">
                    User Profile Details
                  </DialogTitle>
                  <DialogDescription
                    style={{ color: "#9CA3AF" }}
                  >
                    Detailed information about the selected user
                  </DialogDescription>
                </DialogHeader>

                {selectedUser && (
                  <div className="space-y-6 py-4">
                    {/* User Header */}
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "#374151" }}
                      >
                        <User
                          className="h-8 w-8"
                          style={{ color: "#9CA3AF" }}
                        />
                      </div>
                      <div>
                        <h3 className="text-white text-xl">
                          {selectedUser.name}
                        </h3>
                        <p style={{ color: "#9CA3AF" }}>
                          {selectedUser.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(
                            selectedUser.status || "active",
                          )}
                          {selectedUser.isAdmin &&
                            getRoleBadge(
                              selectedUser.role,
                              true,
                            )}
                        </div>
                      </div>
                    </div>

                    {/* User Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label
                            className="text-sm"
                            style={{ color: "#9CA3AF" }}
                          >
                            User ID
                          </label>
                          <p className="text-white font-mono">
                            {selectedUser.id}
                          </p>
                        </div>
                        <div>
                          <label
                            className="text-sm"
                            style={{ color: "#9CA3AF" }}
                          >
                            Role
                          </label>
                          <div className="mt-1">
                            {getRoleBadge(
                              selectedUser.role,
                              selectedUser.isAdmin,
                            )}
                          </div>
                        </div>
                        <div>
                          <label
                            className="text-sm"
                            style={{ color: "#9CA3AF" }}
                          >
                            Registration Date
                          </label>
                          <p className="text-white">
                            {selectedUser.registeredOn}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label
                            className="text-sm"
                            style={{ color: "#9CA3AF" }}
                          >
                            Profile Status
                          </label>
                          <div className="mt-1">
                            <Badge
                              className="text-xs px-2 py-1 border-0 text-white"
                              style={{
                                backgroundColor:
                                  selectedUser.profileCompleted
                                    ? "#10B981"
                                    : "#F59E0B",
                              }}
                            >
                              {selectedUser.profileCompleted
                                ? "Complete"
                                : "Incomplete"}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label
                            className="text-sm"
                            style={{ color: "#9CA3AF" }}
                          >
                            Account Status
                          </label>
                          <div className="mt-1">
                            {getStatusBadge(
                              selectedUser.status || "active",
                            )}
                          </div>
                        </div>
                        {selectedUser.lastLogin && (
                          <div>
                            <label
                              className="text-sm"
                              style={{ color: "#9CA3AF" }}
                            >
                              Last Login
                            </label>
                            <p className="text-white">
                              {selectedUser.lastLogin}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className="flex justify-end space-x-3 pt-4 border-t"
                      style={{ borderColor: "#374151" }}
                    >
                      <Button
                        variant="outline"
                        onClick={() =>
                          setShowProfileModal(false)
                        }
                        className="transition-all duration-200"
                        style={{
                          color: "#9CA3AF",
                          borderColor: "#6B7280",
                          backgroundColor: "transparent",
                        }}
                      >
                        Close
                      </Button>
                      <Button
                        className="transition-all duration-200 hover:scale-105 text-white"
                        style={{
                          backgroundColor: "#3B82F6",
                        }}
                        onClick={() => {
                          setShowProfileModal(false);
                          toast.success(
                            "Profile editing would open here",
                            {
                              style: {
                                background: "#3B82F6",
                                color: "white",
                                border: "none",
                              },
                            },
                          );
                        }}
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
