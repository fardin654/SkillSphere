const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ──────────────────────────────────────────────
// IMPORTANT: Mount the Stripe webhook route BEFORE express.json()
// Stripe requires the raw body for signature verification.
// ──────────────────────────────────────────────
const { stripeWebhook } = require('./controllers/paymentController');
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// ──────────────────────────────────────────────
// Global Middleware
// ──────────────────────────────────────────────

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Security headers
app.use(helmet());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});
app.use('/api', limiter);

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const classSessionRoutes = require('./routes/classSessionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/sessions', classSessionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'SkillSphere API is running' });
});

// ──────────────────────────────────────────────
// Global Error Handler
// ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SkillSphere server running on port ${PORT}`);
});

