import React, { useState, useEffect } from 'react';
import { apiCall, API_BASE } from '../../services/api';
import { ClipboardList, Clock, Eye, AlertCircle, CheckCircle, RefreshCw, XCircle, ArrowLeft } from 'lucide-react';

export default function CustomerOrders({ activeOrderId, initialAlerts }) {
  const [orders, setOrders] = useState([]);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alerts, setAlerts] = useState(initialAlerts || []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const customerToken = localStorage.getItem('customer_token');
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${customerToken}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to retrieve orders');
      }
      setOrders(data.data);
    } catch (err) {
      setError(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = async (id) => {
    setError('');
    try {
      const customerToken = localStorage.getItem('customer_token');
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${customerToken}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch status');
      }
      setTrackingOrder(data.data);
      // Clear initial alerts once tracking is open
      setAlerts([]);
    } catch (err) {
      setError(err.message || 'Failed to connect to tracking server');
    }
  };

  useEffect(() => {
    fetchOrders();
    if (activeOrderId) {
      handleTrackOrder(activeOrderId);
    }
  }, [activeOrderId]);

  // Helper to determine the visual index of workflow status
  const getStatusStepIndex = (status) => {
    const steps = ['Pending', 'Preparing', 'Ready', 'Served', 'Completed'];
    return steps.indexOf(status);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Preparing': return 'info';
      case 'Ready': return 'success';
      case 'Served': return 'success';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'info';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Dining Tickets & Tracking</h1>
          <p className="page-subtitle">Track live kitchen preparations and review past order receipts.</p>
        </div>
        {trackingOrder && (
          <button className="btn btn-secondary" onClick={() => { setTrackingOrder(null); fetchOrders(); }}>
            <ArrowLeft size={16} /> Back to History
          </button>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="glass-table-container" style={{ borderColor: 'var(--danger-color)', padding: '16px', marginBottom: '20px', backgroundColor: 'var(--danger-glow)' }}>
          <h3 style={{ color: 'var(--danger-color)', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <AlertCircle size={16} /> Kitchen Warning
          </h3>
          <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-primary)' }}>
            {alerts.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {/* TRACKING MODE */}
      {trackingOrder ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* Status Tracker */}
          <div className="glass-table-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <h2 className="modal-title" style={{ fontSize: '18px', marginBottom: 0 }}>Live Ticket Tracker</h2>
              <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' }}>
                #{trackingOrder.order._id.substring(trackingOrder.order._id.length - 8).toUpperCase()}
              </span>
            </div>

            {/* Estimated Prep Timer */}
            {trackingOrder.order.status !== 'Completed' && trackingOrder.order.status !== 'Cancelled' && trackingOrder.order.status !== 'Served' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--accent-glow)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <Clock className="nav-icon" style={{ color: 'var(--accent-color)', width: '28px', height: '28px' }} />
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Estimated Time Remaining</div>
                  <strong style={{ fontSize: '20px', color: 'var(--accent-color)' }}>{trackingOrder.estimatedTimeMinutes} Minutes</strong>
                </div>
              </div>
            ) : null}

            {/* Status Steps Flow Chart */}
            {trackingOrder.order.status === 'Cancelled' ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--danger-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <XCircle size={48} />
                <h3>Order Cancelled</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>This order ticket was cancelled by staff or administration.</p>
              </div>
            ) : (
              <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {['Pending', 'Preparing', 'Ready', 'Served'].map((step, idx) => {
                  const currentIdx = getStatusStepIndex(trackingOrder.order.status);
                  const isDone = currentIdx >= idx;
                  const isActive = currentIdx === idx;
                  
                  return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                      
                      {/* Connecting Line */}
                      {idx < 3 && (
                        <div style={{
                          position: 'absolute',
                          left: '12px',
                          top: '24px',
                          width: '2px',
                          height: '32px',
                          backgroundColor: currentIdx > idx ? 'var(--success-color)' : 'var(--border-color)',
                          zIndex: 1
                        }} />
                      )}

                      {/* Icon bubble */}
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? 'var(--accent-glow)' : isDone ? 'var(--success-glow)' : 'var(--bg-secondary)',
                        border: `2px solid ${isActive ? 'var(--accent-color)' : isDone ? 'var(--success-color)' : 'var(--border-color)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2
                      }}>
                        {isDone && <CheckCircle size={14} style={{ color: 'var(--success-color)' }} />}
                      </div>

                      {/* Step details */}
                      <div>
                        <strong style={{ fontSize: '15px', color: isActive ? 'var(--accent-color)' : isDone ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {step}
                        </strong>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {step === 'Pending' && 'Order sent to the kitchen wait queue.'}
                          {step === 'Preparing' && 'Our chefs are actively cooking your items.'}
                          {step === 'Ready' && 'Cooked and ready to be delivered to your table.'}
                          {step === 'Served' && 'Food successfully delivered to your seat.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button className="btn" style={{ marginTop: '16px', justifyContent: 'center' }} onClick={() => handleTrackOrder(trackingOrder.order._id)}>
              <RefreshCw size={14} /> Refresh Tracker
            </button>
          </div>

          {/* Order Details Invoice Receipt */}
          <div className="glass-table-container" style={{ padding: '24px', height: 'fit-content' }}>
            <h3 className="modal-title" style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Order Receipt</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Assigned Seat:</span>
                <strong>Table T{trackingOrder.order.tableId?.tableNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Workflow Status:</span>
                <span className={`badge ${getStatusBadgeClass(trackingOrder.order.status)}`}>{trackingOrder.order.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Order Placed:</span>
                <span>{new Date(trackingOrder.order.createdAt).toLocaleString()}</span>
              </div>

              {/* Items Breakdown */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginTop: '8px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Order Items</h4>
                {trackingOrder.order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span>{item.menuItemId?.name || 'Item'} <span style={{ color: 'var(--text-muted)' }}>x {item.quantity}</span></span>
                    <strong>${(item.priceAtOrder * item.quantity).toFixed(2)}</strong>
                  </div>
                ))}

                {/* Subtotal, tax, total */}
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '12px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Subtotal:</span>
                    <span>${(trackingOrder.order.totalAmount / 1.05).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>CGST/SGST (5% tax):</span>
                    <span>${(trackingOrder.order.totalAmount - (trackingOrder.order.totalAmount / 1.05)).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dotted var(--border-color)', paddingTop: '6px', marginTop: '4px', fontSize: '16px', fontWeight: 'bold' }}>
                    <span>Grand Total:</span>
                    <span style={{ color: 'var(--accent-color)' }}>${trackingOrder.order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* HISTORY MODE */
        loading ? (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>Retrieving your order records...</div>
        ) : orders.length > 0 ? (
          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Assigned Table</th>
                  <th>Order Summary</th>
                  <th>Total Bill</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="badge info">Table T{order.tableId?.tableNumber}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '14px' }}>
                        {order.items.map(item => `${item.menuItemId?.name || 'Item'} (x${item.quantity})`).join(', ')}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--accent-color)' }}>${order.totalAmount.toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn"
                        style={{ padding: '6px 12px', fontSize: '13px', display: 'inline-flex', gap: '4px' }}
                        onClick={() => handleTrackOrder(order._id)}
                      >
                        <Eye size={14} /> Track Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-secondary)' }}>
            You haven't placed any order tickets yet. Go to "GourmetOS Dining Menu" to order!
          </div>
        )
      )}
    </div>
  );
}
