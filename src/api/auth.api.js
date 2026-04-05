import apiClient from './apiClient';
import { ensureUserPayload } from './apiHelpers';

const buildAuthConfig = () => ({
  skipAuthRedirect: true,
  suppressAuthEvent: true,
});

export const authAPI = {
  login: async (credentials) => ensureUserPayload(
    await apiClient.post('/supervisor/login', credentials, buildAuthConfig())
  ),
  logout: async () => await apiClient.post('/supervisor/logout', {}, buildAuthConfig()),
  getCurrentUser: async () => ensureUserPayload(
    await apiClient.get('/supervisor/me', buildAuthConfig())
  ),
};
