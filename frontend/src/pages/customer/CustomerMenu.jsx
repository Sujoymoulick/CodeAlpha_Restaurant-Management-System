import React, { useState, useEffect } from 'react';
import { apiCall, API_BASE } from '../../services/api';
import { Search, ShoppingCart, Plus, Minus, Trash2, Tag, Info, AlertCircle } from 'lucide-react';

export default function CustomerMenu({ onOrderSuccess }) {
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 6, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('name:asc');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [alerts, setAlerts] = useState([]);

  // Cart State: Array of { menuItem, quantity }
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');

  const fetchMenu = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = `/menu?page=${pagination.page}&limit=${pagination.limit}&search=${search}&category=${category}&sort=${sort}`;
      const res = await apiCall(endpoint);
      if (res.success) {
        setMenuItems(res.data.menuItems.filter(item => item.available));
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await apiCall('/bookings/my-bookings');
      if (res.success) {
        // Extract unique tables from the customer's bookings
        const bookedTablesMap = {};
        res.data.forEach(booking => {
          if (booking.tableId && booking.tableId._id) {
            bookedTablesMap[booking.tableId._id] = booking.tableId;
          }
        });
        const bookedTables = Object.values(bookedTablesMap);
        setTables(bookedTables);
        if (bookedTables.length > 0) {
          setSelectedTable(bookedTables[0]._id);
        } else {
          setSelectedTable('');
        }
      }
    } catch (err) {
      console.error('Failed to retrieve booked tables:', err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [pagination.page, category, sort]);

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchMenu();
  };

  // Cart Operations
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItem._id === item._id);
      if (existing) {
        return prev.map(i => i.menuItem._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateCartQty = (id, amount) => {
    setCart(prev => prev.map(item => {
      if (item.menuItem._id === id) {
        const newQty = item.quantity + amount;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.menuItem._id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAlerts([]);

    if (cart.length === 0) {
      setError('Your shopping cart is empty');
      return;
    }
    if (!selectedTable) {
      setError('Please select a dining table');
      return;
    }

    try {
      const payload = {
        tableId: selectedTable,
        items: cart.map(c => ({
          menuItemId: c.menuItem._id,
          quantity: c.quantity
        }))
      };

      const customerToken = localStorage.getItem('customer_token');
      // Pass special headers manually to ensure API helper uses customer token
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Submit failed');
      }

      setSuccess('Order placed successfully! Redirecting...');
      setCart([]);
      
      // Notify parent to transition to My Orders tracking view
      setTimeout(() => {
        onOrderSuccess(data.data.order._id, data.data.alerts);
      }, 1500);

    } catch (err) {
      setError(err.message || 'Checkout failed');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
      
      {/* Left side: Menu items and filters */}
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">GourmetOS Dining Menu</h1>
            <p className="page-subtitle">Select fresh, delicious dishes prepared by our master chefs.</p>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Filters */}
        <form className="search-filter-panel" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrapper">
            <Search className="search-icon-inside" />
            <input
              type="text"
              className="form-control"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
          >
            <option value="">All Categories</option>
            <option value="Starter">Starters</option>
            <option value="Main Course">Main Courses</option>
            <option value="Dessert">Desserts</option>
            <option value="Beverage">Beverages</option>
          </select>

          <select
            className="form-control"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
          >
            <option value="name:asc">Name (A-Z)</option>
            <option value="name:desc">Name (Z-A)</option>
            <option value="price:asc">Price: Low to High</option>
            <option value="price:desc">Price: High to Low</option>
          </select>
        </form>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>Loading menu items...</div>
        ) : menuItems.length > 0 ? (
          <>
            <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {menuItems.map((item) => (
                <div className="card" key={item._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="badge info">{item.category}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '6px' }}>{item.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', minHeight: '58px' }}>
                      {item.description || 'No description provided.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <strong style={{ fontSize: '18px', color: 'var(--accent-color)' }}>
                      ${item.price.toFixed(2)}
                    </strong>
                    <button
                      className="btn"
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={() => addToCart(item)}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination-container">
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Prev
                </button>
                <button
                  className="pagination-btn"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-secondary)' }}>
            No items available.
          </div>
        )}
      </div>

      {/* Right side: Shopping Cart drawer */}
      <div className="glass-table-container" style={{ padding: '24px', height: 'fit-content', position: 'sticky', top: '100px' }}>
        <h2 className="modal-title" style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <ShoppingCart style={{ color: 'var(--accent-color)' }} /> Dining Cart
        </h2>

        {success && <div style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success-color)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{success}</div>}

        {cart.length > 0 ? (
          <form onSubmit={handleCheckout}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
              {cart.map((item) => (
                <div key={item.menuItem._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.menuItem.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--accent-color)' }}>
                      ${item.menuItem.price.toFixed(2)} each
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                      onClick={() => updateCartQty(item.menuItem._id, -1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button
                      type="button"
                      style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                      onClick={() => updateCartQty(item.menuItem._id, 1)}
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', marginLeft: '6px' }}
                      onClick={() => removeFromCart(item.menuItem._id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

             {/* Table Selection */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontSize: '13px' }}>Select Your Seated Table</label>
              {tables.length === 0 ? (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px dashed rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: 'var(--danger-color)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '4px'
                }}>
                  <AlertCircle size={16} />
                  <span>No active table bookings found. Please book a table first.</span>
                </div>
              ) : (
                <>
                  <select
                    className="form-control"
                    style={{ padding: '8px 12px', fontSize: '14px' }}
                    required
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                  >
                    {tables.map((t) => (
                      <option key={t._id} value={t._id}>
                        Table T{t.tableNumber} (Capacity: {t.capacity} seats)
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px' }}>
                    <Info size={12} /> Place order once seated at your table
                  </span>
                </>
              )}
            </div>

            {/* Subtotal & checkout */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Bill:</span>
              <strong style={{ fontSize: '20px', color: 'var(--accent-color)' }}>
                ${calculateTotal().toFixed(2)}
              </strong>
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={tables.length === 0}
            >
              Place Dining Order
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <ShoppingCart size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px' }}>Your cart is empty.</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Add items from the menu to build an order.</p>
          </div>
        )}
      </div>

    </div>
  );
}
