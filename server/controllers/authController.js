import User from '../models/User.js';
import { generateTokenAndSetCookie } from '../utils/generateToken.js';
import validator from 'validator';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, username, email, password, confirmPassword, bio } = req.body;

    // 1. Validation: Required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (name, username, email, password).',
      });
    }

    // 2. Validate Password Match
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    // 3. Validate Email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    // 4. Validate Username format
    const cleanedUsername = username.trim().toLowerCase();
    if (cleanedUsername.length < 3 || cleanedUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 30 characters.',
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanedUsername)) {
      return res.status(400).json({
        success: false,
        message: 'Username can only contain alphanumeric characters and underscores.',
      });
    }

    // 5. Enforce Password Strength (minimum 6 chars)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 6. Check for existing email
    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // 7. Check for existing username
    const existingUsername = await User.findOne({ username: cleanedUsername });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose another.',
      });
    }

    // 8. Create User
    const user = await User.create({
      name: name.trim(),
      username: cleanedUsername,
      email: email.trim().toLowerCase(),
      password,
      bio: bio || 'Hey there! I am using PulseChat.',
      isOnline: true,
    });

    // 9. Generate JWT & Set HTTP-Only Cookie
    generateTokenAndSetCookie(user._id, res);

    // 10. Respond with Sanitized User Object
    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        privacy: user.privacy,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message,
    });
  }
};

/**
 * @desc    Login user with email/username and password
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or username, and password.',
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Query user by email OR username, explicitly selecting password
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // Verify Password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // Update online presence
    user.isOnline = true;
    await user.save();

    // Generate JWT & Set Cookie
    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        privacy: user.privacy,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message,
    });
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req, res) => {
  try {
    // If user is authenticated, update online status and lastSeen
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        isOnline: false,
        lastSeen: new Date(),
      });
    }

    // Clear the HTTP-Only cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed: ' + error.message,
    });
  }
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user session: ' + error.message,
    });
  }
};
