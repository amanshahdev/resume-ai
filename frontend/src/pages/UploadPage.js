/**
 * pages/UploadPage.js - Resume Upload Interface
 *
 * WHAT: Drag-and-drop PDF upload page with live progress bar, validation,
 *       and auto-redirect to the Results page after analysis completes.
 * HOW:  Uses react-dropzone for drag-and-drop UX, axios onUploadProgress for
 *       the progress bar, then immediately triggers AI analysis on the new
 *       resume before navigating to /results/:id.
 * WHY:  A seamless single-page upload → analyse → view flow removes friction
 *       and delivers instant value to the user.
 */

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { apiUploadResume, apiRunAnalysis } from "../utils/api";
import { Button, Card, ProgressBar } from "../components/UI";
import toast from "react-hot-toast";

const steps = [
  { icon: "📤", label: "Upload PDF", desc: "Drag & drop or browse" },
  { icon: "🔍", label: "Parse Text", desc: "Extract resume content" },
  { icon: "🤖", label: "AI Analysis", desc: "Score & generate feedback" },
  { icon: "📊", label: "View Results", desc: "See your detailed report" },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stage, setStage] = useState("idle"); // idle | uploading | analyzing | done
  const [error, setError] = useState("");

  const onDrop = useCallback((accepted, rejected) => {
    setError("");
    if (rejected.length > 0) {
      const reason = rejected[0].errors[0];
      if (reason.code === "file-too-large")
        setError("File is too large. Maximum size is 5 MB.");
      else if (reason.code === "file-invalid-type")
        setError("Only PDF files are accepted.");
      else setError(reason.message);
      return;
    }
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxSize: 5 * 1024 * 1024,
      multiple: false,
      disabled: stage !== "idle",
    });

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    setError("");

    // ── Step 1: Upload ──────────────────────────────────────────────
    setStage("uploading");
    setUploadProgress(0);
    let resumeId;
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const uploadData = await apiUploadResume(formData, setUploadProgress);
      if (!uploadData.success) throw new Error(uploadData.message);
      resumeId = uploadData.resume.id;
      toast.success("Resume uploaded successfully!");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Upload failed. Please try again.",
      );
      setStage("idle");
      return;
    }

    // ── Step 2: Analyze ─────────────────────────────────────────────
    setStage("analyzing");
    try {
      await apiRunAnalysis(resumeId);
      setStage("done");
      toast.success("Analysis complete! 🎉");
      setTimeout(() => navigate(`/results/${resumeId}`), 800);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Analysis failed. You can retry from the dashboard.",
      );
      setStage("idle");
      navigate("/dashboard");
    }
  };

  const isProcessing = stage === "uploading" || stage === "analyzing";
  const currentStep =
    stage === "idle"
      ? 0
      : stage === "uploading"
        ? 1
        : stage === "analyzing"
          ? 2
          : 3;

  const dropzoneStyle = {
    border: `2px dashed ${isDragReject ? "var(--danger)" : isDragActive ? "var(--primary)" : file ? "var(--accent)" : "var(--border-light)"}`,
    borderRadius: "var(--radius-xl)",
    background: isDragActive
      ? "rgba(108,99,255,0.06)"
      : file
        ? "rgba(0,212,170,0.04)"
        : "var(--bg-elevated)",
    padding: "52px 32px",
    textAlign: "center",
    cursor: isProcessing ? "not-allowed" : "pointer",
    transition: "all var(--transition)",
    outline: "none",
  };

  return (
    <div
      className="upload-page"
      style={{
        maxWidth: 700,
        width: "100%",
        margin: "0 auto",
        padding: "0 16px",
        animation: "fadeIn 0.4s ease",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>Upload Your Resume</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Upload a PDF resume to get instant AI-powered feedback and scoring.
        </p>
      </div>

      {/* ── Progress Steps ──────────────────────────────────────── */}
      <div
        className="upload-step-row"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 36,
          gap: 12,
        }}
      >
        {steps.map((step, i) => (
          <React.Fragment key={step.label}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  margin: "0 auto 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  background:
                    i < currentStep
                      ? "var(--accent)"
                      : i === currentStep
                        ? "var(--primary)"
                        : "var(--bg-elevated)",
                  border: `2px solid ${i < currentStep ? "var(--accent)" : i === currentStep ? "var(--primary)" : "var(--border)"}`,
                  transition: "all var(--transition-slow)",
                  boxShadow:
                    i === currentStep ? "0 0 16px var(--primary-glow)" : "none",
                }}
              >
                {i < currentStep ? "✓" : step.icon}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color:
                    i <= currentStep
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                }}
              >
                {step.label}
              </div>
              <div
                className="upload-step-desc"
                style={{
                  fontSize: "0.65rem",
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {step.desc}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: "0 0 32px",
                  height: 2,
                  background:
                    i < currentStep ? "var(--accent)" : "var(--border)",
                  transition: "background var(--transition-slow)",
                  marginBottom: 16,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Dropzone ──────────────────────────────────────────────── */}
      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <div {...getRootProps()} style={dropzoneStyle}>
          <input {...getInputProps()} />

          {stage === "uploading" ? (
            <div>
              <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>📤</div>
              <h3 style={{ marginBottom: 8 }}>Uploading…</h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  marginBottom: 20,
                  fontSize: "0.9rem",
                }}
              >
                {uploadProgress}% complete
              </p>
              <div style={{ maxWidth: 300, margin: "0 auto" }}>
                <ProgressBar
                  value={uploadProgress}
                  color="var(--primary)"
                  animated
                />
              </div>
            </div>
          ) : stage === "analyzing" ? (
            <div>
              <div
                style={{
                  fontSize: "2.5rem",
                  marginBottom: 16,
                  animation: "pulse 1.5s infinite",
                }}
              >
                🤖
              </div>
              <h3 style={{ marginBottom: 8 }}>AI is analyzing your resume…</h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  marginBottom: 20,
                }}
              >
                Extracting skills, scoring sections, generating feedback
              </p>
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: "3px solid var(--border)",
                  borderTopColor: "var(--primary)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto",
                }}
              />
            </div>
          ) : stage === "done" ? (
            <div>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
              <h3 style={{ color: "var(--success)" }}>
                Done! Redirecting to results…
              </h3>
            </div>
          ) : file ? (
            <div>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "var(--radius-lg)",
                  background: "rgba(0,212,170,0.15)",
                  border: "1px solid rgba(0,212,170,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  margin: "0 auto 16px",
                }}
              >
                📄
              </div>
              <h3 style={{ marginBottom: 6, color: "var(--accent)" }}>
                File Selected!
              </h3>
              <p
                style={{
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 4,
                }}
              >
                {file.name}
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  marginBottom: 16,
                }}
              >
                {(file.size / 1024).toFixed(1)} KB · PDF
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  borderRadius: "var(--radius-md)",
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>
                {isDragActive ? "📥" : "☁️"}
              </div>
              <h3 style={{ marginBottom: 8 }}>
                {isDragReject
                  ? "Invalid file type"
                  : isDragActive
                    ? "Drop it here!"
                    : "Drag & drop your resume"}
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  marginBottom: 20,
                  fontSize: "0.9rem",
                }}
              >
                {isDragReject
                  ? "Only PDF files are accepted"
                  : "or click to browse files"}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  background: "var(--primary-glow)",
                  border: "1px solid var(--primary)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--primary-light)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                Browse PDF File
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginTop: 16,
                }}
              >
                Supports: PDF · Max size: 5 MB
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* ── Error Message ─────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(255,107,107,0.1)",
            border: "1px solid rgba(255,107,107,0.3)",
            borderRadius: "var(--radius-md)",
            color: "var(--danger)",
            fontSize: "0.875rem",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ── Action Button ─────────────────────────────────────────── */}
      <Button
        fullWidth
        size="lg"
        loading={isProcessing}
        disabled={!file || isProcessing}
        onClick={handleUploadAndAnalyze}
      >
        {isProcessing
          ? stage === "uploading"
            ? `Uploading… ${uploadProgress}%`
            : "Analyzing with AI…"
          : "⚡ Upload & Analyze Now"}
      </Button>

      {/* ── Tips ──────────────────────────────────────────────────── */}
      <Card
        style={{
          marginTop: 24,
          background: "transparent",
          border: "1px solid var(--border)",
        }}
      >
        <h4
          style={{
            marginBottom: 12,
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
          }}
        >
          For best results:
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "✅ Use a PDF with selectable text (not a scanned image)",
            "✅ Include clear section headers: Experience, Education, Skills",
            "✅ File should be under 5 MB for fastest processing",
            "✅ Make sure contact info (email, LinkedIn) is visible",
          ].map((tip) => (
            <p
              key={tip}
              style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}
            >
              {tip}
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}
