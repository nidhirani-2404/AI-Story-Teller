import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper function to sign JWT tokens
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretstoryforgekey', {
    expiresIn: '30d', // Expiry duration
  });
};

// @desc    Register a new user
// @route   POST /api/user/signup
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validation check
    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please fill in all signup fields');
    }

    // 2. Check if user already exists in database
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with that email');
    }

    // 3. Create user in database (triggers password pre-save hashing)
    const user = await User.create({
      username,
      email,
      password,
    });

    // 4. Return created user metadata + JWT authorization token
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      },
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/user/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validation check
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // 2. Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // 3. Check password matching via schema instance method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // 4. Return user metadata + active authorization token
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      },
    });

  } catch (error) {
    next(error);
  }
};
