const Subject = require('../models/Subject');
const Feedback = require('../models/Feedback');

// GET /api/faculty/subjects  – subjects assigned to this faculty
exports.getMySubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ faculty: req.user._id, isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: subjects });
  } catch (err) { next(err); }
};

// GET /api/faculty/feedback  – all feedback for faculty's subjects (with optional ?subject=id filter)
exports.getFeedback = async (req, res, next) => {
  try {
    const filter = { faculty: req.user._id, isDeleted: false };
    if (req.query.subject) filter.subject = req.query.subject;

    const feedback = await Feedback.find(filter)
      .populate('student', 'name rollNumber department')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: feedback.length, data: feedback });
  } catch (err) { next(err); }
};

// GET /api/faculty/analytics  – rating averages per subject
exports.getAnalytics = async (req, res, next) => {
  try {
    const analytics = await Feedback.aggregate([
      { $match: { faculty: req.user._id, isDeleted: false } },
      {
        $group: {
          _id: '$subject',
          avgRating:         { $avg: '$rating' },
          avgTeaching:       { $avg: '$teachingQuality' },
          avgClarity:        { $avg: '$subjectClarity' },
          avgAvailability:   { $avg: '$availability' },
          totalFeedback:     { $sum: 1 },
          ratings: { $push: '$rating' },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: '$subject' },
      { $sort: { avgRating: -1 } },
    ]);

    // Rating distribution across all feedback
    const distribution = await Feedback.aggregate([
      { $match: { faculty: req.user._id, isDeleted: false } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: { analytics, distribution } });
  } catch (err) { next(err); }
};

// GET /api/faculty/stats  – quick summary numbers
exports.getStats = async (req, res, next) => {
  try {
    const [subjectCount, feedbackCount] = await Promise.all([
      Subject.countDocuments({ faculty: req.user._id, isActive: true }),
      Feedback.countDocuments({ faculty: req.user._id, isDeleted: false }),
    ]);
    const ratingAgg = await Feedback.aggregate([
      { $match: { faculty: req.user._id, isDeleted: false } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    const avgRating = ratingAgg.length ? parseFloat(ratingAgg[0].avg.toFixed(2)) : 0;
    res.json({ success: true, data: { subjectCount, feedbackCount, avgRating } });
  } catch (err) { next(err); }
};
