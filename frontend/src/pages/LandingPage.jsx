import React from 'react';
import { BookOpen, Layers, Calendar, ClipboardCheck, PackageCheck, BarChart3, Zap, Sun, Moon } from 'lucide-react';

export default function LandingPage({ onLaunchStaff, onLaunchCustomer, theme, toggleTheme }) {
  return (
    <div className="landing-wrapper">
      {/* Navigation Header */}
      <header className="landing-nav">
        <div className="landing-brand">
          <span className="brand-icon">🍳</span>
          <h2 className="brand-name">GourmetOS</h2>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#architecture">Architecture</a>
          <a href="#api-contract">API Contract</a>
          
          {/* Theme switcher */}
          <button className="theme-toggle-btn" onClick={toggleTheme} style={{ border: 'none', padding: '6px', cursor: 'pointer' }} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={onLaunchCustomer}>
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <span className="hero-tagline"><Zap size={14} style={{ color: 'var(--accent-color)' }} /> V2.5 Multi-Portal Release</span>
          <h1 className="hero-title">
            The Intelligent OS for <span className="highlight-text">Modern Dining</span> Operations.
          </h1>
          <p className="hero-subtitle">
            An executive-grade restaurant management suite. Includes two independent portals: a waitstaff/admin control desk and an automated customer dining dashboard.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary-glow" onClick={onLaunchCustomer}>
              Enter Customer Space
            </button>
            <button className="btn btn-secondary" onClick={onLaunchStaff}>
              Staff Workspace
            </button>
          </div>
        </div>

        {/* Live CSS Mockup of Dashboard */}
        <div className="hero-preview-container">
          <div className="mock-window">
            <div className="mock-header">
              <div className="mock-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="mock-url">gourmet-os.local/dashboard</div>
            </div>
            
            <div className="mock-body">
              {/* Mini Sidebar */}
              <div className="mock-sidebar">
                <span className="mock-sb-item active"><span className="sb-dot gold"></span></span>
                <span className="mock-sb-item"></span>
                <span className="mock-sb-item"></span>
                <span className="mock-sb-item"></span>
              </div>
              
              {/* Mini Main Panel */}
              <div className="mock-main">
                <div className="mock-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div className="mock-title">Executive Summary</div>
                  <div className="mock-badge">Admin Mode</div>
                </div>
                
                {/* Metrics */}
                <div className="mock-grid-3">
                  <div className="mock-stat-card">
                    <span className="stat-label">Daily Sales</span>
                    <strong className="stat-value">$1,249.50</strong>
                  </div>
                  <div className="mock-stat-card">
                    <span className="stat-label">Active Orders</span>
                    <strong className="stat-value">42</strong>
                  </div>
                  <div className="mock-stat-card alerts">
                    <span className="stat-label">Stock Alerts</span>
                    <strong className="stat-value text-rose">2</strong>
                  </div>
                </div>

                {/* Table Layout Mock */}
                <div className="mock-stat-card" style={{ marginTop: '16px', padding: '16px' }}>
                  <div className="mock-row" style={{ justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Floor Layout</span>
                    <span style={{ fontSize: '10px', color: 'var(--success-color)' }}>6 Available</span>
                  </div>
                  <div className="mock-table-grid">
                    <span className="mock-tbl-cell occupied">T1</span>
                    <span className="mock-tbl-cell available">T2</span>
                    <span className="mock-tbl-cell reserved">T3</span>
                    <span className="mock-tbl-cell available">T4</span>
                    <span className="mock-tbl-cell occupied">T5</span>
                    <span className="mock-tbl-cell available">T6</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="landing-section">
        <div className="section-header">
          <h2 className="section-title">Core Operations Modules</h2>
          <p className="section-subtitle">Engineered to handle high-volume dining services with atomic data integrity.</p>
        </div>

        <div className="features-showcase-grid">
          <div className="feature-show-card">
            <div className="feat-icon-box gold"><BookOpen /></div>
            <h3>Menu Customization</h3>
            <p>Implement search parameters, category filters, page counts, and price sort orders to manage customer menu catalogs.</p>
          </div>

          <div className="feature-show-card">
            <div className="feat-icon-box emerald"><Layers /></div>
            <h3>Floor Layout Mapping</h3>
            <p>Track dining room capacities and occupied states in real-time to control reservations and walk-in seatings.</p>
          </div>

          <div className="feature-show-card">
            <div className="feat-icon-box cyan"><Calendar /></div>
            <h3>Conflict-Free Booking</h3>
            <p>Guards against overlapping time-slots and double-booking errors. Toggles table reservations dynamically.</p>
          </div>

          <div className="feature-show-card">
            <div className="feat-icon-box rose"><ClipboardCheck /></div>
            <h3>Pricing Calculations</h3>
            <p>Fetches real-time database prices on order submits to prevent bill tampering and log historic pricing.</p>
          </div>

          <div className="feature-show-card">
            <div className="feat-icon-box gold"><PackageCheck /></div>
            <h3>Automated Restocking</h3>
            <p>Atomic stock depletion based on menu recipes. Auto-generates alerts if quantities drop below threshold counts.</p>
          </div>

          <div className="feature-show-card">
            <div className="feat-icon-box cyan"><BarChart3 /></div>
            <h3>Aggregation Reports</h3>
            <p>Mongoose aggregation queries reporting sales revenues, order quantities, top dishes, and low stock metrics.</p>
          </div>
        </div>
      </section>

      {/* Architecture & Tech Stack */}
      <section id="architecture" className="landing-section" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="section-header">
          <h2 className="section-title">Technology Stack</h2>
          <p className="section-subtitle">Built on a reliable, scalable foundation of industry-standard technologies.</p>
        </div>

        <div className="tech-stack-grid">
          <div className="tech-item">
            <strong className="tech-name">React + Vite</strong>
            <span className="tech-desc">State-driven SPA frontend on Port 3000</span>
          </div>
          <div className="tech-item">
            <strong className="tech-name">Express + Node</strong>
            <span className="tech-desc">REST API middleware routing on Port 5050</span>
          </div>
          <div className="tech-item">
            <strong className="tech-name">MongoDB Atlas</strong>
            <span className="tech-desc">Document database with aggregation pipelines</span>
          </div>
          <div className="tech-item">
            <strong className="tech-name">Mongoose ORM</strong>
            <span className="tech-desc">Schema validations and relational references</span>
          </div>
          <div className="tech-item">
            <strong className="tech-name">JWT Security</strong>
            <span className="tech-desc">Role-based access tokens for admin commands</span>
          </div>
          <div className="tech-item">
            <strong className="tech-name">express-validator</strong>
            <span className="tech-desc">Strict request payload sanitization checks</span>
          </div>
        </div>
      </section>

      {/* API Contract Call To Action */}
      <section id="api-contract" className="landing-section">
        <div className="api-cta-card">
          <h2>Production-Ready API Contract Included</h2>
          <p>
            Equipped with a comprehensive JSON Postman Collection featuring pre-configured environments, register blocks, order templates, and financial analytics.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
            <button className="btn" onClick={onLaunchCustomer}>Enter Customer Portal</button>
            <button className="btn btn-secondary" onClick={onLaunchStaff}>Staff Portal</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} GourmetOS. Developed for CodeAlpha Full-Stack Portfolio.</p>
      </footer>
    </div>
  );
}
