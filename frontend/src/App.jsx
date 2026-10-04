import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import Landing from './pages/Landing.jsx';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-cream-100">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            {/* Future auth and dashboard routes will mount here */}
            <Route path="/login" element={<Landing />} />
            <Route path="/register" element={<Landing />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
