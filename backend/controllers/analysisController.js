/**
 * controllers/analysisController.js - AI Analysis Orchestration
 *
 * WHAT: Triggers analysis for a given resume, stores the result, and serves
 *       previously stored analysis results.
 * HOW:  Retrieves the resume's extracted text from MongoDB, calls the AI
 *       analysis service, persists the result in the Analysis collection,
 *       and updates the resume's status field.
 * WHY:  Separating the trigger (this controller) from the logic (aiAnalysisService)
 *       keeps controllers focused on HTTP concerns and makes the service testable.
 */

const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const { analyzeResume } = require('../config/aiAnalysisService');

// ────────────────────────────────────────────────────────────────────────────
// @desc    Run AI analysis on a resume
// @route   POST /api/analysis/analyze/:resumeId
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const runAnalysis = async (req, res, next) => {
  try {
    const { resumeId } = req.params;

    // Verify resume belongs to the requesting user
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    if (!resume.extractedText || resume.extractedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Resume text could not be extracted. Please ensure the PDF contains selectable text (not a scanned image).',
      });
    }

    // Mark as processing
    await Resume.findByIdAndUpdate(resumeId, { status: 'processing' });

    // Run AI analysis
    const analysisResult = await analyzeResume(resume.extractedText);

    // Upsert analysis (re-analysis overwrites previous result)
    const analysis = await Analysis.findOneAndUpdate(
      { resume: resumeId },
      {
        resume: resumeId,
        user: req.user._id,
        overallScore: analysisResult.overallScore,
        scoreBreakdown: analysisResult.scoreBreakdown,
        skillsFound: analysisResult.skillsFound,
        missingKeywords: analysisResult.missingKeywords,
        strengths: analysisResult.strengths,
        weaknesses: analysisResult.weaknesses,
        suggestions: analysisResult.suggestions,
        overallFeedback: analysisResult.overallFeedback,
        detectedJobTitle: analysisResult.detectedJobTitle,
        experienceLevel: analysisResult.experienceLevel,
        industryMatch: analysisResult.industryMatch,
        aiModel: analysisResult.aiModel,
        processingTimeMs: analysisResult.processingTimeMs,
        analysisVersion: analysisResult.analysisVersion,
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Mark resume as analyzed
    await Resume.findByIdAndUpdate(resumeId, { status: 'analyzed' });

    res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully.',
      analysis: {
        ...analysis.toObject(),
        grade: analysis.grade,
      },
    });
  } catch (error) {
    // Mark resume as failed if analysis errors
    if (req.params.resumeId) {
      await Resume.findByIdAndUpdate(req.params.resumeId, { status: 'failed' }).catch(() => {});
    }
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get analysis for a specific resume
// @route   GET /api/analysis/:resumeId
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getAnalysis = async (req, res, next) => {
  try {
    const { resumeId } = req.params;

    // Verify ownership via resume
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id }).select('_id originalName');
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const analysis = await Analysis.findOne({ resume: resumeId });
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No analysis found for this resume. Please run the analysis first.',
      });
    }

    res.status(200).json({
      success: true,
      analysis: {
        ...analysis.toObject(),
        grade: analysis.grade,
      },
      resume: { id: resume._id, originalName: resume.originalName },
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get analysis history for the current user (all resumes)
// @route   GET /api/analysis/history
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getAnalysisHistory = async (req, res, next) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id })
      .populate('resume', 'originalName createdAt fileSize')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const formattedAnalyses = analyses.map((a) => ({
      ...a,
      grade: (() => {
        const s = a.overallScore;
        if (s >= 90) return 'A+';
        if (s >= 80) return 'A';
        if (s >= 70) return 'B';
        if (s >= 60) return 'C';
        if (s >= 50) return 'D';
        return 'F';
      })(),
    }));

    res.status(200).json({
      success: true,
      count: formattedAnalyses.length,
      analyses: formattedAnalyses,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get user dashboard stats
// @route   GET /api/analysis/stats
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalResumes, analyses] = await Promise.all([
      Resume.countDocuments({ user: req.user._id }),
      Analysis.find({ user: req.user._id }).select('overallScore createdAt').lean(),
    ]);

    const scores = analyses.map((a) => a.overallScore);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const latestAnalysis = analyses.length > 0 ? analyses[0] : null;

    res.status(200).json({
      success: true,
      stats: {
        totalResumes,
        totalAnalyses: analyses.length,
        averageScore: avgScore,
        highestScore,
        latestScore: latestAnalysis ? latestAnalysis.overallScore : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { runAnalysis, getAnalysis, getAnalysisHistory, getDashboardStats };
