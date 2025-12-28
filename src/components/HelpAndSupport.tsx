// root/src/components/HelpAndSupport.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { supportAPI } from '../utils/api';

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  HelpCircle,
  Lock,
  FileText,
  Mic,
  Settings,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface HelpAndSupportProps {
  username: string;
  onBackToDashboard: () => void;
}

interface SupportTicket {
  id: string;
  subject: string;
  date: string;
  status: 'resolved' | 'pending' | 'in-progress';
}

export default function HelpAndSupport({ username, onBackToDashboard }: HelpAndSupportProps) {
  const [formData, setFormData] = useState({
    subject: '',
    issueType: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const [supportTickets, setSupportTickets] = useState<SupportTicket[] | null>(null);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await supportAPI.getTickets();
        console.log("Fetched tickets:", res);
        setSupportTickets(res?.data?.tickets || []);
      } catch (err) {
        console.error(err);
        setSupportTickets([]);
      } finally {
        setLoadingTickets(false);
      }
    }
    fetchTickets();
  }, []);

  const quickHelpTips = [
    {
      icon: <Lock className="h-5 w-5" style={{ color: '#3B82F6' }} />,
      title: 'How to reset your password',
      description: 'Go to login page and click "Forgot Password" to receive reset instructions via email.'
    },
    {
      icon: <Mic className="h-5 w-5" style={{ color: '#10B981' }} />,
      title: 'Check mic permissions',
      description: 'Ensure browser has microphone access. Check browser settings and refresh the page.'
    },
    {
      icon: <FileText className="h-5 w-5" style={{ color: '#8B5CF6' }} />,
      title: 'Accepted resume formats',
      description: 'Upload files in PDF or DOC format only. Maximum file size is 5MB.'
    },
    {
      icon: <Settings className="h-5 w-5" style={{ color: '#F59E0B' }} />,
      title: 'Slow evaluation issue',
      description: 'If evaluation is taking too long, try refreshing and attempting again in 10 minutes.'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!formData.issueType) {
      errors.issueType = 'Please select an issue type';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await supportAPI.createTicket({
        subject: formData.subject,
        issueType: formData.issueType,
        description: formData.description,
      });

      toast.success(`Support ticket submitted! #${res?.ticket?.TicketID ?? ''}`);
      setShowSuccessAlert(true);
      setFormData({ subject: '', issueType: '', description: '' });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to submit support ticket.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccessAlert(false), 5000);
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="text-white" style={{ backgroundColor: '#10B981' }}>✅ Resolved</Badge>;
      case 'pending':
        return <Badge className="text-white" style={{ backgroundColor: '#F59E0B' }}>⏳ Pending</Badge>;
      case 'in-progress':
        return <Badge className="text-white" style={{ backgroundColor: '#3B82F6' }}>🔄 In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#111827' }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: '#1F2937', borderColor: '#374151', }}>
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <Button variant="outline" onClick={onBackToDashboard}
                className="hidden md:flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{ borderColor: '#6B7280', backgroundColor: "rgba(62, 65, 69, 1)", }}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl mb-2 text-white"> Get Help & Support</h1>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                Need assistance? We're here to help.
              </p>
            </div>
            <div />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Success Alert */}
          {showSuccessAlert && (
            <Alert
              className="border"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: '#10B981'
              }}
            >
              <CheckCircle className="h-4 w-4" style={{ color: '#10B981' }} />
              <AlertDescription style={{ color: '#10B981' }}>
                Support ticket submitted successfully! We'll get back to you within 24 hours.
              </AlertDescription>
            </Alert>
          )}

          {/* Contact Information and Support Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Contact Information Block */}
            <div className="lg:col-span-1">
              <Card
                className="border transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151'
                }}
              >
                <CardHeader>
                  <CardTitle
                    className="flex items-center space-x-2"
                    style={{ color: '#9CA3AF' }}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Email Support */}
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 mt-1" style={{ color: '#3B82F6' }} />
                    <div>
                      <p className="text-sm" style={{ color: '#9CA3AF' }}>
                        Email Support
                      </p>
                      <p className="text-sm text-white">
                        support@mockinterview.ai
                      </p>
                    </div>
                  </div>

                  {/* Phone Support */}
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 mt-1" style={{ color: '#10B981' }} />
                    <div>
                      <p className="text-sm" style={{ color: '#9CA3AF' }}>
                        Phone Support
                      </p>
                      <p className="text-sm text-white">
                        +91 12345 67890
                      </p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        Mon–Fri, 10 AM–6 PM
                      </p>
                    </div>
                  </div>

                  {/* Office Address */}
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 mt-1" style={{ color: '#EF4444' }} />
                    <div>
                      <p className="text-sm" style={{ color: '#9CA3AF' }}>
                        Office Address
                      </p>
                      <div className="text-sm text-white">
                        <p>AI Mock Interview Platform Pvt. Ltd.</p>
                        <p>5th Floor, Tech Hub Tower,</p>
                        <p>Bengaluru, Karnataka, 560103, India</p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>

            {/* Support Form */}
            <div className="lg:col-span-2">
              <Card
                className="border transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151'
                }}
              >
                <CardHeader>
                  <CardTitle
                    className="flex items-center space-x-2"
                    style={{ color: '#9CA3AF' }}
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span>Submit a Support Request</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Subject Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="subject"
                        style={{ color: '#9CA3AF' }}
                      >
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Brief description of your issue"
                        className={`transition-all duration-200 hover:shadow-md focus:shadow-lg text-white ${formErrors.subject ? 'border-red-500' : ''}`}
                        style={{
                          backgroundColor: '#374151',
                          borderColor: formErrors.subject ? '#EF4444' : '#4B5563',
                          color: '#FFFFFF'
                        }}
                      />
                      {formErrors.subject && (
                        <p className="text-sm flex items-center space-x-1" style={{ color: '#EF4444' }}>
                          <AlertTriangle className="h-3 w-3" />
                          <span>{formErrors.subject}</span>
                        </p>
                      )}
                    </div>

                    {/* Issue Type Dropdown */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="issueType"
                        style={{ color: '#9CA3AF' }}
                      >
                        Issue Type *
                      </Label>
                      <Select
                        value={formData.issueType}
                        onValueChange={(value) => handleInputChange('issueType', value)}
                      >
                        <SelectTrigger
                          className={`transition-all duration-200 hover:shadow-md text-white ${formErrors.issueType ? 'border-red-500' : ''}`}
                          style={{
                            backgroundColor: '#374151',
                            borderColor: formErrors.issueType ? '#EF4444' : '#4B5563',
                            color: '#FFFFFF'
                          }}
                        >
                          <SelectValue placeholder="Select an issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Login">Login</SelectItem>
                          <SelectItem value="Billing">Billing</SelectItem>
                          <SelectItem value="Bug">Bug</SelectItem>
                          <SelectItem value="Feature Request">Feature Request</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>

                      </Select>
                      {formErrors.issueType && (
                        <p className="text-sm flex items-center space-x-1" style={{ color: '#EF4444' }}>
                          <AlertTriangle className="h-3 w-3" />
                          <span>{formErrors.issueType}</span>
                        </p>
                      )}
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        style={{ color: '#9CA3AF' }}
                      >
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Please provide detailed information about your issue..."
                        rows={5}
                        className={`transition-all duration-200 hover:shadow-md focus:shadow-lg text-white ${formErrors.description ? 'border-red-500' : ''}`}
                        style={{
                          backgroundColor: '#374151',
                          borderColor: formErrors.description ? '#EF4444' : '#4B5563',
                          color: '#FFFFFF'
                        }}
                      />
                      {formErrors.description && (
                        <p className="text-sm flex items-center space-x-1" style={{ color: '#EF4444' }}>
                          <AlertTriangle className="h-3 w-3" />
                          <span>{formErrors.description}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center space-x-2 text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                      style={{ backgroundColor: '#10B981' }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Submit Support Ticket</span>
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Support Status Table */}
          <Card
            className="border transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle
                className="flex items-center space-x-2"
                style={{ color: '#9CA3AF' }}
              >
                <FileText className="h-5 w-5" />
                <span>Your Support Tickets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#374151' }}>
                      <th className="text-left p-3" style={{ color: '#9CA3AF' }}>
                        Ticket ID
                      </th>
                      <th className="text-left p-3" style={{ color: '#9CA3AF' }}>
                        Subject
                      </th>
                      <th className="text-left p-3" style={{ color: '#9CA3AF' }}>
                        Date
                      </th>
                      <th className="text-left p-3" style={{ color: '#9CA3AF' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTickets ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-400">
                          Loading tickets...
                        </td>
                      </tr>
                    ) : supportTickets && supportTickets.length > 0 ? (
                      supportTickets.map((ticket: any, index) => {
                        // Adapt to backend key casing (TicketID, Message, CreatedAt, Status)
                        const subject = ticket.Message || '(No subject)';
                        const formattedDate = ticket.CreatedAt
                          ? new Date(ticket.CreatedAt).toLocaleDateString()
                          : 'N/A';
                        const status = ticket.Status || 'open';

                        return (
                          <tr
                            key={ticket.TicketID || index}
                            className="border-b"
                            style={{
                              borderColor: '#374151',
                              backgroundColor: index % 2 === 0 ? 'rgba(55,65,81,.2)' : 'transparent'
                            }}
                          >
                            <td className="p-3 text-gray-300">#{ticket.TicketID}</td>
                            <td className="p-3 text-white">{subject}</td>
                            <td className="p-3 text-gray-300">{formattedDate}</td>
                            <td className="p-3">{getStatusBadge(status)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-400">
                          🌟 <strong>No tickets generated yet</strong>
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Help Tips */}
          <Card
            className="border transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle
                className="flex items-center space-x-2"
                style={{ color: '#9CA3AF' }}
              >
                <HelpCircle className="h-5 w-5" />
                <span>Quick Help Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickHelpTips.map((tip, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                    style={{
                      backgroundColor: '#374151',
                      borderColor: '#4B5563'
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      {tip.icon}
                      <div>
                        <h4 className="text-sm mb-2 text-white">
                          {tip.title}
                        </h4>
                        <p className="text-sm" style={{ color: '#9CA3AF' }}>
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Mobile Back Button - Fixed Bottom */}
      <div className="md:hidden fixed bottom-6 left-6 right-6">
        <Button onClick={onBackToDashboard} variant="outline"
          className="hidden md:flex items-center space-x-2 transition-all duration-200 hover:scale-105"
          style={{ borderColor: '#6B7280', backgroundColor: "rgba(62, 65, 69, 1)", }} >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>
    </div>
  );
}