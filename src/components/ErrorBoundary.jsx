import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h1>Something went wrong</h1>
            <p style={{ opacity: 0.7, margin: '0.5rem 0 1.5rem' }}>The application encountered an unexpected error.</p>
            <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem', margin: '0 0 1rem', textAlign: 'left', overflow: 'auto', maxHeight: '120px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error?.toString()}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => window.location.href = '/'}>Go Home</button>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload Page</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
