import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { uploadDir } from '../middleware/upload.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';
export const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, req.user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'avatar', 'profile'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  sendSuccess(res, user, 'Profile updated');
});

export const updateSettings = asyncHandler(async (req, res) => {  const user = await User.findById(req.user._id);
  if (req.body.settings) {
    user.settings = { ...user.settings.toObject(), ...req.body.settings };
  }
  await user.save();
  sendSuccess(res, user, 'Settings updated');
});

export const getStats = asyncHandler(async (req, res) => {
  sendSuccess(res, req.user.stats);
});

export const uploadAvatarImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No image uploaded', 400);

  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404);

  if (user.avatar) {
    const oldPath = path.join(uploadDir, path.basename(user.avatar));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const avatarPath = `/uploads/${req.file.filename}`;
  user.avatar = avatarPath;
  await user.save();

  sendSuccess(res, user.toPublicJSON(), 'Avatar updated');
});