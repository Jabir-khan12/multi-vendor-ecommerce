import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// Create new order
router.post('/', async (req, res) => {
    try {
        const { customerId, items, totalAmount, shippingAddress } = req.body;
        const order = new Order({
            customerId,
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
router.get('/customer/:id', async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.params.id }).populate('items.productId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get orders for a vendor
router.get('/vendor/:id', async (req, res) => {
    try {
        const orders = await Order.find({ 'items.vendorId': req.params.id }).populate('items.productId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
