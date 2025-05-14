const API_BASE_URL = 'http://localhost:3000/api';

// Helper function for making API calls
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  register: async (userData) => {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  login: async (credentials) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }
};

// Health API
export const healthAPI = {
  analyzeSymptoms: async (symptoms) => {
    return fetchAPI('/health/analyze', {
      method: 'POST',
      body: JSON.stringify({ symptoms })
    });
  },

  getHealthRecords: async () => {
    return fetchAPI('/health/records');
  },

  getMedications: async () => {
    return fetchAPI('/health/medications');
  },

  addMedication: async (medication) => {
    return fetchAPI('/health/medications', {
      method: 'POST',
      body: JSON.stringify(medication)
    });
  }
};

// Doctor API
export const doctorAPI = {
  getDoctors: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return fetchAPI(`/doctors?${queryParams}`);
  },

  getDoctorDetails: async (doctorId) => {
    return fetchAPI(`/doctors/${doctorId}`);
  },

  getDoctorAvailability: async (doctorId) => {
    return fetchAPI(`/doctors/${doctorId}/availability`);
  },

  addReview: async (doctorId, review) => {
    return fetchAPI(`/doctors/${doctorId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review)
    });
  }
};

// Appointment API
export const appointmentAPI = {
  getAppointments: async () => {
    return fetchAPI('/appointments');
  },

  createAppointment: async (appointmentData) => {
    return fetchAPI('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    return fetchAPI(`/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  addPrescription: async (appointmentId, prescription) => {
    return fetchAPI(`/appointments/${appointmentId}/prescription`, {
      method: 'POST',
      body: JSON.stringify(prescription)
    });
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Handle logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}; 