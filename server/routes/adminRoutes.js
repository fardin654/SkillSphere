const express = require('express');
const router = express.Router();
const {
  getPendingTeachers,
  approveTeacher,
  rejectTeacher,
  getApprovedTeachers,
  getAllStudents,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// All admin routes are protected and restricted to admin role
router.use(protect);
router.use(authorize('admin'));

// GET /api/admin/teachers/pending
router.get('/teachers/pending', getPendingTeachers);

// GET /api/admin/teachers/approved
router.get('/teachers/approved', getApprovedTeachers);

// GET /api/admin/students
router.get('/students', getAllStudents);

// PUT /api/admin/teachers/:id/approve
router.put('/teachers/:id/approve', approveTeacher);

// PUT /api/admin/teachers/:id/reject
router.put('/teachers/:id/reject', rejectTeacher);

module.exports = router;
