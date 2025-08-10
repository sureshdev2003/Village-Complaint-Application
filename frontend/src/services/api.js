const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Auth API calls
export const authAPI = {
  // User registration
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // User login
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Verify token
  verifyToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Admin API calls
export const adminAPI = {
  // Admin login
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Get admin profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/dashboard-stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get complaints
  getComplaints: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/complaints?${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get single complaint
  getComplaint: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update complaint status
  updateComplaintStatus: async (id, statusData) => {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(statusData),
    });
    return handleResponse(response);
  },

  // Assign complaint
  assignComplaint: async (id, assignmentData) => {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${id}/assign`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });
    return handleResponse(response);
  },

  // Forward complaint
  forwardComplaint: async (id, forwardData) => {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${id}/forward`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(forwardData),
    });
    return handleResponse(response);
  },

  // Get notifications
  getNotifications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/notifications?${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Mark notification as read
  markNotificationRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Complaint API calls
export const complaintAPI = {
  // Submit complaint
  submit: async (complaintData) => {
    const response = await fetch(`${API_BASE_URL}/complaints/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(complaintData),
    });
    return handleResponse(response);
  },

  // Get complaint status
  getStatus: async (complaintId) => {
    const response = await fetch(`${API_BASE_URL}/complaints/status/${complaintId}`);
    return handleResponse(response);
  },

  // Get user's complaints
  getMyComplaints: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/complaints/my-complaints?${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/complaints/categories`);
    return handleResponse(response);
  },

  // Get statistics
  getStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/complaints/statistics`);
    return handleResponse(response);
  },

  // Search complaints
  search: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/complaints/search?${queryString}`);
    return handleResponse(response);
  },
};

// Feedback API calls
export const feedbackAPI = {
  // Submit feedback
  submit: async (feedbackData) => {
    const response = await fetch(`${API_BASE_URL}/feedback/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });
    return handleResponse(response);
  },

  // Get all feedback (admin only)
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/feedback/all?${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// File upload API calls
export const uploadAPI = {
  // Upload single file
  uploadSingle: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/single`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  // Upload multiple files
  uploadMultiple: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },
};

// Utility functions
export const utils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Check if user is admin
  isAdmin: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.isAdmin || false;
    } catch (error) {
      return false;
    }
  },

  // Get user role (for admin)
  getUserRole: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (error) {
      return null;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
  },

  // Set auth data
  setAuthData: (data) => {
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    if (data.admin) {
      localStorage.setItem('admin', JSON.stringify(data.admin));
    }
  },
}; 