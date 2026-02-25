import React from 'react';
import { Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import './VendorCard.css';

const VendorCard = ({ vendor }) => {
    return (
        <div className="vendor-card">
            <div
                className="vendor-cover"
                style={{ backgroundImage: `url(${vendor.coverImage})` }}
            />
            <div className="vendor-logo-container">
                <img src={vendor.logo} alt={vendor.name} className="vendor-logo" />
                {vendor.verified && (
                    <div className="verified-badge" title="Verified Vendor">
                        <ShieldCheck size={14} />
                    </div>
                )}
            </div>

            <div className="vendor-info">
                <h3 className="vendor-name">{vendor.name}</h3>
                <p className="vendor-category">{vendor.category}</p>

                <div className="vendor-stats">
                    <div className="stat">
                        <Star size={16} className="star-icon" fill="currentColor" />
                        <span className="stat-value">{vendor.rating}</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat">
                        <span className="stat-value">{vendor.productCount}</span>
                        <span className="stat-label">Products</span>
                    </div>
                </div>

                <Link to={`/vendor/${vendor.id}`} className="visit-store-btn">
                    Visit Store <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
};

export default VendorCard;
