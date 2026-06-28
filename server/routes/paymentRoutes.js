const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  verifySession,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// POST /api/payments/create-checkout-session — create Stripe checkout
router.post(
  '/create-checkout-session',
  protect,
  authorize('student'),
  createCheckoutSession
);

// NOTE: The webhook route (POST /api/payments/webhook) is mounted
// directly in server.js before express.json() middleware.

// GET /api/payments/verify-session — verify payment session
router.get('/verify-session', protect, verifySession);

module.exports = router;

