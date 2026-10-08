/**
 * context/AuthContext.js - Global Authentication State
 *
 * WHAT: React context providing user state, login/logout functions, and a
 *       loading flag to every component in the tree.
 * HOW:  On mount, checks localStorage for a stored JWT and verifies it with
 *       GET /api/auth/me. Axios default headers are updated whenever the token
 *       changes so all subsequent API calls are automatically authenticated.
 * WHY:  Centralising auth state means no component needs to manage tokens
 *       individually — they just consume the context.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Configure axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ra_token'));
  const [loading, setLoading] = useState(true);

  // ── Set or clear axios Authorization header ─────────────────────────────
  const setAuthHeader = useCallback((tok) => {
    if (tok) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  // ── Verify stored token on app load ────────────────────────────────────
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setAuthHeader(token);
      try {
        const { data } = await axios.get('/auth/me');
        if (data.success) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('ra_token', data.token);
      setToken(data.token);
      setAuthHeader(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message);
  };

  // ── Signup ─────────────────────────────────────────────────────────────
  const signup = async (name, email, password) => {
    const { data } = await axios.post('/auth/signup', { name, email, password });
    if (data.success) {
      localStorage.setItem('ra_token', data.token);
      setToken(data.token);
      setAuthHeader(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message);
  };

  // ── Logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('ra_token');
    setToken(null);
    setUser(null);
    setAuthHeader(null);
  }, [setAuthHeader]);

  // ── Update user in context after profile edits ─────────────────────────
  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  // ── Axios response interceptor: auto-logout on 401 ────────────────────
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401 && token) {
          toast.error('Session expired. Please log in again.');
          logout();
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
