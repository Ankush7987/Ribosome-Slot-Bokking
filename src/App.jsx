import React from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import StudentForm from './components/StudentForm';
import AdminDashboard from './components/AdminDashboard';
import { Home } from 'lucide-react';

function App() {
  return (
    <BookingProvider>
      {/* HashRouter is required for Vercel to handle routing correctly */}
      <HashRouter>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          
          {/* Professional Navbar */}
          <nav className="bg-blue-900 text-white p-4 shadow-md">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="font-bold text-xl tracking-wide">Ribosome Institute</div>
              
              {/* Only Home Link is visible to students */}
              <Link to="/" className="inline-flex items-center gap-1 hover:text-blue-200 transition font-medium">
                <Home size={18} /> Home
              </Link>
            </div>
          </nav>

          <div className="p-4">
            <Routes>
              {/* Home Route */}
              <Route path="/" element={<StudentForm />} />
              
              {/* Admin Route (Hidden & Clean) */}
              <Route path="/admin" element={<AdminDashboard />} />

              {/* Catch-all: Redirect unknown URLs to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </HashRouter>
    </BookingProvider>
  );
}

export default App;