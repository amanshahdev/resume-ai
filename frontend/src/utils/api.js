/**
 * utils/api.js - Centralised API Helper Functions
 *
 * WHAT: Thin wrappers around axios calls for every backend endpoint.
 * HOW:  Each function maps to one REST endpoint; all return the `data` payload
 *       directly so callers receive clean objects without unwrapping .data.
 * WHY:  Keeping API calls in one file means changing a URL or adding a header
 *       requires editing exactly one place, not hunting through components.
 */

import axios from 'axios';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiLogin    = (email, password)         => axios.post('/auth/login', { email, password }).then(r => r.data);
export const apiSignup   = (name, email, password)   => axios.post('/auth/signup', { name, email, password }).then(r => r.data);
export const apiGetMe    = ()                         => axios.get('/auth/me').then(r => r.data);

// ── Resume ────────────────────────────────────────────────────────────────────
export const apiUploadResume  = (formData, onProgress) =>
  axios.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  }).then(r => r.data);

export const apiGetResumes    = (page = 1, limit = 10) =>
  axios.get(`/resume?page=${page}&limit=${limit}`).then(r => r.data);

export const apiGetResume     = (id) => axios.get(`/resume/${id}`).then(r => r.data);
export const apiDeleteResume  = (id) => axios.delete(`/resume/${id}`).then(r => r.data);

// ── Analysis ──────────────────────────────────────────────────────────────────
export const apiRunAnalysis      = (resumeId)   => axios.post(`/analysis/analyze/${resumeId}`).then(r => r.data);
export const apiGetAnalysis      = (resumeId)   => axios.get(`/analysis/${resumeId}`).then(r => r.data);
export const apiGetHistory       = ()            => axios.get('/analysis/history').then(r => r.data);
export const apiGetDashboardStats = ()           => axios.get('/analysis/stats').then(r => r.data);

// ── Error helper ──────────────────────────────────────────────────────────────
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred. Please try again.';
};
