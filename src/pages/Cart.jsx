import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const shipping = cartItems.length > 0 ? 12.50 : 0;
    const tax = cartTotal * 0.08;
    const total = cartTotal + shipping + tax;

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setIsCheckingOut(true);
        try {
            const orderData = {
                customerId: user.id,
                items: cartItems.map(item => ({
                    productId: item._id,
                    quantity: item.quantity,
                    price: item.price,
                    vendorId: item.vendorId._id || item.vendorId
                })),
                totalAmount: total,
                shippingAddress: {
                    street: '123 Test St',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    country: 'USA'
                }
            };

            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                clearCart();
                alert('Order placed successfully!');
                navigate('/');
            } else {
                alert('Failed to place order.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong.');
        } finally {
            setIsCheckingOut(false);
        }
    };


    return (
        <div className="cart-page pb-16 pt-8">
            <div className="container">
                <h1 className="cart-page-title mb-8">Shopping Cart</h1>

                <div className="cart-layout">
                    {/* Cart Items List */}
                    <div className="cart-items-section">
                        <div className="cart-items-header">
                            <span className="items-count">{cartItems.length} Items</span>
                        </div>

                        <div className="cart-items-list">
                            {cartItems.map((item) => (
                                <div key={item._id} className="cart-item glass">
                                    <div className="cart-item-image-wrapper">
                                        <img src={item.images?.[0] || item.image} alt={item.name} className="cart-item-image" />
                                    </div>

                                    <div className="cart-item-details">
                                        <div className="cart-item-header">
                                            <div>
                                                <Link to={`/vendor/${item.vendorId?._id || item.vendorId}`} className="cart-item-vendor">
                                                    {item.vendorId?.storeName || item.vendorName}
                                                </Link>
                                                <h3 className="cart-item-name">{item.name}</h3>
                                            </div>
                                            <button
                                                className="remove-item-btn"
                                                title="Remove Item"
                                                onClick={() => removeFromCart(item._id)}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        <div className="cart-item-bottom">
                                            <div className="quantity-controls">
                                                <button
                                                    className="qty-btn"
                                                    disabled={item.quantity <= 1}
                                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="qty-value">{item.quantity}</span>
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <div className="cart-item-price">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {cartItems.length === 0 && (
                                <div className="cart-empty glass py-20 text-center">
                                    <h3>Your cart is empty</h3>
                                    <p className="mb-8">Looks like you haven't added anything yet.</p>
                                    <Link to="/" className="btn btn-primary">Start Shopping</Link>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Order Summary */}
                    <div className="order-summary-section">
                        <div className="order-summary-card glass">
                            <h2 className="summary-title">Order Summary</h2>

                            <div className="summary-rows">
                                <div className="summary-row">
                                    <span className="summary-label">Subtotal</span>
                                    <span className="summary-value">${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Estimated Shipping</span>
                                    <span className="summary-value">${shipping.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Estimated Tax</span>
                                    <span className="summary-value">${tax.toFixed(2)}</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row summary-total-row">
                                    <span className="summary-label">Total</span>
                                    <span className="summary-value">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary checkout-btn"
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0 || isCheckingOut}
                            >
                                {isCheckingOut ? 'Processing...' : (
                                    <>Proceed to Checkout <ArrowRight size={18} /></>
                                )}
                            </button>

                            <div className="checkout-trust-badges">
                                <div className="trust-badge">
                                    <ShieldCheck size={18} className="trust-icon" />
                                    <span>Secure Payment</span>
                                </div>
                                <div className="trust-badge">
                                    <Truck size={18} className="trust-icon" />
                                    <span>Tracked Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;

