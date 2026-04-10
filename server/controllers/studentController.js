const Subject = require('../models/Subject');
const Feedback = require('../models/Feedback');

// GET /api/student/subjects  – all active subjects
exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .populate('faculty', 'name email department')
      .sort({ name: 1 });
    res.json({ success: true, data: subjects });
  } catch (err) { next(err); }
};

// POST /api/student/feedback  – submit feedback
exports.submitFeedback = async (req, res, next) => {
  try {
    const { subject, rating, comment, teachingQuality, subjectClarity, availability } = req.body;

    // Validate subject exists
    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) return res.status(404).json({ success: false, message: 'Subject not found' });
    if (!subjectDoc.faculty) return res.status(400).json({ success: false, message: 'Subject has no assigned faculty' });

    // Check for duplicate
    const existing = await Feedback.findOne({ student: req.user._id, subject });
    if (existing) return res.status(409).json({ success: false, message: 'You have already submitted feedback for this subject' });

    const feedback = await Feedback.create({
      student: req.user._id,
      subject,
      faculty: subjectDoc.faculty,
      rating,
      comment,
      teachingQuality,
      subjectClarity,
      availability,
    });

    res.status(201).json({ success: true, message: 'Feedback submitted successfully', data: feedback });
  } catch (err) { next(err); }
};

// GET /api/student/feedback  – student's own feedback history
exports.getMyFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ student: req.user._id, isDeleted: false })
      .populate('subject', 'name code department')
      .populate('faculty', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: feedback });
  } catch (err) { next(err); }
};
