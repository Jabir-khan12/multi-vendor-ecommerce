import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { ShieldCheck, Truck, ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../config/api';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey && !stripePublicKey.includes('placeholder')
  ? loadStripe(stripePublicKey)
  : null;

const initialAddress = { street: '', city: '', state: '', zipCode: '', country: 'USA' };

const StripePaymentForm = ({ onSuccess, onBack, total, isPlaceholder }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    if (isPlaceholder) { onSuccess(null); return; }
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { error: stripeError } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
      if (stripeError) setError(stripeError.message);
      else onSuccess();
    } catch (err) {
      setError(err.message || 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0 }}>Payment Details</h2>
      </div>
      {isPlaceholder ? (
        <div className="glass" style={{ padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', opacity: 0.8 }}>
          <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Dev Mode:</strong> No Stripe key — using test order flow.</p>
        </div>
      ) : (
        <div style={{ marginBottom: '1rem' }}><PaymentElement /></div>
      )}
      {error && <p style={{ color: '#ef4444', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{error}</p>}
      <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} type="submit" disabled={loading || (!isPlaceholder && !stripe)}>
        {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
      <p style={{ fontSize: '0.75rem', opacity: 0.6, textAlign: 'center', marginTop: '0.75rem' }}>Your payment is encrypted and secure.</p>
    </form>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState('address');
  const [address, setAddress] = useState(initialAddress);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [error, setError] = useState('');
  const isPlaceholder = !stripePublicKey || stripePublicKey.includes('placeholder');

  const pricing = useMemo(() => {
    const shipping = cartItems.length > 0 ? 12.5 : 0;
    const tax = cartTotal * 0.08;
    return { shipping, tax, total: cartTotal + shipping + tax * 0.08 + tax };
  }, [cartItems, cartTotal]);

  useEffect(() => {
    if (!user) navigate('/login');
    else if (cartItems.length === 0) navigate('/cart');
  }, [user, cartItems, navigate]);

  if (!user || cartItems.length === 0) return null;

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoadingIntent(true);
    try {
      if (!isPlaceholder) {
        const data = await apiClient.post('/api/payments/create-intent', { amount: pricing.total });
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      }
      setStep('payment');
    } catch (err) {
      setError(err?.message || 'Failed to initialize payment.');
    } finally {
      setIsLoadingIntent(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      await apiClient.post('/api/orders', {
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price,
          vendorId: item.vendorId?._id || item.vendorId
        })),
        totalAmount: pricing.total,
        shippingAddress: address,
        paymentIntentId: paymentIntentId || undefined
      });
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err?.message || 'Order placement failed.');
    }
  };

  const stripeOptions = clientSecret ? {
    clientSecret,
    appearance: { theme: 'night', variables: { colorPrimary: '#818cf8', colorBackground: '#1e1b4b', colorText: '#e2e8f0' } }
  } : null;

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <span style={{ fontWeight: step === 'address' ? 700 : 400, opacity: step === 'address' ? 1 : 0.5 }}>1. Shipping</span>
        <span style={{ opacity: 0.4 }}>›</span>
        <span style={{ fontWeight: step === 'payment' ? 700 : 400, opacity: step === 'payment' ? 1 : 0.5 }}>2. Payment</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div>
          {step === 'address' && (
            <form onSubmit={handleAddressSubmit} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
              <h2 style={{ marginBottom: '1rem' }}>Shipping Address</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input required placeholder="Street" value={address.street} onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input required placeholder="City" value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} />
                  <input required placeholder="State" value={address.state} onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input required placeholder="ZIP Code" value={address.zipCode} onChange={(e) => setAddress((p) => ({ ...p, zipCode: e.target.value }))} />
                  <input required placeholder="Country" value={address.country} onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))} />
                </div>
              </div>
              {error && <p style={{ color: '#ef4444', marginTop: '0.75rem' }}>{error}</p>}
              <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} type="submit" disabled={isLoadingIntent}>
                {isLoadingIntent ? 'Loading...' : 'Continue to Payment'}
              </button>
            </form>
          )}
          {step === 'payment' && (
            stripeOptions && !isPlaceholder ? (
              <Elements stripe={stripePromise} options={stripeOptions}>
                <StripePaymentForm onSuccess={handlePaymentSuccess} onBack={() => setStep('address')} total={pricing.total} isPlaceholder={false} />
              </Elements>
            ) : (
              <StripePaymentForm onSuccess={handlePaymentSuccess} onBack={() => setStep('address')} total={pricing.total} isPlaceholder={true} />
            )
          )}
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1rem' }}>Order Summary</h2>
          <div style={{ marginBottom: '1rem', display: 'grid', gap: '0.5rem' }}>
            {cartItems.map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ opacity: 0.9 }}>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr style={{ opacity: 0.2 }} />
          <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><span>${pricing.shipping.toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax (8%)</span><span>${pricing.tax.toFixed(2)}</span></div>
            <hr style={{ opacity: 0.2 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Total</span><span>${pricing.total.toFixed(2)}</span></div>
          </div>
          <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, fontSize: '0.85rem' }}><ShieldCheck size={16} /><span>SSL encrypted</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, fontSize: '0.85rem' }}><CreditCard size={16} /><span>Powered by Stripe</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, fontSize: '0.85rem' }}><Truck size={16} /><span>Tracked delivery</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
