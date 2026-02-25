import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle, ChevronRight } from 'lucide-react';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/orders/customer/${user.id}`);
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchOrders();
    }, [user]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' };
            case 'completed': return { color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' };
            default: return { color: '#6b7280', background: 'rgba(107, 114, 128, 0.1)' };
        }
    };

    return (
        <div className="orders-page container py-12">
            <h1 className="section-title mb-8">My Orders</h1>

            {loading ? (
                <div className="loading">Loading orders...</div>
            ) : (
                <div className="orders-list flex flex-col gap-4">
                    {orders.map(order => (
                        <div key={order._id} className="order-item glass p-6 rounded-2xl flex justify-between items-center">
                            <div className="order-info flex items-center gap-6">
                                <div className="order-icon p-4 bg-white/5 rounded-xl">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Order #{order._id.slice(-6).toUpperCase()}</h3>
                                    <p className="text-secondary text-sm">
                                        {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="order-amount text-right">
                                    <div className="text-xl font-bold">${order.totalAmount.toFixed(2)}</div>
                                    <div className="status-badge px-3 py-1 rounded-full text-xs font-bold uppercase inline-block mt-1" style={getStatusStyle(order.status)}>
                                        {order.status}
                                    </div>
                                </div>
                                <ChevronRight className="text-secondary" />
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="empty-orders text-center py-20 glass">
                            <Clock size={48} className="mx-auto mb-4 text-secondary opacity-20" />
                            <h3>No orders yet</h3>
                            <p className="text-secondary">When you buy something, it'll show up here.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Orders;
