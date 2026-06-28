const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Course price is required'],
    },
    thumbnailImage: {
      type: String,
      default: '',
    },
    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Educator is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', courseSchema);
