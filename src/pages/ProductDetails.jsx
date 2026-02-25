import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { apiClient } from '../config/api';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        const fetchProductAndReviews = async () => {
            try {
                const [productRes, reviewsRes] = await Promise.all([
                    apiClient.get(`/api/products/${id}`),
                    apiClient.get(`/api/reviews/product/${id}`)
                ]);
                setProduct(productRes);
                setReviews(reviewsRes);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductAndReviews();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert('Please login to leave a review');

        try {
            const savedReview = await apiClient.post('/api/reviews', {
                productId: id,
                customerId: user.userId || user.id,
                ...newReview
            });
            setReviews([...reviews, { ...savedReview, customerId: { name: user.name } }]);
            setNewReview({ rating: 5, comment: '' });
            // Update product stats locally
            setProduct(prev => ({
                ...prev,
                reviewsCount: (prev.reviewsCount || 0) + 1,
                rating: Number(((prev.rating * (prev.reviewsCount || 0) + newReview.rating) / ((prev.reviewsCount || 0) + 1)).toFixed(1))
            }));
        } catch (error) {
            console.error('Error posting review:', error);
        }
    };

    if (loading) return <div className="container py-20">Loading product...</div>;
    if (!product) return <div className="container py-20">Product not found.</div>;

    return (
        <div className="product-details-page container py-12">
            <Link to="/" className="back-link mb-8 inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors">
                <ArrowLeft size={20} /> Back to Products
            </Link>

            <div className="product-main-grid grid grid-cols-2 gap-12 mb-20">
                <div className="product-gallery">
                    <div className="main-image-wrapper glass rounded-3xl overflow-hidden aspect-square">
                        <img src={product.images?.[0] || product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                </div>

                <div className="product-info-stack">
                    <Link to={`/vendor/${product.vendorId?._id || product.vendorId}`} className="vendor-tag text-primary font-medium mb-2 block">
                        {product.vendorId?.storeName || 'Verified Vendor'}
                    </Link>
                    <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                            <Star size={18} fill="#f59e0b" color="#f59e0b" />
                            <span className="font-bold">{product.rating}</span>
                        </div>
                        <span className="text-secondary">{product.reviewsCount || 0} customer reviews</span>
                    </div>

                    <div className="price-tag text-3xl font-bold mb-6">${product.price.toFixed(2)}</div>

                    <p className="description text-secondary mb-8 leading-relaxed">
                        {product.description}
                    </p>

                    <button
                        className="btn btn-primary w-full py-4 text-lg flex justify-center items-center gap-3 mb-8"
                        onClick={() => addToCart(product)}
                    >
                        <ShoppingCart size={24} /> Add to Cart
                    </button>

                    <div className="trust-features grid grid-cols-2 gap-4">
                        <div className="feature glass p-4 rounded-2xl flex items-center gap-3">
                            <ShieldCheck className="text-primary" />
                            <span className="text-sm">2 Year Warranty</span>
                        </div>
                        <div className="feature glass p-4 rounded-2xl flex items-center gap-3">
                            <Truck className="text-primary" />
                            <span className="text-sm">Free Express Shipping</span>
                        </div>
                    </div>
                </div>
            </div>

            <section className="reviews-section">
                <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="review-form-container">
                        <div className="glass p-8 rounded-3xl">
                            <h3 className="text-xl font-bold mb-6">Write a Review</h3>
                            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm text-secondary mb-2">Rating</label>
                                    <select
                                        value={newReview.rating}
                                        onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                                    >
                                        <option value="5">5 - Excellent</option>
                                        <option value="4">4 - Very Good</option>
                                        <option value="3">3 - Good</option>
                                        <option value="2">2 - Fair</option>
                                        <option value="1">1 - Poor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-secondary mb-2">Comment</label>
                                    <textarea
                                        placeholder="Share your thoughts about this product..."
                                        value={newReview.comment}
                                        onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white h-32"
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary py-3">Submit Review</button>
                            </form>
                        </div>
                    </div>

                    <div className="reviews-list lg:col-span-2 flex flex-col gap-6">
                        {reviews.length > 0 ? reviews.map(review => (
                            <div key={review._id} className="review-item glass p-6 rounded-2xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="font-bold">{review.customerId?.name}</div>
                                        <div className="flex gap-1 mt-1 text-primary">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-secondary">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-secondary">{review.comment}</p>
                            </div>
                        )) : (
                            <div className="text-center py-10 opacity-50">No reviews yet. Be the first to review!</div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductDetails;
