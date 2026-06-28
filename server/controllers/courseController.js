const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all active courses
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).populate(
      'educator',
      'name'
    );

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('GetAllCourses error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching courses',
    });
  }
};

// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      'educator',
      'name email'
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('GetCourseById error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching course',
    });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (teacher, admin)
const createCourse = async (req, res) => {
  try {
    const { title, description, price, thumbnailImage } = req.body;

    // Validate required fields
    if (!title || !description || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and price',
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number (in smallest currency unit)',
      });
    }

    const course = await Course.create({
      title,
      description,
      price,
      thumbnailImage: thumbnailImage || '',
      educator: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('CreateCourse error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error creating course',
    });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (teacher who owns it, or admin)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Verify ownership (teacher must own the course; admins can edit any)
    if (
      course.educator.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    const { title, description, price, thumbnailImage, isActive } = req.body;

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a non-negative number (in smallest currency unit)',
        });
      }
      course.price = price;
    }
    if (thumbnailImage !== undefined) course.thumbnailImage = thumbnailImage;
    if (isActive !== undefined) course.isActive = isActive;

    const updatedCourse = await course.save();

    res.status(200).json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    console.error('UpdateCourse error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating course',
    });
  }
};

// @desc    Get courses created by the logged-in teacher
// @route   GET /api/courses/teacher/me
// @access  Private (teacher, admin)
const getTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.find({ educator: req.user.id }).populate(
      'educator',
      'name'
    );

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('GetTeacherCourses error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching teacher courses',
    });
  }
};

// @desc    Get courses enrolled by the logged-in student
// @route   GET /api/courses/enrolled/me
// @access  Private (student)
const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'enrolledCourses',
      populate: {
        path: 'educator',
        select: 'name',
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user.enrolledCourses,
    });
  } catch (error) {
    console.error('GetEnrolledCourses error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching enrolled courses',
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  getTeacherCourses,
  getEnrolledCourses,
};
