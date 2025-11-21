import { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import axiosInstance from '../config/apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const access = localStorage.getItem('access');
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (access) {
      const decoded = jwtDecode(access);
      return {
        ...decoded,
        email: userEmail || decoded.email,
        id: userId || decoded.id,
        username: userName || decoded.username
      };
    }
    return null;
  });

  const loginUser = async (email, password) => {
    try {
      const response = await axiosInstance.post('/token/', { email, password });
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      
      // Store user info separately so it persists on refresh
      if (response.data.user) {
        localStorage.setItem('userEmail', response.data.user.email);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userName', response.data.user.username);
      }
      
      const decoded = jwtDecode(response.data.access);
      const userData = {
        ...decoded,
        ...response.data.user
      };
      setUser(userData);
      console.log('Logged in user:', userData); // Debug log
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
