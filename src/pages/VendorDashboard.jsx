import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Trash2, Edit } from 'lucide-react';
import './VendorDashboard.css';

const VendorDashboard = () => {
    const { user, vendorId } = useAuth();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        stock: '',
        image: ''
    });

    useEffect(() => {
        fetchVendorProducts();
        fetchVendorOrders();
    }, []);

    const fetchVendorProducts = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/products?vendorId=${vendorId}`);
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchVendorOrders = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/vendor/${vendorId}`);
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };


    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newProduct,
                    vendorId: vendorId,
                    images: [newProduct.image]
                }),
            });
            if (response.ok) {
                setShowAddModal(false);
                fetchVendorProducts();
                setNewProduct({ name: '', description: '', price: '', category: 'Electronics', stock: '', image: '' });
            }
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    return (
        <div className="dashboard-container container">
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Vendor Dashboard</h1>
                    <p className="dashboard-subtitle">Manage your products and orders</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                    <Plus size={20} /> Add New Product
                </button>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass">
                    <span className="stat-label">Total Products</span>
                    <span className="stat-value">{products.length}</span>
                </div>
                <div className="stat-card glass">
                    <span className="stat-label">Total Orders</span>
                    <span className="stat-value">{orders.length}</span>
                </div>
                <div className="stat-card glass">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-value">${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}</span>
                </div>
            </div>


            <section className="product-management">
                <h2 className="section-title">My Products</h2>
                <div className="product-list glass">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p._id}>
                                    <td className="product-cell">
                                        <img src={p.images?.[0]} alt="" />
                                        <span>{p.name}</span>
                                    </td>
                                    <td>{p.category}</td>
                                    <td>${p.price}</td>
                                    <td>{p.stock}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="icon-btn"><Edit size={16} /></button>
                                            <button className="icon-btn danger"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h2>Add New Product</h2>
                        <form onSubmit={handleAddProduct} className="modal-form">
                            <input
                                placeholder="Product Name"
                                value={newProduct.name}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={newProduct.description}
                                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                required
                            />
                            <div className="form-row">
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    value={newProduct.stock}
                                    onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                    required
                                />
                            </div>
                            <input
                                placeholder="Image URL"
                                value={newProduct.image}
                                onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                required
                            />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;
