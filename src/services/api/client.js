import axios from "axios";
import { tokenStorage } from "../../utils/storage";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }

    const normalizedError = new Error(error.response?.data?.message || "Koneksi ke server gagal.");
    normalizedError.status = error.response?.status;
    normalizedError.errors = error.response?.data?.errors || [];
    normalizedError.response = error.response;

    return Promise.reject(normalizedError);
  }
);

export default api;
