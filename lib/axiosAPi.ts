import axios from 'axios';
import {apiURL} from '@/constants/main';

const axiosApi = axios.create({
  baseURL: apiURL,
  withCredentials: true,
});

const logoutAndRedirect = async () => {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

axiosApi.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          originalRequest.url !== '/users/login'
      ) {
        originalRequest._retry = true;

      try {
        await axios.post(
          `${apiURL}/users/login`,
          {},
          { withCredentials: true },
        );

        return axiosApi(originalRequest);
      } catch (refreshError) {
        await logoutAndRedirect();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosApi;

