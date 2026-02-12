import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import StudentForm from './components/StudentForm';
import AdminDashboard from './components/AdminDashboard';
import { Home } from 'lucide-react';

function App() {
  return (
    <BookingProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          {/* Simple Navigation Bar */}
          <nav className="bg-blue-900 text-white p-4 shadow-md">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="font-bold text-xl tracking-wide">Ribosome Institute</div>
              
              {/* Sirf Home Button Rakha Hai */}
              <Link to="/" className="inline-flex items-center gap-1 hover:text-blue-200 transition font-medium">
                <Home size={18} /> Home
              </Link>
            </div>
          </nav>

          <div className="p-4">
            <Routes>
              <Route path="/" element={<StudentForm />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </BookingProvider>
  );
}

export default App;