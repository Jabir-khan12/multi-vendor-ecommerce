import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Store, Package, ShoppingCart, CheckCircle, XCircle, Ban, RefreshCw, Trash2 } from 'lucide-react';
import { apiClient } from '../config/api';

const TABS = ['overview', 'vendors', 'users', 'orders'];

const statusColors = {
  pending: { bg: '#fef3c7', color: '#92400e' },
  approved: { bg: '#d1fae5', color: '#065f46' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  shipped: { bg: '#d1fae5', color: '#065f46' },
  delivered: { bg: '#d1fae5', color: '#065f46' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' }
};

const Badge = ({ status }) => {
  const s = statusColors[status] || { bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.78rem', background: s.bg, color: s.color, fontWeight: 600 }}>
      {status}
    </span>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vendorFilter, setVendorFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); return; }
  }, [user, navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiClient.get('/api/admin/stats');
      setStats(data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchVendors = useCallback(async (status = '') => {
    setLoading(true);
    try {
      const url = status ? `/api/admin/vendors?status=${status}` : '/api/admin/vendors';
      const data = await apiClient.get(url);
      setVendors(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/admin/users');
      setUsers(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchOrders = useCallback(async (status = '') => {
    setLoading(true);
    try {
      const url = status ? `/api/admin/orders?status=${status}` : '/api/admin/orders';
      const data = await apiClient.get(url);
      setOrders(data.orders || data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchStats();
    if (activeTab === 'overview') fetchStats();
    else if (activeTab === 'vendors') fetchVendors(vendorFilter);
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'orders') fetchOrders(orderFilter);
  }, [activeTab, vendorFilter, orderFilter, user]);

  const handleApprove = async (vendorId) => {
    try {
      await apiClient.put(`/api/admin/vendors/${vendorId}/approve`);
      showToast('Vendor approved!');
      fetchVendors(vendorFilter);
    } catch (e) { showToast('Failed to approve vendor.'); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await apiClient.put(`/api/admin/vendors/${rejectModal}/reject`, { reason: rejectReason });
      showToast('Vendor rejected.');
      setRejectModal(null);
      setRejectReason('');
      fetchVendors(vendorFilter);
    } catch (e) { showToast('Failed to reject vendor.'); }
  };

  const handleSuspend = async (vendorId) => {
    if (!confirm('Are you sure you want to suspend this vendor?')) return;
    try {
      await apiClient.put(`/api/admin/vendors/${vendorId}/suspend`);
      showToast('Vendor suspended.');
      fetchVendors(vendorFilter);
    } catch (e) { showToast('Failed to suspend vendor.'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await apiClient.delete(`/api/admin/users/${userId}`);
      showToast('User deleted.');
      fetchUsers();
    } catch (e) { showToast(e?.message || 'Failed to delete user.'); }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: '#22c55e', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', zIndex: 9999, fontWeight: 500 }}>
          {toast}
        </div>
      )}

      <h1 className="section-title" style={{ marginBottom: '0.25rem' }}>Admin Dashboard</h1>
      <p style={{ opacity: 0.6, marginBottom: '1.5rem' }}>Platform management & oversight</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', color: activeTab === tab ? '#818cf8' : 'inherit', fontWeight: activeTab === tab ? 700 : 400, borderBottom: activeTab === tab ? '2px solid #818cf8' : 'none', textTransform: 'capitalize', fontSize: '1rem' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Users', value: stats.userCount ?? '…', icon: <Users size={24} /> },
              { label: 'Total Vendors', value: stats.vendorCount ?? '…', icon: <Store size={24} /> },
              { label: 'Total Products', value: stats.productCount ?? '…', icon: <Package size={24} /> },
              { label: 'Total Orders', value: stats.orderCount ?? '…', icon: <ShoppingCart size={24} /> },
              { label: 'Total Revenue', value: stats.totalRevenue != null ? `$${Number(stats.totalRevenue).toFixed(2)}` : '…', icon: <span style={{ fontSize: '1.5rem' }}>💰</span> }
            ].map(({ label, value, icon }) => (
              <div key={label} className="glass" style={{ padding: '1.25rem', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ opacity: 0.7 }}>{icon}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</div>
                <div style={{ opacity: 0.6, fontSize: '0.85rem' }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setActiveTab('vendors')}>Manage Vendors</button>
            <button className="btn btn-outline" onClick={() => setActiveTab('users')}>Manage Users</button>
          </div>
        </div>
      )}

      {/* VENDORS */}
      {activeTab === 'vendors' && (
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s || 'all'} onClick={() => setVendorFilter(s)} className={vendorFilter === s ? 'btn btn-primary' : 'btn btn-outline'} style={{ fontSize: '0.85rem' }}>
                {s || 'All'}
              </button>
            ))}
            <button onClick={() => fetchVendors(vendorFilter)} className="btn btn-outline" style={{ marginLeft: 'auto' }}><RefreshCw size={14} /></button>
          </div>
          {loading ? <p>Loading...</p> : (
            <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
              <table className="dashboard-table" style={{ width: '100%' }}>
                <thead><tr><th>Store</th><th>Owner</th><th>Status</th><th>Verified</th><th>Suspended</th><th>Actions</th></tr></thead>
                <tbody>
                  {vendors.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>No vendors found.</td></tr>
                  ) : vendors.map(v => (
                    <tr key={v._id}>
                      <td><strong>{v.storeName}</strong><br /><span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{v.description?.slice(0, 50)}</span></td>
                      <td>{v.userId?.name || '—'}<br /><span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{v.userId?.email}</span></td>
                      <td><Badge status={v.verificationStatus || 'pending'} /></td>
                      <td>{v.isVerified ? '✅' : '❌'}</td>
                      <td>{v.isSuspended ? '🚫' : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {v.verificationStatus !== 'approved' && (
                            <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }} onClick={() => handleApprove(v._id)}>
                              <CheckCircle size={12} /> Approve
                            </button>
                          )}
                          {v.verificationStatus !== 'rejected' && (
                            <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => setRejectModal(v._id)}>
                              <XCircle size={12} /> Reject
                            </button>
                          )}
                          {!v.isSuspended && (
                            <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }} onClick={() => handleSuspend(v._id)}>
                              <Ban size={12} /> Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* USERS */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={fetchUsers} className="btn btn-outline"><RefreshCw size={14} /></button>
          </div>
          {loading ? <p>Loading...</p> : (
            <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
              <table className="dashboard-table" style={{ width: '100%' }}>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
                <tbody>
                  {users.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>No users found.</td></tr> : users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td style={{ fontSize: '0.9rem', opacity: 0.8 }}>{u.email}</td>
                      <td><Badge status={u.role} /></td>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u._id !== user?.userId && u._id !== user?.id && (
                          <button className="icon-btn danger" onClick={() => handleDeleteUser(u._id)} title="Delete user"><Trash2 size={15} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ORDERS */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
              <button key={s || 'all'} onClick={() => setOrderFilter(s)} className={orderFilter === s ? 'btn btn-primary' : 'btn btn-outline'} style={{ fontSize: '0.85rem' }}>
                {s || 'All'}
              </button>
            ))}
          </div>
          {loading ? <p>Loading...</p> : (
            <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
              <table className="dashboard-table" style={{ width: '100%' }}>
                <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {orders.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>No orders found.</td></tr>
                  : orders.map(o => (
                    <tr key={o._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{o._id.slice(-8)}</td>
                      <td>{o.customerId?.name || '—'}<br /><span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{o.customerId?.email}</span></td>
                      <td>{o.items?.length}</td>
                      <td>${Number(o.totalAmount).toFixed(2)}</td>
                      <td><Badge status={o.paymentStatus || 'unpaid'} /></td>
                      <td><Badge status={o.status} /></td>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '420px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Reject Vendor</h2>
            <textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => { setRejectModal(null); setRejectReason(''); }}>Cancel</button>
              <button className="btn btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={handleReject}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
