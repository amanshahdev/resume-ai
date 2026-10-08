import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

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
  spark: "M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3z",
};

const NAV_THEME = {
  dashboard: {
    softBg: "rgba(79, 195, 247, 0.16)",
    softBorder: "rgba(79, 195, 247, 0.38)",
    text: "#cff2ff",
    activeBg: "linear-gradient(135deg, #34b9f3, #1d7ea9)",
    glow: "0 12px 22px rgba(79, 195, 247, 0.38)",
  },
  upload: {
    softBg: "rgba(255, 196, 106, 0.18)",
    softBorder: "rgba(255, 196, 106, 0.38)",
    text: "#ffe8bf",
    activeBg: "linear-gradient(135deg, #f7bc60, #d7862f)",
    glow: "0 12px 22px rgba(247, 188, 96, 0.36)",
  },
  history: {
    softBg: "rgba(132, 239, 196, 0.18)",
    softBorder: "rgba(132, 239, 196, 0.36)",
    text: "#d8fbe9",
    activeBg: "linear-gradient(135deg, #56d4a0, #208966)",
    glow: "0 12px 22px rgba(86, 212, 160, 0.34)",
  },
};

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    style={({ isActive }) => {
      const theme = NAV_THEME[icon] || NAV_THEME.dashboard;
      return {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: "var(--radius-md)",
        color: isActive ? "#fffdf8" : theme.text,
        textDecoration: "none",
        fontSize: "0.88rem",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        letterSpacing: "0.02em",
        background: isActive ? theme.activeBg : theme.softBg,
        border: `1px solid ${isActive ? "transparent" : theme.softBorder}`,
        boxShadow: isActive ? theme.glow : "none",
        transition: "all var(--transition)",
      };
    }}
  >
    <Icon d={Icons[icon]} size={17} />
    {label}
  </NavLink>
);

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 860);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 859px)");
    const updateIsMobile = (e) => setIsMobile(e.matches);

    updateIsMobile(mediaQuery);
    if (mediaQuery.addEventListener)
      mediaQuery.addEventListener("change", updateIsMobile);
    else mediaQuery.addListener(updateIsMobile);

    return () => {
      if (mediaQuery.removeEventListener)
        mediaQuery.removeEventListener("change", updateIsMobile);
      else mediaQuery.removeListener(updateIsMobile);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative" }}>
      <aside
        style={{
          width: "var(--sidebar-width)",
          minHeight: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 120,
          padding: "18px",
          transform: isMobile
            ? mobileOpen
              ? "translateX(0)"
              : "translateX(-105%)"
            : "translateX(0)",
          transition: "transform var(--transition-slow)",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: "26px",
            background: "linear-gradient(180deg, #1e3f39, #16322d)",
            boxShadow: "0 20px 50px rgba(16, 38, 35, 0.4)",
            color: "#ecf4f2",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "22px 18px 18px",
              borderBottom: "1px solid rgba(236, 244, 242, 0.14)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  background: "linear-gradient(135deg, var(--accent), #f6c271)",
                  color: "#11211d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon d={Icons.spark} size={16} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  ResumeAI
                </div>
                <div style={{ fontSize: "0.72rem", opacity: 0.8 }}>
                  Sharper resumes, faster
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              flex: 1,
            }}
          >
            <NavItem to="/dashboard" icon="dashboard" label="Dashboard" />
            <NavItem to="/upload" icon="upload" label="Upload" />
            <NavItem to="/history" icon="history" label="History" />
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(236, 244, 242, 0.14)",
              padding: "16px",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
              }}
            >
              {avatarLetter}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="truncate"
                style={{
                  fontSize: "0.86rem",
                  color: "#f3f8f6",
                  fontWeight: 600,
                }}
              >
                {user?.name}
              </div>
              <div
                className="truncate"
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(243, 248, 246, 0.72)",
                }}
              >
                {user?.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                border: "none",
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "rgba(255, 255, 255, 0.1)",
                color: "#f3f8f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              title="Logout"
            >
              <Icon d={Icons.logout} size={15} />
            </button>
          </div>
        </div>
      </aside>

      {isMobile && mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            border: "none",
            background: "rgba(15, 16, 16, 0.5)",
          }}
        />
      )}

      <div
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : "calc(var(--sidebar-width) + 14px)",
          minHeight: "100vh",
          padding: isMobile ? "14px" : "16px 18px 18px 0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            height: "var(--navbar-height)",
            borderRadius: "22px",
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 12,
            position: "sticky",
            top: 14,
            zIndex: 90,
          }}
        >
          <button
            onClick={() => setMobileOpen((v) => !v)}
            style={{
              display: isMobile ? "inline-flex" : "none",
              border: "1px solid var(--border)",
              width: 36,
              height: 36,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              background: "var(--bg-elevated)",
            }}
          >
            <Icon d={mobileOpen ? Icons.close : Icons.menu} size={17} />
          </button>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.06rem",
                lineHeight: 1.2,
              }}
            >
              Resume Command Center
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Track uploads, run analysis, iterate faster
            </div>
          </div>
          <div style={{ marginLeft: "auto" }} />
        </header>

        <main
          style={{
            flex: 1,
            marginTop: 12,
            borderRadius: "24px",
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            boxShadow: "var(--shadow-sm)",
            padding: isMobile ? "18px 14px" : "28px",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
