/**
 * models/Resume.js - Mongoose Resume Schema
 *
 * WHAT: Stores metadata for every PDF a user uploads (filename, path, extracted
 *       text, upload date, and a reference to the owning user).
 * HOW:  Each Resume document is linked to a User via a ObjectId ref.  The
 *       extracted text is stored so the AI analysis step can re-read it without
 *       re-parsing the PDF.
 * WHY:  Separating resume storage from analysis results allows a single resume
 *       to be re-analysed in the future with updated AI models.
 */

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // bytes
      required: true,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    extractedText: {
      type: String,
      default: '',
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'analyzed', 'failed'],
      default: 'uploaded',
    },
    // Cloud storage URL (if using cloud in production)
    publicUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Virtual: Human-readable file size ────────────────────────────────────────
resumeSchema.virtual('fileSizeFormatted').get(function () {
  const kb = this.fileSize / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
});

resumeSchema.set('toJSON', { virtuals: true });
resumeSchema.set('toObject', { virtuals: true });

// ── Compound index for user + date (dashboard queries) ───────────────────────
resumeSchema.index({ user: 1, createdAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
