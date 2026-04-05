import axios from 'axios';

// إنشاء instance مخصص لـ axios
const api = axios.create({
  baseURL: 'https://alemam-backend.vercel.app/api',
  timeout: 15000,
  withCredentials: true,
});

const shouldRedirectToLogin = (error) => {
  if (error.response?.status !== 401) {
    return false;
  }

  if (error.config?.skipAuthRedirect) {
    return false;
  }

  if (error.config?.url?.includes('/login')) {
    return false;
  }

  return window.location.pathname !== '/login';
};

const normalizeTaskFilters = (filtersOrDate) => {
  if (!filtersOrDate) {
    return undefined;
  }

  if (typeof filtersOrDate === 'string') {
    return { date: filtersOrDate };
  }

  return filtersOrDate;
};

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (shouldRedirectToLogin(error)) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// وظائف الـ Supervisor
export const supervisorAPI = {
  // Authentication
  login: (credentials) => api.post('/supervisor/login', credentials, { skipAuthRedirect: true }),
  logout: () => api.post('/supervisor/logout'),
  getCurrentUser: () => api.get('/supervisor/me', { skipAuthRedirect: true }),

  // Projects
  getMyProjects: () => api.get('/supervisor/projects'),
  getDashboardStats: () => api.get('/supervisor/dashboard/stats'),
  getProjectStats: () => api.get('/supervisor/projects/stats'),

  // Tasks Review
  getDailyTasks: (projectId, filters) => api.get(`/supervisor/daily-tasks/${projectId}`, {
    params: normalizeTaskFilters(filters),
  }),
  getMonthlyTasks: (projectId, filters) => api.get(`/supervisor/monthly-tasks/${projectId}`, {
    params: normalizeTaskFilters(filters),
  }),
  reviewDailyTask: (taskId, reviewData) => api.put(`/supervisor/daily-tasks/${taskId}/review`, reviewData),
  reviewMonthlyTask: (taskId, reviewData) => api.put(`/supervisor/monthly-tasks/${taskId}/review`, reviewData),
};

// وظيفة للتحقق من حالة السيرفر
export const checkServerStatus = async () => {
  try {
    const response = await axios.get('https://alemam-backend.vercel.app/health', {
      timeout: 3000,
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export default api;
