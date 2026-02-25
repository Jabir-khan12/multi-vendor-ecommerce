import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, Calendar, Share2, ShieldCheck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { apiClient } from '../config/api';
import './VendorProfile.css';

const VendorProfile = () => {
    const { id } = useParams();
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                const [vendorRes, productsRes] = await Promise.all([
                    apiClient.get(`/api/vendors/${id}`),
                    apiClient.get(`/api/products?vendorId=${id}&limit=100`)
                ]);
                setVendor(vendorRes);
                setProducts(productsRes.products || productsRes);
            } catch (error) {
                console.error('Error fetching vendor data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendorData();
    }, [id]);

    if (loading) return <div className="loading-state container">Loading vendor profile...</div>;
    if (!vendor) return <div className="error-state container">Vendor not found.</div>;


    return (
        <div className="vendor-profile-page">
            {/* Cover Profile */}
            <div
                className="vendor-cover-large"
                style={{ backgroundImage: `url(${vendor.coverImage})` }}
            ></div>

            <div className="container">
                <div className="vendor-header-card glass">
                    <div className="vendor-header-left">
                        <img src={vendor.logo} alt={vendor.storeName} className="vendor-profile-logo" />
                        <div className="vendor-header-info">
                            <div className="vendor-title-wrapper">
                                <h1 className="vendor-header-title">{vendor.storeName}</h1>
                                {vendor.isVerified && (
                                    <ShieldCheck className="verified-icon" size={24} />
                                )}
                            </div>

                            <div className="vendor-meta-row">
                                <div className="vendor-meta-item">
                                    <Star className="star-icon" size={16} fill="currentColor" />
                                    <span>{vendor.rating} ({vendor.reviewsCount || 0} reviews)</span>
                                </div>
                                <div className="vendor-meta-item">
                                    <MapPin size={16} />
                                    <span>{vendor.location || 'Global'}</span>
                                </div>
                                <div className="vendor-meta-item">
                                    <Calendar size={16} />
                                    <span>Joined {new Date(vendor.createdAt).getFullYear()}</span>
                                </div>
                            </div>

                            <p className="vendor-description">{vendor.description}</p>
                        </div>
                    </div>

                    <div className="vendor-header-right">
                        <button className="btn btn-primary w-full">Follow Store</button>
                        <button className="btn btn-outline w-full"><Share2 size={18} /> Share</button>
                    </div>
                </div>
            </div>

            <div className="container vendor-content">
                <div className="section-header">
                    <h2 className="section-title">All Products from {vendor.storeName}</h2>
                    <div className="sort-dropdown">
                        <select>
                            <option>Recommended</option>
                            <option>Newest Arrivals</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-6 mb-10">
                    {products.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </div>

        </div>
    );
};

export default VendorProfile;
