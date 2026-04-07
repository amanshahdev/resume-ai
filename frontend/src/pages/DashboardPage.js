/**
 * pages/DashboardPage.js - Main User Dashboard
 *
 * WHAT: Shows the user's stats (total resumes, average score, highest score),
 *       their recent resume uploads with analysis status, and quick-action CTAs.
 * HOW:  On mount, fetches dashboard stats and recent resumes in parallel.
 *       Uses StatCard, Card, ProgressBar components from the UI library.
 * WHY:  The dashboard is the home base — it gives users an at-a-glance health
 *       check on their resume portfolio and nudges them toward the next action.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  apiGetDashboardStats,
  apiGetResumes,
  apiRunAnalysis,
  apiDeleteResume,
} from "../utils/api";
import {
  Card,
  Button,
  Badge,
  StatCard,
  ProgressBar,
  SectionHeader,
  EmptyState,
  Spinner,
} from "../components/UI";
import toast from "react-hot-toast";

const IconSVG = ({ d, size = 20 }) => (
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

const FileSize = (bytes) => {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
};

const StatusBadge = ({ status }) => {
  const map = {
    uploaded: { variant: "info", label: "Uploaded" },
    processing: { variant: "warning", label: "Processing" },
    analyzed: { variant: "success", label: "Analyzed" },
    failed: { variant: "danger", label: "Failed" },
  };
  const { variant, label } = map[status] || {
    variant: "default",
    label: status,
  };
  return <Badge variant={variant}>{label}</Badge>;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, resumesData] = await Promise.all([
          apiGetDashboardStats(),
          apiGetResumes(1, 5),
        ]);
        setStats(statsData.stats);
        setResumes(resumesData.resumes || []);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoadingStats(false);
        setLoadingResumes(false);
      }
    };
    loadData();
  }, []);

  const handleAnalyze = async (resumeId) => {
    setAnalyzingId(resumeId);
    try {
      await apiRunAnalysis(resumeId);
      toast.success("Analysis complete!");
      navigate(`/results/${resumeId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (resumeId, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(resumeId);
    try {
      await apiDeleteResume(resumeId);
      setResumes((r) => r.filter((x) => x._id !== resumeId));
      toast.success("Resume deleted");
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setDeletingId(null);
    }
  };

  const firstName = user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 45%, #0f3d36 100%)",
          borderRadius: "var(--radius-xl)",
          padding: "28px 32px",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 280,
            height: 280,
            background: "rgba(255,255,255,0.04)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 20,
            top: 20,
            width: 180,
            height: 180,
            background: "rgba(255,255,255,0.04)",
            borderRadius: "50%",
          }}
        />
        <div style={{ position: "relative" }}>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.875rem",
              marginBottom: 4,
            }}
          >
            {greeting} 👋
          </p>
          <h1 style={{ color: "#fff", marginBottom: 8, fontSize: "1.8rem" }}>
            Welcome back, {firstName}!
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "0.9rem",
              marginBottom: 20,
            }}
          >
            Ready to take your resume to the next level?
          </p>
          <Button variant="accent" onClick={() => navigate("/upload")}>
            ↑ Upload New Resume
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {loadingStats ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 100, borderRadius: "var(--radius-lg)" }}
              />
            ))
        ) : (
          <>
            <StatCard
              label="Resumes Uploaded"
              value={stats?.totalResumes ?? 0}
              icon={
                <IconSVG
                  d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6"
                  size={20}
                />
              }
              color="var(--primary)"
            />
            <StatCard
              label="Analyses Run"
              value={stats?.totalAnalyses ?? 0}
              icon={
                <IconSVG
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  size={20}
                />
              }
              color="var(--accent)"
            />
            <StatCard
              label="Average Score"
              value={stats?.averageScore ? `${stats.averageScore}` : "—"}
              icon={
                <IconSVG
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  size={20}
                />
              }
              color="var(--warning)"
            />
            <StatCard
              label="Best Score"
              value={stats?.highestScore ? `${stats.highestScore}` : "—"}
              icon={
                <IconSVG
                  d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12 M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  size={20}
                />
              }
              color="var(--success)"
            />
          </>
        )}
      </div>

      {/* ── Recent Resumes ─────────────────────────────────────────── */}
      <SectionHeader
        title="Recent Resumes"
        subtitle="Your latest uploads and their analysis status"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/history")}
          >
            View All →
          </Button>
        }
      />

      {loadingResumes ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 80, borderRadius: "var(--radius-lg)" }}
              />
            ))}
        </div>
      ) : resumes.length === 0 ? (
        <Card>
          <EmptyState
            icon="📄"
            title="No resumes yet"
            description="Upload your first resume to get AI-powered analysis and improvement tips."
            action={
              <Button onClick={() => navigate("/upload")}>
                ↑ Upload Resume
              </Button>
            }
          />
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {resumes.map((resume) => (
            <Card key={resume._id} hover style={{ padding: "16px 20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                {/* File icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-md)",
                    background: "rgba(15,123,108,0.15)",
                    border: "1px solid rgba(15,123,108,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    flexShrink: 0,
                  }}
                >
                  📄
                </div>

                {/* File info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "var(--text-primary)",
                      marginBottom: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {resume.originalName}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {FileSize(resume.fileSize)}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {resume.wordCount} words
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {new Date(resume.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <StatusBadge status={resume.status} />
                  </div>
                </div>

                {/* Score if analyzed */}
                {resume.analysis && (
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: "1.4rem",
                        color:
                          resume.analysis.overallScore >= 70
                            ? "var(--success)"
                            : resume.analysis.overallScore >= 50
                              ? "var(--warning)"
                              : "var(--danger)",
                      }}
                    >
                      {resume.analysis.overallScore}
                    </div>
                    <div
                      style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                    >
                      score
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {resume.status === "analyzed" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/results/${resume._id}`)}
                    >
                      View Results
                    </Button>
                  )}
                  {(resume.status === "uploaded" ||
                    resume.status === "failed") && (
                    <Button
                      size="sm"
                      loading={analyzingId === resume._id}
                      onClick={() => handleAnalyze(resume._id)}
                    >
                      {analyzingId === resume._id ? "Analyzing…" : "⚡ Analyze"}
                    </Button>
                  )}
                  <button
                    onClick={() =>
                      handleDelete(resume._id, resume.originalName)
                    }
                    disabled={deletingId === resume._id}
                    style={{
                      background: "none",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: "6px 10px",
                      display: "flex",
                      alignItems: "center",
                      transition: "all var(--transition)",
                      fontSize: "0.8rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--danger)";
                      e.currentTarget.style.color = "var(--danger)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    {deletingId === resume._id ? <Spinner size={14} /> : "🗑"}
                  </button>
                </div>
              </div>

              {/* Score bar for analyzed resumes */}
              {resume.analysis && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <ProgressBar
                    value={resume.analysis.overallScore}
                    max={100}
                    height={5}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ── Quick Tips ────────────────────────────────────────────── */}
      {resumes.length > 0 && (
        <Card
          style={{
            marginTop: 28,
            background:
              "linear-gradient(135deg, rgba(239,142,82,0.08), rgba(15,123,108,0.08))",
            border: "1px solid rgba(15,123,108,0.24)",
          }}
        >
          <h4 style={{ marginBottom: 12, color: "var(--accent)" }}>
            💡 Pro Tips
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {[
              {
                icon: "🎯",
                tip: "Target each resume to the specific job description",
              },
              {
                icon: "📊",
                tip: "Quantify achievements with numbers and percentages",
              },
              {
                icon: "🔑",
                tip: "Use keywords from the job posting in your resume",
              },
              {
                icon: "✂️",
                tip: "Keep it to 1 page for under 10 years experience",
              },
            ].map(({ icon, tip }) => (
              <div
                key={tip}
                style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
              >
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{icon}</span>
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
