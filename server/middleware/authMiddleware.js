import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Route protection middleware to authorize requests using JWTs
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in Authorization headers in Bearer format
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token string
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature against JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretstoryforgekey');

      // Fetch user from MongoDB (excluding hashed password field) and append to req object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        return next(new Error('Authorized user no longer exists'));
      }

      return next(); // Proceed to controller

    } catch (error) {
      res.status(401);
      return next(new Error('Not authorized, token validation failed'));
    }
  }

  // 2. If no token found, deny authorization access
  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no security token provided'));
  }
};
