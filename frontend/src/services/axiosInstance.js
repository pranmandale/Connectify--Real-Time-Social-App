import axios from "axios";
import { refreshToken, logout } from "../featurres/users/authSlice";
import toast from "react-hot-toast";

let store; // 👈 declare but don’t import

export const injectStore = (_store) => {
  store = _store;
};

let refreshPromise = null;

const addAuthInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const accessToken = state?.token?.accessToken;

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!refreshPromise) {
          refreshPromise = store
            .dispatch(refreshToken())
            .unwrap()
            .finally(() => {
              refreshPromise = null;
            });
        }

        try {
          const newAccessToken = await refreshPromise;
          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken.accessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (err) {
          toast.error("Session expired. Please log in again.");
          store.dispatch(logout());
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );
};

export const axiosNodeClient = axios.create({
  baseURL: import.meta.env.VITE_NODE_URL,
  headers: {
    "ngrok-skip-browser-warning": "69420",
  },
  withCredentials: true,
});

addAuthInterceptor(axiosNodeClient);
