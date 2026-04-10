const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMySubjects, getFeedback, getAnalytics, getStats } = require('../controllers/facultyController');

router.use(protect, authorize('faculty'));

router.get('/subjects',  getMySubjects);
router.get('/feedback',  getFeedback);
router.get('/analytics', getAnalytics);
router.get('/stats',     getStats);

module.exports = router;
