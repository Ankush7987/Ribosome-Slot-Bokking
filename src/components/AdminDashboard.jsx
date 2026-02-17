import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { Trash2, User, Lock, LogOut, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const context = useBooking();
  if (!context) return null;

  const { bookings, removeBooking, updateBookingStatus, loading } = context; 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const ADMIN_PASSWORD = "admin123";

  // --- HELPER: Convert Slot String to Date Object ---
  const getSlotDateTime = (dateStr, timeStr) => {
    try {
      // Step 1: Date create karo (YYYY-MM-DD assume kar rahe hain)
      // Agar format DD-MM-YYYY hai to split karke reverse karna padega
      const dateObj = new Date(dateStr); 

      // Step 2: Time parse karo (Example: "10:00 AM" ya "10:00 - 11:00 AM")
      // Sirf starting time lenge (10:00 AM)
      const startTime = timeStr.split(' - ')[0].trim(); 
      
      // Time string se Hours/Minutes nikalna
      const [time, modifier] = startTime.split(' ');
      let [hours, minutes] = time.split(':');

      if (hours === '12') {
        hours = '00';
      }
      if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
      }

      dateObj.setHours(hours);
      dateObj.setMinutes(minutes);
      
      return dateObj;
    } catch (e) {
      console.error("Date Parsing Error", e);
      return new Date(); // Fallback
    }
  };

  // --- 1. AUTO-EXPIRE LOGIC (Slot Time + 30 Mins) ---
  useEffect(() => {
    if (!loading && bookings.length > 0) {
      const interval = setInterval(() => {
        const now = new Date();

        bookings.forEach((booking) => {
          // Sirf Pending bookings ko check karo
          if (booking.status === 'Pending' || !booking.status) {
            
            // Helper function se Slot ka sahi time nikalo
            const slotTime = getSlotDateTime(booking.date, booking.time);
            
            // 30 Minutes add karo slot time mein
            const expireTime = new Date(slotTime.getTime() + 30 * 60000);

            // Agar abhi ka time (now) expireTime se aage nikal gaya hai
            if (now > expireTime) {
              updateBookingStatus(booking.id, 'Expired');
            }
          }
        });
      }, 60000); // Har 1 minute check karega

      return () => clearInterval(interval);
    }
  }, [bookings, loading, updateBookingStatus]);


  // --- 2. SORTING LOGIC (Pending > Success > Expired) ---
  const sortedBookings = [...bookings].sort((a, b) => {
    const statusPriority = {
      'Pending': 1, // Highest Priority (Top)
      'Success': 2, // Middle
      'Expired': 3  // Lowest (Bottom)
    };

    const statusA = a.status || 'Pending';
    const statusB = b.status || 'Pending';

    // Pehle Status ke hisaab se sort
    if (statusPriority[statusA] !== statusPriority[statusB]) {
      return statusPriority[statusA] - statusPriority[statusB];
    }

    // Agar Status same hai, to Date/Time ke hisaab se sort
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    
    // Pending aur Success ke liye: Jo pehle aane wala hai wo upar (Ascending)
    // Expired ke liye: Jo abhi expire hua wo upar
    return dateA - dateB;
  });

  // --- Login Logic ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect Password!');
    }
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-sm w-full">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Lock className="w-8 h-8 text-blue-900" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" className="w-full p-2 border rounded-md" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded-md">Access Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">Manage student slot bookings</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg font-medium border border-blue-100">
            Total: {bookings.length}
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition">
                <LogOut size={18} /> Logout
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Slot Details</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedBookings.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8">No bookings found.</td></tr>
            ) : (
                sortedBookings.map((booking) => {
                const isExpired = booking.status === 'Expired';
                return (
                    <tr key={booking.id} className={`border-b transition ${isExpired ? 'bg-gray-100 opacity-60' : 'bg-white hover:bg-gray-50'}`}>
                    <td className="px-6 py-4">
                        <div className={`font-medium flex items-center gap-2 ${isExpired ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            <User size={14} /> {booking.name}
                        </div>
                        <div className="text-xs text-gray-500 ml-6">{booking.mobile} | {booking.batch}</div>
                    </td>
                    <td className="px-6 py-4">
                        <div className={`font-bold ${isExpired ? 'text-gray-500' : 'text-blue-600'}`}>{booking.time}</div>
                        <div className="text-xs text-gray-400">{booking.date}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        {isExpired ? (
                             <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-300 text-gray-600 border border-gray-400 cursor-not-allowed">
                                <XCircle size={14} /> Expired
                            </div>
                        ) : (
                            <button 
                            onClick={() => updateBookingStatus(booking.id, booking.status === 'Success' ? 'Pending' : 'Success')}
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                booking.status === 'Success' 
                                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                                : 'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse'
                            }`}
                            >
                            {booking.status === 'Success' ? <CheckCircle size={14} /> : <Clock size={14} />}
                            {booking.status || 'Pending'}
                            </button>
                        )}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <button onClick={() => { if(window.confirm('Delete this booking?')) removeBooking(booking.id) }} 
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition">
                        <Trash2 size={18} />
                        </button>
                    </td>
                    </tr>
                )})
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;