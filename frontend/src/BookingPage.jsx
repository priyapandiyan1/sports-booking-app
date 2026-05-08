import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from './api';

/** Must match backend `bookingMath.PRICE_PER_HOUR` */
const PRICE_PER_HOUR = 100;

const BookingPage = () => {
  const { id: sportId } = useParams();
  const navigate = useNavigate();

  const [sport, setSport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    place: ''
  });
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [hours, setHours] = useState(1);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewEmailLink, setPreviewEmailLink] = useState(null);



  // API Submit Error
  const [submitError, setSubmitError] = useState(null);

  const todayDateString = new Date().toISOString().split('T')[0];

  const loadAvailability = useCallback(async () => {
    const place = formData.place?.trim();
    if (!place || !selectedDate) {
      setAvailableSlots([]);
      setSlotsError(null);
      return;
    }
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const q = new URLSearchParams({
        place,
        date: selectedDate,
        hours: String(hours),
      });
      const json = await api.get(`/api/bookings/availability?${q}`);
      if (!json.success) throw new Error(json.error || 'Failed to load slots');
      setAvailableSlots(json.availableSlots || []);
      setSelectedTime((prev) => {
        if (!prev) return null;
        const still = (json.availableSlots || []).some(
          (s) => s.start === prev.start && s.end === prev.end
        );
        return still ? prev : null;
      });
    } catch (e) {
      setAvailableSlots([]);
      setSlotsError(e.message);
    } finally {
      setSlotsLoading(false);
    }
  }, [formData.place, selectedDate, hours]);

  // Fetch sport details when page loads
  useEffect(() => {
    const fetchSport = async () => {
      try {
        const result = await api.get(`/api/sports/${sportId}`);
        if (result.success) {
          setSport(result.data);
          setSelectedDate(todayDateString);
          setFormData(prev => ({ ...prev, place: `${result.data.sport_name} Ground` }));
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load sport details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSport();
    // eslint-disable-next-line
  }, [sportId]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.place.trim()) errors.place = 'Place / Location is required';
    if (!selectedDate) errors.date = 'Date selection is required';
    if (!selectedTime) errors.time = 'Time slot selection is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const downloadExcelReceipt = () => {
    const total = PRICE_PER_HOUR * hours;
    const endDisp = selectedTime.end ? selectedTime.end.slice(0, 5) : '—';

    const bookingData = [
      { Field: 'Booking ID', Value: `BK-${Date.now()}` },
      { Field: 'Customer Name', Value: formData.name },
      { Field: 'Customer Email', Value: formData.email },
      { Field: 'Sport', Value: sport.sport_name },
      { Field: 'Location / Place', Value: formData.place },
      { Field: 'Booking Date', Value: selectedDate },
      { Field: 'Start Time', Value: selectedTime.label },
      { Field: 'End Time', Value: endDisp },
      { Field: 'Duration (Hours)', Value: `${hours} ${hours > 1 ? 'hours' : 'hour'}` },
      { Field: 'Price Per Hour', Value: `₹${PRICE_PER_HOUR}` },
      { Field: 'Total Price', Value: `₹${PRICE_PER_HOUR * hours}` },
      { Field: 'Status', Value: 'Confirmed' },
      { Field: 'Downloaded At', Value: new Date().toLocaleString() },
    ];

    const worksheet = XLSX.utils.json_to_sheet(bookingData);
    // Set column widths
    worksheet['!cols'] = [{ wch: 22 }, { wch: 35 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Booking Receipt');

    const filename = `Booking_${sport.sport_name}_${selectedDate}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const handleBooking = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const bookingPayload = {
      sport_id: sport.id,
      name: formData.name,
      email: formData.email,
      place: formData.place,
      booking_date: selectedDate,
      start_time: selectedTime.start,
      end_time: selectedTime.end,
    };

    try {
      const result = await api.post('/api/bookings', bookingPayload);
      
      if (result.success) {
        setBookingSuccess(true);
        if (result.emailPreviewUrl) {
          setPreviewEmailLink(result.emailPreviewUrl);
        }
      } else {
        setSubmitError(`Failed to process booking: ${result.error}`);
      }
    } catch (err) {
      setSubmitError('An error occurred while connecting to the backend API. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-bold">Loading booking details...</div>;
  if (error) return <div className="text-center py-20 text-red-500 text-xl">{error}</div>;

  const formatDay = (dateObj) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dateObj.getDay()];
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-2">Thank you, <span className="font-bold">{formData.name}</span>!</p>
          <p className="text-gray-600 mb-8">
            Your {sport.sport_name} session at {formData.place} is confirmed for {selectedDate} at {selectedTime.label}. We have prepared the automated confirmation email.
          </p>
          <div className="flex flex-col gap-4">
            {previewEmailLink && (
              <a 
                href={previewEmailLink} 
                target="_blank" 
                rel="noreferrer"
                className="bg-indigo-600 font-bold text-white py-3 px-8 rounded-xl hover:bg-indigo-700 transition block text-center"
              >
                📥 Open Confirmation Email
              </a>
            )}
            <button
              onClick={downloadExcelReceipt}
              className="bg-green-600 font-bold text-white py-3 px-8 rounded-xl hover:bg-green-700 transition block text-center w-full"
            >
              📊 Download Excel Receipt
            </button>
            <button 
              onClick={() => navigate('/sports')}
              className="bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-xl hover:bg-gray-300 transition w-full"
            >
              Back to Sports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Sport Summary Panel */}
        <div className="md:w-1/3 bg-gray-900 text-white p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{sport.sport_name} Booking</h1>
            <p className="text-gray-400 mb-8">Fill the details to lock your slot securely.</p>
            
            <div className="space-y-6">
              <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm border border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="block text-sm text-gray-400">Total Price</span>
                  <span className="text-xs text-gray-400">₹{PRICE_PER_HOUR}/hr × {hours} hr</span>
                </div>
                <span className="text-3xl font-extrabold text-green-400">₹{PRICE_PER_HOUR * hours}</span>
              </div>
              
              {selectedDate && selectedTime && (
                <div className="bg-indigo-900/40 p-5 rounded-xl border border-indigo-500/30">
                  <h3 className="font-semibold text-indigo-300 mb-3">Your Selection</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-400">Date:</span> 
                      <span className="font-medium">
                        {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB') : ''}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Time:</span> 
                      <span className="font-medium">{selectedTime.label} ({hours} {hours > 1 ? 'hours' : 'hour'})</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Booking Form */}
        <div className="md:w-2/3 p-8">
          <form onSubmit={handleBooking} className="space-y-8">
            
            {/* 1. Personal Details Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className={`w-full px-4 py-3 rounded-xl border ${formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-indigo-500'} focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all`}
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 rounded-xl border ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-indigo-500'} focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all`}
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.email}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Place / Ground or Court name
                  </label>
                  <input
                    type="text"
                    name="place"
                    value={formData.place}
                    onChange={handleInputChange}
                    placeholder="e.g. Central Court — used to check slot availability"
                    className={`w-full px-4 py-3 rounded-xl border ${formErrors.place ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-indigo-500'} focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all`}
                  />
                  {formErrors.place && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.place}</p>}
                </div>
              </div>
            </div>

            {/* 2. Date Selection */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" /></svg>
                Select Date
              </h2>
              {formErrors.date && <p className="text-red-500 text-xs mt-1 mb-2 font-medium">{formErrors.date}</p>}
              <div className="flex">
                 <input
                   type="date"
                   min={todayDateString}
                   value={selectedDate || todayDateString}
                   onChange={(e) => {
                     setSelectedDate(e.target.value);
                     setSelectedTime(null);
                     setFormErrors({ ...formErrors, date: null });
                   }}
                   className={`w-full md:w-auto px-5 py-3 text-lg font-medium text-gray-800 rounded-xl border-2 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                     formErrors.date 
                     ? 'border-red-400 bg-red-50 hover:bg-red-100' 
                     : 'border-indigo-100 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-200'
                   }`}
                   style={{
                     colorScheme: 'light' // Fix for dark mode OS settings
                   }}
                 />
              </div>
            </div>

            {/* 3. Time Selection (server-validated available slots only) */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Select Time
              </h2>
              {!formData.place.trim() && (
                <p className="text-amber-600 text-sm mb-2">Enter a place above to see open slots for that venue.</p>
              )}
              {slotsLoading && (
                <p className="text-gray-500 text-sm mb-2">Loading available slots…</p>
              )}
              {slotsError && (
                <p className="text-red-500 text-sm mb-2">{slotsError}</p>
              )}
              {formErrors.time && <p className="text-red-500 text-xs mt-1 mb-2 font-medium">{formErrors.time}</p>}
              {!slotsLoading && formData.place.trim() && availableSlots.length === 0 && !slotsError && (
                <p className="text-gray-500 text-sm mb-2">No slots found for this date and place.</p>
              )}
              {!slotsLoading && formData.place.trim() && availableSlots.length > 0 && availableSlots.every(s => s.booked) && !slotsError && (
                <p className="text-gray-500 text-sm mb-2">All slots are booked for this date and duration. Try another day.</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableSlots.map((slot, idx) => {
                  const isSelected = selectedTime?.start === slot.start && selectedTime?.end === slot.end;
                  const isBooked = slot.booked;
                  return (
                    <button
                      type="button"
                      key={`${slot.start}-${slot.end}-${idx}`}
                      disabled={isBooked}
                      title={isBooked ? "Already Booked" : "Available"}
                      onClick={() => {
                        if (!isBooked) {
                          setSelectedTime(slot);
                          setFormErrors({ ...formErrors, time: null });
                        }
                      }}
                      className={`py-3 px-2 rounded-xl font-medium transition-all text-sm border-2 ${
                        isBooked
                          ? 'bg-green-100 border-green-500 text-green-800 cursor-not-allowed opacity-75'
                          : isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md transform -translate-y-1 scale-105'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      {slot.label} {isBooked ? '(Booked)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Duration */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Number of Hours
              </h2>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={hours}
                  onChange={(e) => {
                    const n = Math.min(12, Math.max(1, parseInt(e.target.value, 10) || 1));
                    setHours(n);
                    setSelectedTime(null);
                  }}
                  className="w-24 px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all text-center text-xl font-bold"
                />
                <span className="text-gray-600 font-medium">{hours > 1 ? 'hours' : 'hour'}</span>
              </div>
            </div>



            {/* Submit Action */}
            <div className="pt-6 relative">
              {submitError && (
                <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-xl shadow-sm flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{submitError}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 text-xl font-bold rounded-2xl flex items-center justify-center gap-3 transition-colors ${
                  isSubmitting
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200'
                }`}
              >
                {isSubmitting ? (
                   <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    Confirm Booking
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </>
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>

    </div>
  );
};

export default BookingPage;
