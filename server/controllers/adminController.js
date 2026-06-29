const User = require('../models/User');

// @desc    Get all pending teachers
// @route   GET /api/admin/teachers/pending
// @access  Private/Admin
const getPendingTeachers = async (req, res) => {
  try {
    const pendingTeachers = await User.find({
      role: 'teacher',
      approvalStatus: 'pending',
    })
      .select('-password')
      .populate('intendedCourse', 'title');

    res.status(200).json({
      success: true,
      count: pendingTeachers.length,
      data: pendingTeachers,
    });
  } catch (error) {
    console.error('Error fetching pending teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Approve a teacher
// @route   PUT /api/admin/teachers/:id/approve
// @access  Private/Admin
const approveTeacher = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    if (user.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'User is not a teacher',
      });
    }

    user.approvalStatus = 'approved';
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error approving teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Reject a teacher
// @route   PUT /api/admin/teachers/:id/reject
// @access  Private/Admin
const rejectTeacher = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    if (user.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'User is not a teacher',
      });
    }

    user.approvalStatus = 'rejected';
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error rejecting teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Get all approved teachers
// @route   GET /api/admin/teachers/approved
// @access  Private/Admin
const getApprovedTeachers = async (req, res) => {
  try {
    const approvedTeachers = await User.find({
      role: 'teacher',
      approvalStatus: 'approved',
    }).select('-password');

    res.status(200).json({
      success: true,
      data: approvedTeachers,
    });
  } catch (error) {
    console.error('Error fetching approved teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: 'student',
    })
      .select('-password')
      .populate('enrolledCourses', 'title');

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

module.exports = {
  getPendingTeachers,
  approveTeacher,
  rejectTeacher,
  getApprovedTeachers,
  getAllStudents,
};
