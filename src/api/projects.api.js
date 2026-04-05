import apiClient from './apiClient';
import { ensureArray } from './apiHelpers';

export const getSupervisorProjects = async () => ensureArray(await apiClient.get('/supervisor/projects'));
