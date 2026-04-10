const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getSubjects, submitFeedback, getMyFeedback } = require('../controllers/studentController');

router.use(protect, authorize('student'));

router.get('/subjects',         getSubjects);
router.post('/feedback',        submitFeedback);
router.get('/feedback/mine',    getMyFeedback);

module.exports = router;
