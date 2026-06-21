import React, { useState } from 'react';
import { apiCall } from '../../services/api';

export default function CustomerAuth({ onAuthSuccess, onBack }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Customer Login
        const res = await apiCall('/customers/login', 'POST', {
          email: formData.email,
          password: formData.password
        });
        if (res.success) {
          localStorage.setItem('customer_token', res.data.token);
          localStorage.setItem('customer_name', res.data.name);
          localStorage.setItem('customer_email', res.data.email);
          localStorage.setItem('customer_role', 'customer');
          onAuthSuccess(res.data);
        }
      } else {
        // Customer Register
        const res = await apiCall('/customers/register', 'POST', formData);
        if (res.success) {
          setSuccess('Account created successfully! Redirecting to login...');
          setTimeout(() => {
            setIsLogin(true);
            setError('');
            setSuccess('');
          }, 1500);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ width: '450px' }}>
        <div className="login-header">
          <div className="login-logo">🍔</div>
          <h1 className="login-title">GourmetOS</h1>
          <p className="login-subtitle">
            {isLogin ? 'Customer Login Portal' : 'Create Customer Account'}
          </p>
        </div>

        {success && <div style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success-color)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{success}</div>}
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="e.g. customer@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                className="form-control"
                placeholder="e.g. +15551234"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="address">Address (Optional)</label>
              <textarea
                id="address"
                className="form-control"
                style={{ minHeight: '60px', resize: 'vertical' }}
                placeholder="Enter your delivery/billing address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '16px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <span
              style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </span>
            <span
              style={{ fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={onBack}
            >
              Back to Home
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
