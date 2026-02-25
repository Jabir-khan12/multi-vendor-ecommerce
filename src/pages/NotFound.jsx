import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '6rem 1rem 4rem', textAlign: 'center' }}>
      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
        <h1 style={{ marginBottom: '0.5rem' }}>Page Not Found</h1>
        <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>The page you're looking for doesn't exist or has moved.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>Go Back</button>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Home</button>
        </div>
      </div>
    </div>
  );
}
