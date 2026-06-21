import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Plus, Trash2, Calendar, Clock, Phone, User } from 'lucide-react';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Booking Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    tableId: '',
    reservationDate: '',
    reservationTime: '18:00'
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const resReservations = await apiCall('/reservations');
      if (resReservations.success) {
        setReservations(resReservations.data);
      }

      const resTables = await apiCall('/tables');
      if (resTables.success) {
        // Filter tables that are available or reserved (can have future reservations)
        setTables(resTables.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve reservation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      customerName: '',
      phone: '',
      tableId: tables[0]?._id || '',
      reservationDate: new Date().toISOString().split('T')[0],
      reservationTime: '18:00'
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Phone validation helper (basic pattern)
    if (!formData.phone.match(/^[+]?[0-9\s-]{7,15}$/)) {
      setError('Please provide a valid phone number (numeric, 7-15 digits)');
      return;
    }

    try {
      const res = await apiCall('/reservations', 'POST', formData);
      if (res.success) {
        setSuccess(`Table T${res.data.tableId.tableNumber} reserved for ${formData.customerName} successfully!`);
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.message || 'Reservation booking failed. Table may be unavailable.');
    }
  };

  const handleCancel = async (id, name, tableNum) => {
    if (!window.confirm(`Are you sure you want to cancel the reservation for ${name} on Table T${tableNum}?`)) return;
    setError('');
    setSuccess('');
    try {
      const res = await apiCall(`/reservations/${id}`, 'DELETE');
      if (res.success) {
        setSuccess('Reservation cancelled successfully.');
        fetchData();
      }
    } catch (err) {
      setError(err.message || 'Cancellation failed');
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Table Reservations</h1>
          <p className="page-subtitle">Schedule customer dining events and track floor bookings.</p>
        </div>
        <button className="btn" onClick={handleOpenAdd}>
          <Plus size={18} /> Book Table
        </button>
      </div>

      {success && <div style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success-color)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{success}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>Retrieving reservations data...</div>
      ) : reservations.length > 0 ? (
        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Table Number</th>
                <th>Seating Capacity</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} style={{ color: 'var(--accent-color)' }} />
                      <strong>{res.customerName}</strong>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <Phone size={14} /> {res.phone}
                    </div>
                  </td>
                  <td>
                    <span className="badge info">Table T{res.tableId?.tableNumber || 'N/A'}</span>
                  </td>
                  <td>{res.tableId?.capacity || 'N/A'} seats</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} /> {formatDate(res.reservationDate)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} style={{ color: 'var(--text-muted)' }} /> {res.reservationTime}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={() => handleCancel(res._id, res.customerName, res.tableId?.tableNumber)}
                    >
                      <Trash2 size={14} style={{ marginRight: '4px' }} /> Cancel Booking
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-secondary)' }}>
          No reservations registered. Click "Book Table" to log a customer schedule.
        </div>
      )}

      {/* Booking Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Book Table Reservation</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="John Doe"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. +15551234"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assign Table</label>
                <select
                  className="form-control"
                  required
                  value={formData.tableId}
                  onChange={(e) => setFormData(prev => ({ ...prev, tableId: e.target.value }))}
                >
                  {tables.map((t) => (
                    <option key={t._id} value={t._id}>
                      Table T{t.tableNumber} (Capacity: {t.capacity} seats, Status: {t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-cols-2" style={{ gap: '16px', marginBottom: '0px' }}>
                <div className="form-group">
                  <label className="form-label">Reservation Date</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={formData.reservationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, reservationDate: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time (24-hour)</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="HH:MM (e.g. 19:30)"
                    value={formData.reservationTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, reservationTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Book Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
