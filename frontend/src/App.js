/**
 * App.js - Root Application Component
 *
 * WHAT: Sets up React Router v6, wraps the entire app in AuthProvider and
 *       Toaster, and defines all client-side routes.
 * HOW:  Uses <Routes> + <Route> for declarative routing.  ProtectedRoute
 *       guards all authenticated pages. PublicRoute redirects logged-in
 *       users away from auth pages.
 * WHY:  Centralising routing here gives a single source of truth for all
 *       application pages and their access rules.
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";
import HistoryPage from "./pages/HistoryPage";

// Layout
import AppLayout from "./components/AppLayout";

// ── Route Guards ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Full-screen loading spinner ───────────────────────────────────────────────
const LoadingScreen = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      flexDirection: "column",
      gap: "16px",
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        border: "3px solid var(--border)",
        borderTopColor: "var(--primary)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <p
      style={{
        color: "var(--text-muted)",
        fontFamily: "var(--font-body)",
        fontSize: "0.875rem",
      }}
    >
      Loading ResumeAI…
    </p>
  </div>
);

// ── App ───────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* Protected routes inside AppLayout (navbar + sidebar) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="results/:resumeId" element={<ResultsPage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
              borderRadius: "12px",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              padding: "12px 16px",
              boxShadow: "var(--shadow-md)",
            },
            success: {
              iconTheme: { primary: "var(--accent)", secondary: "var(--bg)" },
            },
            error: {
              iconTheme: { primary: "var(--danger)", secondary: "var(--bg)" },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
