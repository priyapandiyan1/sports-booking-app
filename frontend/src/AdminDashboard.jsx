import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const POLL_INTERVAL = 6000;

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTime = (timeStr) => {
  if (!timeStr) return '—';
  const s = typeof timeStr === 'string' ? timeStr : String(timeStr);
  const [h, m] = s.split(':');
  const hour = parseInt(h, 10);
  if (Number.isNaN(hour)) return s.slice(0, 5);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const mm = (m || '00').slice(0, 2);
  return `${h12}:${mm} ${ampm}`;
};

const formatHours = (n) => {
  if (n === undefined || n === null || n === '') return '—';
  const x = Number(n);
  if (!Number.isFinite(x)) return '—';
  return `${x} ${x === 1 ? 'hr' : 'hrs'}`;
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    pending:   { bg: 'rgba(251,191,36,0.18)',  color: '#fbbf24', border: 'rgba(251,191,36,0.45)',  label: '⏳ Pending'   },
    confirmed: { bg: 'rgba(74,222,128,0.18)',  color: '#4ade80', border: 'rgba(74,222,128,0.45)',  label: '✅ Confirmed' },
    rejected:  { bg: 'rgba(248,113,113,0.18)', color: '#f87171', border: 'rgba(248,113,113,0.45)', label: '❌ Rejected'  },
    cancelled: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.35)', label: '🚫 Cancelled' },
  };
  const s = cfg[status] || cfg.pending;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
      fontWeight: '700', display: 'inline-block', whiteSpace: 'nowrap',
    }}>{s.label}</span>
  );
};

// ─── New Booking Alert Popup ───────────────────────────────────────────────────
const BookingAlertPopup = ({ booking, onClose, onViewDetails }) => {
  if (!booking) return null;
  return (
    <div className="admin-popup-overlay" onClick={onClose}>
      <div className="admin-popup" onClick={(e) => e.stopPropagation()}>
        <div className="admin-popup-header">
          <span className="admin-popup-bell">🔔</span>
          <h2 className="admin-popup-title">New Booking Alert!</h2>
          <button className="admin-popup-close" onClick={onClose}>✕</button>
        </div>
        <p className="admin-popup-subtitle">A new booking request has arrived.</p>
        <hr className="admin-popup-divider" />
        <div className="admin-popup-details">
          <div className="admin-popup-row">
            <span className="admin-popup-label">Name:</span>
            <span className="admin-popup-value">{booking.user_name || booking.name}</span>
          </div>
          <div className="admin-popup-row">
            <span className="admin-popup-label">Email:</span>
            <span className="admin-popup-value">{booking.user_email || booking.email}</span>
          </div>
          <div className="admin-popup-row">
            <span className="admin-popup-label">Location:</span>
            <span className="admin-popup-value">{booking.place || '—'}</span>
          </div>
          <div className="admin-popup-row">
            <span className="admin-popup-label">Date:</span>
            <span className="admin-popup-value">{formatDate(booking.booking_date)}</span>
          </div>
          <div className="admin-popup-row">
            <span className="admin-popup-label">Time:</span>
            <span className="admin-popup-value">
              {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
            </span>
          </div>
        </div>
        <button className="admin-popup-btn" onClick={() => { onViewDetails(booking); onClose(); }}>
          VIEW DETAILS
        </button>
      </div>
    </div>
  );
};

// ─── Booking Detail Modal ──────────────────────────────────────────────────────
const BookingDetailModal = ({ booking, onClose }) => {
  if (!booking) return null;
  return (
    <div className="admin-popup-overlay" onClick={onClose}>
      <div className="admin-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-detail-header">
          <h2>📋 Booking Details</h2>
          <button className="admin-popup-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-detail-grid">
          {[
            ['👤 Name',        booking.user_name || booking.name],
            ['📧 Email',       booking.user_email || booking.email],
            ['🏅 Sport',       booking.sport_name],
            ['📍 Location',    booking.place || '—'],
            ['📅 Date',        formatDate(booking.booking_date)],
            ['🕐 Start Time',  formatTime(booking.start_time)],
            ['🕓 End Time',    formatTime(booking.end_time)],
            ['⏱ Duration',    formatHours(booking.total_hours)],
            ['💰 Total Price', `₹${Number(booking.total_price ?? booking.price ?? 0).toLocaleString('en-IN')}`],
            ['📊 Status',      booking.status || 'pending'],
          ].map(([label, val]) => (
            <div key={label} className="admin-detail-row">
              <span className="admin-detail-label">{label}</span>
              <span className="admin-detail-val">
                {label === '📊 Status' ? <StatusBadge status={val} /> : val}
              </span>
            </div>
          ))}
        </div>
        <button className="admin-detail-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [bookings, setBookings]         = useState([]);
  const [allCounts, setAllCounts]       = useState({ all: 0, pending: 0, confirmed: 0, rejected: 0 });
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [alertBooking, setAlertBooking] = useState(null);
  const [detailBooking, setDetailBooking] = useState(null);
  const [lastSeenId, setLastSeenId]     = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [dateFilter, setDateFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [pushStatus, setPushStatus]     = useState('idle');
  const [updatingId, setUpdatingId]     = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const adminUser = (() => { try { return JSON.parse(localStorage.getItem('adminUser') || '{}'); } catch { return {}; } })();

  // Redirect to login if no token
  useEffect(() => {
    if (!token) navigate('/admin/login');
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };
  const isFirstLoad  = useRef(true);
  const lastSeenIdRef = useRef(null);



  // ── Fetch bookings ─────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (showAlert = true) => {
    try {
      const params = new URLSearchParams();
      if (dateFilter.trim())        params.set('date',   dateFilter.trim());
      if (searchQuery.trim())       params.set('search', searchQuery.trim());
      if (statusFilter !== 'all')   params.set('status', statusFilter);
      const qs = params.toString();

      const data = await api.get(`/admin/bookings${qs ? `?${qs}` : ''}`);

      const list = data.data || [];
      setTotalRevenue(Number(data.totalRevenue) || 0);
      if (data.counts) setAllCounts(data.counts);

      if (isFirstLoad.current) {
        setBookings(list);
        if (list.length > 0) {
          lastSeenIdRef.current = list[0].id;
          setLastSeenId(list[0].id);
        }
        isFirstLoad.current = false;
        setLoading(false);
        return;
      }

      const filtersActive = dateFilter.trim() || searchQuery.trim() || statusFilter !== 'all';
      if (showAlert && !filtersActive && list.length > 0 && lastSeenIdRef.current !== null) {
        const newest = list[0];
        if (newest.id !== lastSeenIdRef.current) {
          setAlertBooking(newest);
          lastSeenIdRef.current = newest.id;
          setLastSeenId(newest.id);
        }
      }

      setBookings(list);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [dateFilter, searchQuery, statusFilter]);

  useEffect(() => { fetchBookings(false); }, [fetchBookings]);

  useEffect(() => {
    const interval = setInterval(() => fetchBookings(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  const handleManualRefresh = () => {
    setLoading(true);
    isFirstLoad.current = true;
    fetchBookings(false).then(() => setLoading(false));
  };

  // ── Accept / Reject ────────────────────────────────────────────────────────
  const handleStatusUpdate = async (bookingId, newStatus, e) => {
    e.stopPropagation();
    setUpdatingId(bookingId);
    try {
      const data = await api.patch(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      // Optimistic update — instant UI feedback
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      setAllCounts(prev => {
        const oldStatus = bookings.find(b => b.id === bookingId)?.status || 'pending';
        return {
          ...prev,
          [oldStatus]: Math.max(0, (prev[oldStatus] || 0) - 1),
          [newStatus]: (prev[newStatus] || 0) + 1,
        };
      });
    } catch (err) {
      alert(`Failed to update: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Status tab definitions
  const statusTabs = [
    { key: 'all',       label: 'All',       emoji: '📋' },
    { key: 'pending',   label: 'Pending',   emoji: '⏳' },
    { key: 'confirmed', label: 'Confirmed', emoji: '✅' },
    { key: 'rejected',  label: 'Rejected',  emoji: '❌' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .admin-bg {
          min-height: 100vh;
          background: radial-gradient(ellipse at top left, #1a1a2e 0%, #16213e 40%, #0f0f23 100%);
          padding: 40px 32px 60px;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          color: #e2e8f0;
        }

        /* ── Top Bar ── */
        .admin-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
        }
        .admin-title { font-size: 28px; font-weight: 300; color: #f1f5f9; letter-spacing: -0.5px; }
        .admin-title strong { font-weight: 800; }
        .admin-topbar-actions { display: flex; gap: 12px; align-items: center; }
        .admin-btn {
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          color: #cbd5e1; padding: 9px 22px; border-radius: 10px; font-size: 14px;
          font-weight: 600; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(8px);
        }
        .admin-btn:hover { background: rgba(255,255,255,0.15); color: #fff; transform: translateY(-1px); }

        /* ── Stats Row ── */
        .admin-stats { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
        .admin-stat-card {
          background: rgba(255,255,255,0.06); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 14px;
          padding: 18px 28px; flex: 1; min-width: 130px;
        }
        .admin-stat-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .admin-stat-value { font-size: 32px; font-weight: 800; color: #f1f5f9; }
        .admin-stat-value.green  { color: #4ade80; }
        .admin-stat-value.yellow { color: #fbbf24; }
        .admin-stat-value.red    { color: #f87171; }
        .admin-stat-sub { font-size: 11px; color: #64748b; margin-top: 2px; }

        /* ── Status Filter Tabs ── */
        .admin-status-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .admin-status-tab {
          padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 600;
          border: 1px solid rgba(255,255,255,0.12); cursor: pointer; transition: all 0.2s;
          background: rgba(255,255,255,0.05); color: #64748b;
        }
        .admin-status-tab:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
        .admin-status-tab.tab-all       { }
        .admin-status-tab.tab-all.active       { background: rgba(99,102,241,0.25); border-color: rgba(99,102,241,0.5); color: #a5b4fc; }
        .admin-status-tab.tab-pending.active   { background: rgba(251,191,36,0.15); border-color: rgba(251,191,36,0.4); color: #fbbf24; }
        .admin-status-tab.tab-confirmed.active { background: rgba(74,222,128,0.15); border-color: rgba(74,222,128,0.4); color: #4ade80; }
        .admin-status-tab.tab-rejected.active  { background: rgba(248,113,113,0.15); border-color: rgba(248,113,113,0.4); color: #f87171; }
        .admin-tab-count {
          display: inline-block; background: rgba(255,255,255,0.12);
          border-radius: 99px; padding: 1px 8px; font-size: 11px; margin-left: 6px;
        }

        /* ── Search / Filter Row ── */
        .admin-search-wrap { margin-bottom: 20px; }
        .admin-search {
          width: 100%; max-width: 360px; background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.13); border-radius: 10px;
          padding: 10px 18px; color: #e2e8f0; font-size: 14px; outline: none; transition: border 0.2s;
        }
        .admin-search::placeholder { color: #64748b; }
        .admin-search:focus { border-color: rgba(99,102,241,0.5); background: rgba(255,255,255,0.1); }

        /* ── Table ── */
        .admin-table-card {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px; overflow: hidden; backdrop-filter: blur(12px); overflow-x: auto;
        }
        .admin-table { width: 100%; border-collapse: collapse; min-width: 900px; }
        .admin-table thead tr {
          background: rgba(99,102,241,0.2);
          border-bottom: 1px solid rgba(99,102,241,0.3);
        }
        .admin-table th {
          padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 700;
          color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; white-space: nowrap;
        }
        .admin-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s; cursor: pointer;
        }
        .admin-table tbody tr:last-child { border-bottom: none; }
        .admin-table tbody tr:hover { background: rgba(99,102,241,0.08); }
        .admin-table td { padding: 13px 16px; font-size: 13px; color: #cbd5e1; white-space: nowrap; }
        .admin-table td.name-cell { font-weight: 600; color: #f1f5f9; }
        .admin-table td.sport-cell {
          color: #a5b4fc; font-weight: 600; font-size: 12px;
        }
        .admin-badge-new {
          display: inline-block; background: #4ade80; color: #052e16; font-size: 10px;
          font-weight: 800; padding: 2px 8px; border-radius: 99px; margin-left: 8px;
          vertical-align: middle; animation: pulse-badge 1.5s infinite;
        }
        @keyframes pulse-badge { 0%,100%{opacity:1} 50%{opacity:0.5} }

        /* ── Action buttons ── */
        .admin-action-btns { display: flex; gap: 6px; align-items: center; }
        .admin-view-btn {
          background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.35);
          color: #a5b4fc; padding: 5px 12px; border-radius: 7px; font-size: 11px;
          font-weight: 600; cursor: pointer; transition: all 0.18s;
        }
        .admin-view-btn:hover { background: rgba(99,102,241,0.4); color: #fff; }
        .admin-approve-btn {
          background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.4);
          color: #4ade80; padding: 5px 12px; border-radius: 7px; font-size: 11px;
          font-weight: 700; cursor: pointer; transition: all 0.18s;
        }
        .admin-approve-btn:hover:not(:disabled) { background: rgba(74,222,128,0.3); color: #fff; }
        .admin-reject-btn {
          background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.35);
          color: #f87171; padding: 5px 12px; border-radius: 7px; font-size: 11px;
          font-weight: 700; cursor: pointer; transition: all 0.18s;
        }
        .admin-reject-btn:hover:not(:disabled) { background: rgba(248,113,113,0.28); color: #fff; }
        .admin-approve-btn:disabled,
        .admin-reject-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .admin-empty { padding: 60px; text-align: center; color: #64748b; font-size: 15px; }
        .admin-refreshed { font-size: 12px; color: #475569; margin-top: 16px; text-align: right; }

        /* ── Alert Popup ── */
        .admin-popup-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
          z-index: 9999; display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .admin-popup {
          background: #1e1e2e; border: 1px solid rgba(255,255,255,0.12); border-radius: 18px;
          width: 420px; max-width: 95vw; padding: 28px 28px 24px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.7); animation: slideUp 0.25s ease;
        }
        @keyframes slideUp { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        .admin-popup-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .admin-popup-bell { font-size: 28px; animation: ring 0.6s ease; }
        @keyframes ring { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-15deg)} 75%{transform:rotate(15deg)} }
        .admin-popup-title { font-size: 20px; font-weight: 800; color: #f1f5f9; flex: 1; }
        .admin-popup-close {
          background: rgba(255,255,255,0.08); border: none; color: #94a3b8;
          width: 30px; height: 30px; border-radius: 8px; cursor: pointer;
          font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.15s;
        }
        .admin-popup-close:hover { background: rgba(255,80,80,0.2); color: #f87171; }
        .admin-popup-subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 16px; }
        .admin-popup-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin-bottom: 18px; }
        .admin-popup-details { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .admin-popup-row { display: flex; gap: 8px; font-size: 15px; }
        .admin-popup-label { color: #cbd5e1; font-weight: 700; min-width: 80px; }
        .admin-popup-value { color: #f1f5f9; font-weight: 500; }
        .admin-popup-btn {
          width: 100%; background: #16a34a; color: #fff; border: none; border-radius: 10px;
          padding: 14px; font-size: 14px; font-weight: 800; letter-spacing: 1px;
          cursor: pointer; transition: background 0.18s, transform 0.15s;
        }
        .admin-popup-btn:hover { background: #15803d; transform: translateY(-1px); }

        /* ── Detail Modal ── */
        .admin-detail-modal {
          background: #1e1e2e; border: 1px solid rgba(255,255,255,0.12); border-radius: 18px;
          width: 480px; max-width: 95vw; padding: 28px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.7); animation: slideUp 0.25s ease;
        }
        .admin-detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .admin-detail-header h2 { font-size: 20px; font-weight: 800; color: #f1f5f9; }
        .admin-detail-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
        .admin-detail-row {
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(255,255,255,0.05); border-radius: 10px; padding: 12px 16px;
        }
        .admin-detail-label { font-size: 13px; color: #94a3b8; font-weight: 500; }
        .admin-detail-val { font-size: 14px; color: #f1f5f9; font-weight: 700; }
        .admin-detail-close-btn {
          width: 100%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          color: #cbd5e1; border-radius: 10px; padding: 12px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.18s;
        }
        .admin-detail-close-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }

        /* ── Push status badge ── */
        .admin-push-badge {
          display: inline-flex; align-items: center; padding: 7px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 600; border: 1px solid rgba(255,255,255,0.12); cursor: default;
        }
        .admin-push-active     { background: rgba(74,222,128,0.15); color: #4ade80; border-color: rgba(74,222,128,0.3); }
        .admin-push-requesting { background: rgba(251,191,36,0.12); color: #fbbf24; border-color: rgba(251,191,36,0.3); }
        .admin-push-denied,
        .admin-push-error      { background: rgba(248,113,113,0.1); color: #f87171; border-color: rgba(248,113,113,0.25); }
        .admin-push-idle       { background: rgba(255,255,255,0.05); color: #64748b; }

        @media (max-width: 600px) {
          .admin-bg { padding: 20px 12px 40px; }
          .admin-table th, .admin-table td { padding: 10px 8px; font-size: 11px; }
        }
      `}</style>

      <div className="admin-bg">
        {/* ── Top Bar ── */}
        <div className="admin-topbar">
          <h1 className="admin-title"><strong>Admin</strong> Booking Dashboard</h1>
          <div className="admin-topbar-actions">
            {adminUser?.name && (
              <span style={{ color: '#64748b', fontSize: '13px' }}>👤 {adminUser.name}</span>
            )}
            <span className={`admin-push-badge admin-push-${pushStatus}`} title={
              pushStatus === 'active'     ? 'Push notifications active' :
              pushStatus === 'requesting' ? 'Requesting notification permission...' :
              pushStatus === 'denied'     ? 'Notification permission denied' :
              pushStatus === 'error'      ? 'Firebase not configured' :
              'Push notifications not enabled'
            }>
              {pushStatus === 'active'     ? '🔔 Push Active'   :
               pushStatus === 'requesting' ? '⏳ Enabling...'   :
               pushStatus === 'denied'     ? '🔕 Blocked'       :
               pushStatus === 'error'      ? '⚙️ Not Configured' :
               '🔕 Push Off'}
            </span>
            <button className="admin-btn" onClick={handleManualRefresh}>🔄 Refresh</button>
            <button className="admin-btn" onClick={handleLogout} style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}>🚪 Logout</button>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total Bookings</div>
            <div className="admin-stat-value">{allCounts.all || bookings.length}</div>
            <div className="admin-stat-sub">All time</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Pending</div>
            <div className="admin-stat-value yellow">{allCounts.pending}</div>
            <div className="admin-stat-sub">Awaiting approval</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Confirmed</div>
            <div className="admin-stat-value green">{allCounts.confirmed}</div>
            <div className="admin-stat-sub">Approved bookings</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Revenue</div>
            <div className="admin-stat-value">
              ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="admin-stat-sub">From confirmed bookings</div>
          </div>
        </div>

        {/* ── Status Filter Tabs ── */}
        <div className="admin-status-tabs">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              className={`admin-status-tab tab-${tab.key}${statusFilter === tab.key ? ' active' : ''}`}
              onClick={() => { setStatusFilter(tab.key); isFirstLoad.current = true; }}
            >
              {tab.emoji} {tab.label}
              <span className="admin-tab-count">
                {tab.key === 'all' ? (allCounts.all || bookings.length) : (allCounts[tab.key] ?? 0)}
              </span>
            </button>
          ))}
        </div>

        {/* ── Search & Date Filter ── */}
        <div
          className="admin-search-wrap"
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <input
            className="admin-search"
            style={{ flex: '1', minWidth: '220px' }}
            placeholder="Search by customer name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <input
            type="date"
            className="admin-search"
            style={{ maxWidth: '200px' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            title="Filter by booking date"
          />
          {(dateFilter || searchQuery) && (
            <button
              type="button"
              className="admin-btn"
              onClick={() => { setDateFilter(''); setSearchQuery(''); }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Bookings Table ── */}
        <div className="admin-table-card">
          {loading ? (
            <div className="admin-empty">Loading bookings…</div>
          ) : error ? (
            <div className="admin-empty" style={{ color: '#f87171' }}>Error: {error}</div>
          ) : bookings.length === 0 ? (
            <div className="admin-empty">
              {statusFilter !== 'all'
                ? `No ${statusFilter} bookings found.`
                : 'No bookings yet.'}
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Place</th>
                  <th>Sport</th>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Hours</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, idx) => {
                  const isUpdating = updatingId === b.id;
                  return (
                    <tr key={b.id} onClick={() => setDetailBooking(b)}>
                      <td style={{ color: '#475569', fontSize: '12px' }}>{b.id}</td>
                      <td className="name-cell">
                        {b.user_name || b.name}
                        {idx === 0 && <span className="admin-badge-new">NEW</span>}
                      </td>
                      <td style={{ color: '#94a3b8' }}>{b.user_email || b.email}</td>
                      <td>{b.place || '—'}</td>
                      <td className="sport-cell">{b.sport_name}</td>
                      <td>{formatDate(b.booking_date)}</td>
                      <td>{formatTime(b.start_time)}</td>
                      <td>{formatTime(b.end_time)}</td>
                      <td>{formatHours(b.total_hours)}</td>
                      <td style={{ color: '#4ade80', fontWeight: '700' }}>
                        ₹{Number(b.total_price ?? b.price ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td><StatusBadge status={b.status} /></td>
                      <td>
                        <div className="admin-action-btns" onClick={e => e.stopPropagation()}>
                          {/* View details */}
                          <button
                            className="admin-view-btn"
                            onClick={(e) => { e.stopPropagation(); setDetailBooking(b); }}
                          >View</button>

                          {/* Approve — only if not already confirmed */}
                          {b.status !== 'confirmed' && (
                            <button
                              className="admin-approve-btn"
                              disabled={isUpdating}
                              onClick={(e) => handleStatusUpdate(b.id, 'confirmed', e)}
                            >
                              {isUpdating ? '…' : '✅ Approve'}
                            </button>
                          )}

                          {/* Reject — only if not already rejected */}
                          {b.status !== 'rejected' && (
                            <button
                              className="admin-reject-btn"
                              disabled={isUpdating}
                              onClick={(e) => handleStatusUpdate(b.id, 'rejected', e)}
                            >
                              {isUpdating ? '…' : '❌ Reject'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-refreshed">
          Last refreshed: {lastRefreshed.toLocaleTimeString()} · Auto-refreshes every {POLL_INTERVAL / 1000}s
        </div>
      </div>

      {/* ── New Booking Popup ── */}
      <BookingAlertPopup
        booking={alertBooking}
        onClose={() => setAlertBooking(null)}
        onViewDetails={(b) => setDetailBooking(b)}
      />

      {/* ── Detail Modal ── */}
      <BookingDetailModal
        booking={detailBooking}
        onClose={() => setDetailBooking(null)}
      />
    </>
  );
};

export default AdminDashboard;
