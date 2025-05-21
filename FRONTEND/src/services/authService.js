import axios from "axios";
import Cookies from 'js-cookie';

const API_URL = "http://localhost:3001/auth";

export const register = (data) => axios.post(`${API_URL}/register`, data);
export const login = (data) => axios.post(`${API_URL}/login`, data);
export const googleAuth = () => {
  // Stocker l'URL actuelle pour la redirection après authentification
  localStorage.setItem('redirectAfterLogin', window.location.pathname);
  window.location.href = `${API_URL}/google`;
};
export const verifyEmail = (data) => axios.post(`${API_URL}/approve`, data);
export const forgotPassword = (data) => axios.post(`${API_URL}/forgot-password`, data);
export const resetPassword = (data) => axios.post(`${API_URL}/reset-password`, data);
export const getProfile = () => axios.get(`${API_URL}/profile`);
export const logout = () => {
  const token = Cookies.get('accessToken');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  return axios.post(`${API_URL}/logout`, {}, config);
};