import axios from 'axios';

export const AUTH_REQUIRED_EVENT = 'portal:auth-required';

const normalizeBaseUrl = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\/+$/, '');
};

export const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL || '/api');
export const PUBLIC_BASE_URL = API_BASE_URL.replace(/\/api$/i, '');

const createApiError = (message, options = {}) => {
  const error = new Error(message || 'Unexpected request error');

  if (options.code) {
    error.code = options.code;
  }

  if (options.details !== undefined) {
    error.details = options.details;
  }

  if (options.status) {
    error.status = options.status;
  }

  if (options.originalError) {
    error.originalError = options.originalError;
  }

  return error;
};

const getErrorMessage = (error) => {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.request) {
    return 'تعذر الاتصال بالخادم. يرجى التحقق من الشبكة والمحاولة مرة أخرى.';
  }

  return error.message || 'Unexpected request error';
};

const normalizeApiError = (error) => createApiError(getErrorMessage(error), {
  code: error.response?.data?.error?.code,
  details: error.response?.data?.error?.details,
  status: error.response?.status,
  originalError: error,
});

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[api]', config.method?.toUpperCase(), `${config.baseURL || ''}${config.url || ''}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const payload = response?.data;

    if (payload && typeof payload === 'object' && 'success' in payload) {
      if (payload.success === true) {
        return payload.data ?? null;
      }

      return Promise.reject(
        createApiError(payload.error?.message || 'Request failed', {
          code: payload.error?.code,
          details: payload.error?.details,
          status: response?.status,
        })
      );
    }

    return payload ?? null;
  },
  (error) => {
    if (
      error.response?.status === 401
      && !error.config?.skipAuthRedirect
      && !error.config?.suppressAuthEvent
    ) {
      window.dispatchEvent(new CustomEvent(AUTH_REQUIRED_EVENT));
    }

    return Promise.reject(normalizeApiError(error));
  }
);

export default apiClient;
