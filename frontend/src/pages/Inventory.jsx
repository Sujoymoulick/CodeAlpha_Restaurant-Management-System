import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Plus, Edit, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export default function Inventory({ role }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    unit: '',
    lowStockThreshold: ''
  });

  const isAdmin = role === 'admin';

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall('/inventory');
      if (res.success) {
        setInventory(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve inventory details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      itemName: '',
      quantity: '',
      unit: 'kg',
      lowStockThreshold: ''
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      lowStockThreshold: item.lowStockThreshold
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (parseFloat(formData.quantity) < 0 || parseFloat(formData.lowStockThreshold) < 0) {
      setError('Quantities and thresholds cannot be negative numbers');
      return;
    }

    try {
      if (editingItem) {
        // Edit Item
        const res = await apiCall(`/inventory/${editingItem._id}`, 'PUT', formData);
        if (res.success) {
          setSuccess('Stock record updated successfully!');
          if (res.data.lowStockAlert) {
            setError(res.data.lowStockAlert); // Warn the user if still low stock!
          }
          setShowModal(false);
          fetchInventory();
        }
      } else {
        // Add Item
        const res = await apiCall('/inventory', 'POST', formData);
        if (res.success) {
          setSuccess('New stock item added successfully!');
          setShowModal(false);
          fetchInventory();
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Monitor ingredient stock levels, update restocks, and check thresholds.</p>
        </div>
        {isAdmin && (
          <button className="btn" onClick={handleOpenAdd}>
            <Plus size={18} /> Add Stock Item
          </button>
        )}
      </div>

      {success && <div style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success-color)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{success}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>Loading stock levels...</div>
      ) : inventory.length > 0 ? (
        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Ingredient Item</th>
                <th>Current Quantity</th>
                <th>Unit</th>
                <th>Low Safety Threshold</th>
                <th>Alert Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const isLowStock = item.quantity <= item.lowStockThreshold;
                return (
                  <tr key={item._id} style={isLowStock ? { backgroundColor: 'rgba(244, 63, 94, 0.02)' } : {}}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={16} style={{ color: isLowStock ? 'var(--danger-color)' : 'var(--success-color)' }} />
                        <strong>{item.itemName}</strong>
                      </div>
                    </td>
                    <td style={{ fontWeight: 'bold', color: isLowStock ? 'var(--danger-color)' : 'var(--text-primary)' }}>
                      {item.quantity.toFixed(2).replace(/\.00$/, '')}
                    </td>
                    <td>{item.unit}</td>
                    <td>{item.lowStockThreshold} {item.unit}</td>
                    <td>
                      {isLowStock ? (
                        <span className="badge danger" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="badge success" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <CheckCircle size={12} /> Adequate
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Edit size={14} style={{ marginRight: '4px' }} /> Update Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-secondary)' }}>
          Inventory is empty. Click "Add Stock Item" to track raw ingredients.
        </div>
      )}

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{editingItem ? 'Restock / Modify Ingredient' : 'Add Stock Ingredient'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Ingredient Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  disabled={!!editingItem} // Ingredient name shouldn't be altered easily
                  placeholder="e.g. Mozzarella Cheese"
                  value={formData.itemName}
                  onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '16px', marginBottom: '0px' }}>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    required
                    placeholder="e.g. 50"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit of Measure</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    disabled={!!editingItem}
                    placeholder="e.g. kg, pcs, liters"
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Low Safety Threshold</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  required
                  placeholder="Alert below this quantity"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                />
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
