import Vendor from '../models/Vendor.js';

/**
 * Middleware to verify user is a vendor
 * Must be used AFTER authMiddleware
 * Checks that:
 * 1. User role is 'vendor'
 * 2. User has an active vendor record
 * 3. Vendor is verified (optional - can be enforced)
 */
const vendorMiddleware = async (req, res, next) => {
  try {
    // Check if user role is vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'This action requires vendor privileges.'
      });
    }

    // Find vendor record for this user
    const vendor = await Vendor.findOne({ userId: req.user.userId });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: 'Vendor profile not found.'
      });
    }

    // Attach vendor info to request
    req.vendor = {
      vendorId: vendor._id,
      storeName: vendor.storeName,
      isVerified: vendor.isVerified,
      verificationStatus: vendor.verificationStatus || 'pending'
    };

    next();
  } catch (error) {
    console.error('Vendor middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying vendor status.'
    });
  }
};

export default vendorMiddleware;
