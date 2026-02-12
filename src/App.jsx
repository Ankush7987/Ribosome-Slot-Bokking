import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import StudentForm from './components/StudentForm';
// AdminDashboard ko abhi ke liye comment kar rahe hain debugging ke liye
import AdminDashboard from './components/AdminDashboard'; 
import { Home, LayoutDashboard } from 'lucide-react';

function App() {
  return (
    <BookingProvider>
      <HashRouter>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <nav className="bg-blue-900 text-white p-4 shadow-md">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="font-bold text-xl tracking-wide">Ribosome Institute</div>
              <div className="flex gap-4">
                <Link to="/" className="inline-flex items-center gap-1 hover:text-blue-200 transition">
                   Home
                </Link>
                {/* Debugging Link */}
                <Link to="/admin" className="inline-flex items-center gap-1 hover:text-blue-200 transition">
                   Admin (Test)
                </Link>
              </div>
            </div>
          </nav>

          <div className="p-4">
            <Routes>
              <Route path="/" element={<StudentForm />} />
              
              {/* Debugging: Agar AdminDashboard mein error hai to ye text dikhega */}
              <Route path="/admin" element={
                <div className="p-10 border-2 border-red-500 bg-red-100 text-center">
                  <h1 className="text-2xl font-bold">Routing Working!</h1>
                  <p>Agar ye dikh raha hai, to AdminDashboard component mein error hai.</p>
                  <div className="mt-5 p-4 bg-white border">
                    <AdminDashboard />
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </div>
      </HashRouter>
    </BookingProvider>
  );
}

export default App;