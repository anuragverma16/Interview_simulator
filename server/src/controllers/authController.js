import { body } from 'express-validator';
import User from '../models/User.js';
import CodingStreak from '../models/CodingStreak.js';
import { generateTokens } from '../utils/jwt.js';
import { AppError, asyncHandler, sendSuccess } from '../utils/helpers.js';
import { syncCodingXp } from '../services/achievementService.js';
import { syncMissedDays } from '../services/dailyChallengeService.js';

export const register = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw new AppError('Email already registered', 400);

    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    sendSuccess(res, { user: user.toPublicJSON(), accessToken, refreshToken }, 'Registration successful', 201);
  }),
];

export const login = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) throw new AppError('Account deactivated', 403);

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    sendSuccess(res, { user: user.toPublicJSON(), accessToken, refreshToken }, 'Login successful');
  }),
];

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token required', 400);

  const { verifyRefreshToken } = await import('../utils/jwt.js');
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.userId).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  sendSuccess(res, tokens);
});

export const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }
  sendSuccess(res, null, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    const streak = await CodingStreak.findOne({ userId: req.user._id });
    if (streak) await syncMissedDays(streak);
  }
  await syncCodingXp(req.user._id);
  const user = await User.findById(req.user._id).select('-password -refreshToken');
  sendSuccess(res, user);
});
