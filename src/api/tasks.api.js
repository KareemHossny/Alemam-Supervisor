import apiClient from './apiClient';
import {
  ensureNullableObject,
  ensureObject,
  ensurePaginatedResult,
  ensureArray,
} from './apiHelpers';

const normalizeTaskFilters = (filtersOrDate) => {
  if (!filtersOrDate) {
    return undefined;
  }

  if (typeof filtersOrDate === 'string') {
    return { date: filtersOrDate };
  }

  return filtersOrDate;
};

export const getSupervisorDashboardStats = async () => ensureObject(
  await apiClient.get('/supervisor/dashboard/stats')
);

export const getSupervisorProjectStats = async () => ensureArray(
  await apiClient.get('/supervisor/projects/stats')
);

export const getSupervisorDailyTasks = async (projectId, filters) => ensurePaginatedResult(
  await apiClient.get(`/supervisor/daily-tasks/${projectId}`, {
    params: normalizeTaskFilters(filters),
  })
);

export const getSupervisorMonthlyTasks = async (projectId, filters) => ensurePaginatedResult(
  await apiClient.get(`/supervisor/monthly-tasks/${projectId}`, {
    params: normalizeTaskFilters(filters),
  })
);

export const reviewDailyTask = async (taskId, reviewData) => ensureNullableObject(
  await apiClient.put(`/supervisor/daily-tasks/${taskId}/review`, reviewData)
);

export const reviewMonthlyTask = async (taskId, reviewData) => ensureNullableObject(
  await apiClient.put(`/supervisor/monthly-tasks/${taskId}/review`, reviewData)
);
