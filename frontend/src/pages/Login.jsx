import React, { useState } from 'react';
import logo from '../../images/rrlogo.png';
import { apiCall } from '../services/api';

export default function Login({ onLoginSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiCall('/auth/login', 'POST', { email, password });
      if (res.success) {
        const username = res.data.name || res.data.email;
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', username);
        localStorage.setItem('role', res.data.role);
        onLoginSuccess({
          token: res.data.token,
          username: username,
          role: res.data.role
        });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo"><img src={logo} alt="GourmetOS Logo" /></div>
          <h1 className="login-title">GourmetOS</h1>
          <p className="login-subtitle">Restaurant Management Hub</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter email (e.g. admin@example.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>

          {onBack && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onBack}
            >
              Back to Showcase
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
