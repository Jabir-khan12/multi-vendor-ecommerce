import express from 'express';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// All routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/stats - Dashboard overview numbers
router.get('/stats', async (req, res) => {
  try {
    const [userCount, vendorCount, productCount, orderCount, orders] = await Promise.all([
      User.countDocuments(),
      Vendor.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find().select('totalAmount')
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({ userCount, vendorCount, productCount, orderCount, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/vendors?status=pending
router.get('/vendors', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { verificationStatus: status } : {};
    const vendors = await Vendor.find(filter).populate('userId', 'name email createdAt');
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/vendors/:id/approve
router.put('/vendors/:id/approve', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'approved', isVerified: true, rejectionReason: '' },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ message: 'Vendor approved successfully', vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/vendors/:id/reject
router.put('/vendors/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'rejected', isVerified: false, rejectionReason: reason || '' },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ message: 'Vendor rejected', vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/vendors/:id/suspend
router.put('/vendors/:id/suspend', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ message: 'Vendor suspended', vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(filter);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
