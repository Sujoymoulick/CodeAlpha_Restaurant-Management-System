import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

export default function Tables({ role }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    status: 'Available'
  });

  const isAdmin = role === 'admin';

  const fetchTables = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall('/tables');
      if (res.success) {
        setTables(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOpenAdd = () => {
    setEditingTable(null);
    setFormData({
      tableNumber: '',
      capacity: '',
      status: 'Available'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: table.status
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (parseInt(formData.capacity) <= 0) {
      setError('Capacity must be at least 1 person');
      return;
    }

    try {
      if (editingTable) {
        // Edit Table
        const res = await apiCall(`/tables/${editingTable._id}`, 'PUT', formData);
        if (res.success) {
          setSuccess('Table updated successfully!');
          setShowModal(false);
          fetchTables();
        }
      } else {
        // Add Table
        if (parseInt(formData.tableNumber) <= 0) {
          setError('Table number must be positive');
          return;
        }
        const res = await apiCall('/tables', 'POST', formData);
        if (res.success) {
          setSuccess('Table added successfully!');
          setShowModal(false);
          fetchTables();
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table? All active orders and reservations should be cleared first.')) return;
    setError('');
    setSuccess('');
    try {
      const res = await apiCall(`/tables/${id}`, 'DELETE');
      if (res.success) {
        setSuccess('Table deleted successfully!');
        fetchTables();
      }
    } catch (err) {
      setError(err.message || 'Deletion failed');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Reserved': return 'warning';
      case 'Occupied': return 'danger';
      default: return 'info';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Table Layout & Status</h1>
          <p className="page-subtitle">Manage physical dining tables, seating arrangements, and active statuses.</p>
        </div>
        {isAdmin && (
          <button className="btn" onClick={handleOpenAdd}>
            <Plus size={18} /> Add Table
          </button>
        )}
      </div>

      {success && <div style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success-color)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{success}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>Loading dining tables...</div>
      ) : tables.length > 0 ? (
        <div className="cards-grid">
          {tables.map((table) => (
            <div className="card" key={table._id} style={{ borderLeft: `4px solid var(--${getStatusClass(table.status)}-color)` }}>
              <div className="table-card-header">
                <div className="table-number-badge">
                  T{table.tableNumber}
                </div>
                <span className={`badge ${getStatusClass(table.status)}`}>
                  {table.status}
                </span>
              </div>
              
              <div className="table-capacity" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0' }}>
                <Users size={16} /> Capacity: <strong>{table.capacity} people</strong>
              </div>

              <div className="table-actions">
                <button
                  className="btn btn-secondary"
                  style={{ flexGrow: 1, padding: '8px 12px', justifyContent: 'center' }}
                  onClick={() => handleOpenEdit(table)}
                >
                  <Edit size={16} /> Update Status
                </button>
                {isAdmin && (
                  <button
                    className="btn btn-danger"
                    style={{ padding: '8px 12px' }}
                    onClick={() => handleDelete(table._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-secondary)' }}>
          No tables found. Click "Add Table" to configure your restaurant layout.
        </div>
      )}

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{editingTable ? 'Update Table Properties' : 'Create New Table'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Table Number</label>
                <input
                  type="number"
                  className="form-control"
                  required
                  disabled={!!editingTable} // Number can't be changed once created (usually unique identifier)
                  value={formData.tableNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, tableNumber: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacity (people)</label>
                <input
                  type="number"
                  className="form-control"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Table Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Occupied">Occupied</option>
                </select>
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
