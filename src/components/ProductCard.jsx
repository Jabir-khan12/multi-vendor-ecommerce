import { Star, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <div className="product-card">
            <div className="product-image-container">
                <img
                    src={product.images && product.images[0] ? product.images[0] : product.image}
                    alt={product.name}
                    className="product-image"
                />
                <div className="product-actions">
                    <button className="add-to-cart-quick" onClick={() => addToCart(product)}>
                        <ShoppingCart size={20} />
                    </button>
                </div>

            </div>

            <div className="product-info">
                <div className="product-vendor">
                    <Link to={`/vendor/${product.vendorId?._id || product.vendorId}`}>
                        {product.vendorId?.storeName || product.vendorName}
                    </Link>
                </div>
                <h3 className="product-name" title={product.name}>{product.name}</h3>

                <div className="product-rating">
                    <Star size={14} className="star-icon" fill="currentColor" />
                    <span>{product.rating}</span>
                    <span className="review-count">({product.reviewsCount || product.reviews})</span>
                </div>


                <div className="product-price-row">
                    <div className="price">${product.price.toFixed(2)}</div>
                    {product.oldPrice && (
                        <div className="old-price">${product.oldPrice.toFixed(2)}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
