import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器，自动加token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器（可选：统一处理错误）
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 可在此处统一处理401等
    return Promise.reject(error);
  }
);

export default instance; 