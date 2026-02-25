import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../config/api';
import './Login.css'; // Reusing styles

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        storeName: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = formData.role === 'vendor' ? '/api/auth/register-vendor' : '/api/auth/register';

        try {
            const data = await apiClient.post(endpoint, formData);
            login(data.user);
            navigate('/');
        } catch (err) {
            setError(err?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card glass">
                <h2 className="login-title">Join AstraMarket</h2>
                <p className="login-subtitle">Create an account to start shopping</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Register as</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="cta-input"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        >
                            <option value="customer" style={{ color: 'black' }}>Customer</option>
                            <option value="vendor" style={{ color: 'black' }}>Vendor</option>
                        </select>
                    </div>

                    {formData.role === 'vendor' && (
                        <div className="form-group">
                            <label>Store Name</label>
                            <input
                                name="storeName"
                                type="text"
                                value={formData.storeName}
                                onChange={handleChange}
                                placeholder="My Awesome Store"
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-block">Create Account</button>
                </form>

                <div className="login-footer">
                    <p>Already have an account? <Link to="/login">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
