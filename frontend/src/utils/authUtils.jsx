import axios from "axios";

export const refreshToken = async () => {
  try {
    const response = await axios.get("http://localhost:5001/api/user/refresh", { withCredentials: true });
    localStorage.setItem("token", response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.clear();
    window.location.href = "/sign-in";
    throw error;
  }
};

// Axios interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const newToken = await refreshToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);

export default axios;