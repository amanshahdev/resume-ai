/**
 * routes/analysis.js - Analysis Routes
 *
 * WHAT: Maps HTTP verbs + paths to analysisController functions.
 * NOTE: /history and /stats must be declared BEFORE /:resumeId to avoid Express
 *       treating them as route parameter values.
 */

const express = require('express');
const router = express.Router();
const {
  runAnalysis,
  getAnalysis,
  getAnalysisHistory,
  getDashboardStats,
} = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/history', getAnalysisHistory);
router.get('/stats', getDashboardStats);
router.post('/analyze/:resumeId', runAnalysis);
router.get('/:resumeId', getAnalysis);

module.exports = router;
