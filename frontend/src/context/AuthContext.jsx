import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('p2c_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.me();
          setUser(res.data);
        } catch (err) {
          console.error('Auth failed', err);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, [token]);

  const login = (userData, jwt) => {
    localStorage.setItem('p2c_token', jwt);
    setToken(jwt);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('p2c_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
