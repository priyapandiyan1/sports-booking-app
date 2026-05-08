import React from 'react';
import { useNavigate } from 'react-router-dom';

const SportCard = ({ id, title, image, category, price, description }) => {
  const navigate = useNavigate();
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
      <div className="relative h-56 w-full overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
            {category}
          </span>
        </div>
        <div className="absolute absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
            <span className="text-lg font-bold text-indigo-600">₹{price}<span className="text-sm text-gray-500 font-normal">/hr</span></span>
          </div>
          <p className="text-gray-500 text-sm mb-6 line-clamp-2">
            {description}
          </p>
        </div>
        
        <button 
          onClick={() => navigate(`/book/${id}`)}
          className="w-full bg-gray-50 hover:bg-indigo-600 text-gray-900 hover:text-white border border-gray-200 hover:border-indigo-600 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          <span>Book Now</span>
          <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SportCard;
