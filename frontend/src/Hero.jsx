import React from 'react';

const Hero = () => {
  const scrollToBooking = () => {
    const element = document.getElementById('search-section');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToExplore = () => {
    const element = document.getElementById('sports-section');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-900">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=2000"
          alt="Stadium Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/40 md:bg-gradient-to-r md:from-gray-900/90 md:via-gray-900/60 md:to-transparent"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center h-full">
        <div className="max-w-2xl text-center md:text-left">
          <div className="flex justify-center md:justify-start mb-6">
            <span className="inline-flex items-center py-1 pr-4 pl-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs md:text-sm font-semibold tracking-wider backdrop-blur-sm gap-3">
              <span className="bg-indigo-600 text-white rounded-full px-3 py-0.5">NEW</span>
              Premium Sports Facilities
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
            Book Your Favorite <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Sports Anytime
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300 mb-10 leading-relaxed max-w-xl mx-auto md:mx-0">
            Indoor & Outdoor sports booking made easy. Discover and reserve premium courts, fields, and tables near you in just a few clicks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button 
              onClick={scrollToBooking}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] transition-all transform hover:-translate-y-1"
            >
              Start Booking
            </button>
            <button 
              onClick={scrollToExplore}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all"
            >
              Explore All Sports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
