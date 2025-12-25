const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            authProvider: 'local'
        });

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Store refresh token in Redis
        await req.app.locals.redis.setEx(
            `refresh_token:${user._id}`,
            30 * 24 * 60 * 60, // 30 days
            refreshToken
        );

        logger.info(`New user registered: ${email}`);

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                },
                token,
                refreshToken
            }
        });
    } catch (error) {
        logger.error('Registration error:', error);
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Store refresh token in Redis
        await req.app.locals.redis.setEx(
            `refresh_token:${user._id}`,
            30 * 24 * 60 * 60,
            refreshToken
        );

        logger.info(`User logged in: ${email}`);

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    plan: user.currentPlan
                },
                token,
                refreshToken
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        next(error);
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
    try {
        // Remove refresh token from Redis
        await req.app.locals.redis.del(`refresh_token:${req.user.id}`);

        // Add token to blacklist
        const token = req.headers.authorization.split(' ')[1];
        await req.app.locals.redis.setEx(
            `blacklist:${token}`,
            7 * 24 * 60 * 60, // 7 days
            'true'
        );

        logger.info(`User logged out: ${req.user.email}`);

        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        logger.error('Logout error:', error);
        next(error);
    }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Refresh token required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Check if refresh token exists in Redis
        const storedToken = await req.app.locals.redis.get(`refresh_token:${decoded.id}`);
        if (storedToken !== refreshToken) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid refresh token'
            });
        }

        // Generate new access token
        const newToken = generateToken(decoded.id);

        res.status(200).json({
            status: 'success',
            data: {
                token: newToken
            }
        });
    } catch (error) {
        logger.error('Refresh token error:', error);
        res.status(401).json({
            status: 'error',
            message: 'Invalid or expired refresh token'
        });
    }
};

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'No user found with that email'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save to database
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link expires in 10 minutes.</p>
            `
        });

        logger.info(`Password reset email sent to: ${email}`);

        res.status(200).json({
            status: 'success',
            message: 'Password reset email sent'
        });
    } catch (error) {
        logger.error('Forgot password error:', error);
        next(error);
    }
};

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired reset token'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        logger.info(`Password reset successful for: ${user.email}`);

        res.status(200).json({
            status: 'success',
            message: 'Password reset successful'
        });
    } catch (error) {
        logger.error('Reset password error:', error);
        next(error);
    }
};

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        logger.error('Get me error:', error);
        next(error);
    }
};

// OAuth methods (simplified - full implementation requires passport setup)
exports.googleAuth = (req, res) => {
    res.status(501).json({ message: 'Google OAuth not yet implemented' });
};

exports.googleCallback = (req, res) => {
    res.status(501).json({ message: 'Google OAuth callback not yet implemented' });
};

exports.facebookAuth = (req, res) => {
    res.status(501).json({ message: 'Facebook OAuth not yet implemented' });
};

exports.facebookCallback = (req, res) => {
    res.status(501).json({ message: 'Facebook OAuth callback not yet implemented' });
};
