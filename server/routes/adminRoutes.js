const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllUsers, createUser, deleteUser, toggleUserStatus,
  getAllSubjects, createSubject, updateSubject, deleteSubject,
  getAllFeedback, deleteFeedback, getStats,
} = require('../controllers/adminController');

// All admin routes are protected and require 'admin' role
router.use(protect, authorize('admin'));

// ── Stats ──────────────────────────────────────────────────
router.get('/stats', getStats);

// ── Users ──────────────────────────────────────────────────
router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle', toggleUserStatus);

// ── Subjects ───────────────────────────────────────────────
router.route('/subjects')
  .get(getAllSubjects)
  .post(createSubject);

router.route('/subjects/:id')
  .put(updateSubject)
  .delete(deleteSubject);

// ── Feedback ───────────────────────────────────────────────
router.get('/feedback', getAllFeedback);
router.delete('/feedback/:id', deleteFeedback);

module.exports = router;
