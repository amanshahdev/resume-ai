/**
 * controllers/resumeController.js - Resume Upload & Management
 *
 * WHAT: Handles PDF upload (via multer), text extraction (via pdf-parse),
 *       listing, retrieving, and deleting resumes.
 * HOW:  After multer saves the file, pdf-parse reads it and extracts raw text.
 *       All metadata + text is persisted to MongoDB.  The user's resume counter
 *       is incremented atomically.
 * WHY:  Separating upload logic from analysis logic means we can re-analyse
 *       a resume later without re-uploading.
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const User = require('../models/User');

// ────────────────────────────────────────────────────────────────────────────
// @desc    Upload a new resume
// @route   POST /api/resume/upload
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    const { originalname, filename, path: filePath, size, mimetype } = req.file;

    // ── Extract text from PDF ─────────────────────────────────────────────
    let extractedText = '';
    let pageCount = 1;
    let wordCount = 0;

    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text || '';
      pageCount = pdfData.numpages || 1;
      wordCount = extractedText.split(/\s+/).filter(Boolean).length;
    } catch (parseError) {
      console.warn('PDF parsing warning:', parseError.message);
      // Don't fail the upload if parsing fails — still save the file
      extractedText = '';
    }

    // ── Save Resume document ──────────────────────────────────────────────
    const resume = await Resume.create({
      user: req.user._id,
      originalName: originalname,
      fileName: filename,
      filePath: filePath,
      fileSize: size,
      mimeType: mimetype,
      extractedText,
      wordCount,
      pageCount,
      status: extractedText ? 'uploaded' : 'failed',
    });

    // ── Increment user's resume counter ───────────────────────────────────
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalResumesUploaded: 1 } });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully.',
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        fileSize: resume.fileSize,
        fileSizeFormatted: resume.fileSizeFormatted,
        wordCount: resume.wordCount,
        pageCount: resume.pageCount,
        status: resume.status,
        createdAt: resume.createdAt,
        hasText: extractedText.length > 0,
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get all resumes for the current user
// @route   GET /api/resume
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getResumes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [resumes, total] = await Promise.all([
      Resume.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Resume.countDocuments({ user: req.user._id }),
    ]);

    // Attach analysis status to each resume
    const resumeIds = resumes.map((r) => r._id);
    const analyses = await Analysis.find({ resume: { $in: resumeIds } })
      .select('resume overallScore createdAt')
      .lean();

    const analysisMap = {};
    analyses.forEach((a) => {
      analysisMap[a.resume.toString()] = a;
    });

    const resumesWithAnalysis = resumes.map((r) => ({
      ...r,
      fileSizeFormatted:
        r.fileSize < 1024 * 1024
          ? `${(r.fileSize / 1024).toFixed(1)} KB`
          : `${(r.fileSize / (1024 * 1024)).toFixed(1)} MB`,
      analysis: analysisMap[r._id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      count: resumes.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      resumes: resumesWithAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get a single resume by ID (must belong to the user)
// @route   GET /api/resume/:id
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const analysis = await Analysis.findOne({ resume: resume._id });

    res.status(200).json({
      success: true,
      resume: {
        ...resume.toObject(),
        fileSizeFormatted: resume.fileSizeFormatted,
      },
      analysis: analysis || null,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Delete a resume and its analysis
// @route   DELETE /api/resume/:id
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    // Delete file from disk
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    // Delete analysis
    await Analysis.deleteOne({ resume: resume._id });

    // Delete resume document
    await Resume.deleteOne({ _id: resume._id });

    res.status(200).json({ success: true, message: 'Resume deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResume, getResumes, getResume, deleteResume };
