// axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.VITE_BACKEND_URL,
});

export default axiosInstance;
