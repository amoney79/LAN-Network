const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/v1/payment/mpesa/stk-push
 * @desc    Initiate M-Pesa STK Push
 * @access  Private
 */
router.post('/mpesa/stk-push', protect, paymentController.initiateMpesaPayment);

/**
 * @route   POST /api/v1/payment/mpesa/callback
 * @desc    M-Pesa callback handler
 * @access  Public
 */
router.post('/mpesa/callback', paymentController.mpesaCallback);

/**
 * @route   POST /api/v1/payment/mpesa/query
 * @desc    Query M-Pesa transaction status
 * @access  Private
 */
router.post('/mpesa/query', protect, paymentController.queryMpesaTransaction);

/**
 * @route   POST /api/v1/payment/stripe/create-intent
 * @desc    Create Stripe payment intent
 * @access  Private
 */
router.post('/stripe/create-intent', protect, paymentController.createStripeIntent);

/**
 * @route   POST /api/v1/payment/stripe/webhook
 * @desc    Stripe webhook handler
 * @access  Public
 */
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

/**
 * @route   GET /api/v1/payment/history
 * @desc    Get user payment history
 * @access  Private
 */
router.get('/history', protect, paymentController.getPaymentHistory);

/**
 * @route   GET /api/v1/payment/:id
 * @desc    Get payment details
 * @access  Private
 */
router.get('/:id', protect, paymentController.getPaymentDetails);

module.exports = router;
