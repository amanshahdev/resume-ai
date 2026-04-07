/**
 * pages/ResultsPage.js - Detailed Analysis Results
 *
 * WHAT: Renders the complete AI analysis report for a single resume including
 *       score ring, score breakdown bars, skills tags, strengths, weaknesses,
 *       suggestions, and overall AI feedback.
 * HOW:  Reads the resumeId from the URL, fetches both the resume and its
 *       analysis on mount, and renders each section in dedicated cards.
 *       If no analysis exists yet, offers an Analyze button.
 * WHY:  This is the highest-value page — where users actually read their
 *       feedback — so it gets the most visual treatment.
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGetAnalysis, apiGetResume, apiRunAnalysis } from "../utils/api";
import {
  Card,
  Button,
  Badge,
  ScoreRing,
  ProgressBar,
  TagCloud,
  SectionHeader,
  Spinner,
} from "../components/UI";
import toast from "react-hot-toast";

const Section = ({ title, icon, children, style }) => (
  <Card style={{ ...style }}>
    <h4
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
        color: "var(--text-primary)",
      }}
    >
      <span>{icon}</span> {title}
    </h4>
    {children}
  </Card>
);

const ListItems = ({ items = [], variant = "default", emptyMsg }) => {
  if (!items.length)
    return (
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
        {emptyMsg}
      </p>
    );
  return (
    <ul
      style={{
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              flexShrink: 0,
              marginTop: 1,
              background:
                variant === "success"
                  ? "rgba(21,143,100,0.16)"
                  : variant === "danger"
                    ? "rgba(204,77,77,0.14)"
                    : "rgba(15,123,108,0.15)",
              color:
                variant === "success"
                  ? "var(--success)"
                  : variant === "danger"
                    ? "var(--danger)"
                    : "var(--primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: 700,
            }}
          >
            {variant === "success" ? "✓" : variant === "danger" ? "✕" : i + 1}
          </span>
          <span
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
            }}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default function ResultsPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [resumeData, analysisData] = await Promise.allSettled([
          apiGetResume(resumeId),
          apiGetAnalysis(resumeId),
        ]);
        if (resumeData.status === "fulfilled")
          setResume(resumeData.value.resume);
        if (analysisData.status === "fulfilled")
          setAnalysis(analysisData.value.analysis);
        else if (analysisData.reason?.response?.status !== 404) {
          setError("Failed to load analysis");
        }
      } catch {
        setError("Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resumeId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const data = await apiRunAnalysis(resumeId);
      setAnalysis(data.analysis);
      toast.success("Analysis complete!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 16,
        }}
      >
        <Spinner size={32} color="var(--primary)" />
        <p style={{ color: "var(--text-muted)" }}>Loading results…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>⚠️</div>
        <h3 style={{ marginBottom: 8 }}>{error}</h3>
        <Button
          onClick={() => navigate("/dashboard")}
          variant="secondary"
          style={{ marginTop: 16 }}
        >
          ← Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div
        style={{
          maxWidth: 500,
          margin: "80px auto",
          textAlign: "center",
          animation: "fadeIn 0.4s ease",
        }}
      >
        <div style={{ fontSize: "3.5rem", marginBottom: 20 }}>🤖</div>
        <h2 style={{ marginBottom: 8 }}>No Analysis Yet</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>
          {resume
            ? `"${resume.originalName}" hasn't been analyzed yet.`
            : "This resume hasn't been analyzed yet."}{" "}
          Click below to run the AI analysis now.
        </p>
        <Button size="lg" loading={analyzing} onClick={handleAnalyze}>
          {analyzing ? "Analyzing…" : "⚡ Run AI Analysis"}
        </Button>
      </div>
    );
  }

  const {
    overallScore,
    scoreBreakdown,
    skillsFound,
    missingKeywords,
    strengths,
    weaknesses,
    suggestions,
    overallFeedback,
    detectedJobTitle,
    experienceLevel,
    industryMatch,
    processingTimeMs,
    aiModel,
    grade,
  } = analysis;

  const scoreColor =
    overallScore >= 80
      ? "var(--success)"
      : overallScore >= 60
        ? "var(--warning)"
        : "var(--danger)";

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <SectionHeader
        title="Resume Analysis Results"
        subtitle={
          resume
            ? `Analysis for: ${resume.originalName}`
            : "AI-Powered Resume Report"
        }
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/upload")}
            >
              ↑ Upload New
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={analyzing}
              onClick={handleAnalyze}
            >
              ↺ Re-analyze
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/dashboard")}
            >
              ← Dashboard
            </Button>
          </div>
        }
      />

      {/* ── Overall Score Hero ────────────────────────────────── */}
      <Card
        glow
        style={{
          marginBottom: 20,
          background:
            "linear-gradient(135deg, var(--bg-card), var(--bg-elevated))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          <ScoreRing score={overallScore} size={160} />

          <div style={{ flex: 1, minWidth: 200 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {overallScore >= 80
                  ? "Excellent Resume!"
                  : overallScore >= 60
                    ? "Good Resume"
                    : overallScore >= 40
                      ? "Needs Improvement"
                      : "Major Revisions Needed"}
              </h2>
              <Badge
                variant={
                  overallScore >= 80
                    ? "success"
                    : overallScore >= 60
                      ? "warning"
                      : "danger"
                }
              >
                Grade: {grade}
              </Badge>
            </div>

            <p
              style={{
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                marginBottom: 16,
                fontSize: "0.9rem",
              }}
            >
              {overallFeedback}
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {detectedJobTitle !== "Not detected" && (
                <Badge variant="primary">🎯 {detectedJobTitle}</Badge>
              )}
              {experienceLevel !== "Unknown" && (
                <Badge variant="info">👤 {experienceLevel}</Badge>
              )}
              {industryMatch?.slice(0, 2).map((ind) => (
                <Badge key={ind} variant="default">
                  🏢 {ind}
                </Badge>
              ))}
            </div>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                gap: 16,
                fontSize: "0.75rem",
                color: "var(--text-muted)",
              }}
            >
              <span>Analyzed by: {aiModel}</span>
              {processingTimeMs > 0 && (
                <span>Time: {(processingTimeMs / 1000).toFixed(1)}s</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Score Breakdown ───────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <Section title="Score Breakdown" icon="📊">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                label: "Formatting & Structure",
                key: "formatting",
                icon: "📐",
              },
              { label: "Keywords & ATS Score", key: "keywords", icon: "🔑" },
              { label: "Work Experience", key: "experience", icon: "💼" },
              { label: "Education", key: "education", icon: "🎓" },
              { label: "Skills", key: "skills", icon: "⚡" },
            ].map(({ label, key, icon }) => (
              <ProgressBar
                key={key}
                label={`${icon} ${label}`}
                value={scoreBreakdown?.[key] || 0}
                max={100}
                height={7}
              />
            ))}
          </div>
        </Section>

        <Section title="Resume Overview" icon="📋">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                label: "Overall Score",
                value: `${overallScore}/100`,
                color: scoreColor,
              },
              { label: "Grade", value: grade, color: scoreColor },
              { label: "Job Title", value: detectedJobTitle },
              { label: "Experience Level", value: experienceLevel },
              {
                label: "Skills Detected",
                value: `${skillsFound?.length || 0} skills`,
              },
              {
                label: "Missing Keywords",
                value: `${missingKeywords?.length || 0} items`,
              },
              resume && {
                label: "Word Count",
                value: `${resume.wordCount} words`,
              },
              resume && {
                label: "Pages",
                value: `${resume.pageCount} page${resume.pageCount > 1 ? "s" : ""}`,
              },
            ]
              .filter(Boolean)
              .map(({ label, value, color }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 10,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: color || "var(--text-primary)",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
          </div>
        </Section>
      </div>

      {/* ── Skills ───────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <Section title="Skills Found" icon="✅">
          {skillsFound?.length > 0 ? (
            <TagCloud tags={skillsFound} color="success" max={30} />
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No skills detected. Add a dedicated Skills section.
            </p>
          )}
        </Section>

        <Section title="Missing Keywords" icon="❌">
          {missingKeywords?.length > 0 ? (
            <TagCloud tags={missingKeywords} color="warning" max={20} />
          ) : (
            <p style={{ color: "var(--success)", fontSize: "0.875rem" }}>
              Great! No critical keywords missing.
            </p>
          )}
          {missingKeywords?.length > 0 && (
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginTop: 12,
              }}
            >
              Consider adding these to improve ATS compatibility and keyword
              matching.
            </p>
          )}
        </Section>
      </div>

      {/* ── Strengths & Weaknesses ─────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <Section
          title="Strengths"
          icon="💪"
          style={{ borderTop: `3px solid var(--success)` }}
        >
          <ListItems
            items={strengths}
            variant="success"
            emptyMsg="Run the analysis again for detailed strengths."
          />
        </Section>

        <Section
          title="Weaknesses"
          icon="⚠️"
          style={{ borderTop: `3px solid var(--danger)` }}
        >
          <ListItems
            items={weaknesses}
            variant="danger"
            emptyMsg="No major weaknesses detected!"
          />
        </Section>
      </div>

      {/* ── Suggestions ──────────────────────────────────────────── */}
      <Section
        title="Improvement Suggestions"
        icon="💡"
        style={{ marginBottom: 20, borderTop: `3px solid var(--primary)` }}
      >
        {suggestions?.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 12,
            }}
          >
            {suggestions.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 16px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--primary)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: "var(--primary-light)" }}>
                    #{i + 1}
                  </strong>{" "}
                  {s}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No specific suggestions — your resume looks great!
          </p>
        )}
      </Section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <Card
        style={{
          textAlign: "center",
          background:
            "linear-gradient(135deg, rgba(15,123,108,0.08), rgba(239,142,82,0.08))",
          border: "1px solid rgba(15,123,108,0.22)",
        }}
      >
        <h3 style={{ marginBottom: 8 }}>Ready to improve your resume?</h3>
        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: 20,
            fontSize: "0.9rem",
          }}
        >
          Make the changes above and upload your updated resume to see your
          score improve.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button onClick={() => navigate("/upload")}>
            ↑ Upload Updated Resume
          </Button>
          <Button variant="secondary" onClick={() => navigate("/history")}>
            View History
          </Button>
        </div>
      </Card>
    </div>
  );
}
