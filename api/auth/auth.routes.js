const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validators');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (invalidate token)
 * @access  Private
 */
router.post('/logout', protect, authController.logout);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password/:token', authController.resetPassword);

/**
 * @route   GET /api/v1/auth/google
 * @desc    Google OAuth login
 * @access  Public
 */
router.get('/google', authController.googleAuth);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', authController.googleCallback);

/**
 * @route   GET /api/v1/auth/facebook
 * @desc    Facebook OAuth login
 * @access  Public
 */
router.get('/facebook', authController.facebookAuth);

/**
 * @route   GET /api/v1/auth/facebook/callback
 * @desc    Facebook OAuth callback
 * @access  Public
 */
router.get('/facebook/callback', authController.facebookCallback);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, authController.getMe);

module.exports = router;
