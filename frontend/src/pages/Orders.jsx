import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Plus, Trash2, ChevronRight, Eye, ClipboardList, CheckCircle, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 8, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [alerts, setAlerts] = useState([]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  // New Order Form state
  const [selectedTable, setSelectedTable] = useState('');
  const [orderItems, setOrderItems] = useState([
    { menuItemId: '', quantity: 1 }
  ]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Get Orders
      const orderRes = await apiCall(`/orders?page=${pagination.page}&limit=${pagination.limit}`);
      if (orderRes.success) {
        setOrders(orderRes.data.orders);
        setPagination(orderRes.data.pagination);
      }

      // Get Tables (for assignment)
      const tableRes = await apiCall('/tables');
      if (tableRes.success) {
        setTables(tableRes.data);
      }

      // Get Menu (for item selection)
      const menuRes = await apiCall('/menu?limit=100'); // get all items
      if (menuRes.success) {
        setMenuItems(menuRes.data.menuItems.filter(item => item.available));
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page]);

  const handleOpenCreate = () => {
    setSelectedTable(tables[0]?._id || '');
    setOrderItems([{ menuItemId: menuItems[0]?._id || '', quantity: 1 }]);
    setError('');
    setSuccess('');
    setAlerts([]);
    setShowCreateModal(true);
  };

  const handleAddRow = () => {
    setOrderItems(prev => [...prev, { menuItemId: menuItems[0]?._id || '', quantity: 1 }]);
  };

  const handleRemoveRow = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    setOrderItems(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Calculate live order total on frontend
  const calculateLiveTotal = () => {
    let sum = 0;
    for (const item of orderItems) {
      const matched = menuItems.find(m => m._id === item.menuItemId);
      if (matched) {
        sum += matched.price * parseInt(item.quantity || 0);
      }
    }
    return sum;
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAlerts([]);

    // Validate
    const invalidItem = orderItems.some(i => !i.menuItemId || i.quantity < 1);
    if (invalidItem) {
      setError('Please select items and ensure quantities are positive integers');
      return;
    }

    try {
      const payload = {
        tableId: selectedTable,
        items: orderItems
      };
      
      const res = await apiCall('/orders', 'POST', payload);
      if (res.success) {
        setSuccess('Order placed successfully!');
        if (res.data.alerts && res.data.alerts.length > 0) {
          setAlerts(res.data.alerts);
        }
        setShowCreateModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit order');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setError('');
    try {
      const res = await apiCall(`/orders/${orderId}`, 'PUT', { status: newStatus });
      if (res.success) {
        setSuccess(`Order status updated to '${newStatus}'`);
        // If order details modal is open, update its state too
        if (viewingOrder && viewingOrder._id === orderId) {
          setViewingOrder(res.data);
        }
        fetchData();
      }
    } catch (err) {
      setError(err.message || 'Status transition failed');
    }
  };

  const handleOpenView = (order) => {
    setViewingOrder(order);
    setShowViewModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Preparing': return 'info';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'info';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Order Processing</h1>
          <p className="page-subtitle">Track, fulfill, and record dining orders and table balances.</p>
        </div>
        <button className="btn" onClick={handleOpenCreate}>
          <Plus size={18} /> Place Order
        </button>
      </div>

      {/* Dynamic Alerts Banner */}
      {alerts.length > 0 && (
        <div className="glass-table-container" style={{ borderColor: 'var(--danger-color)', padding: '16px', marginBottom: '20px', backgroundColor: 'var(--danger-glow)' }}>
          <h3 style={{ color: 'var(--danger-color)', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={18} /> Low Stock Warnings (Triggered by Order)
          </h3>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
            {alerts.map((alert, i) => <li key={i}>{alert}</li>)}
          </ul>
        </div>
      )}

      {success && <div style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success-color)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{success}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>Retrieving orders list...</div>
      ) : orders.length > 0 ? (
        <>
          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Table</th>
                  <th>Order Items</th>
                  <th>Total Amount</th>
                  <th>Order Status</th>
                  <th>Order Time</th>
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
                      <span className="badge info">Table T{order.tableId?.tableNumber || 'N/A'}</span>
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
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '13px' }}
                          onClick={() => handleOpenView(order)}
                        >
                          <Eye size={14} style={{ marginRight: '4px' }} /> View
                        </button>

                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '13px', width: '130px', height: '32px' }}
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Showing {orders.length} of {pagination.total} orders
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
          No orders found. Click "Place Order" to record an item ticket.
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '600px' }}>
            <h2 className="modal-title">Place Dining Ticket</h2>
            <form onSubmit={handleCreateOrder}>
              <div className="form-group">
                <label className="form-label">Assign to Table</label>
                <select
                  className="form-control"
                  required
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  {tables.map(t => (
                    <option key={t._id} value={t._id}>
                      Table T{t.tableNumber} (Capacity: {t.capacity} seats, Status: {t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label">Order Items</label>
                  <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={handleAddRow}>
                    + Add Item Row
                  </button>
                </div>

                {orderItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                    <select
                      className="form-control"
                      style={{ flexGrow: 1 }}
                      required
                      value={item.menuItemId}
                      onChange={(e) => handleRowChange(idx, 'menuItemId', e.target.value)}
                    >
                      <option value="" disabled>Select Item</option>
                      {menuItems.map(m => (
                        <option key={m._id} value={m._id}>
                          {m.name} (${m.price.toFixed(2)})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      className="form-control"
                      style={{ width: '80px' }}
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                    />

                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: '10px', height: '44px' }}
                      disabled={orderItems.length === 1}
                      onClick={() => handleRemoveRow(idx)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', margin: '24px 0 16px 0' }}>
                <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Estimated Subtotal:</span>
                <strong style={{ fontSize: '24px', color: 'var(--accent-color)' }}>
                  ${calculateLiveTotal().toFixed(2)}
                </strong>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {showViewModal && viewingOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '500px' }}>
            <h2 className="modal-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span>Order Details</span>
              <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                #{viewingOrder._id.toUpperCase()}
              </span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Table Assigned:</span>
                <strong style={{ color: 'var(--info-color)' }}>Table T{viewingOrder.tableId?.tableNumber}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Workflow Status:</span>
                <span className={`badge ${getStatusBadge(viewingOrder.status)}`}>{viewingOrder.status}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Order Placed:</span>
                <span>{new Date(viewingOrder.createdAt).toLocaleString()}</span>
              </div>

              {/* Items Table */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Purchased Items</h4>
                {viewingOrder.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span>{item.menuItemId?.name || 'Item'} <span style={{ color: 'var(--text-muted)' }}>x {item.quantity}</span></span>
                    <strong>${(item.priceAtOrder * item.quantity).toFixed(2)}</strong>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px', fontWeight: 'bold' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--accent-color)', fontSize: '18px' }}>${viewingOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button type="button" className="btn" onClick={() => setShowViewModal(false)}>Close Window</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
