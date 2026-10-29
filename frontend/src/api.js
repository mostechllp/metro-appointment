import axios from 'axios';

const API = axios.create({
  // PRODUCTION
  baseURL: 'https://metro-appointment.onrender.com/api'

  // DEVELOPMENT  
  // baseURL: 'http://localhost:5000/api'
});

// Attach token for admin requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;