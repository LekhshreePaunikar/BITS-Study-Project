// root/src/components/ManageUsers.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  ArrowLeft,
  Search,
  Eye,
  Trash2,
  Users as UsersIcon,
  Mail,
  Calendar,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import api from '../utils/api';

interface ManageUsersProps {
  onBackToAdminDashboard: () => void;
}

interface User {
  id: number;
  displayId: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isBlacklisted: boolean;
  status: string;
  createdAt: string;
  lastLogin: string | null;
  role: string;
  profileImage: string | null;
  profileCompletion: {
    percentage: number;
    status: string;
  };
  sessionCount: number;
  averageScore: number;
}

interface UserDetailsData {
  personal: {
    userId: number;
    name: string;
    gender: string | null;
    email: string;
    profileImage: string | null;
    phoneNumber: string | null;
    location: string | null;
    hobbies: string | null;
    createdAt: string;
    isAdmin: boolean;
    isBlacklisted: boolean;
  };
  professional: {
    university: string | null;
    graduationYear: number | null;
    experienceLevel: string | null;
    education: string | null;
    experience: string | null;
    preferredRoles: string | null;
    skills: string[] | null;
    programmingLanguages: string[] | null;
    linkedinProfile: string | null;
    githubProfile: string | null;
    portfolio: string | null;
  };
  performance: {
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
    lowestScore: number;
  };
}

export default function ManageUsers({ onBackToAdminDashboard }: ManageUsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserDetailsData | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== 'all') {
        params.active = statusFilter === 'active' ? 'true' : 'false';
      }

      const response = await api.get('/admin/users', { params });
      
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
      setTotalUsers(response.data.pagination.totalUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchUsers();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // View user details
  const handleViewProfile = async (userId: number) => {
    try {
      const response = await api.get(`/admin/view_user/${userId}`);
      setSelectedUser(response.data);
      setViewModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      alert('Failed to load user details');
    }
  };

  // Toggle blacklist status
  const handleToggleBlacklist = async (userId: number, currentStatus: boolean) => {
    try {
      await api.put(`/admin/blacklist_user/${userId}`, {
        blacklist: !currentStatus
      });
      
      alert(`User ${!currentStatus ? 'blacklisted' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle blacklist status:', error);
      alert('Failed to update user status');
    }
  };

  // Delete user (for future implementation)
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    // Implement delete functionality here if needed
    alert('Delete functionality not implemented yet');
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ backgroundColor: '#111827' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#111827' }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: '#1F2937', borderColor: '#374151' }}>
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <Button
                variant="outline"
                onClick={onBackToAdminDashboard}
                className="flex items-center space-x-2"
                style={{ borderColor: '#6B7280', backgroundColor: '#374151' }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl mb-2 text-white">Manage Users Page</h1>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                View and manage all registered users
              </p>
            </div>
            <div className="flex justify-end">
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-5 w-5" style={{ color: '#3B82F6' }} />
                <span className="text-white font-semibold">Total Registered Users: {totalUsers}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b" style={{ backgroundColor: '#1F2937', borderColor: '#374151' }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#9CA3AF' }} />
                <Input
                  placeholder="Search users by ID, name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-white"
                  style={{
                    backgroundColor: '#374151',
                    borderColor: '#4B5563',
                    color: '#FFFFFF'
                  }}
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="w-48 text-white"
                style={{
                  backgroundColor: '#374151',
                  borderColor: '#4B5563',
                  color: '#FFFFFF'
                }}
              >
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* User Cards Grid */}
      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center text-white py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-white py-8">
            <p className="text-xl">No users found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
            {users.map((user) => (
              <Card
  key={user.id}
  className="border transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
  style={{
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    maxWidth: '400px'
  }}
>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                        {user.profileImage ? (
                          <img
                            src={`http://localhost:3001${user.profileImage}`}
                            alt={user.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-lg font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
  <CardTitle className="text-white text-sm font-semibold truncate">{user.name}</CardTitle>
  <p className="text-xs" style={{ color: '#9CA3AF' }}>{user.displayId}</p>
</div>
                    </div>
                    <Badge
                      className={`px-2 py-1 text-xs ${
                        user.status === 'Active'
                          ? 'bg-green-500/20 text-green-400 border-green-500'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500'
                      }`}
                    >
                      {user.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 pt-2">
                  <div className="flex items-center space-x-2 text-xs" style={{ color: '#9CA3AF' }}>
  <Mail className="h-3 w-3 flex-shrink-0" />
  <span className="truncate">{user.email}</span>
</div>

                  <div className="flex items-center space-x-2 text-xs" style={{ color: '#9CA3AF' }}>
  <Calendar className="h-3 w-3 flex-shrink-0" />
  <span className="truncate">Registered: {formatDate(user.createdAt)}</span>
</div>

<div className="flex items-center space-x-2 text-xs" style={{ color: '#9CA3AF' }}>
  <Clock className="h-3 w-3 flex-shrink-0" />
  <span className="truncate">Last Login: {formatDateTime(user.lastLogin)}</span>
</div>

                  <div className="pt-2 border-t" style={{ borderColor: '#374151' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: '#9CA3AF' }}>Role:</span>
                      <span className="text-sm" style={{ color: '#9CA3AF' }}>Profile:</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: '#3B82F6',
                          color: 'white'
                        }}
                      >
                        {user.role || 'Not Specified'}
                      </Badge>
                      <Badge
                        className={`text-xs ${
                          user.profileCompletion.status === 'Complete'
                            ? 'bg-green-500 text-white'
                            : 'bg-orange-500 text-white'
                        }`}
                      >
                        {user.profileCompletion.status}
                      </Badge>
                    </div>
                  </div>

<div className="pt-2 space-y-1">
  <div className="flex items-center justify-between text-xs">
    <span style={{ color: '#9CA3AF' }}>Sessions:</span>
    <span className="text-white font-semibold">{user.sessionCount}</span>
  </div>
  <div className="flex items-center justify-between text-xs">
    <span style={{ color: '#9CA3AF' }}>Avg Score:</span>
    <div className="flex items-center space-x-1">
      <Award className="h-3 w-3" style={{ color: '#F59E0B' }} />
      <span className="text-white font-semibold">
        {user.averageScore.toFixed(1)}%
      </span>
    </div>
  </div>
</div>

                  <div className="flex gap-2 pt-2">
  <Button
    size="sm"
    className="flex-1 text-xs"
    style={{
      backgroundColor: '#3B82F6',
      color: 'white'
    }}
    onClick={() => handleViewProfile(user.id)}
  >
    <Eye className="h-3 w-3 mr-1" />
    View
  </Button>
                    <Button
  size="sm"
  variant="outline"
  className="px-2"
  style={{
    borderColor: user.isBlacklisted ? '#10B981' : '#EF4444',
    color: user.isBlacklisted ? '#10B981' : '#EF4444',
    backgroundColor: 'transparent'
  }}
  onClick={() => handleToggleBlacklist(user.id, user.isBlacklisted)}
>
  {user.isBlacklisted ? (
    <CheckCircle className="h-3 w-3" />
  ) : (
    <Ban className="h-3 w-3" />
  )}
</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 mt-8">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={{
                borderColor: '#4B5563',
                backgroundColor: '#374151',
                color: currentPage === 1 ? '#6B7280' : 'white'
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <span className="text-white">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={{
                borderColor: '#4B5563',
                backgroundColor: '#374151',
                color: currentPage === totalPages ? '#6B7280' : 'white'
              }}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </main>

      {/* View Profile Modal */}
<Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
  <DialogContent
    className="max-w-3xl max-h-[85vh] overflow-y-auto"
    style={{
      backgroundColor: '#1F2937',
      borderColor: '#374151',
      color: '#FFFFFF'
    }}
  >
          <DialogHeader className="pb-1">
  <DialogTitle className="text-xl text-white">User Profile Details</DialogTitle>
  <DialogDescription className="text-sm" style={{ color: '#9CA3AF' }}>
    Complete information about the user
  </DialogDescription>
</DialogHeader>

 {selectedUser && (
  <div className="space-y-2">
              {/* Personal Information */}
              <div>
                <h3 className="text-base font-semibold text-white mb-2 flex items-center space-x-2">
  <UsersIcon className="h-3 w-3" style={{ color: '#3B82F6' }} />
  <span>Personal Information</span>
</h3>
<div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
  <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Name</p>
  <p className="text-sm text-white">{selectedUser.personal.name}</p>
</div>
                  <div>
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>Gender</p>
                    <p className="text-white">{selectedUser.personal.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>Email</p>
                    <p className="text-white">{selectedUser.personal.email}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>Phone</p>
                    <p className="text-white">{selectedUser.personal.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>Location</p>
                    <p className="text-white">{selectedUser.personal.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>Hobbies</p>
                    <p className="text-white">{selectedUser.personal.hobbies || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
<div className="pt-2 border-t" style={{ borderColor: '#374151' }}>
                <h3 className="text-base font-semibold text-white mb-2 flex items-center space-x-2">
  <Award className="h-2 w-2" style={{ color: '#10B981' }} />
  <span>Professional Information</span>
</h3>
<div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>University</p>
                    <p className="text-white">{selectedUser.professional.university || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>Graduation Year</p>
                    <p className="text-white">{selectedUser.professional.graduationYear || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>Experience Level</p>
                    <p className="text-white">{selectedUser.professional.experienceLevel || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>Preferred Roles</p>
                    <p className="text-white">{selectedUser.professional.preferredRoles || 'Not specified'}</p>
                  </div>
                  <div className="col-span-2">
  <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Skills</p>
  <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedUser.professional.skills && selectedUser.professional.skills.length > 0 ? (
                        selectedUser.professional.skills.map((skill, idx) => (
                          <Badge key={idx} className="text-xs px-2 py-0.5" style={{ backgroundColor: '#3B82F6', color: 'white' }}>
  {skill}
</Badge>
                        ))
                      ) : (
                        <span className="text-white">No skills listed</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>Programming Languages</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedUser.professional.programmingLanguages && selectedUser.professional.programmingLanguages.length > 0 ? (
                        selectedUser.professional.programmingLanguages.map((lang, idx) => (
                          <Badge key={idx} style={{ backgroundColor: '#10B981', color: 'white' }}>
                            {lang}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-white">No languages listed</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>LinkedIn</p>
                    {selectedUser.professional.linkedinProfile ? (
                      <a
                        href={selectedUser.professional.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        View Profile
                      </a>
                    ) : (
                      <p className="text-white">Not provided</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>GitHub</p>
                    {selectedUser.professional.githubProfile ? (
                      <a
                        href={selectedUser.professional.githubProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        View Profile
                      </a>
                    ) : (
                      <p className="text-white">Not provided</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Statistics */}
              <div className="pt-3 border-t" style={{ borderColor: '#374151' }}>
  <h3 className="text-base font-semibold text-white mb-2 flex items-center space-x-2">
    <Award className="h-4 w-4" style={{ color: '#F59E0B' }} />
    <span>Performance Statistics</span>
  </h3>
  <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-0.1 rounded-lg" style={{ backgroundColor: '#374151' }}>
  <p className="text-xs mb-1" style={{ color: '#9CA3AF' }}>Total Attempts</p>
  <p className="text-xl font-bold text-white">{selectedUser.performance.totalAttempts}</p>
</div>
                  <div className="text-center p-0.1 rounded-lg" style={{ backgroundColor: '#374151' }}>
                    <p className="text-xs mb-1" style={{ color: '#9CA3AF' }}>Average Score</p>
                    <p className="text-xl font-bold text-white">{selectedUser.performance.averageScore.toFixed(1)}%</p>
                  </div>
                  <div className="text-center p-0.1 rounded-lg" style={{ backgroundColor: '#374151' }}>
                    <p className="text-xs mb-1" style={{ color: '#9CA3AF' }}>Best Score</p>
                    <p className="text-xl font-bold text-white">{selectedUser.performance.bestScore.toFixed(1)}%</p>
                  </div>
                  <div className="text-center p-0.1 rounded-lg" style={{ backgroundColor: '#374151' }}>
                    <p className="text-xs mb-1" style={{ color: '#9CA3AF' }}>Lowest Score</p>
                    <p className="text-xl font-bold text-white">{selectedUser.performance.lowestScore.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

<DialogFooter className="pt-3">
  <Button
    size="sm"
    onClick={() => setViewModalOpen(false)}
    style={{
      backgroundColor: '#3B82F6',
      color: 'white'
    }}
  >
    Close
  </Button>
</DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}