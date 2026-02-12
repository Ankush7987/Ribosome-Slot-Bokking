import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { Calendar, Clock, CheckCircle, AlertCircle, Phone, User, BookOpen, Mail, MessageCircle, Info, AlertTriangle, Home } from 'lucide-react';

// Time Slots
const SLOTS = [
  '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', 
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', 
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', 
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', 
  '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', 
  '10:00 PM'
];

const MAX_CAPACITY = 4;
const LAST_DATE = "2026-03-08"; // March 8th Deadline

const StudentForm = () => {
  const { bookings, addBooking } = useBooking();
  
  const [formData, setFormData] = useState({
    name: '',
    batch: '',
    mobile: '',
    email: '',
    date: '',
    time: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);

  // --- TIME VALIDATION ---
  const isTimeSlotPast = (slotTime, selectedDate) => {
    const today = new Date();
    const currentDateStr = today.toISOString().split('T')[0];
    
    // Logic for Future/Past Dates
    if (selectedDate > currentDateStr) return false;
    if (selectedDate < currentDateStr) return true;

    // Logic for Today's Time
    const [time, modifier] = slotTime.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    if (hours === 12 && modifier === 'AM') hours = 0;
    if (hours !== 12 && modifier === 'PM') hours += 12;

    const currentHours = today.getHours();
    const currentMinutes = today.getMinutes();

    if (hours < currentHours) return true;
    if (hours === currentHours && minutes <= currentMinutes) return true;
    return false;
  };

  // --- FIELD VALIDATION ---
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'mobile':
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!value) error = 'Mobile number is required.';
        else if (value.length !== 10) error = 'Must be exactly 10 digits.';
        else if (!mobileRegex.test(value)) error = 'Invalid Number! Must start with 6-9.';
        break;
      case 'name':
        if (!value || value.length < 3) error = 'Name is too short.';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) error = 'Email is required.';
        else if (!emailRegex.test(value)) error = 'Invalid email address.';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile' && !/^\d*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    const errorMsg = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const getSlotCount = (date, time) => {
    return bookings.filter(b => b.date === date && b.time === time).length;
  };

  // --- RESET FORM (Home Button Logic) ---
  const resetForm = () => {
    setSubmitted(null);
    setFormData({ name: '', batch: '', mobile: '', email: '', date: '', time: '' });
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mobileError = validateField('mobile', formData.mobile);
    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);
    
    if (mobileError || nameError || emailError) {
      setErrors({ mobile: mobileError, name: nameError, email: emailError });
      return;
    }

    const result = addBooking(formData);
    if (result.success) {
      setSubmitted(result.token);
    } else {
      alert(result.message);
    }
  };

  // --- SUCCESS SCREEN ---
  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-green-50 rounded-2xl border border-green-200 text-center shadow-xl animate-fade-in">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-green-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">Your appointment is set.</p>
        
        <div className="bg-white p-4 rounded-lg border border-green-100 mb-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Token ID</p>
            <p className="font-mono font-bold text-2xl text-green-700">{submitted}</p>
        </div>
        
        <p className="text-sm text-red-500 font-medium mb-6">⚠️ Please take a screenshot of this.</p>
        
        {/* THIS BUTTON FIXES THE HOME ISSUE */}
        <button onClick={resetForm} className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow-md flex items-center justify-center gap-2">
            <Home size={20} /> Book Another / Go Home
        </button>
      </div>
    );
  }

  // --- MAIN FORM ---
  return (
    <div className="max-w-3xl mx-auto mt-4 mb-12 px-4">
      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">Ribosome Institute</h1>
        <p className="text-blue-600 font-medium text-lg mt-1">NEET Form Filling Appointment</p>
      </div>

      {/* URGENT WARNING: SERVER ISSUE */}
      <div className="bg-red-50 border-l-4 border-red-600 p-5 rounded-r-xl shadow-sm mb-6 animate-pulse">
        <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-1 w-6 h-6" />
            <div>
                <h3 className="font-bold text-red-900 text-lg">Server Warning: Apply Immediately!</h3>
                <p className="text-red-800 text-sm mt-1">
                    NEET servers are slowing down. <strong>Last Date is 8th March.</strong> 
                    <br/>Please fill your form as soon as possible to avoid failure.
                </p>
            </div>
        </div>
      </div>

      {/* DOCUMENT INSTRUCTIONS */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-xl shadow-sm mb-8">
        <div className="flex items-start gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-1" />
            <div>
                <h3 className="font-bold text-blue-900 text-lg">Documents Required</h3>
                <ul className="mt-3 space-y-2 text-sm text-blue-800">
                    <li className="flex gap-2"><span className="font-bold">•</span> <span><strong>Aadhar Card</strong> (Original & Copy)</span></li>
                    <li className="flex gap-2"><span className="font-bold">•</span> <span><strong>10th & 12th Marksheet</strong> (If pursuing, bring School Details)</span></li>
                    <li className="flex gap-2"><span className="font-bold">•</span> <span><strong>Income Details</strong> of Parents</span></li>
                    <li className="flex gap-2"><span className="font-bold">•</span> <span><strong>Caste Certificate</strong> (OBC, SC/ST, General-EWS)</span></li>
                    <li className="flex gap-2"><span className="font-bold">•</span> <span>Valid <strong>Mobile No.</strong> & <strong>Email ID</strong> are mandatory.</span></li>
                </ul>
            </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PERSONAL DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                <User size={16} className="text-blue-600"/> Student Name
              </label>
              <input name="name" type="text" placeholder="Full Name" 
                className={`w-full p-3 bg-gray-50 border rounded-lg outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100 ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                value={formData.name} onChange={handleChange} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                  <BookOpen size={16} className="text-blue-600"/> Batch Name
              </label>
              <input name="batch" type="text" placeholder="e.g. Target 2026" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                value={formData.batch} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                  <Phone size={16} className="text-blue-600"/> Mobile Number
              </label>
              <input name="mobile" type="tel" maxLength="10" placeholder="e.g. 9998887776" 
                className={`w-full p-3 bg-gray-50 border rounded-lg outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100 ${errors.mobile ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                value={formData.mobile} onChange={handleChange} />
              {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                  <Mail size={16} className="text-blue-600"/> Email ID
              </label>
              <input name="email" type="email" placeholder="student@example.com" 
                className={`w-full p-3 bg-gray-50 border rounded-lg outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100 ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                value={formData.email} onChange={handleChange} />
               {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* DATE & TIME SECTION */}
          <div className="pt-4 border-t border-dashed border-gray-200">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" /> Select Date
            </label>
            <input required type="date" 
              className="block w-full p-3 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-medium text-blue-900"
              min={new Date().toISOString().split('T')[0]} 
              max={LAST_DATE} // Locked till 8th March
              value={formData.date} onChange={e => setFormData({...formData, date: e.target.value, time: ''})} />
            <p className="text-xs text-red-500 mt-1 font-medium">* No bookings allowed after 8th March.</p>
          </div>

          {formData.date && (
            <div className="animate-fade-in">
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" /> Select Time Slot
              </label>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {SLOTS.map((slot) => {
                  const count = getSlotCount(formData.date, slot);
                  const isFull = count >= MAX_CAPACITY;
                  const isPast = isTimeSlotPast(slot, formData.date);
                  const isDisabled = isFull || isPast;
                  const seatsLeft = MAX_CAPACITY - count;
                  const isSelected = formData.time === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setFormData({...formData, time: slot})}
                      className={`relative py-2.5 px-1 rounded-lg border text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 shadow-sm
                        ${isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105 ring-2 ring-blue-300' 
                          : isDisabled
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                            : 'bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:shadow-md'
                        }`}
                    >
                      <span className="text-[13px]">{slot}</span>
                      {isPast ? (
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Passed</span>
                      ) : isFull ? (
                          <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider">Full</span>
                      ) : (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'bg-green-100 text-green-700'}`}>
                              {seatsLeft} left
                          </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button type="submit" disabled={!formData.time || !formData.name || !!errors.mobile || !!errors.name || !formData.mobile} 
              className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mt-4">
            Confirm Booking
          </button>
        </form>
      </div>

      {/* ADMIN CONTACT */}
      <div className="mt-8 bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
        <p className="text-gray-500 text-sm font-medium mb-2">Have questions? Contact Admin</p>
        <a 
            href="https://wa.me/917999895002" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-green-600 font-bold text-xl hover:bg-green-50 px-6 py-2 rounded-full transition"
        >
            <MessageCircle size={24} /> 79998 95002
        </a>
        <p className="text-xs text-gray-400 mt-2">Click number to chat on WhatsApp</p>
      </div>
    </div>
  );
};

export default StudentForm;