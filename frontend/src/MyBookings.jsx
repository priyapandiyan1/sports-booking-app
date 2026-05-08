import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${(m || '00').slice(0, 2)} ${ampm}`;
};

const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  pending:   'bg-amber-100 text-amber-700 border-amber-200',
  rejected:  'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const MyBookings = () => {
  const [email, setEmail]       = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  // Try to pre-fill from localStorage if user previously booked
  useEffect(() => {
    const saved = localStorage.getItem('guestEmail') || localStorage.getItem('lastBookingEmail');
    if (saved) setInputEmail(saved);
  }, []);

  const fetchByEmail = async (e) => {
    e?.preventDefault();
    const trimmed = inputEmail.trim().toLowerCase();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    setBookings([]);
    try {
      // Find user by email first
      const userRes = await api.get(`/api/users?email=${encodeURIComponent(trimmed)}`);
      if (!userRes.success || !userRes.data || userRes.data.length === 0) {
        setError('No account found for this email address. Make sure you used this email when booking.');
        setLoading(false);
        return;
      }
      const userId = userRes.data[0].id;
      const bookRes = await api.get(`/api/bookings/user/${userId}`);
      if (bookRes.success) {
        setBookings(bookRes.data);
        setEmail(trimmed);
        localStorage.setItem('lastBookingEmail', trimmed);
      } else {
        setError(bookRes.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError(err.message || 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    setError(null);
    setSuccessMsg('');
    try {
      const res = await api.delete(`/api/bookings/${bookingId}`);
      if (res.success) {
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        setSuccessMsg('Booking cancelled successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(res.error || 'Failed to cancel booking');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="text-indigo-600 font-semibold mb-4 hover:underline text-sm flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Enter your email to view your booking history.</p>
        </div>

        {/* Email Lookup Form */}
        <form onSubmit={fetchByEmail} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={inputEmail}
            onChange={e => setInputEmail(e.target.value)}
            placeholder="Enter your booking email address"
            required
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Searching...' : '🔍 Find My Bookings'}
          </button>
        </form>

        {/* Success / Error messages */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
            ✅ {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Bookings List */}
        {email && !loading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-base sm:text-lg">
                Bookings for <span className="text-indigo-600">{email}</span>
              </h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
                {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-4xl mb-3">🎾</p>
                <p className="text-gray-500 text-base">No bookings found for this email.</p>
                <button onClick={() => navigate('/sports')} className="mt-4 text-indigo-600 font-bold hover:underline text-sm">
                  Book a sport now →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Card Header */}
                    <div className="flex items-start justify-between p-4 sm:p-5 border-b border-gray-50">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg">{b.sport_name}</h3>
                        <p className="text-gray-500 text-sm mt-0.5">📍 {b.place || '—'}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[b.status] || STATUS_COLORS.pending}`}>
                        {b.status?.toUpperCase()}
                      </span>
                    </div>

                    {/* Card Body — responsive grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5">
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Date</p>
                        <p className="text-sm font-semibold text-gray-800">{formatDate(b.booking_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Time</p>
                        <p className="text-sm font-semibold text-gray-800">{formatTime(b.start_time)} – {formatTime(b.end_time)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Duration</p>
                        <p className="text-sm font-semibold text-gray-800">{b.total_hours} hr{b.total_hours !== 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Total</p>
                        <p className="text-sm font-bold text-green-600">₹{Number(b.total_price).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Cancel button — only for pending/confirmed */}
                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <div className="px-4 sm:px-5 pb-4">
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={cancellingId === b.id}
                          className="w-full sm:w-auto text-sm font-bold text-red-600 border border-red-200 px-5 py-2 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
                        >
                          {cancellingId === b.id ? 'Cancelling...' : '✕ Cancel Booking'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
