const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private (student)
const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    // Check course exists and is active
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (!course.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This course is not currently available for enrollment',
      });
    }

    // Check if student is already enrolled
    const user = await User.findById(req.user.id);
    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course',
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'upi'],
      mode: 'payment',
      currency: 'inr',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: course.title,
              description: course.description.substring(0, 500),
            },
            unit_amount: course.price, // Already in smallest currency unit (paise)
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: courseId.toString(),
        userId: req.user.id.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
    });

    res.status(200).json({
      success: true,
      data: {
        url: session.url,
      },
    });
  } catch (error) {
    console.error('CreateCheckoutSession error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error creating checkout session',
    });
  }
};

// @desc    Handle Stripe webhook events
// @route   POST /api/payments/webhook
// @access  Public (Stripe calls this directly)
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).json({
      success: false,
      message: `Webhook Error: ${error.message}`,
    });
  }

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { courseId, userId } = session.metadata;

    try {
      // Add course to user's enrolledCourses (avoid duplicates with $addToSet)
      await User.findByIdAndUpdate(userId, {
        $addToSet: { enrolledCourses: courseId },
      });

      console.log(
        `Enrollment successful: User ${userId} enrolled in Course ${courseId}`
      );
    } catch (error) {
      console.error('Webhook enrollment error:', error.message);
    }
  }

  res.status(200).json({ received: true });
};

// @desc    Verify a checkout session
// @route   GET /api/payments/verify-session
// @access  Private
const verifySession = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.status(200).json({
      success: true,
      data: {
        status: session.payment_status,
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
      },
    });
  } catch (error) {
    console.error('VerifySession error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error verifying session',
    });
  }
};

module.exports = { createCheckoutSession, stripeWebhook, verifySession };
