const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('lf_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorMsg = `Request failed: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson.error) errorMsg = errJson.error;
      } catch (e) {
        // ignore JSON parse error
      }
      if (response.status === 404 && endpoint === '/auth/signup') {
        errorMsg = 'Signup endpoint not found. Restart the backend server, then try creating the account again.';
      }
      throw new Error(errorMsg);
    }

    // Handle CSV or text responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
      return response.blob();
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // System Health
  getHealth: () => request('/health'),

  // Authentication
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  signup: (details) => request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(details)
  }),
  getMe: () => request('/auth/me'),

  // Departments
  getDepartments: () => request('/departments'),
  getDepartmentById: (id) => request(`/departments/${id}`),
  createDepartment: (data) => request('/departments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateDepartment: (id, data) => request(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteDepartment: (id) => request(`/departments/${id}`, {
    method: 'DELETE'
  }),

  // Courses
  getCourses: () => request('/courses'),
  getCourseById: (id) => request(`/courses/${id}`),
  createCourse: (data) => request('/courses', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCourse: (id, data) => request(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteCourse: (id) => request(`/courses/${id}`, {
    method: 'DELETE'
  }),

  // Lecture Halls
  getLectureHalls: () => request('/lecture-halls'),
  getLectureHallById: (id) => request(`/lecture-halls/${id}`),
  createLectureHall: (data) => request('/lecture-halls', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateLectureHall: (id, data) => request(`/lecture-halls/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteLectureHall: (id) => request(`/lecture-halls/${id}`, {
    method: 'DELETE'
  }),
  toggleHallStatus: (id) => request(`/lecture-halls/${id}/toggle-status`, {
    method: 'PATCH'
  }),

  // Time Slots
  getTimeSlots: () => request('/time-slots'),
  createTimeSlot: (data) => request('/time-slots', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTimeSlot: (id, data) => request(`/time-slots/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTimeSlot: (id) => request(`/time-slots/${id}`, {
    method: 'DELETE'
  }),

  // Schedules
  getSchedules: () => request('/schedules'),
  createSchedule: (data) => request('/schedules', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateSchedule: (id, data) => request(`/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteSchedule: (id) => request(`/schedules/${id}`, {
    method: 'DELETE'
  }),
  clearSchedules: () => request('/schedules/clear', {
    method: 'DELETE'
  }),
  generateSchedule: (options) => request('/schedules/generate', {
    method: 'POST',
    body: JSON.stringify(options || {})
  }),

  // Conflicts & Resolutions
  getConflicts: () => request('/conflicts'),
  resolveConflict: (resolution) => request('/conflicts/resolve', {
    method: 'POST',
    body: JSON.stringify({ resolution })
  }),
  autoResolveAll: () => request('/conflicts/auto-resolve', {
    method: 'POST'
  }),
  exportConflictsCSV: () => request('/conflicts/export-csv'),

  // Break & Scheduling Policies
  getPolicies: () => request('/policies'),
  updatePolicies: (data) => request('/policies', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Dashboard
  getDashboardSummary: () => request('/dashboard/summary')
};
