import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiClient } from '../config/api';

const CATEGORIES = ['all', 'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Beauty', 'Food', 'Automotive', 'Other'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'featured', label: 'Featured' }
];

const SearchResults = () => {
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get('q') || '';

    const fetchResults = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.set('search', query);
            if (category && category !== 'all') params.set('category', category);
            if (minPrice) params.set('minPrice', minPrice);
            if (maxPrice) params.set('maxPrice', maxPrice);
            params.set('sort', sort);
            params.set('page', page);
            params.set('limit', 12);

            const data = await apiClient.get(`/api/products?${params.toString()}`);
            setProducts(data.products || data);
            setTotal(data.total ?? (data.products || data).length);
            setPages(data.pages ?? 1);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    }, [query, category, minPrice, maxPrice, sort, page]);

    useEffect(() => {
        setPage(1);
    }, [query, category, minPrice, maxPrice, sort]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const handlePriceFilter = (e) => {
        e.preventDefault();
        fetchResults();
    };

    const clearFilters = () => {
        setCategory('all');
        setMinPrice('');
        setMaxPrice('');
        setSort('newest');
        setPage(1);
    };

    const hasFilters = category !== 'all' || minPrice || maxPrice || sort !== 'newest';

    return (
        <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
            <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
                {query ? `Results for "${query}"` : 'Browse Products'}
            </h1>
            <p style={{ opacity: 0.6, marginBottom: '1.5rem' }}>{loading ? '...' : `${total} product${total !== 1 ? 's' : ''} found`}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Sidebar */}
                <aside className="glass" style={{ padding: '1.25rem', borderRadius: '1rem', position: 'sticky', top: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Filters</h3>
                        {hasFilters && <button onClick={clearFilters} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#818cf8' }}>Clear all</button>}
                    </div>

                    {/* Sort */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.4rem' }}>Sort by</label>
                        <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: '100%' }}>
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    {/* Category */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.6rem' }}>Category</label>
                        <div style={{ display: 'grid', gap: '0.3rem' }}>
                            {CATEGORIES.map(c => (
                                <button key={c} onClick={() => setCategory(c)} style={{
                                    background: category === c ? 'rgba(129,140,248,0.2)' : 'none',
                                    border: category === c ? '1px solid #818cf8' : '1px solid transparent',
                                    borderRadius: '0.4rem',
                                    padding: '0.35rem 0.6rem',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    color: category === c ? '#818cf8' : 'inherit',
                                    fontSize: '0.88rem',
                                    textTransform: c === 'all' ? 'capitalize' : 'none'
                                }}>
                                    {c === 'all' ? 'All Categories' : c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.6rem' }}>Price Range</label>
                        <form onSubmit={handlePriceFilter} style={{ display: 'grid', gap: '0.5rem' }}>
                            <input type="number" placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)} min="0" step="0.01" />
                            <input type="number" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="0" step="0.01" />
                            <button type="submit" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>Apply</button>
                        </form>
                    </div>
                </aside>

                {/* Results Grid */}
                <div>
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="glass" style={{ borderRadius: '1rem', height: '280px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem' }}>
                            <h3>No products found</h3>
                            <p style={{ opacity: 0.6, marginTop: '0.5rem' }}>Try different keywords or adjust filters.</p>
                            {hasFilters && <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={clearFilters}>Clear Filters</button>}
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                                {products.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                                    <button className="btn btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
                                    {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                                        const p = i + 1;
                                        return (
                                            <button key={p} onClick={() => setPage(p)} className={page === p ? 'btn btn-primary' : 'btn btn-outline'} style={{ minWidth: '2.25rem' }}>{p}</button>
                                        );
                                    })}
                                    <button className="btn btn-outline" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next ›</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
