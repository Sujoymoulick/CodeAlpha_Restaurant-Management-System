import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Tables from './pages/Tables';
import Reservations from './pages/Reservations';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';

// Customer space imports
import CustomerAuth from './pages/customer/CustomerAuth';
import CustomerMenu from './pages/customer/CustomerMenu';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerOrders from './pages/customer/CustomerOrders';

import { LayoutDashboard, BookOpen, Layers, Calendar, ClipboardCheck, PackageCheck, LogOut, Sun, Moon, Utensils } from 'lucide-react';

export default function App() {
  // Session states
  const [user, setUser] = useState(null); // Staff/Admin
  const [customer, setCustomer] = useState(null); // Customer
  
  // App routing states
  const [appMode, setAppMode] = useState('landing'); // 'landing' | 'staff' | 'customer'
  const [activeTab, setActiveTab] = useState('dashboard'); // Inner portal tab switching
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Customer order tracking flow states
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [customerAlerts, setCustomerAlerts] = useState([]);

  // Check existing sessions on mount
  useEffect(() => {
    // 1. Check Staff
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (token && username && role) {
      setUser({ token, username, role });
      setAppMode('staff');
      const isAdminUser = role && role.toLowerCase() === 'admin';
      setActiveTab(isAdminUser ? 'dashboard' : 'tables');
    }

    // 2. Check Customer
    const customerToken = localStorage.getItem('customer_token');
    const customerName = localStorage.getItem('customer_name');
    const customerEmail = localStorage.getItem('customer_email');

    if (customerToken && customerName && customerEmail) {
      setCustomer({ token: customerToken, name: customerName, email: customerEmail });
      setAppMode('customer');
      setActiveTab('menu'); // Customers land on menu page by default
    }
  }, []);

  // Theme synchronization
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Staff Authentication Handlers
  const handleStaffLoginSuccess = (userData) => {
    setUser(userData);
    setAppMode('staff');
    const isAdminUser = userData.role && userData.role.toLowerCase() === 'admin';
    setActiveTab(isAdminUser ? 'dashboard' : 'tables');
  };

  const handleStaffLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
    setAppMode('landing');
  };

  // Customer Authentication Handlers
  const handleCustomerAuthSuccess = (customerData) => {
    setCustomer(customerData);
    setAppMode('customer');
    setActiveTab('menu');
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('customer_email');
    localStorage.removeItem('customer_role');
    setCustomer(null);
    setAppMode('landing');
    setActiveOrderId(null);
    setCustomerAlerts([]);
  };

  // Handle successful customer checkout redirections
  const handleOrderPlacementSuccess = (orderId, alerts) => {
    setActiveOrderId(orderId);
    setCustomerAlerts(alerts);
    setActiveTab('orders'); // Redirect to orders tracking list
  };

  // Render Public Showcase Screen
  if (appMode === 'landing') {
    return (
      <LandingPage
        onLaunchStaff={() => setAppMode('staff')}
        onLaunchCustomer={() => setAppMode('customer')}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  // ==========================================
  // STAFF WORKSPACE PORTAL
  // ==========================================
  if (appMode === 'staff') {
    if (!user) {
      return (
        <Login
          onLoginSuccess={handleStaffLoginSuccess}
          onBack={() => setAppMode('landing')}
        />
      );
    }

    const isAdmin = user && user.role && user.role.toLowerCase() === 'admin';

    const renderStaffContent = () => {
      let tab = activeTab;
      if (!isAdmin && (tab === 'dashboard' || tab === 'inventory')) {
        tab = 'tables';
      }
      switch (tab) {
        case 'dashboard':
          return <Dashboard role={user.role} setActiveTab={setActiveTab} />;
        case 'menu':
          return <Menu role={user.role} />;
        case 'tables':
          return <Tables role={user.role} />;
        case 'reservations':
          return <Reservations />;
        case 'orders':
          return <Orders />;
        case 'inventory':
          return <Inventory role={user.role} />;
        default:
          return <Tables role={user.role} />;
      }
    };

    return (
      <div className="app-container">
        <aside className="sidebar">
          <div className="brand" style={{ cursor: 'pointer' }} onClick={handleStaffLogout}>
            <span className="brand-icon">🍳</span>
            <h2 className="brand-name">GourmetOS</h2>
          </div>

          <nav style={{ flexGrow: 1 }}>
            <ul className="nav-links">
              {isAdmin && (
                <li>
                  <div
                    className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <LayoutDashboard className="nav-icon" /> Dashboard
                  </div>
                </li>
              )}
              <li>
                <div
                  className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
                  onClick={() => setActiveTab('menu')}
                >
                  <BookOpen className="nav-icon" /> Menu Items
                </div>
              </li>
              <li>
                <div
                  className={`nav-item ${activeTab === 'tables' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tables')}
                >
                  <Layers className="nav-icon" /> Table Layout
                </div>
              </li>
              <li>
                <div
                  className={`nav-item ${activeTab === 'reservations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reservations')}
                >
                  <Calendar className="nav-icon" /> Reservations
                </div>
              </li>
              <li>
                <div
                  className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <ClipboardCheck className="nav-icon" /> Order Tickets
                </div>
              </li>
              {isAdmin && (
                <li>
                  <div
                    className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inventory')}
                  >
                    <PackageCheck className="nav-icon" /> Raw Stock
                  </div>
                </li>
              )}
            </ul>
          </nav>

          <div className="user-profile">
            <div className="user-info">
              <div className="user-avatar">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="username">{user.username}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button className="theme-toggle-btn" onClick={toggleTheme} style={{ flexGrow: 1 }} title="Toggle Theme">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button className="logout-btn" onClick={handleStaffLogout} style={{ flexGrow: 3 }}>
                <LogOut size={16} /> Exit Desk
              </button>
            </div>
          </div>
        </aside>

        <main className="main-content">
          {renderStaffContent()}
        </main>
      </div>
    );
  }

  // ==========================================
  // CUSTOMER WORKSPACE PORTAL (MVP FLOW)
  // ==========================================
  if (appMode === 'customer') {
    if (!customer) {
      return (
        <CustomerAuth
          onAuthSuccess={handleCustomerAuthSuccess}
          onBack={() => setAppMode('landing')}
        />
      );
    }

    const renderCustomerContent = () => {
      switch (activeTab) {
        case 'menu':
          return <CustomerMenu onOrderSuccess={handleOrderPlacementSuccess} />;
        case 'bookings':
          return <CustomerBookings />;
        case 'orders':
          return (
            <CustomerOrders
              activeOrderId={activeOrderId}
              initialAlerts={customerAlerts}
            />
          );
        default:
          return <CustomerMenu onOrderSuccess={handleOrderPlacementSuccess} />;
      }
    };

    return (
      <div className="app-container">
        <aside className="sidebar">
          <div className="brand" style={{ cursor: 'pointer' }} onClick={handleCustomerLogout}>
            <span className="brand-icon">🍔</span>
            <h2 className="brand-name">GourmetOS</h2>
          </div>

          <nav style={{ flexGrow: 1 }}>
            <ul className="nav-links">
              <li>
                <div
                  className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
                  onClick={() => setActiveTab('menu')}
                >
                  <Utensils className="nav-icon" /> Dining Menu
                </div>
              </li>
              <li>
                <div
                  className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookings')}
                >
                  <Calendar className="nav-icon" /> Book Table
                </div>
              </li>
              <li>
                <div
                  className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <ClipboardCheck className="nav-icon" /> Track Orders
                </div>
              </li>
            </ul>
          </nav>

          <div className="user-profile">
            <div className="user-info">
              <div className="user-avatar" style={{ background: 'linear-gradient(135deg, var(--info-color), var(--success-color))' }}>
                {customer.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="username" style={{ fontSize: '13px' }}>{customer.name}</span>
                <span className="user-role">Customer</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button className="theme-toggle-btn" onClick={toggleTheme} style={{ flexGrow: 1 }} title="Toggle Theme">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button className="logout-btn" onClick={handleCustomerLogout} style={{ flexGrow: 3 }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        <main className="main-content">
          {renderCustomerContent()}
        </main>
      </div>
    );
  }

  return null;
}
