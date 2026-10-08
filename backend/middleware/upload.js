/**
 * middleware/upload.js - Multer File Upload Configuration
 *
 * WHAT: Configures multer disk storage for PDF resume uploads, enforcing file-
 *       type validation and a 25 MB size limit.
 * HOW:  Generates a timestamped unique filename, stores files in /uploads, and
 *       rejects any file that is not application/pdf.
 * WHY:  Keeping upload config in its own file lets any route import it cleanly,
 *       and centralises security constraints (size, type) in one place.
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Disk Storage Configuration ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Pattern: userId_timestamp_originalname.pdf
    const userId = req.user ? req.user._id.toString() : "unknown";
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    const safeOriginal = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(ext, "");
    const filename = `${userId}_${timestamp}_${safeOriginal}${ext}`;
    cb(null, filename);
  },
});

// ── File Filter: Only allow PDFs ──────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf"];
  const allowedExtensions = [".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF resume/CV files are allowed. Please upload a .pdf file.",
      ),
      false,
    );
  }
};

// ── Multer Instance ───────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 25 * 1024 * 1024, // 25 MB
    files: 1,
  },
});

module.exports = upload;
