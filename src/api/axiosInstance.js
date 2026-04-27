import axios from "axios";
import { toast } from "react-toastify";

// 🔹 Ensure NO trailing slash in env
const API_BASE = import.meta.env.VITE_BASE_URL.replace(/\/$/, "");

const axiosInstance = axios.create({
  baseURL: `${API_BASE}/api/`,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =======================
   Toast helpers
======================= */
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

/* =======================
   REQUEST INTERCEPTOR
======================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =======================
   RESPONSE INTERCEPTOR
======================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🌐 Network error
    if (!error.response) {
      showNetworkToast();
      return Promise.reject(error);
    }

    const { status } = error.response;

    /* =======================
       TOKEN EXPIRED → REFRESH
    ======================= */
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${API_BASE}/auth/token/refresh/`,
          { refresh: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = res.data.access;

        localStorage.setItem("access_token", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }

    /* =======================
       PERMISSION DENIED
    ======================= */
    if (status === 403) {
      showPermissionToast();
    }

    /* =======================
       SERVER ERROR
    ======================= */
    if (status >= 500) {
      showServerToast();
    }

    return Promise.reject(error);
  }
);

/* =======================
   LOGOUT HELPER
======================= */
const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  toast.error("🔒 Session expired. Please log in again.", {
    theme: "colored",
  });

  window.location.href = "/login";
};

export default axiosInstance;
