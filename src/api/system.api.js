import axios from 'axios';
import { PUBLIC_BASE_URL } from './apiClient';

export const checkServerStatus = async () => {
  try {
    const response = await axios.get(`${PUBLIC_BASE_URL}/health`, {
      timeout: 3000,
      withCredentials: true,
    });

    return response.status === 200;
  } catch (error) {
    return false;
  }
};
