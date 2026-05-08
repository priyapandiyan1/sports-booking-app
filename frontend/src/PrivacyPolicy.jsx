import React from 'react';

const PrivacyPolicy = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-[80vh] py-16 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        {/* Header Section */}
        <div className="text-center mb-16 border-b border-gray-100 pb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl md:text-2xl text-blue-600 font-semibold tracking-wide mb-6">
            Your data is safe with us
          </p>
          <p className="text-sm text-gray-500 font-medium bg-gray-50 inline-block px-4 py-1.5 rounded-full border border-gray-200">
            Last updated: {currentDate}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12 text-lg text-gray-700 leading-relaxed">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Introduction
            </h2>
            <p className="pl-11">
              We respect your privacy and are committed to protecting your personal information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Information We Collect
            </h2>
            <ul className="list-disc pl-16 space-y-2 marker:text-blue-500">
              <li>Name</li>
              <li>Email</li>
              <li>Phone number</li>
              <li>Booking details</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              How We Use Information
            </h2>
            <ul className="list-disc pl-16 space-y-2 marker:text-blue-500">
              <li>To process bookings</li>
              <li>To improve user experience</li>
              <li>To provide customer support</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
              Data Protection
            </h2>
            <p className="pl-11 bg-gray-50 border-l-4 border-blue-500 p-4 rounded-r-lg italic text-gray-800">
              "We use secure systems to protect your data."
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
              Contact
            </h2>
            <p className="pl-11">
              If you have any questions, contact us at <a href="mailto:support@sportshub.com" className="text-blue-600 font-semibold hover:underline decoration-2 underline-offset-4">support@sportshub.com</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
