import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Trash2, Edit, X, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import { apiClient } from '../config/api';
import './VendorDashboard.css';

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Beauty', 'Food', 'Automotive', 'Other'];

const emptyProduct = { name: '', description: '', price: '', category: 'Electronics', stock: '', image: '', oldPrice: '', featured: false };

const statusColors = {
  pending: { bg: '#fef3c7', color: '#92400e' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  shipped: { bg: '#d1fae5', color: '#065f46' },
  delivered: { bg: '#d1fae5', color: '#065f46' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' }
};

const VendorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const vendorId = user?.vendorId;

    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState(emptyProduct);
    const [formError, setFormError] = useState('');
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [toastMsg, setToastMsg] = useState('');

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3000);
    };

    const fetchData = useCallback(async () => {
        if (!vendorId) return;
        setLoading(true);
        try {
            const [productsRes, ordersRes] = await Promise.all([
                apiClient.get(`/api/products?vendorId=${vendorId}&limit=100`),
                apiClient.get(`/api/orders/vendor/${vendorId}`)
            ]);
            setProducts(productsRes.products || productsRes);
            setOrders(ordersRes);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [vendorId]);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user.role !== 'vendor') { navigate('/'); return; }
        fetchData();
    }, [user, navigate, fetchData]);

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData(emptyProduct);
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            category: product.category || 'Electronics',
            stock: product.stock || '',
            image: product.images?.[0] || '',
            oldPrice: product.oldPrice || '',
            featured: product.featured || false
        });
        setFormError('');
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSubmitting(true);
        const payload = { ...formData, images: [formData.image], price: Number(formData.price), stock: Number(formData.stock) };
        if (formData.oldPrice) payload.oldPrice = Number(formData.oldPrice);
        delete payload.image;
        try {
            if (editingProduct) {
                await apiClient.put(`/api/products/${editingProduct._id}`, payload);
                showToast('Product updated successfully!');
            } else {
                await apiClient.post('/api/products', payload);
                showToast('Product added successfully!');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            setFormError(error?.message || 'Failed to save product.');
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDelete = async (productId) => {
        try {
            await apiClient.delete(`/api/products/${productId}`);
            setDeleteConfirm(null);
            showToast('Product deleted.');
            fetchData();
        } catch (error) {
            showToast('Delete failed: ' + (error?.message || 'Unknown error'));
        }
    };

    const handleOrderStatus = async (orderId, newStatus) => {
        try {
            await apiClient.put(`/api/orders/${orderId}/status`, { status: newStatus });
            showToast(`Order marked as ${newStatus}`);
            fetchData();
        } catch (error) {
            showToast('Status update failed.');
        }
    };

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading dashboard...</div>;

    return (
        <div className="dashboard-container container">
            {/* Toast */}
            {toastMsg && (
                <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: '#22c55e', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', zIndex: 9999, fontWeight: 500 }}>
                    {toastMsg}
                </div>
            )}

            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Vendor Dashboard</h1>
                    <p className="dashboard-subtitle">Manage your products and orders</p>
                </div>
                <button onClick={openAddModal} className="btn btn-primary"><Plus size={20} /> Add Product</button>
            </header>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card glass"><span className="stat-label">Total Products</span><span className="stat-value">{products.length}</span></div>
                <div className="stat-card glass"><span className="stat-label">Total Orders</span><span className="stat-value">{orders.length}</span></div>
                <div className="stat-card glass"><span className="stat-label">Revenue</span><span className="stat-value">${totalRevenue.toFixed(2)}</span></div>
                <div className="stat-card glass"><span className="stat-label">Pending Orders</span><span className="stat-value">{orders.filter(o => o.status === 'pending').length}</span></div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                {['products', 'orders'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', color: activeTab === tab ? '#818cf8' : 'inherit', fontWeight: activeTab === tab ? 700 : 400, borderBottom: activeTab === tab ? '2px solid #818cf8' : 'none', textTransform: 'capitalize', fontSize: '1rem' }}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Products Tab */}
            {activeTab === 'products' && (
                <section className="product-management">
                    <div className="product-list glass">
                        <table className="dashboard-table">
                            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>No products yet. Add your first product!</td></tr>
                                ) : products.map(p => (
                                    <tr key={p._id}>
                                        <td className="product-cell">
                                            <img src={p.images?.[0]} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '0.25rem' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                            <span>{p.name}</span>
                                        </td>
                                        <td>{p.category}</td>
                                        <td>${Number(p.price).toFixed(2)}</td>
                                        <td style={{ color: p.stock < 5 ? '#ef4444' : 'inherit' }}>{p.stock}</td>
                                        <td>{p.featured ? '⭐' : '—'}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="icon-btn" onClick={() => openEditModal(p)} title="Edit"><Edit size={16} /></button>
                                                <button className="icon-btn danger" onClick={() => setDeleteConfirm(p._id)} title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <section>
                    <div className="product-list glass">
                        <table className="dashboard-table">
                            <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>No orders yet.</td></tr>
                                ) : orders.map(order => {
                                    const statusStyle = statusColors[order.status] || {};
                                    return (
                                        <tr key={order._id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order._id.slice(-8)}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                                            <td>${Number(order.totalAmount).toFixed(2)}</td>
                                            <td>
                                                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', background: statusStyle.bg, color: statusStyle.color }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                {order.status === 'processing' && (
                                                    <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} onClick={() => handleOrderStatus(order._id, 'shipped')}>
                                                        <Truck size={12} /> Ship
                                                    </button>
                                                )}
                                                {order.status === 'shipped' && (
                                                    <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} onClick={() => handleOrderStatus(order._id, 'delivered')}>
                                                        <CheckCircle size={12} /> Deliver
                                                    </button>
                                                )}
                                                {order.status === 'pending' && (
                                                    <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>Awaiting payment</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass" style={{ maxWidth: '540px', width: '90vw' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="modal-form">
                            <input placeholder="Product Name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
                            <textarea placeholder="Description" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} required />
                            <div className="form-row">
                                <input type="number" placeholder="Price ($)" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} required min="0" step="0.01" />
                                <input type="number" placeholder="Old Price (optional)" value={formData.oldPrice} onChange={e => setFormData(p => ({ ...p, oldPrice: e.target.value }))} min="0" step="0.01" />
                            </div>
                            <div className="form-row">
                                <input type="number" placeholder="Stock Qty" value={formData.stock} onChange={e => setFormData(p => ({ ...p, stock: e.target.value }))} required min="0" />
                                <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <input placeholder="Image URL" value={formData.image} onChange={e => setFormData(p => ({ ...p, image: e.target.value }))} />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.featured} onChange={e => setFormData(p => ({ ...p, featured: e.target.checked }))} />
                                Mark as Featured
                            </label>
                            {formError && <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{formError}</p>}
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                                    {formSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content glass" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <Trash2 size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
                        <h2>Delete Product?</h2>
                        <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;
