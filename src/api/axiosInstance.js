// src/api/axiosInstance.js
import axios from "axios";
import { toast } from "react-toastify";

const baseURL = `${import.meta.env.VITE_BASE_URL}/api/`;

// ✅ Create instance
const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔔 Helper toast functions
const showPermissionToast = () => {
  toast.error("🚫 You do not have permission to perform this action.", {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};

const showNetworkToast = () => {
  toast.error("🌐 Network error! Please check your internet connection.", {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: true,
    theme: "colored",
  });
};

const showServerToast = () => {
  toast.error("⚠️ Server error. Please try again later.", {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: true,
    theme: "colored",
  });
};

// 🔐 Attach access token to each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔄 Auto-refresh token on 401 + handle 403 and errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🧱 Network-level errors (no response at all)
    if (!error.response) {
      showNetworkToast();
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // 🔄 Handle 401 Unauthorized — Token expired, refresh logic
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh_token = localStorage.getItem("refresh_token");

      if (!refresh_token) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${baseURL}token/refresh/`, {
          refresh: refresh_token,
        });

        const new_access_token = response.data.access;
        localStorage.setItem("access_token", new_access_token);

        axiosInstance.defaults.headers.Authorization = `Bearer ${new_access_token}`;
        originalRequest.headers.Authorization = `Bearer ${new_access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("🚫 Refresh failed, logging out...");
        toast.error("🔒 Session expired. Please log in again.", {
          theme: "colored",
        });
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // 🚫 Handle 403 Forbidden — Permission denied
    if (status === 403 && data?.detail === "You do not have permission to perform this action.") {
      showPermissionToast();
    }

    // ⚙️ Handle 500+ server errors
    if (status >= 500) {
      showServerToast();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
