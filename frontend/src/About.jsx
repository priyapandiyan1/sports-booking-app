import React from 'react';
import { NavLink } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-[80vh] flex items-center bg-white py-12 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          
          {/* Left Side: Image Content */}
          <div className="w-full lg:w-1/2 relative group">
            {/* Subtle decorative shadow behind the image */}
            <div className="absolute -inset-3 bg-gradient-to-tr from-blue-200 to-indigo-100 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-500"></div>
            <img 
              src="/about_stadium.png" 
              alt="People enjoying sports on a sunny field" 
              className="relative w-full h-[350px] md:h-[450px] object-cover rounded-xl shadow-xl transform transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>

          {/* Right Side: Textual Content */}
          <div className="w-full lg:w-1/2 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                About Us
              </h1>
              <p className="text-xl text-blue-600 font-semibold tracking-wide">
                Your Trusted Sports Booking Partner
              </p>
              <div className="w-16 h-1.5 bg-blue-600 rounded-full mt-4"></div>
            </div>

            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                We provide a simple platform to book indoor and outdoor sports like cricket, football, badminton, carrom, and chess. Our goal is to make sports booking easy and accessible for everyone.
              </p>
              <p>
                Our platform offers real-time availability, affordable pricing in Indian Rupees (₹), and a smooth booking experience.
              </p>
            </div>

            {/* Call to Action Wrapper */}
            <div className="pt-6">
              <NavLink 
                to="/#indoor" 
                className="inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-lg group w-full sm:w-auto text-center"
              >
                Book Now
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </NavLink>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
