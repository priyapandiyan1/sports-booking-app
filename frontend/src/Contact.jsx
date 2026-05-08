import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { contactInfo } from './data/contactInfo';

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      e.target.reset();
    }, 5000);
  };

  return (
    <div className="min-h-[80vh] flex items-center bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-blue-600 font-semibold tracking-wide">
            Get in touch with us
          </p>
          <div className="w-24 h-1.5 bg-blue-600 rounded-full mx-auto mt-6"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* Left Column: Contact Details */}
          <div className="w-full lg:w-5/12 bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100 transform transition-transform hover:-translate-y-1 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h2>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 flex-shrink-0 mt-1">
                  <FaMapMarkerAlt size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Our Location</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {contactInfo.address.line1},<br />
                    {contactInfo.address.line2},<br />
                    {contactInfo.address.line3}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 flex-shrink-0 mt-1">
                  <FaPhoneAlt size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Phone Number</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {contactInfo.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 flex-shrink-0 mt-1">
                  <FaEnvelope size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Email Address</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {contactInfo.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <p className="text-gray-500 italic">
                Our support team typically responds within 24 hours during business days.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="w-full lg:w-7/12 bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
            {isSubmitted ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 space-y-4">
                <FaCheckCircle className="text-green-500 w-20 h-20 mb-4" />
                <h2 className="text-3xl font-bold text-gray-900">Thank You!</h2>
                <p className="text-xl text-green-600 font-medium">Message sent successfully!</p>
                <p className="text-gray-500 max-w-md mt-2">We have received your message and will get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 drop-shadow-sm">Send us a Message</h2>

                <div className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none bg-gray-50/50 hover:bg-white"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none bg-gray-50/50 hover:bg-white"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Your Message</label>
                    <textarea
                      id="message"
                      rows="5"
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none resize-none bg-gray-50/50 hover:bg-white"
                      placeholder="How can we help you today?"
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-lg flex justify-center items-center gap-2 group"
                  >
                    Send Message
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
