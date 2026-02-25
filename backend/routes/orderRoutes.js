import express from 'express';
import Order from '../models/Order.js';
import authMiddleware from '../middleware/authMiddleware.js';
import vendorMiddleware from '../middleware/vendorMiddleware.js';

const router = express.Router();

// Create new order
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must include at least one item' });
        }

        const order = new Order({
            customerId: req.user.userId,
            items,
            totalAmount,
            shippingAddress,
            status: 'pending' // Default
        });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get orders for a customer
router.get('/customer/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'customer' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Customer access required' });
        }

        if (req.user.role !== 'admin' && req.params.id !== req.user.userId) {
            return res.status(403).json({ message: 'You can only view your own orders' });
        }

        const orders = await Order.find({ customerId: req.params.id }).populate('items.productId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order status (vendor: shipped/delivered; admin: any)
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Vendor can only update orders containing their items
        if (req.user.role === 'vendor') {
            const isVendorOrder = order.items.some(
                (item) => item.vendorId?.toString() === req.user.vendorId
            );
            if (!isVendorOrder) {
                return res.status(403).json({ message: 'Not authorized to update this order' });
            }
        } else if (req.user.role === 'customer') {
            // Customer can only cancel own pending orders
            if (status !== 'cancelled' || order.customerId.toString() !== req.user.userId) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }

        order.status = status;
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get orders for a vendor
router.get('/vendor/:id', authMiddleware, vendorMiddleware, async (req, res) => {
    try {
        if (req.params.id !== req.vendor.vendorId.toString()) {
            return res.status(403).json({ message: 'You can only view your own vendor orders' });
        }

        const orders = await Order.find({ 'items.vendorId': req.vendor.vendorId }).populate('items.productId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.productId', 'name images price')
            .populate('customerId', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Only owner, vendor in order, or admin can view
        const isOwner = order.customerId._id?.toString() === req.user.userId ||
                        order.customerId.toString() === req.user.userId;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
