import apiClient, { AUTH_REQUIRED_EVENT } from '../api/apiClient';
import { authAPI } from '../api/auth.api';
import { getSupervisorProjects } from '../api/projects.api';
import {
  getSupervisorDailyTasks,
  getSupervisorDashboardStats,
  getSupervisorMonthlyTasks,
  getSupervisorProjectStats,
  reviewDailyTask,
  reviewMonthlyTask,
} from '../api/tasks.api';
import { checkServerStatus } from '../api/system.api';

export const supervisorAPI = {
  login: authAPI.login,
  logout: authAPI.logout,
  getCurrentUser: authAPI.getCurrentUser,
  getMyProjects: getSupervisorProjects,
  getDashboardStats: getSupervisorDashboardStats,
  getProjectStats: getSupervisorProjectStats,
  getDailyTasks: getSupervisorDailyTasks,
  getMonthlyTasks: getSupervisorMonthlyTasks,
  reviewDailyTask,
  reviewMonthlyTask,
};

export { AUTH_REQUIRED_EVENT, checkServerStatus };

export default apiClient;
