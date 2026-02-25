import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import VendorProfile from './pages/VendorProfile';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VendorDashboard from './pages/VendorDashboard';
import SearchResults from './pages/SearchResults';
import Orders from './pages/Orders';
import ProductDetails from './pages/ProductDetails';
import './index.css';






function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vendor/:id" element={<VendorProfile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<VendorDashboard />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/product/:id" element={<ProductDetails />} />
          </Routes>





        </main>
      </div>
    </Router>
  );
}

export default App;
