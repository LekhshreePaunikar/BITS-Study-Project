// root/src/utils/api.js

// API utility functions for the AI Mock Interview Platform
import axios from 'axios';

// Base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // User registration
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // User login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Google OAuth login
  googleLogin: async (credential) => {
    const response = await api.post('/auth/google', { credential });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },
};

// User API
export const userAPI = {
  // Get user profile
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Change password
  changePassword: async (userId, passwordData) => {
    const response = await api.put(`/users/${userId}/password`, passwordData);
    return response.data;
  },

  // Get user statistics
  getStats: async (userId) => {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  },

  // Deactivate account
  deactivateAccount: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

// Interview API
export const interviewAPI = {
  // Create interview configuration
  createConfig: async (configData) => {
    const response = await api.post('/interviews/config', configData);
    return response.data;
  },

  // Start interview session
  startSession: async (configId) => {
    const response = await api.post('/interviews/start', { configId });
    return response.data;
  },

  // Submit answer
  submitAnswer: async (sessionId, answerData) => {
    const response = await api.post(`/interviews/sessions/${sessionId}/answers`, answerData);
    return response.data;
  },

  // Complete session
  completeSession: async (sessionId) => {
    const response = await api.post(`/interviews/sessions/${sessionId}/complete`);
    return response.data;
  },

  // Get user sessions
  getSessions: async (page = 1, limit = 10) => {
    const response = await api.get(`/interviews/sessions?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get session details
  getSessionDetails: async (sessionId) => {
    const response = await api.get(`/interviews/sessions/${sessionId}`);
    return response.data;
  },
};

// Questions API
export const questionsAPI = {
  // Get questions
  getQuestions: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get(`/questions?${params}`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/questions/categories');
    return response.data;
  },

  // Create question (admin only)
  createQuestion: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },

  // Update question (admin only)
  updateQuestion: async (questionId, questionData) => {
    const response = await api.put(`/questions/${questionId}`, questionData);
    return response.data;
  },

  // Delete question (admin only)
  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/questions/${questionId}`);
    return response.data;
  },
};

// Sessions API
export const sessionsAPI = {
  // Get session feedback
  getFeedback: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}/feedback`);
    return response.data;
  },

  // Update session feedback
  updateFeedback: async (sessionId, feedbackData) => {
    const response = await api.put(`/sessions/${sessionId}/feedback`, feedbackData);
    return response.data;
  },

  // Get session metrics
  getMetrics: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}/metrics`);
    return response.data;
  },

  // Record performance metric
  recordPerformance: async (metricData) => {
    const response = await api.post('/sessions/performance', metricData);
    return response.data;
  },

  // Get performance history
  getPerformanceHistory: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get(`/sessions/performance/history?${params}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  // Get dashboard statistics
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Get all users
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  // Get analytics
  getAnalytics: async (period = '30d') => {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  },

  // Get admin logs
  getLogs: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get(`/admin/logs?${params}`);
    return response.data;
  },

  // Get flagged content
  getFlaggedContent: async () => {
    const response = await api.get('/admin/flagged-content');
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Check if user is admin
  isAdmin: () => {
    const user = apiUtils.getCurrentUser();
    return user && user.isAdmin;
  },

  // Handle API errors
  handleError: (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        message: data.message || `HTTP Error: ${status}`,
        error: data.error || 'An error occurred',
        status,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        error: 'No response from server',
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: 'An unexpected error occurred',
        error: error.message,
        status: -1,
      };
    }
  },

  // Format error message for UI
  formatError: (error) => {
    const errorInfo = apiUtils.handleError(error);
    return errorInfo.message;
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw apiUtils.handleError(error);
  }
};

export default api;

// Support API
export const supportAPI = {
  /**
   * Create a support ticket.
   * shape: { subject: string, issueType: 'Login'|'Billing'|'Bug'|'Feature Request'|'Other', description: string }
   */
  createTicket: async ({ subject, issueType, description }) => {
    const response = await api.post('/support', { subject, issueType, description });
    return response.data;
  },
};
