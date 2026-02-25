/**
 * Middleware to verify user is an admin
 * Must be used AFTER authMiddleware
 * Checks that user role is 'admin'
 */
const adminMiddleware = (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This action requires admin privileges.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying admin status.'
    });
  }
};

export default adminMiddleware;
