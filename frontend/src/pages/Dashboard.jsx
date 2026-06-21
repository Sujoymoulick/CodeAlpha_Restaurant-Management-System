import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { DollarSign, ClipboardList, AlertTriangle, Users, BookOpen, Layers } from 'lucide-react';

export default function Dashboard({ role, setActiveTab }) {
  const [dailyStats, setDailyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [tables, setTables] = useState([]);
  const [menuCount, setMenuCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = role && role.toLowerCase() === 'admin';

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch basic stats (accessible to both staff and admin)
        const tablesRes = await apiCall('/tables');
        if (tablesRes.success) {
          setTables(tablesRes.data);
        }

        const menuRes = await apiCall('/menu?limit=1');
        if (menuRes.success) {
          setMenuCount(menuRes.data.pagination.total);
        }

        // Fetch reports (Admin only)
        if (isAdmin) {
          const dailyRes = await apiCall('/reports/daily-sales');
          if (dailyRes.success) setDailyStats(dailyRes.data);

          const monthlyRes = await apiCall('/reports/monthly-sales');
          if (monthlyRes.success) setMonthlyStats(monthlyRes.data);

          const lowStockRes = await apiCall('/reports/low-stock');
          if (lowStockRes.success) setLowStock(lowStockRes.data);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Failed to fetch some dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>Loading Dashboard metrics...</div>;
  }

  // Calculate Table counts
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.status === 'Occupied').length;
  const reservedTables = tables.filter(t => t.status === 'Reserved').length;
  const availableTables = tables.filter(t => t.status === 'Available').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here is a summary of today's activities.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Metrics Row */}
      <div className="grid-cols-4">
        {isAdmin ? (
          <>
            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Daily Revenue</span>
                <span className="metric-value">${dailyStats?.totalRevenue?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="metric-icon-box gold">
                <DollarSign />
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Daily Orders</span>
                <span className="metric-value">{dailyStats?.totalOrders || 0}</span>
              </div>
              <div className="metric-icon-box emerald">
                <ClipboardList />
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Monthly Revenue</span>
                <span className="metric-value">${monthlyStats?.totalRevenue?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="metric-icon-box cyan">
                <DollarSign />
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Low Stock Alerts</span>
                <span className="metric-value">{lowStock?.count || 0}</span>
              </div>
              <div className="metric-icon-box rose">
                <AlertTriangle />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Available Tables</span>
                <span className="metric-value">{availableTables} / {totalTables}</span>
              </div>
              <div className="metric-icon-box emerald">
                <Users />
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Occupied Tables</span>
                <span className="metric-value">{occupiedTables}</span>
              </div>
              <div className="metric-icon-box rose">
                <Users />
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Reserved Tables</span>
                <span className="metric-value">{reservedTables}</span>
              </div>
              <div className="metric-icon-box gold">
                <Users />
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Menu Items</span>
                <span className="metric-value">{menuCount}</span>
              </div>
              <div className="metric-icon-box cyan">
                <BookOpen />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid-cols-2">
        {/* Left Side: Table & Operations Info */}
        <div className="glass-table-container" style={{ padding: '24px' }}>
          <h2 className="modal-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Table Occupancy Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
              <span>Total Tables Configured</span>
              <strong style={{ color: 'var(--text-primary)' }}>{totalTables}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
              <span>Tables Available Now</span>
              <strong style={{ color: 'var(--success-color)' }}>{availableTables}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
              <span>Tables Occupied</span>
              <strong style={{ color: 'var(--danger-color)' }}>{occupiedTables}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>Tables Reserved</span>
              <strong style={{ color: 'var(--accent-color)' }}>{reservedTables}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="btn" onClick={() => setActiveTab('orders')}>Place New Order</button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('reservations')}>Book Table</button>
          </div>
        </div>

        {/* Right Side: Reports (Admin) or Staff Info (Staff) */}
        {isAdmin ? (
          <div className="glass-table-container" style={{ padding: '24px' }}>
            <h2 className="modal-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Top Selling Items (Today)</h2>
            {dailyStats?.mostSoldItems?.length > 0 ? (
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Qty Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyStats.mostSoldItems.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{item.totalQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No orders placed today yet.</p>
            )}
          </div>
        ) : (
          <div className="glass-table-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 className="modal-title" style={{ fontSize: '18px', marginBottom: '8px' }}>Staff Portal Guide</h2>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              As a restaurant staff member, you have access to core table operations and order processing functionalities.
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <li>Browse and manage current <strong>Menu Items</strong></li>
              <li>View real-time <strong>Table Allocations</strong> (Occupied/Available)</li>
              <li>Add and view customer <strong>Reservations</strong></li>
              <li>Place new <strong>Orders</strong> and transition active cooking statuses</li>
              <li>Track raw ingredient levels in <strong>Inventory</strong></li>
            </ul>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              Note: Reporting and dashboard sales analytics are restricted to Administrator accounts.
            </p>
          </div>
        )}
      </div>

      {isAdmin && lowStock?.lowStockItems?.length > 0 && (
        <div className="glass-table-container" style={{ padding: '24px', marginTop: '24px' }}>
          <h2 className="modal-title" style={{ fontSize: '18px', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle /> Critical Stock Alerts (Below Threshold)
          </h2>
          <table className="glass-table">
            <thead>
              <tr>
                <th>Ingredient Name</th>
                <th>Current Stock</th>
                <th>Safety Threshold</th>
                <th>Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.lowStockItems.map((item) => (
                <tr key={item._id}>
                  <td>{item.itemName}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--danger-color)' }}>{item.quantity}</td>
                  <td>{item.lowStockThreshold}</td>
                  <td>{item.unit}</td>
                  <td>
                    <span className="badge danger">Low Stock</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
