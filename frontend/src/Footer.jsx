import React from 'react';
import { Link } from 'react-router-dom';
import { MdSportsVolleyball } from 'react-icons/md';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { contactInfo } from './data/contactInfo';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Logo & Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <MdSportsVolleyball className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                SPORTS HUB
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Your trusted partner for booking sports venues. Discover the best courts and fields in your area with zero hassle.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                <FaFacebookF size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6 relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-indigo-600 -mb-2"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '#' },
                { name: 'About Us', href: '#about' },
                { name: 'All Sports', href: '#indoor' },
                { name: 'Book Now', href: '#indoor' },
                { name: 'Contact Us', href: '#footer-contact' }
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:text-indigo-400 transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-indigo-600 before:rounded-full">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6 relative inline-block">
              Legal & Support
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-indigo-600 -mb-2"></span>
            </h3>
            <ul className="space-y-3">
              {[
                  { name: 'Privacy Policy', href: '/privacy-policy' },
                  { name: 'Terms & Conditions', href: '/terms' },
                  { name: 'FAQ', href: '#' },
                  { name: 'Help Center', href: '#' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="hover:text-indigo-400 transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-indigo-600 before:rounded-full">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div id="footer-contact">
            <h3 className="text-white text-lg font-bold mb-6 relative inline-block">
              Contact Us
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-indigo-600 -mb-2"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <FaMapMarkerAlt className="text-indigo-500 mt-1 flex-shrink-0" size={18} />
                <span className="text-gray-400 leading-relaxed">
                  {contactInfo.address.line1},<br />
                  {contactInfo.address.line2},<br />
                  {contactInfo.address.line3}
                </span>
              </li>
              <li className="flex items-center gap-4">
                <FaPhoneAlt className="text-indigo-500 flex-shrink-0" size={16} />
                <span className="text-gray-400">{contactInfo.phone}</span>
              </li>
              <li className="flex items-center gap-4">
                <FaEnvelope className="text-indigo-500 flex-shrink-0" size={16} />
                <span className="text-gray-400">{contactInfo.email}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Sports Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
