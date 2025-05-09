import axios from "axios";

// Можно доработать получение токена (например, из localStorage)
const getToken = () => localStorage.getItem("token");

const api = axios.create({
  baseURL: "http://localhost:8000", // если бэкенд на другом порту, укажи полный адрес
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
