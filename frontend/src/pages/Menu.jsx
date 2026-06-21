import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Search, Plus, Edit, Trash2, ArrowUpDown } from 'lucide-react';

export default function Menu({ role }) {
  const [menuItems, setMenuItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 6, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('name:asc');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Main Course',
    price: '',
    available: true
  });

  const isAdmin = role === 'admin';

  const fetchMenu = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = `/menu?page=${pagination.page}&limit=${pagination.limit}&search=${search}&category=${category}&sort=${sort}`;
      const res = await apiCall(endpoint);
      if (res.success) {
        setMenuItems(res.data.menuItems);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [pagination.page, category, sort]); // Fetch on page/filter/sort changes

  // Trigger search on submit or search delay
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchMenu();
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: 'Main Course',
      price: '',
      available: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price,
      available: item.available
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (parseFloat(formData.price) <= 0) {
      setError('Price must be a positive number');
      return;
    }

    try {
      if (editingItem) {
        // Edit Item
        const res = await apiCall(`/menu/${editingItem._id}`, 'PUT', formData);
        if (res.success) {
          setSuccess('Item updated successfully!');
          setShowModal(false);
          fetchMenu();
        }
      } else {
        // Add Item
        const res = await apiCall('/menu', 'POST', formData);
        if (res.success) {
          setSuccess('Item added successfully!');
          setShowModal(false);
          fetchMenu();
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await apiCall(`/menu/${id}`, 'DELETE');
      if (res.success) {
        setSuccess('Item deleted successfully!');
        fetchMenu();
      }
    } catch (err) {
      setError(err.message || 'Deletion failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">Configure dishes, pricing, and availability states.</p>
        </div>
        {isAdmin && (
          <button className="btn" onClick={handleOpenAdd}>
            <Plus size={18} /> Add Menu Item
          </button>
        )}
      </div>

      {success && <div style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success-color)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{success}</div>}
      {error && <div className="error-banner">{error}</div>}

      {/* Filters and Search Panel */}
      <form className="search-filter-panel" onSubmit={handleSearchSubmit}>
        <div className="search-input-wrapper">
          <Search className="search-icon-inside" />
          <input
            type="text"
            className="form-control"
            placeholder="Search menu item by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
          style={{ minWidth: '150px' }}
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
          style={{ minWidth: '150px' }}
        >
          <option value="name:asc">Name (A-Z)</option>
          <option value="name:desc">Name (Z-A)</option>
          <option value="price:asc">Price: Low to High</option>
          <option value="price:desc">Price: High to Low</option>
        </select>

        <button type="submit" className="btn btn-secondary">Search</button>
      </form>

      {/* Menu list cards grid */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>Loading menu items...</div>
      ) : menuItems.length > 0 ? (
        <>
          <div className="cards-grid">
            {menuItems.map((item) => (
              <div className="card" key={item._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge info">{item.category}</span>
                  <span className={`badge ${item.available ? 'success' : 'danger'}`}>
                    {item.available ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{item.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', minHeight: '63px' }}>
                    {item.description || 'No description provided.'}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <strong style={{ fontSize: '20px', color: 'var(--accent-color)' }}>
                    ${item.price.toFixed(2)}
                  </strong>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '8px 12px' }}
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '8px 12px' }}
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Showing {menuItems.length} of {pagination.total} items
            </span>
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center', padding: '0 8px', fontSize: '14px' }}>
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
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
          No menu items found matching search filters.
        </div>
      )}

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Dish Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '16px', marginBottom: '0px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Starter">Starter</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <input
                  type="checkbox"
                  id="available"
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={formData.available}
                  onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                />
                <label htmlFor="available" className="form-label" style={{ cursor: 'pointer', marginBottom: 0 }}>Available for Order</label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
