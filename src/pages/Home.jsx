import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import VendorCard from '../components/VendorCard';
import { apiClient } from '../config/api';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await apiClient.get('/api/products?sort=featured&limit=8');
                setProducts(data.products || data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Discover unique products from independent creators.
                        </h1>
                        <p className="hero-subtitle">
                            AstraMarket is a curated marketplace of premium electronics, fashion, and home goods sourced directly from verified global vendors.
                        </p>
                        <div className="hero-actions">
                            <button className="btn btn-primary">Shop Now</button>
                            <button className="btn btn-outline">Become a Vendor</button>
                        </div>
                    </div>
                </div>
                <div className="hero-blur hero-blur-1"></div>
                <div className="hero-blur hero-blur-2"></div>
            </section>

            {/* Categories */}
            <section className="category-section container">
                <div className="section-header">
                    <h2 className="section-title">Shop by Category</h2>
                </div>
                <div className="category-grid">
                    {['Electronics', 'Fashion', 'Home Goods', 'Beauty'].map(cat => (
                        <div key={cat} className="category-pill">{cat}</div>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="products-section container">
                <div className="section-header">
                    <h2 className="section-title">Trending Products</h2>
                    <button className="view-all-link">View All</button>
                </div>
                {loading ? (
                    <div className="loading-spinner">Loading products...</div>
                ) : (
                    <div className="grid grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>


            {/* Featured Vendors */}
            <section className="vendors-section container">
                <div className="section-header">
                    <h2 className="section-title">Top Vendors</h2>
                    <button className="view-all-link">View All Stores</button>
                </div>
                <div className="grid grid-cols-3 gap-8">
                    {VENDORS.map(vendor => (
                        <VendorCard key={vendor.id} vendor={vendor} />
                    ))}
                </div>
            </section>

            {/* Newsletter / CTA */}
            <section className="cta-section container">
                <div className="cta-box glass">
                    <h2 className="cta-title">Get 15% off your first order!</h2>
                    <p className="cta-text">Join AstraMarket for exclusive deals from top vendors.</p>
                    <div className="cta-form">
                        <input type="email" placeholder="Enter your email" className="cta-input" />
                        <button className="btn btn-primary">Subscribe</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
