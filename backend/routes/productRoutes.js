import express from 'express';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';

const router = express.Router();

// Get all products (with optional filtering by vendor or search)
router.get('/', async (req, res) => {
    try {
        const { vendorId, search } = req.query;
        let filter = {};

        if (vendorId) filter.vendorId = vendorId;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(filter).populate('vendorId', 'storeName logo');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('vendorId');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create product (Vendor only protected in middleware later)
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
