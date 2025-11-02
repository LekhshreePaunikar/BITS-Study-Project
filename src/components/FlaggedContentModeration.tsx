// root/src/components/FlaggedContentModeration.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { 
  ArrowLeft,
  Flag,
  CheckCircle,
  Clock,
  MoreVertical,
  Eye,
  User,
  AlertTriangle,
  Calendar,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface FlaggedContentModerationProps {
  username: string;
  onBackToAdminDashboard: () => void;
}

interface FlaggedItem {
  flagId: string;
  userId: string;
  questionId: string;
  issueType: string;
  issueDescription: string;
  timestamp: string;
  status: 'resolved' | 'pending' | 'in-progress';
  reporterName?: string;
  questionText?: string;
}

export default function FlaggedContentModeration({ username, onBackToAdminDashboard }: FlaggedContentModerationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock flagged content data
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>([
    {
      flagId: '#1124',
      userId: 'USR_001',
      questionId: 'Q_4521',
      issueType: 'Inappropriate Content',
      issueDescription: 'Question contains offensive language and inappropriate references to workplace harassment scenarios.',
      timestamp: '20 Jul 2025, 10:15 AM',
      status: 'pending',
      reporterName: 'Sarah Johnson',
      questionText: 'Describe how you would handle a situation where...'
    },
    {
      flagId: '#1125',
      userId: 'USR_007',
      questionId: 'Q_4522',
      issueType: 'Offensive Language',
      issueDescription: 'Uses discriminatory language towards specific demographic groups.',
      timestamp: '20 Jul 2025, 09:32 AM',
      status: 'in-progress',
      reporterName: 'Mike Chen',
      questionText: 'What would you do if your colleague...'
    },
    {
      flagId: '#1126',
      userId: 'USR_003',
      questionId: 'Q_4523',
      issueType: 'Copyright Violation',
      issueDescription: 'Question appears to be copied directly from a published interview guide without attribution.',
      timestamp: '19 Jul 2025, 04:45 PM',
      status: 'resolved',
      reporterName: 'Alex Rivera',
      questionText: 'Explain the technical implementation of...'
    },
    {
      flagId: '#1127',
      userId: 'USR_012',
      questionId: 'Q_4524',
      issueType: 'Misleading Information',
      issueDescription: 'Contains factually incorrect information about industry standards and best practices.',
      timestamp: '19 Jul 2025, 02:20 PM',
      status: 'pending',
      reporterName: 'Emma Watson',
      questionText: 'What are the key principles of...'
    },
    {
      flagId: '#1128',
      userId: 'USR_005',
      questionId: 'Q_4525',
      issueType: 'Spam/Irrelevant',
      issueDescription: 'Question is completely unrelated to the interview topic and appears to be spam content.',
      timestamp: '18 Jul 2025, 11:58 AM',
      status: 'resolved',
      reporterName: 'David Kim',
      questionText: 'Random content about unrelated topics...'
    }
  ]);

  const handleStatusChange = (flagId: string, newStatus: 'resolved' | 'pending' | 'in-progress') => {
    setFlaggedItems(items => 
      items.map(item => 
        item.flagId === flagId 
          ? { ...item, status: newStatus }
          : item
      )
    );
  };

  const handleViewDetails = (item: FlaggedItem) => {
    alert(`Viewing details for ${item.flagId}:\n\nQuestion: ${item.questionText}\nIssue: ${item.issueDescription}\nReporter: ${item.reporterName}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <Badge 
            className="px-3 py-1 text-xs text-white border-0"
            style={{ backgroundColor: '#10B981' }}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolved
          </Badge>
        );
      case 'pending':
        return (
          <Badge 
            className="px-3 py-1 text-xs text-white border-0"
            style={{ backgroundColor: '#F59E0B' }}
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge 
            className="px-3 py-1 text-xs text-white border-0"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case 'Inappropriate Content':
        return '#EF4444';
      case 'Offensive Language':
        return '#DC2626';
      case 'Copyright Violation':
        return '#8B5CF6';
      case 'Misleading Information':
        return '#F59E0B';
      case 'Spam/Irrelevant':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  // Filter items based on search and filters
  const filteredItems = flaggedItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.flagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.questionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issueDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.issueType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const truncateText = (text: string, maxLength: number = 60) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#111827' }}>
        
        {/* Header */}
        <header 
          className="border-b"
          style={{ 
            backgroundColor: '#1F2937',
            borderColor: '#374151'
          }}
        >
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl text-white mb-2">
                  Flagged Content Moderation
                </h1>
                <p className="text-sm md:text-base" style={{ color: '#9CA3AF' }}>
                  Review and resolve reported questions efficiently.
                </p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={onBackToAdminDashboard}
                className="flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: '#6B7280',
                  color: '#9CA3AF',
                  backgroundColor: 'transparent'
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Admin Dashboard</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          
          {/* Filters and Search */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                  style={{ color: '#6B7280' }}
                />
                <Input
                  placeholder="Search by ID, issue type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-80 transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                  style={{ 
                    backgroundColor: '#374151',
                    borderColor: '#4B5563',
                    color: '#FFFFFF'
                  }}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger 
                  className="w-full sm:w-40 text-white"
                  style={{ 
                    backgroundColor: '#374151',
                    borderColor: '#4B5563',
                    color: '#FFFFFF'
                  }}
                >
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger 
                  className="w-full sm:w-48 text-white"
                  style={{ 
                    backgroundColor: '#374151',
                    borderColor: '#4B5563',
                    color: '#FFFFFF'
                  }}
                >
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Inappropriate Content">Inappropriate Content</SelectItem>
                  <SelectItem value="Offensive Language">Offensive Language</SelectItem>
                  <SelectItem value="Copyright Violation">Copyright Violation</SelectItem>
                  <SelectItem value="Misleading Information">Misleading Information</SelectItem>
                  <SelectItem value="Spam/Irrelevant">Spam/Irrelevant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div 
              className="flex items-center space-x-2 text-sm" 
              style={{ color: '#9CA3AF' }}
            >
              <Flag className="h-4 w-4" />
              <span>{filteredItems.length} flagged item{filteredItems.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Content Table or Empty State */}
          {filteredItems.length === 0 ? (
            <Card 
              className="border text-center py-16"
              style={{ 
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardContent>
                <Flag 
                  className="h-16 w-16 mx-auto mb-4" 
                  style={{ color: '#6B7280' }}
                />
                <h3 className="text-xl text-white mb-2">
                  No flagged content to review currently
                </h3>
                <p style={{ color: '#9CA3AF' }}>
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? 'No items match your current filters.'
                    : 'All flagged content has been reviewed.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card 
              className="border transition-all duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardContent className="p-0">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr 
                        className="border-b"
                        style={{ 
                          borderColor: '#374151',
                          backgroundColor: '#374151'
                        }}
                      >
                        <th className="text-left p-4" style={{ color: '#9CA3AF' }}>Flag ID</th>
                        <th className="text-left p-4" style={{ color: '#9CA3AF' }}>User ID</th>
                        <th className="text-left p-4" style={{ color: '#9CA3AF' }}>Question ID</th>
                        <th className="text-left p-4" style={{ color: '#9CA3AF' }}>Issue Type</th>
                        <th className="text-left p-4" style={{ color: '#9CA3AF' }}>Issue Description</th>
                        <th className="text-left p-4" style={{ color: '#9CA3AF' }}>Timestamp</th>
                        <th className="text-left p-4" style={{ color: '#9CA3AF' }}>Status</th>
                        <th className="text-left p-4" style={{ color: '#9CA3AF' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, index) => (
                        <tr 
                          key={item.flagId}
                          className="border-b transition-colors duration-200"
                          style={{ 
                            borderColor: '#374151',
                            backgroundColor: index % 2 === 0 ? 'rgba(55, 65, 81, 0.2)' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(55, 65, 81, 0.2)' : 'transparent';
                          }}
                        >
                          <td 
                            className="p-4 text-sm"
                            style={{ color: '#9CA3AF', fontFamily: 'monospace' }}
                          >
                            {item.flagId}
                          </td>
                          <td 
                            className="p-4 text-sm"
                            style={{ color: '#9CA3AF', fontFamily: 'monospace' }}
                          >
                            {item.userId}
                          </td>
                          <td 
                            className="p-4 text-sm"
                            style={{ color: '#9CA3AF', fontFamily: 'monospace' }}
                          >
                            {item.questionId}
                          </td>
                          <td className="p-4">
                            <Badge 
                              variant="outline"
                              className="text-xs"
                              style={{ 
                                borderColor: getIssueTypeColor(item.issueType),
                                color: getIssueTypeColor(item.issueType),
                                backgroundColor: `${getIssueTypeColor(item.issueType)}20`
                              }}
                            >
                              {item.issueType}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-white">
                            <Tooltip>
                              <TooltipTrigger>
                                <span>{truncateText(item.issueDescription)}</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{item.issueDescription}</p>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="p-4 text-sm" style={{ color: '#6B7280' }}>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{item.timestamp}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
                                  style={{
                                    color: '#6B7280',
                                    backgroundColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#FFFFFF';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#6B7280';
                                  }}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent 
                                align="end"
                                style={{ 
                                  backgroundColor: '#1F2937',
                                  borderColor: '#374151'
                                }}
                              >
                                <DropdownMenuItem 
                                  onClick={() => handleViewDetails(item)}
                                  className="text-white cursor-pointer transition-colors duration-200"
                                  style={{ backgroundColor: 'transparent' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(item.flagId, 'resolved')}
                                  className="cursor-pointer transition-colors duration-200"
                                  style={{ 
                                    color: '#10B981',
                                    backgroundColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(item.flagId, 'in-progress')}
                                  className="cursor-pointer transition-colors duration-200"
                                  style={{ 
                                    color: '#3B82F6',
                                    backgroundColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Mark as In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(item.flagId, 'pending')}
                                  className="cursor-pointer transition-colors duration-200"
                                  style={{ 
                                    color: '#F59E0B',
                                    backgroundColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Mark as Pending
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4 p-4">
                  {filteredItems.map((item) => (
                    <Card 
                      key={item.flagId}
                      className="border transition-all duration-200 hover:shadow-lg"
                      style={{ 
                        backgroundColor: '#374151',
                        borderColor: '#4B5563'
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span 
                              className="text-sm"
                              style={{ color: '#9CA3AF', fontFamily: 'monospace' }}
                            >
                              {item.flagId}
                            </span>
                            <Badge 
                              variant="outline"
                              className="text-xs"
                              style={{ 
                                borderColor: getIssueTypeColor(item.issueType),
                                color: getIssueTypeColor(item.issueType),
                                backgroundColor: `${getIssueTypeColor(item.issueType)}20`
                              }}
                            >
                              {item.issueType}
                            </Badge>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <User 
                              className="h-3 w-3" 
                              style={{ color: '#6B7280' }}
                            />
                            <span style={{ color: '#9CA3AF' }}>User: {item.userId}</span>
                            <span style={{ color: '#9CA3AF' }}>Question: {item.questionId}</span>
                          </div>
                          <p className="text-sm text-white">{item.issueDescription}</p>
                          <div 
                            className="flex items-center space-x-1 text-xs" 
                            style={{ color: '#6B7280' }}
                          >
                            <Calendar className="h-3 w-3" />
                            <span>{item.timestamp}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(item)}
                            className="transition-all duration-200 hover:scale-105"
                            style={{
                              color: '#9CA3AF',
                              borderColor: '#6B7280',
                              backgroundColor: 'transparent'
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="transition-all duration-200 hover:scale-105"
                                style={{
                                  color: '#9CA3AF',
                                  borderColor: '#6B7280',
                                  backgroundColor: 'transparent'
                                }}
                              >
                                <MoreVertical className="h-3 w-3 mr-1" />
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end"
                              style={{ 
                                backgroundColor: '#1F2937',
                                borderColor: '#374151'
                              }}
                            >
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(item.flagId, 'resolved')}
                                className="cursor-pointer transition-colors duration-200"
                                style={{ 
                                  color: '#10B981',
                                  backgroundColor: 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(item.flagId, 'in-progress')}
                                className="cursor-pointer transition-colors duration-200"
                                style={{ 
                                  color: '#3B82F6',
                                  backgroundColor: 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Mark as In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(item.flagId, 'pending')}
                                className="cursor-pointer transition-colors duration-200"
                                style={{ 
                                  color: '#F59E0B',
                                  backgroundColor: 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Mark as Pending
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}