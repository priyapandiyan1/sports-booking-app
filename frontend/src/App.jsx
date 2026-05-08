import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home';
import About from './About';
import Contact from './Contact';
import Sports from './Sports';
import BookingPage from './BookingPage';
import PrivacyPolicy from './PrivacyPolicy';
import Terms from './Terms';
import Footer from './Footer';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';
import GroupsPage from './GroupsPage';
import GroupDetails from './GroupDetails';
import MyBookings from './MyBookings';
import { FaChevronUp } from 'react-icons/fa';

// App component changes
function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Full-screen Admin pages — no Navbar/Footer */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Regular public pages with Navbar + Footer */}
        <Route path="*" element={
          <div className="relative min-h-screen font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900 bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow pt-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/sports" element={<Sports />} />
                <Route path="/book/:id" element={<BookingPage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/groups/:id" element={<GroupDetails />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
              </Routes>
            </div>
            <Footer />
            {showScrollTop && (
              <button 
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none"
                aria-label="Scroll to top"
              >
                <FaChevronUp size={20} />
              </button>
            )}
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
