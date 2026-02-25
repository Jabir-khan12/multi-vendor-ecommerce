import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, Store, LogOut, Layout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';




const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState('');


    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <header className="navbar-container">
            <div className="container navbar">
                <div className="navbar-left">
                    <button className="mobile-menu-btn">
                        <Menu size={24} />
                    </button>
                    <Link to="/" className="logo">
                        <Store className="logo-icon" size={28} />
                        <span className="logo-text">AstraMarket</span>
                    </Link>
                </div>

                <div className="navbar-center">
                    <div className="search-bar">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search products, brands, and vendors..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                </div>


                <div className="navbar-right">
                    <Link to="/cart" className="nav-action cart-action">
                        <ShoppingCart size={24} />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>

                    {user ? (
                        <div className="user-nav">
                            {user.role === 'vendor' && (
                                <Link to="/dashboard" className="nav-action icon-btn" title="Dashboard">
                                    <Layout size={20} />
                                </Link>
                            )}
                            <Link to="/orders" className="nav-action icon-btn" title="My Orders">
                                <Package size={20} />
                            </Link>
                            <button className="nav-action profile-action">

                                <User size={24} />
                                <span className="profile-text">{user.name}</span>
                            </button>
                            <button onClick={logout} className="nav-action logout-btn" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (

                        <button onClick={() => navigate('/login')} className="nav-action profile-action">
                            <User size={24} />
                            <span className="profile-text">Sign In</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};


export default Navbar;
