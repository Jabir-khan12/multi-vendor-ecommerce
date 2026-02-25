import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const SearchResults = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/api/products?search=${query}`);
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };
        if (query) fetchSearchResults();
    }, [query]);

    return (
        <div className="search-results-page container" style={{ padding: '4rem 2rem' }}>
            <h1 className="section-title">
                {query ? `Search Results for "${query}"` : 'Search Products'}
            </h1>
            <p className="text-secondary mb-8">{products.length} products found</p>

            {loading ? (
                <div className="loading-state">Searching...</div>
            ) : (
                <div className="grid grid-cols-4 gap-6">
                    {products.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                    {products.length === 0 && (
                        <div className="no-results col-span-4 py-20 text-center glass">
                            <h3>No products found matching your search.</h3>
                            <p>Try different keywords or categories.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
