import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        // userData should include: userId, email, role, vendorId (if vendor)
        setUser(userData);
        // Store non-sensitive user info in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        // Token is stored in httpOnly cookie by backend
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('user');
        
        // Optional: Call backend to clear any server-side sessions
        try {
            await apiClient.post('/api/auth/logout', {});
        } catch (error) {
            console.error('Logout API error:', error);
            // Still logout on frontend even if API fails
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
