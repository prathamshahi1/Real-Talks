import User from '../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * @desc    Search users by name, username, or email
 * @route   GET /api/users/search?q=...
 * @access  Private
 */
export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q || '';
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      // If query is empty, return latest active users (excluding current user)
      const users = await User.find({ _id: { $ne: req.user._id } })
        .select('name username email avatar bio isOnline lastSeen')
        .sort({ isOnline: -1, updatedAt: -1 })
        .limit(20);

      return res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    }

    // Escape regex special characters for safety
    const safeRegex = new RegExp(trimmedQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ username: safeRegex }, { name: safeRegex }, { email: safeRegex }],
    })
      .select('name username email avatar bio isOnline lastSeen')
      .limit(20);

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Search Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users: ' + error.message,
    });
  }
};

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/profile/:id
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name username email avatar bio isOnline lastSeen privacy createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile: ' + error.message,
    });
  }
};

/**
 * @desc    Update authenticated user profile (name, bio, avatar)
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    if (avatar && avatar.trim()) {
      user.avatar = avatar.trim();
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        isOnline: updatedUser.isOnline,
        lastSeen: updatedUser.lastSeen,
        privacy: updatedUser.privacy,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile: ' + error.message,
    });
  }
};

/**
 * @desc    Change authenticated user password
 * @route   PUT /api/users/password
 * @access  Private
 */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    user.password = newPassword;
    await user.save(); // Triggers pre('save') bcrypt hashing

    res.status(200).json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password: ' + error.message,
    });
  }
};

/**
 * @desc    Update user privacy settings
 * @route   PUT /api/users/privacy
 * @access  Private
 */
export const updatePrivacy = async (req, res) => {
  try {
    const { showOnlineStatus, showLastSeen, readReceipts, typingIndicator } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.privacy = {
      showOnlineStatus: showOnlineStatus ?? user.privacy.showOnlineStatus,
      showLastSeen: showLastSeen ?? user.privacy.showLastSeen,
      readReceipts: readReceipts ?? user.privacy.readReceipts,
      typingIndicator: typingIndicator ?? user.privacy.typingIndicator,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated.',
      privacy: user.privacy,
    });
  } catch (error) {
    console.error('Update Privacy Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update privacy settings: ' + error.message,
    });
  }
};

/**
 * @desc    Block a user
 * @route   POST /api/users/block/:id
 * @access  Private
 */
export const blockUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself.',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user.blockedUsers.includes(targetUserId)) {
      user.blockedUsers.push(targetUserId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'User blocked successfully.',
      blockedUsers: user.blockedUsers,
    });
  } catch (error) {
    console.error('Block User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user: ' + error.message,
    });
  }
};

/**
 * @desc    Unblock a user
 * @route   POST /api/users/unblock/:id
 * @access  Private
 */
export const unblockUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const user = await User.findById(req.user._id);

    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== targetUserId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully.',
      blockedUsers: user.blockedUsers,
    });
  } catch (error) {
    console.error('Unblock User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user: ' + error.message,
    });
  }
};

/**
 * @desc    Get list of blocked users
 * @route   GET /api/users/blocked
 * @access  Private
 */
export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'blockedUsers',
      'name username avatar email'
    );

    res.status(200).json({
      success: true,
      blockedUsers: user.blockedUsers || [],
    });
  } catch (error) {
    console.error('Get Blocked Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve blocked users: ' + error.message,
    });
  }
};
