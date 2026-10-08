/**
 * models/Analysis.js - Mongoose Analysis Schema
 *
 * WHAT: Stores the full AI analysis result for a given resume, including score,
 *       skills found, missing keywords, feedback, and improvement tips.
 * HOW:  Linked 1-to-1 with a Resume document.  All AI output is persisted here
 *       so results can be retrieved instantly without re-calling the AI API.
 * WHY:  Caching AI results reduces latency, costs, and API rate-limit pressure.
 */

const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      unique: true, // One analysis per resume
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Scoring ──────────────────────────────────────────────────────────────
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    scoreBreakdown: {
      formatting: { type: Number, min: 0, max: 100, default: 0 },
      keywords:   { type: Number, min: 0, max: 100, default: 0 },
      experience: { type: Number, min: 0, max: 100, default: 0 },
      education:  { type: Number, min: 0, max: 100, default: 0 },
      skills:     { type: Number, min: 0, max: 100, default: 0 },
    },

    // ── Skills ───────────────────────────────────────────────────────────────
    skillsFound: {
      type: [String],
      default: [],
    },
    missingKeywords: {
      type: [String],
      default: [],
    },

    // ── Qualitative Analysis ─────────────────────────────────────────────────
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    overallFeedback: {
      type: String,
      default: '',
    },

    // ── Job Matching ─────────────────────────────────────────────────────────
    detectedJobTitle: {
      type: String,
      default: 'Not detected',
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive', 'Unknown'],
      default: 'Unknown',
    },
    industryMatch: {
      type: [String],
      default: [],
    },

    // ── AI Metadata ──────────────────────────────────────────────────────────
    aiModel: {
      type: String,
      default: 'rule-based + huggingface',
    },
    processingTimeMs: {
      type: Number,
      default: 0,
    },
    analysisVersion: {
      type: String,
      default: '1.0',
    },
  },
  {
    timestamps: true,
  }
);

// ── Grade helper virtual ─────────────────────────────────────────────────────
analysisSchema.virtual('grade').get(function () {
  const s = this.overallScore;
  if (s >= 90) return 'A+';
  if (s >= 80) return 'A';
  if (s >= 70) return 'B';
  if (s >= 60) return 'C';
  if (s >= 50) return 'D';
  return 'F';
});

analysisSchema.set('toJSON', { virtuals: true });
analysisSchema.set('toObject', { virtuals: true });

analysisSchema.index({ user: 1, createdAt: -1 });

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;
