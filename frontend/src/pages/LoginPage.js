/**
 * pages/LoginPage.js - Authentication: Login
 *
 * WHAT: Full-page login form with email/password inputs, error handling,
 *       loading state, and a link to the signup page.
 * HOW:  Calls AuthContext.login() which POSTs to /api/auth/login; on success
 *       React Router navigates to /dashboard automatically via ProtectedRoute.
 * WHY:  First touchpoint for returning users — must be fast, clear, and secure.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input, Button } from "../components/UI";
import toast from "react-hot-toast";

const EyeIcon = ({ open }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back! 👋");
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Login failed";
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-page login-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--bg)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -200,
          left: -200,
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(239,142,82,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Left panel — branding */}
      <div
        className="auth-branding"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "34px 36px",
          background:
            "linear-gradient(135deg, var(--bg-card) 0%, var(--bg) 100%)",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
              }}
            >
              🧠
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1.4rem",
              }}
            >
              ResumeAI
            </span>
          </div>

          <h1 style={{ marginBottom: 16, fontSize: "2.4rem" }}>
            Land your
            <br />
            <span className="gradient-text">dream job</span>
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            Upload your resume and get instant AI-powered feedback, skill
            analysis, and actionable improvement tips.
          </p>

          {/* Feature bullets */}
          {[
            { icon: "⚡", text: "Instant AI-powered analysis" },
            { icon: "📊", text: "Detailed score breakdown" },
            { icon: "🎯", text: "Actionable improvement tips" },
            { icon: "🔒", text: "Your data stays private" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{icon}</span>
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
              >
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div
        className="auth-form-panel"
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <div
          className="auth-card"
          style={{
            width: "100%",
            maxWidth: 400,
            animation: "fadeIn 0.4s ease",
          }}
        >
          <h2 style={{ marginBottom: 8 }}>Welcome back</h2>
          <p
            style={{
              color: "var(--text-muted)",
              marginBottom: 32,
              fontSize: "0.9rem",
            }}
          >
            Sign in to your account to continue
          </p>

          {errors.general && (
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(255,107,107,0.1)",
                border: "1px solid rgba(255,107,107,0.3)",
                borderRadius: "var(--radius-md)",
                color: "var(--danger)",
                fontSize: "0.875rem",
                marginBottom: 20,
              }}
            >
              {errors.general}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <Input
              label="Email Address"
              type="email"
              required
              value={form.email}
              placeholder="you@example.com"
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              error={errors.email}
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
            />

            <div style={{ position: "relative" }}>
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                required
                value={form.password}
                placeholder="••••••••"
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                error={errors.password}
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                }
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                style={{
                  position: "absolute",
                  right: 12,
                  bottom: errors.password ? 28 : 12,
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </Button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: "0.875rem",
              color: "var(--text-muted)",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{ color: "var(--primary-light)", fontWeight: 600 }}
            >
              Create one free
            </Link>
          </p>

          {/* Demo credentials hint */}
          <div
            style={{
              marginTop: 28,
              padding: "12px 16px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
            }}
          >
            <strong style={{ color: "var(--text-secondary)" }}>
              New here?
            </strong>{" "}
            Create a free account in seconds — no credit card required.
          </div>
        </div>
      </div>
    </div>
  );
}
