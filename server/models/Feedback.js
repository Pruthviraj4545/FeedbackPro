const mongoose = require('mongoose');

/**
 * Feedback Schema – a student submits feedback for a subject (and its faculty)
 */
const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    // Detailed ratings (optional breakdown)
    teachingQuality: { type: Number, min: 1, max: 5 },
    subjectClarity:  { type: Number, min: 1, max: 5 },
    availability:    { type: Number, min: 1, max: 5 },
    // Admin moderation
    isDeleted: { type: Boolean, default: false },
    deletedReason: { type: String, default: '' },
  },
  { timestamps: true }
);

// Prevent duplicate feedback: one student → one feedback per subject
feedbackSchema.index({ student: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
