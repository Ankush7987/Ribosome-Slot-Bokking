// Imports wahi rahenge...
import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Trash2, User, Lock, LogOut, Loader2 } from 'lucide-react'; // Loader2 add kiya

const AdminDashboard = () => {
  const context = useBooking();
  
  // Safety check
  if (!context) return null;

  const { bookings, removeBooking, loading } = context; // loading variable nikala
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const ADMIN_PASSWORD = "admin123";

  // ... Login Handler Code same rahega ...
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect Password!');
    }
  };

  // ... Logout Handler same rahega ...
  const handleLogout = () => {
      setIsAuthenticated(false);
      setPassword('');
  };

  // --- 1. Login Screen (Same as before) ---
  if (!isAuthenticated) {
    return (
      // ... Purana Login wala pura code same rakhein ...
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-sm w-full">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Lock className="w-8 h-8 text-blue-900" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter Password</label>
              <input type="password" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition">Access Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. NEW: Loading Screen (Ye naya add karein) ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Loading Live Data...</h2>
      </div>
    );
  }

  // --- 3. Main Dashboard (Same as before) ---
  return (
     // ... Niche ka Table wala code same rahega ...
     // Bas check kar lein ki aapne purana code delete na kiya ho
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
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Token ID</th>
              <th className="px-6 py-3">Student Name</th>
              <th className="px-6 py-3">Batch</th>
              <th className="px-6 py-3">Mobile</th>
              <th className="px-6 py-3">Slot Details</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-400">No bookings found yet.</td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="bg-white border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">#{booking.id ? booking.id.slice(-6) : '...'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                        <User size={14} />
                    </div>
                    {booking.name}
                  </td>
                  <td className="px-6 py-4">{booking.batch}</td>
                  <td className="px-6 py-4 font-mono">{booking.mobile}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-600">{booking.date}</span>
                        <span className="text-blue-600 font-bold">{booking.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => {
                        if(window.confirm('Are you sure you want to delete this booking?')) {
                            removeBooking(booking.id)
                        }
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
                      title="Delete Slot"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;