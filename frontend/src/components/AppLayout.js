/**
 * components/AppLayout.js - Main Application Shell
 *
 * WHAT: Renders the persistent sidebar, top navbar, and the <Outlet> where
 *       page-level components mount.
 * HOW:  Uses React Router's <Outlet> so child routes render inside the layout
 *       without re-mounting the shell on navigation.
 * WHY:  Shared chrome (nav, sidebar) defined once here; pages stay clean.
 */

import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// ── Icon components (inline SVG — no extra dependency) ───────────────────────
const Icon = ({ d, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const Icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  menu: "M3 12h18 M3 6h18 M3 18h18",
  close: "M18 6L6 18 M6 6l12 12",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  brain:
    "M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7H4a2 2 0 00-2 2v2a2 2 0 002 2h.5A2.5 2.5 0 017 15.5v0A2.5 2.5 0 019.5 18h5a2.5 2.5 0 002.5-2.5v0A2.5 2.5 0 0119.5 13H20a2 2 0 002-2V9a2 2 0 00-2-2h-.5A2.5 2.5 0 0117 4.5v0A2.5 2.5 0 0114.5 2h-5z",
};

const NavItem = ({ to, icon, label, onClick }) => {
  const baseStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
    fontFamily: "var(--font-body)",
    transition: "all var(--transition)",
    cursor: "pointer",
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left",
  };

  if (onClick) {
    return (
      <button
        style={baseStyle}
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-hover)";
          e.currentTarget.style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "none";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        <Icon d={Icons[icon]} />
        {label}
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...baseStyle,
        background: isActive ? "var(--primary-glow)" : "none",
        color: isActive ? "var(--primary-light)" : "var(--text-secondary)",
        borderLeft: isActive
          ? "3px solid var(--primary)"
          : "3px solid transparent",
      })}
    >
      <Icon d={Icons[icon]} />
      {label}
    </NavLink>
  );
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = (event) => setIsMobile(event.matches);
    updateIsMobile(mediaQuery);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateIsMobile);
    } else {
      mediaQuery.addListener(updateIsMobile);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updateIsMobile);
      } else {
        mediaQuery.removeListener(updateIsMobile);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  const sidebarStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "var(--sidebar-width)",
    height: "100vh",
    background: "var(--bg-card)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
    transition: "transform var(--transition-slow)",
    transform: isMobile
      ? sidebarOpen
        ? "translateX(0)"
        : "translateX(-100%)"
      : "translateX(0)",
  };

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}
    >
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside style={sidebarStyle}>
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, var(--primary), var(--accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon d={Icons.brain} size={18} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1.1rem",
                lineHeight: 1,
              }}
            >
              ResumeAI
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginTop: 2,
              }}
            >
              AI-Powered Analyzer
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav
          style={{
            flex: 1,
            padding: "20px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              padding: "0 4px 8px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Main
          </div>
          <NavItem to="/dashboard" icon="dashboard" label="Dashboard" />
          <NavItem to="/upload" icon="upload" label="Upload Resume" />
          <NavItem to="/history" icon="history" label="Analysis History" />
        </nav>

        {/* User panel */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--primary), var(--accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              flexShrink: 0,
            }}
          >
            {avatarLetter}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
              className="truncate"
            >
              {user?.name}
            </div>
            <div
              style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}
              className="truncate"
            >
              {user?.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 6,
              borderRadius: "var(--radius-sm)",
              transition: "color var(--transition)",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--danger)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <Icon d={Icons.logout} size={16} />
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ───────────────────────────────────────────── */}
      <div
        onClick={() => setSidebarOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 99,
          display: sidebarOpen && isMobile ? "block" : "none",
        }}
      />

      {/* ── Main content area ─────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : "var(--sidebar-width)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Navbar */}
        <header
          style={{
            height: "var(--navbar-height)",
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            gap: 16,
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: isMobile ? "flex" : "none",
              padding: 4,
            }}
          >
            <Icon d={Icons.menu} />
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                background: "var(--primary-glow)",
                border: "1px solid var(--primary)",
                fontSize: "0.72rem",
                color: "var(--primary-light)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {user?.plan || "Free"} Plan
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? "20px 16px" : "32px 28px",
            maxWidth: "var(--content-max)",
            width: "100%",
          }}
        >
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
