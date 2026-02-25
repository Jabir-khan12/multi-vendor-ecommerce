import express from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// POST /api/payments/create-intent
// Auth required — creates a PaymentIntent for the given amount
router.post('/create-intent', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body; // amount in dollars

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: 'usd',
      metadata: {
        userId: req.user.userId,
        email: req.user.email
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe create-intent error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/webhook
// Stripe webhook — verifies signature and updates order status to 'paid'
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Dev fallback: parse raw body
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    try {
      // Update all orders linked to this paymentIntentId
      await Order.updateMany(
        { paymentIntentId: paymentIntent.id },
        { $set: { paymentStatus: 'paid', status: 'processing' } }
      );
      console.log(`✅ Payment succeeded for PaymentIntent: ${paymentIntent.id}`);
    } catch (err) {
      console.error('Error updating order after payment:', err.message);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    await Order.updateMany(
      { paymentIntentId: paymentIntent.id },
      { $set: { paymentStatus: 'failed' } }
    );
  }

  res.json({ received: true });
});

export default router;
