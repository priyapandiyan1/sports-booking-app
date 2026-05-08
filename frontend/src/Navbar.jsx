import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { MdSportsVolleyball } from 'react-icons/md';
import LoginModal from './LoginModal';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Active link styling
  const navLinkClass = ({ isActive }) => 
    isActive 
      ? "text-indigo-600 border-b-2 border-indigo-600 shadow-sm font-bold text-sm transition-colors py-1" 
      : "text-gray-600 font-semibold text-sm hover:text-indigo-600 border-b-2 border-transparent transition-colors py-1";

  return (
    <>
      <div className="fixed w-full z-50 px-4 sm:px-6 lg:px-8 top-4">
        <nav className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl">
          <div className="flex justify-between items-center h-16 px-6">
          <NavLink to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="bg-indigo-600 p-1.5 rounded-lg flex-shrink-0">
                <MdSportsVolleyball className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="font-extrabold text-base sm:text-xl text-indigo-900 tracking-tight">
                SPORTS HUB
              </span>
            </NavLink>
            
            <div className="hidden md:flex space-x-8">
              <NavLink to="/" className={navLinkClass} end>Home</NavLink>
              <NavLink to="/about" className={navLinkClass}>About</NavLink>
              <NavLink to="/sports" className={navLinkClass}>Sports</NavLink>
              <NavLink to="/groups" className={navLinkClass}>Play with Others</NavLink>
              <NavLink to="/my-bookings" className={navLinkClass}>My Bookings</NavLink>
              <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Admin Login Button */}
              <button 
                onClick={() => navigate('/admin/login')}
                className="hidden md:flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-md transition-all hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin
              </button>

              {/* User Login Button */}
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="hidden md:block bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-semibold text-sm shadow-md transition-all hover:-translate-y-0.5"
              >
                Log in
              </button>

              {/* Mobile hamburger */}
              <button 
                className="md:hidden text-gray-700 hover:text-indigo-600 p-2 focus:outline-none rounded-lg"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                <FiMenu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-gray-100 px-6 pb-4 pt-2 flex flex-col gap-3">
              <NavLink to="/" className="text-gray-700 font-semibold text-sm py-2" onClick={() => setMobileOpen(false)}>Home</NavLink>
              <NavLink to="/about" className="text-gray-700 font-semibold text-sm py-2" onClick={() => setMobileOpen(false)}>About</NavLink>
              <NavLink to="/sports" className="text-gray-700 font-semibold text-sm py-2" onClick={() => setMobileOpen(false)}>Sports</NavLink>
              <NavLink to="/groups" className="text-gray-700 font-semibold text-sm py-2" onClick={() => setMobileOpen(false)}>Play with Others</NavLink>
              <NavLink to="/my-bookings" className="text-gray-700 font-semibold text-sm py-2" onClick={() => setMobileOpen(false)}>My Bookings</NavLink>
              <NavLink to="/contact" className="text-gray-700 font-semibold text-sm py-2" onClick={() => setMobileOpen(false)}>Contact</NavLink>
              <hr className="border-gray-200" />
              <button 
                onClick={() => { navigate('/admin/login'); setMobileOpen(false); }}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl font-semibold text-sm w-full justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Panel
              </button>
              <button 
                onClick={() => { setIsLoginOpen(true); setMobileOpen(false); }}
                className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm w-full"
              >
                Log in
              </button>
            </div>
          )}
        </nav>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default Navbar;
