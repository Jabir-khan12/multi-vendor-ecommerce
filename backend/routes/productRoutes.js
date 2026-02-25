import express from 'express';
import Product from '../models/Product.js';
import authMiddleware from '../middleware/authMiddleware.js';
import vendorMiddleware from '../middleware/vendorMiddleware.js';
import checkOwnership from '../middleware/checkOwnership.js';

const router = express.Router();

// Get all products (with filtering, sorting, pagination)
router.get('/', async (req, res) => {
    try {
        const {
            vendorId, search, category,
            minPrice, maxPrice, featured,
            sort = 'newest', page = 1, limit = 12
        } = req.query;

        let filter = {};

        if (vendorId) filter.vendorId = vendorId;
        if (category && category !== 'all') filter.category = category;
        if (featured === 'true') filter.featured = true;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            'price-asc': { price: 1 },
            'price-desc': { price: -1 },
            featured: { featured: -1, createdAt: -1 }
        };
        const sortBy = sortOptions[sort] || sortOptions.newest;

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('vendorId', 'storeName logo')
            .sort(sortBy)
            .skip(skip)
            .limit(Number(limit));

        res.json({
            products,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        });
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
router.post('/', authMiddleware, vendorMiddleware, async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            vendorId: req.vendor.vendorId
        });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update product (Vendor owner only)
router.put('/:id', authMiddleware, vendorMiddleware, checkOwnership('product'), async (req, res) => {
    try {
        const allowedUpdates = ['name', 'description', 'price', 'oldPrice', 'category', 'images', 'stock', 'featured'];
        const updates = {};

        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        updates.updatedAt = Date.now();

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete product (Vendor owner only)
router.delete('/:id', authMiddleware, vendorMiddleware, checkOwnership('product'), async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
