import axios from 'axios';

// إنشاء instance مخصص لـ axios
const api = axios.create({
  baseURL: 'https://alemam-backend.vercel.app/api', 
  timeout: 15000,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('supervisorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('supervisorToken');
      localStorage.removeItem('supervisorInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// وظائف الـ Supervisor
export const supervisorAPI = {
  // Authentication
  login: (credentials) => api.post('/supervisor/login', credentials),
  logout: () => api.post('/supervisor/logout'),
  
  // Projects
  getMyProjects: () => api.get('/supervisor/projects'),
  
  // Tasks Review
  getDailyTasks: (projectId) => api.get(`/supervisor/daily-tasks/${projectId}`),
  getMonthlyTasks: (projectId) => api.get(`/supervisor/monthly-tasks/${projectId}`),
  reviewDailyTask: (taskId, reviewData) => api.put(`/supervisor/daily-tasks/${taskId}/review`, reviewData),
  reviewMonthlyTask: (taskId, reviewData) => api.put(`/supervisor/monthly-tasks/${taskId}/review`, reviewData),
};

// وظيفة للتحقق من حالة السيرفر
export const checkServerStatus = async () => {
  try {
    const response = await axios.get('https://alemam-backend.vercel.app/health', { 
      timeout: 3000 
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// وظيفة للحصول على معلومات المشرف من الـ Token
export const getSupervisorInfo = () => {
  try {
    const token = localStorage.getItem('supervisorToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        name: payload.name,
        email: payload.email,
        id: payload.id
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting supervisor info:', error);
    return null;
  }
};

export default api;