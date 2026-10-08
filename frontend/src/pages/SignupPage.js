/**
 * pages/SignupPage.js - Authentication: Registration
 *
 * WHAT: Registration form with name, email, password, and confirm-password.
 * HOW:  Validates locally first, then calls AuthContext.signup().  Identical
 *       layout pattern to LoginPage for visual consistency.
 * WHY:  Separate page keeps each concern isolated and the form logic clean.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input, Button } from "../components/UI";
import toast from "react-hot-toast";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2)
      e.name = "Name must be at least 2 characters";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
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
      await signup(form.name.trim(), form.email, form.password);
      toast.success("Account created! Welcome to ResumeAI 🎉");
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Signup failed";
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][
    strength
  ];
  const strengthColor = [
    "",
    "var(--danger)",
    "var(--warning)",
    "#9AE6B4",
    "var(--accent)",
    "var(--success)",
  ][strength];

  return (
    <div
      className="auth-page signup-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -300,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 800,
          background:
            "radial-gradient(circle, var(--primary-glow) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="auth-card"
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: 32,
          boxShadow: "var(--shadow-lg)",
          animation: "fadeIn 0.4s ease",
          position: "relative",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, var(--primary), var(--accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
            }}
          >
            🧠
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.3rem",
            }}
          >
            ResumeAI
          </span>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: 6 }}>
          Create your account
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            marginBottom: 28,
          }}
        >
          Free forever · No credit card required
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
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <Input
            label="Full Name"
            required
            value={form.name}
            placeholder="Jane Doe"
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={form.email}
            placeholder="you@example.com"
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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

          <div>
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              required
              value={form.password}
              placeholder="Min. 6 characters"
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
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              }
            />
            {form.password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background:
                          i <= strength ? strengthColor : "var(--border)",
                        transition: "background 0.3s",
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: "0.72rem", color: strengthColor }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type={showPw ? "text" : "password"}
            required
            value={form.confirm}
            placeholder="Re-enter password"
            onChange={(e) =>
              setForm((f) => ({ ...f, confirm: e.target.value }))
            }
            error={errors.confirm}
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            }
          />

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              required
              style={{
                marginTop: 3,
                accentColor: "var(--primary)",
                cursor: "pointer",
              }}
            />
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                lineHeight: 1.5,
              }}
            >
              I agree to the{" "}
              <span style={{ color: "var(--primary-light)" }}>
                Terms of Service
              </span>{" "}
              and{" "}
              <span style={{ color: "var(--primary-light)" }}>
                Privacy Policy
              </span>
            </span>
          </label>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? "Creating account…" : "Create Free Account →"}
          </Button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: "0.875rem",
            color: "var(--text-muted)",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "var(--primary-light)", fontWeight: 600 }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
