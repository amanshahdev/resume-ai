/**
 * models/User.js - Mongoose User Schema
 *
 * WHAT: Defines the MongoDB document shape for application users.
 * HOW:  Uses bcryptjs to hash passwords before saving; exposes a comparePassword
 *       instance method so controllers never touch raw password strings.
 * WHY:  Centralising the schema and hashing logic here keeps controllers lean
 *       and ensures passwords are NEVER stored in plain text.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries by default
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    totalResumesUploaded: {
      type: Number,
      default: 0,
    },
    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Pre-save Hook: Hash password before saving ────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if the password field was modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ── Instance Method: Compare plain-text password with hashed ─────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance Method: Return safe user object (no password) ───────────────────
userSchema.methods.toSafeObject = function () {
  const { password, __v, ...safeUser } = this.toObject();
  return safeUser;
};

// ── Index for faster email lookups ────────────────────────────────────────────
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
