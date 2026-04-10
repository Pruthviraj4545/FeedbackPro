const User = require('../models/User');
const Subject = require('../models/Subject');
const Feedback = require('../models/Feedback');

// ═══════════════════════════════════════════════════════════
//  USER MANAGEMENT
// ═══════════════════════════════════════════════════════════

// GET /api/admin/users  – get all users (optionally filter by role)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

// POST /api/admin/users  – admin creates a user (any role)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, rollNumber } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already exists' });
    const user = await User.create({ name, email, password, role, department, rollNumber });
    const safe = user.toObject(); delete safe.password;
    res.status(201).json({ success: true, data: safe });
  } catch (err) { next(err); }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

// PATCH /api/admin/users/:id/toggle  – activate/deactivate
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════
//  SUBJECT MANAGEMENT
// ═══════════════════════════════════════════════════════════

// GET /api/admin/subjects
exports.getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find().populate('faculty', 'name email department').sort({ createdAt: -1 });
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (err) { next(err); }
};

// POST /api/admin/subjects
exports.createSubject = async (req, res, next) => {
  try {
    const { name, code, department, semester, faculty } = req.body;
    const subject = await Subject.create({ name, code, department, semester, faculty: faculty || null });
    await subject.populate('faculty', 'name email');
    res.status(201).json({ success: true, data: subject });
  } catch (err) { next(err); }
};

// PUT /api/admin/subjects/:id  – update / assign faculty
exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('faculty', 'name email');
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (err) { next(err); }
};

// DELETE /api/admin/subjects/:id
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    // Also remove related feedback
    await Feedback.deleteMany({ subject: req.params.id });
    res.json({ success: true, message: 'Subject and related feedback deleted' });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════
//  FEEDBACK MANAGEMENT
// ═══════════════════════════════════════════════════════════

// GET /api/admin/feedback
exports.getAllFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ isDeleted: false })
      .populate('student', 'name email rollNumber')
      .populate('faculty', 'name email')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: feedback.length, data: feedback });
  } catch (err) { next(err); }
};

// DELETE /api/admin/feedback/:id  – soft delete (moderate)
exports.deleteFeedback = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    feedback.isDeleted = true;
    feedback.deletedReason = reason || 'Removed by admin';
    await feedback.save();
    res.json({ success: true, message: 'Feedback removed' });
  } catch (err) { next(err); }
};

// GET /api/admin/stats  – dashboard overview stats
exports.getStats = async (req, res, next) => {
  try {
    const [students, faculty, subjects, feedbackCount] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      Subject.countDocuments(),
      Feedback.countDocuments({ isDeleted: false }),
    ]);
    const ratingAgg = await Feedback.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    const avgRating = ratingAgg.length ? ratingAgg[0].avg.toFixed(2) : 0;
    res.json({ success: true, data: { students, faculty, subjects, feedbackCount, avgRating } });
  } catch (err) { next(err); }
};
