/**
 * routes/resume.js - Resume Management Routes
 *
 * WHAT: Maps HTTP verbs + paths to resumeController functions.
 *       All routes are protected (require valid JWT).
 * WHY:  Applying `protect` at the router level means every resume route is
 *       automatically authenticated with zero repetition.
 */

const express = require('express');
const router = express.Router();
const { uploadResume, getResumes, getResume, deleteResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All resume routes require authentication
router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);

module.exports = router;
