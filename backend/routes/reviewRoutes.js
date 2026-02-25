import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).populate('customerId', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Post a review
router.post('/', async (req, res) => {
    try {
        const { productId, customerId, rating, comment } = req.body;

        // Create review
        const review = new Review({ productId, customerId, rating, comment });
        await review.save();

        // Update product rating (Simplified: real production might use aggregation)
        const product = await Product.findById(productId);
        const reviews = await Review.find({ productId });
        const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

        product.rating = Number(avgRating.toFixed(1));
        product.reviewsCount = reviews.length;
        await product.save();

        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
