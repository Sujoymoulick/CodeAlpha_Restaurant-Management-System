import React, { useState, useEffect } from 'react';
import { apiCall, API_BASE } from '../../services/api';
import { Calendar, Clock, Users, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    guests: '2',
    reservationDate: '',
    reservationTime: '19:00'
  });

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const customerToken = localStorage.getItem('customer_token');
      const res = await fetch(`${API_BASE}/bookings/my-bookings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${customerToken}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch bookings');
      }
      setBookings(data.data);
    } catch (err) {
      setError(err.message || 'Failed to load your reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    setFormData(prev => ({
      ...prev,
      reservationDate: new Date().toISOString().split('T')[0]
    }));
  }, []);

  const handleBookTable = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (parseInt(formData.guests) < 1) {
      setError('Guests count must be at least 1 person');
      return;
    }

    try {
      const customerToken = localStorage.getItem('customer_token');
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Table allocation failed');
      }

      setSuccess(`Table T${data.data.tableId.tableNumber} (Capacity: ${data.data.tableId.capacity} guests) has been successfully reserved for you!`);
      setShowForm(false);
      fetchBookings();
    } catch (err) {
      setError(err.message || 'No tables matching this criteria are currently available');
    }
  };

  const handleCancelBooking = async (id, tableNum) => {
    if (!window.confirm(`Are you sure you want to cancel your reservation for Table T${tableNum}?`)) return;
    setError('');
    setSuccess('');
    try {
      const customerToken = localStorage.getItem('customer_token');
      const res = await fetch(`${API_BASE}/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${customerToken}`
        }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Cancellation failed');
      }

      setSuccess('Your table booking has been successfully cancelled.');
      fetchBookings();
    } catch (err) {
      setError(err.message || 'Failed to cancel the reservation');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Table Booking Portal</h1>
          <p className="page-subtitle">Schedule a table, choose guest sizes, and review upcoming plans.</p>
        </div>
        {!showForm && (
          <button className="btn" onClick={() => { setShowForm(true); setError(''); setSuccess(''); }}>
            <Plus size={18} /> Plan New Reservation
          </button>
        )}
      </div>

      {success && <div style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success-color)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{success}</div>}
      {error && <div className="error-banner">{error}</div>}

      {/* Booking Form Layout */}
      {showForm && (
        <div className="glass-table-container" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto 32px auto' }}>
          <h2 className="modal-title" style={{ fontSize: '20px', marginBottom: '20px' }}>Request Table Allocation</h2>
          <form onSubmit={handleBookTable}>
            
            <div className="form-group">
              <label className="form-label">Number of Dining Guests</label>
              <input
                type="number"
                className="form-control"
                required
                min="1"
                value={formData.guests}
                onChange={(e) => setFormData(prev => ({ ...prev, guests: e.target.value }))}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>We will assign the smallest optimal table to fit your group.</span>
            </div>

            <div className="grid-cols-2" style={{ gap: '16px', marginBottom: '0px' }}>
              <div className="form-group">
                <label className="form-label">Reservation Date</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.reservationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, reservationDate: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dining Time</label>
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

            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn">Check & Book Table</button>
            </div>
          </form>
        </div>
      )}

      {/* List of bookings */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>Retrieving your scheduled bookings...</div>
      ) : bookings.length > 0 ? (
        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Booking Reference</th>
                <th>Assigned Table</th>
                <th>Capacity</th>
                <th>Reservation Date</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--success-color)' }} />
                      <strong style={{ fontFamily: 'monospace' }}>#{booking._id.substring(booking._id.length - 8).toUpperCase()}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="badge info">Table T{booking.tableId?.tableNumber || 'N/A'}</span>
                  </td>
                  <td>{booking.tableId?.capacity || 'N/A'} people</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} /> {formatDate(booking.reservationDate)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} style={{ color: 'var(--text-muted)' }} /> {booking.reservationTime}
                    </div>
                  </td>
                  <td>
                    <span className="badge success">Confirmed</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={() => handleCancelBooking(booking._id, booking.tableId?.tableNumber)}
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
          You have no active table reservations scheduled. Click "Plan New Reservation" to book.
        </div>
      )}

    </div>
  );
}
